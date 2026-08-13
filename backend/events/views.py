from datetime import date
from django.db.models import Case, IntegerField, Value, When
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Event
from .serializers import EventSerializer, EventDetailSerializer
from .filters import EventFilter
from accounts.permissions import IsOrganizer, IsOwnerOrAdmin


class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/  — public, paginated, ordered by date asc, filterable
    POST /api/events/  — Organizer only
    """
    queryset = Event.objects.select_related(
        'organizer', 'category'
    ).prefetch_related('rsvps').order_by(
        Case(
            When(date__gte=date.today(), then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        ),
        'date',
        'time',
    )
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        return EventDetailSerializer if self.request.method == 'POST' else EventSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsOrganizer()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET         /api/events/<pk>/  — public
    PUT/PATCH   /api/events/<pk>/  — owner or admin
    DELETE      /api/events/<pk>/  — owner or admin (cascades RSVPs via on_delete=CASCADE)
    """
    queryset = Event.objects.select_related('organizer', 'category').prefetch_related('rsvps')
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = EventDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.AllowAny()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
