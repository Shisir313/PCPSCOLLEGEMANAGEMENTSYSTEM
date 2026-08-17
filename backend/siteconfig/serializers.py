from rest_framework import serializers
from .models import FeatureFlag


class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = ['require_event_image', 'require_email_on_registration', 'require_rsvp_auth', 'updated_at']
        read_only_fields = ['updated_at']
