from django.contrib import admin
from django.utils.html import format_html

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'time', 'organizer', 'category', 'thumb')
    readonly_fields = ('thumb',)
    search_fields = ('title', 'location')

    def save_model(self, request, obj, form, change):
        # If an organizer wasn't provided in the admin form, set it to the current user.
        # This makes it easier for staff/admin users to create events from the admin UI.
        if not getattr(obj, 'organizer', None):
            obj.organizer = request.user
        super().save_model(request, obj, form, change)

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:48px;object-fit:cover;border-radius:4px;" />', obj.image.url)
        return '-'

    thumb.short_description = 'Image'
