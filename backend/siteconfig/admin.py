from django.contrib import admin
from .models import FeatureFlag


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ('require_event_image', 'require_email_on_registration', 'require_rsvp_auth', 'updated_at')
    readonly_fields = ('updated_at',)
