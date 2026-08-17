from django.db import models
from django.conf import settings


class FeatureFlag(models.Model):
    """Singleton-ish model used to toggle runtime feature flags via admin/UI.

    Use `FeatureFlag.get_solo()` to access the single instance. If none exists,
    defaults are populated from `django.conf.settings`.
    """
    require_event_image = models.BooleanField(default=getattr(settings, 'REQUIRE_EVENT_IMAGE', True))
    require_email_on_registration = models.BooleanField(default=getattr(settings, 'REQUIRE_EMAIL_ON_REGISTRATION', True))
    require_rsvp_auth = models.BooleanField(default=getattr(settings, 'REQUIRE_RSVP_AUTH', True))

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Feature Flags'

    def __str__(self):
        return 'Feature flags'

    @classmethod
    def get_solo(cls):
        obj = cls.objects.first()
        if obj is None:
            # create with defaults from settings
            obj = cls.objects.create(
                require_event_image=getattr(settings, 'REQUIRE_EVENT_IMAGE', True),
                require_email_on_registration=getattr(settings, 'REQUIRE_EMAIL_ON_REGISTRATION', True),
                require_rsvp_auth=getattr(settings, 'REQUIRE_RSVP_AUTH', True),
            )
        return obj

    @classmethod
    def get_flag(cls, name):
        obj = cls.objects.first()
        if obj is None:
            return getattr(settings, name, None)
        mapping = {
            'REQUIRE_EVENT_IMAGE': obj.require_event_image,
            'REQUIRE_EMAIL_ON_REGISTRATION': obj.require_email_on_registration,
            'REQUIRE_RSVP_AUTH': obj.require_rsvp_auth,
        }
        return mapping.get(name, getattr(settings, name, None))
