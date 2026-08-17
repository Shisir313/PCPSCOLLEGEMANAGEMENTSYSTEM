from datetime import date
from django.conf import settings
from rest_framework import serializers
from .models import RSVP
from events.models import Event


class RSVPSerializer(serializers.ModelSerializer):
    event_id          = serializers.PrimaryKeyRelatedField(
        source='event',
        queryset=Event.objects.all()
    )
    attendee_username = serializers.CharField(source='attendee.username', read_only=True)
    registered_at     = serializers.DateTimeField(read_only=True)
    qr_token          = serializers.UUIDField(read_only=True)
    checked_in        = serializers.BooleanField(read_only=True)
    checked_in_at     = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = RSVP
        fields = [
            'id', 'event_id', 'attendee_username', 'registered_at',
            'qr_token', 'checked_in', 'checked_in_at',
        ]
        read_only_fields = ['id', 'attendee_username', 'registered_at',
                            'qr_token', 'checked_in', 'checked_in_at']

    def validate(self, attrs):
        request = self.context.get('request')
        if getattr(settings, 'REQUIRE_RSVP_AUTH', True):
            if not request or not getattr(request, 'user', None) or not request.user.is_authenticated:
                raise serializers.ValidationError({'non_field_errors': 'Authentication required to RSVP.'})
        # if auth not required, ensure we still have an attendee if possible
        if request and getattr(request, 'user', None):
            attendee = request.user
        else:
            attendee = None
        event = attrs.get('event')

        # Check for duplicate RSVP
        if RSVP.objects.filter(attendee=attendee, event=event).exists():
            raise serializers.ValidationError(
                {'non_field_errors': 'You have already registered for this event.'}
            )

        # Check capacity if set
        if event.capacity is not None:
            rsvp_count = event.rsvps.count()
            if rsvp_count >= event.capacity:
                raise serializers.ValidationError(
                    {'non_field_errors': 'This event is at full capacity.'}
                )

        # Prevent RSVPing to past events
        if event.date < date.today():
            raise serializers.ValidationError({'non_field_errors': 'Cannot RSVP to past events.'})

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['attendee'] = request.user
        return super().create(validated_data)


class CheckInSerializer(serializers.Serializer):
    """Used by the organizer check-in endpoint to validate a QR token."""
    qr_token = serializers.UUIDField()
