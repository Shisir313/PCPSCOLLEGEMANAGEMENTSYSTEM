from django.db import models
from django.conf import settings


class Event(models.Model):
    title       = models.CharField(max_length=255)
    description = models.TextField()
    date        = models.DateField()
    time        = models.TimeField()
    location    = models.CharField(max_length=255)
    capacity    = models.PositiveIntegerField(null=True, blank=True)
    organizer   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )
    category    = models.ForeignKey(
        'categories.Category',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='events'
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    # Use FileField instead of ImageField to avoid Pillow dependency on some systems.
    image       = models.FileField(upload_to='events/', null=True, blank=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return self.title
