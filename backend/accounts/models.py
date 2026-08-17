from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('pending', 'Pending'),
        ('admin', 'Admin'),
        ('organizer', 'Organizer'),
        ('attendee', 'Attendee'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='attendee')

    # Override email to enforce uniqueness (AbstractUser has email without unique=True)
    email = models.EmailField(unique=True)

    # is_active is inherited from AbstractUser (BooleanField, default=True).
    # No need to redefine — AbstractUser already provides it.

    class Meta:
        swappable = 'AUTH_USER_MODEL'
