import uuid
from django.db import models
from django.conf import settings


class RSVP(models.Model):
    attendee      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rsvps'
    )
    event         = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='rsvps'
    )
    registered_at = models.DateTimeField(auto_now_add=True)

    # QR / check-in fields (added in migration 0002_checkin_fields)
    qr_token      = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique token encoded in the attendee's QR code.",
    )
    checked_in    = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='checked_in_rsvps',
        help_text='Organizer or admin who scanned the QR code.',
    )

    class Meta:
        unique_together = ('attendee', 'event')

    def __str__(self):
        return f"{self.attendee.username} → {self.event.title}"
