from django.urls import path

from .views import (
    EventAttendeeListView,
    MyEventsView,
    OrganizerDashboardView,
    RSVPDestroyView,
    RSVPListCreateView,
)

urlpatterns = [
    path('', RSVPListCreateView.as_view(), name='rsvp-list-create'),
    path('my-events/', MyEventsView.as_view(), name='my-events'),
    path('<int:pk>/', RSVPDestroyView.as_view(), name='rsvp-destroy'),
    path('organizer-dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
    path('<int:pk>/attendees/', EventAttendeeListView.as_view(), name='event-attendees'),
]
