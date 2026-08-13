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

    class Meta:
        unique_together = ('attendee', 'event')

    def __str__(self):
        return f"{self.attendee.username} → {self.event.title}"
