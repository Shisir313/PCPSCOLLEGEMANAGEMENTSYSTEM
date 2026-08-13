"""
Root URL configuration for the Event Management System.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Auth endpoints
    # POST /api/auth/register/  — handled by accounts app
    # POST /api/auth/login/     — simplejwt TokenObtainPairView
    # POST /api/auth/token/refresh/ — simplejwt TokenRefreshView
    path('api/auth/', include('accounts.urls')),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User management (Admin only): /api/users/
    path('api/users/', include('accounts.user_urls')),

    # Events: /api/events/
    path('api/events/', include('events.urls')),

    # RSVPs / Registrations: /api/rsvps/
    path('api/rsvps/', include('registrations.urls')),

    # Organizer Dashboard: /api/dashboard/
    path('api/dashboard/', include('registrations.dashboard_urls')),

    # Categories: /api/categories/
    path('api/categories/', include('categories.urls')),
    # Feature flags: /api/flags/
    path('api/flags/', include('siteconfig.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
