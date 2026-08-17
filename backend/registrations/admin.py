from django.contrib import admin

from .models import RSVP


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display  = ('attendee', 'event', 'registered_at', 'checked_in', 'checked_in_at')
    list_filter   = ('checked_in',)
    search_fields = ('attendee__username', 'event__title')
    readonly_fields = ('qr_token', 'registered_at', 'checked_in_at', 'checked_in_by')
    list_select_related = ('attendee', 'event')
