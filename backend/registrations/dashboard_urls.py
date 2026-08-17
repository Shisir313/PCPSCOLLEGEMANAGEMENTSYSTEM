from django.urls import path
from .views import OrganizerDashboardView

urlpatterns = [
    path('', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
]
