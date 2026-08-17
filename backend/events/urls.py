from django.urls import path
from .views import EventListCreateView, EventRetrieveUpdateDestroyView
from registrations.views import EventAttendeeListView

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
    path('<int:pk>/attendees/', EventAttendeeListView.as_view(), name='event-attendees'),
]
