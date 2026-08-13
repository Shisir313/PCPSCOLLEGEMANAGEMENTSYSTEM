from django.contrib import admin

from .models import RSVP


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ('attendee', 'event', 'registered_at')
    search_fields = ('attendee__username', 'event__title')
    list_select_related = ('attendee', 'event')
