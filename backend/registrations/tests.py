from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from events.models import Event
from datetime import date, time, timedelta


class RSVPValidationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='att', email='a@example.com', password='pass', role='attendee')
        self.org = User.objects.create_user(username='org', email='o@example.com', password='pass', role='organizer')
        self.event = Event.objects.create(
            title='Past', description='past', date=date.today() - timedelta(days=1), time=time(12,0), location='Here', organizer=self.org
        )

    def test_cannot_rsvp_to_past_event(self):
        self.client.force_authenticate(self.user)
        url = reverse('rsvp-list-create')
        resp = self.client.post(url, {'event_id': self.event.id})
        self.assertEqual(resp.status_code, 400)
        self.assertIn('non_field_errors', resp.data)

    def test_attendee_can_register_and_organizer_can_view_attendees(self):
        attendee = get_user_model().objects.create_user(username='student', email='student@example.com', password='pass', role='attendee')
        organizer = get_user_model().objects.create_user(username='teacher', email='teacher@example.com', password='pass', role='organizer')
        event = Event.objects.create(
            title='Launch Event', description='welcome', date=date.today() + timedelta(days=1), time=time(18, 0), location='Room 1', organizer=organizer
        )

        self.client.force_authenticate(attendee)
        create_resp = self.client.post(reverse('rsvp-list-create'), {'event_id': event.id})
        self.assertEqual(create_resp.status_code, 201)
        self.assertEqual(event.rsvps.count(), 1)

        self.client.force_authenticate(organizer)
        attendees_resp = self.client.get(reverse('event-attendees', kwargs={'pk': event.id}))
        self.assertEqual(attendees_resp.status_code, 200)
        self.assertEqual(attendees_resp.data[0]['username'], attendee.username)

    def test_non_organizer_cannot_view_event_attendee_list(self):
        attendee = get_user_model().objects.create_user(username='student2', email='student2@example.com', password='pass', role='attendee')
        organizer = get_user_model().objects.create_user(username='teacher2', email='teacher2@example.com', password='pass', role='organizer')
        event = Event.objects.create(
            title='Another Event', description='welcome', date=date.today() + timedelta(days=2), time=time(19, 0), location='Room 2', organizer=organizer
        )

        self.client.force_authenticate(attendee)
        resp = self.client.get(reverse('event-attendees', kwargs={'pk': event.id}))
        self.assertEqual(resp.status_code, 403)
