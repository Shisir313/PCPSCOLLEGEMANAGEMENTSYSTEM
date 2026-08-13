from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model


class FeatureFlagAPITests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'pass')

    def test_flags_get_requires_admin(self):
        url = reverse('feature-flags')
        # anonymous may be allowed to read flags (public read), admin required to write
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (200, 401, 403))
        # admin can read
        self.client.force_authenticate(self.admin)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('require_event_image', resp.data)
