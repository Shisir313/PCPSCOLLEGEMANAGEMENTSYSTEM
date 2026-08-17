from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
