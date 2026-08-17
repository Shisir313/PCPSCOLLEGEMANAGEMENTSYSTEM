from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from events.models import Event
from datetime import date, time, timedelta


class EventValidationTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(username='org', email='org@example.com', password='pass', role='organizer')

    def test_create_requires_image_by_default(self):
        self.client.force_authenticate(self.user)
        url = reverse('event-list-create')
        payload = {
            'title': 'No Image Event',
            'description': 'Test',
            'date': (date.today() + timedelta(days=1)).isoformat(),
            'time': '12:00:00',
            'location': 'Online'
        }
        resp = self.client.post(url, payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn('image', resp.data)

    def test_create_rejects_past_date(self):
        self.client.force_authenticate(self.user)
        url = reverse('event-list-create')
        payload = {
            'title': 'Past Event',
            'description': 'Test',
            'date': (date.today() - timedelta(days=1)).isoformat(),
            'time': '12:00:00',
            'location': 'Online',
        }
        resp = self.client.post(url, payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn('date', resp.data)

    def test_upcoming_events_are_returned_before_past_events(self):
        Event.objects.create(
            title='Past Event', description='past', date=date.today() - timedelta(days=1), time=time(12, 0), location='Here', organizer=self.user
        )
        Event.objects.create(
            title='Upcoming Event', description='future', date=date.today() + timedelta(days=1), time=time(12, 0), location='There', organizer=self.user
        )

        response = self.client.get(reverse('event-list-create'))
        self.assertEqual(response.status_code, 200)
        results = response.data.get('results', response.data)
        self.assertEqual(results[0]['title'], 'Upcoming Event')
        self.assertEqual(results[1]['title'], 'Past Event')
