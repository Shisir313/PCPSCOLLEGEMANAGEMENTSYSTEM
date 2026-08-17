from datetime import date
from django.utils import timezone

from django.db.models import Case, IntegerField, Value, When
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RSVP
from .serializers import RSVPSerializer, CheckInSerializer
from accounts.permissions import IsAttendee
from events.serializers import EventDetailSerializer
from events.models import Event


class RSVPListCreateView(generics.ListCreateAPIView):
    """POST /api/rsvps/ — Attendee only, creates an RSVP."""
    serializer_class = RSVPSerializer
    def get_permissions(self):
        # Public read; authenticated attendee required to create
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAttendee()]

    def get_queryset(self):
        if self.request.method == 'GET':
            return RSVP.objects.select_related('event', 'attendee').order_by('registered_at')
        return RSVP.objects.filter(attendee=self.request.user).select_related('event', 'attendee')

    def perform_create(self, serializer):
        serializer.save(attendee=self.request.user)


class RSVPDestroyView(generics.DestroyAPIView):
    """DELETE /api/rsvps/<pk>/ — Attendee (owner) only, cancels RSVP."""
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated, IsAttendee]

    def get_queryset(self):
        return RSVP.objects.filter(attendee=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyEventsView(generics.ListAPIView):
    """GET /api/rsvps/my-events/ — Attendee only, list all RSVPs with event details."""
    permission_classes = [permissions.IsAuthenticated, IsAttendee]

    def get(self, request, *args, **kwargs):
        rsvps = RSVP.objects.filter(
            attendee=request.user
        ).select_related('event__organizer', 'event__category').prefetch_related(
            'event__rsvps'
        ).order_by(
            Case(
                When(event__date__gte=date.today(), then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            ),
            'event__date',
            'event__time',
        )

        events = [rsvp.event for rsvp in rsvps]
        serializer = EventDetailSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


class OrganizerDashboardView(APIView):
    """GET /api/dashboard/ — Organizer only, list owned events with RSVP stats."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from accounts.permissions import IsOrganizer
        if not IsOrganizer().has_permission(request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        events = Event.objects.filter(
            organizer=request.user
        ).select_related('organizer', 'category').prefetch_related('rsvps').order_by(
            Case(
                When(date__gte=date.today(), then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            ),
            'date',
            'time',
        )

        serializer = EventDetailSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


class EventAttendeeListView(APIView):
    """GET /api/events/<pk>/attendees/ — Organizer of the event or admin only."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        from rest_framework.exceptions import PermissionDenied

        event = get_object_or_404(Event, pk=pk)

        if request.user.role == 'admin' or event.organizer_id == request.user.id:
            pass
        else:
            raise PermissionDenied()

        rsvps = RSVP.objects.filter(event=event).select_related('attendee').order_by('registered_at')
        data = [
            {
                'username': rsvp.attendee.username,
                'email': rsvp.attendee.email,
                'registered_at': rsvp.registered_at,
            }
            for rsvp in rsvps
        ]
        return Response(data)


class CheckInView(APIView):
    """
    POST /api/rsvps/checkin/
    Organizer or admin scans a QR token to check an attendee in.
    Body: { "qr_token": "<uuid>" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from rest_framework.exceptions import PermissionDenied

        # Only organizers and admins can check people in
        if request.user.role not in ('organizer', 'admin'):
            raise PermissionDenied('Only organizers and admins can check in attendees.')

        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qr_token = serializer.validated_data['qr_token']

        try:
            rsvp = RSVP.objects.select_related('attendee', 'event').get(qr_token=qr_token)
        except RSVP.DoesNotExist:
            return Response({'error': 'Invalid QR code. No matching registration found.'},
                            status=status.HTTP_404_NOT_FOUND)

        if rsvp.checked_in:
            return Response(
                {
                    'error': f'{rsvp.attendee.username} has already been checked in.',
                    'attendee': rsvp.attendee.username,
                    'event': rsvp.event.title,
                    'checked_in_at': rsvp.checked_in_at,
                },
                status=status.HTTP_409_CONFLICT,
            )

        rsvp.checked_in = True
        rsvp.checked_in_at = timezone.now()
        rsvp.checked_in_by = request.user
        rsvp.save(update_fields=['checked_in', 'checked_in_at', 'checked_in_by'])

        return Response({
            'attendee': rsvp.attendee.username,
            'event': rsvp.event.title,
            'checked_in_at': rsvp.checked_in_at,
        }, status=status.HTTP_200_OK)
