from datetime import date, datetime
from django.conf import settings
from rest_framework import serializers
from .models import Event


class CategoryInlineSerializer(serializers.Serializer):
    """Minimal nested category representation used inside event responses."""
    id   = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)


class LazyCategoryRelatedField(serializers.PrimaryKeyRelatedField):
    """
    PrimaryKeyRelatedField whose queryset is resolved lazily on first access.
    This avoids the circular-import issue that arises when importing
    categories.models at module load time inside the events app.
    """

    def get_queryset(self):
        from categories.models import Category
        return Category.objects.all()


class EventSerializer(serializers.ModelSerializer):
    """Used for list and create operations."""
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    rsvp_count         = serializers.SerializerMethodField()
    category           = CategoryInlineSerializer(read_only=True)
    category_id        = LazyCategoryRelatedField(
        source='category',
        required=False,
        allow_null=True,
        write_only=True,
    )
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'location',
            'capacity', 'organizer_username', 'rsvp_count',
            'category', 'category_id', 'image', 'image_url', 'created_at',
        ]
        read_only_fields = ['id', 'organizer_username', 'rsvp_count', 'created_at', 'image_url']

    def get_rsvp_count(self, obj):
        return obj.rsvps.count()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request is not None:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate_date(self, value):
        """Reject event dates that are in the past."""
        if value < date.today():
            raise serializers.ValidationError('Event date cannot be in the past.')
        return value

    def validate(self, attrs):
        # Ensure time is not in the past when date is today
        event_date = attrs.get('date')
        event_time = attrs.get('time')
        if event_date == date.today() and event_time is not None:
            now_time = datetime.now().time()
            if event_time < now_time:
                raise serializers.ValidationError({'time': 'Event time cannot be in the past for today.'})

        # Capacity must be positive if provided
        capacity = attrs.get('capacity')
        if capacity is not None:
            try:
                if int(capacity) <= 0:
                    raise serializers.ValidationError({'capacity': 'Capacity must be greater than zero.'})
            except (TypeError, ValueError):
                raise serializers.ValidationError({'capacity': 'Capacity must be a positive integer.'})

        return attrs


class EventDetailSerializer(EventSerializer):
    """Used for retrieve, update, and delete — adds remaining_spots and updated_at."""
    remaining_spots = serializers.SerializerMethodField()

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['remaining_spots', 'updated_at']

    def get_remaining_spots(self, obj):
        if obj.capacity is None:
            return None
        return max(0, obj.capacity - obj.rsvps.count())

    def validate(self, attrs):
        """Prevent reducing capacity below the current RSVP count and require image on create."""
        # First run parent validation (date/time/capacity positivity)
        attrs = super().validate(attrs)

        instance = self.instance
        capacity = attrs.get('capacity', getattr(instance, 'capacity', None))
        if instance and capacity is not None:
            rsvp_count = instance.rsvps.count()
            if capacity < rsvp_count:
                raise serializers.ValidationError({
                    'capacity': (
                        f'Cannot set capacity to {capacity} — '
                        f'there are already {rsvp_count} RSVPs for this event.'
                    )
                })

        # Require an image for new events (POST) when the feature flag is enabled.
        if getattr(settings, 'REQUIRE_EVENT_IMAGE', True):
            request = self.context.get('request')
            if request and request.method == 'POST':
                # Check both validated attrs and uploaded files
                has_image_in_data = bool(attrs.get('image'))
                has_image_in_files = bool(getattr(request, 'FILES', None) and request.FILES.get('image'))
                if not (has_image_in_data or has_image_in_files):
                    raise serializers.ValidationError({'image': 'Image is required when creating an event.'})

        return attrs
