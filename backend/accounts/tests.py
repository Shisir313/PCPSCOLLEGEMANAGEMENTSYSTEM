from django.urls import reverse
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    def test_registration_requires_email_by_default(self):
        url = reverse('register')
        payload = {'username': 'u1', 'password': 'pass1234', 'password2': 'pass1234', 'role': 'attendee'}
        resp = self.client.post(url, payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn('email', resp.data)

    def test_registration_creates_user_with_pending_role(self):
        url = reverse('register')
        payload = {
            'username': 'u2',
            'email': 'u2@example.com',
            'password': 'pass1234',
            'password2': 'pass1234',
            'role': 'attendee',
        }
        resp = self.client.post(url, payload)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['username'], 'u2')
        self.assertEqual(resp.data['role'], 'pending')
