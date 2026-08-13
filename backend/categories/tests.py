from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from .models import Category


class CategoryAPITests(APITestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_user(
            username='admin', email='admin@example.com', password='pass', role='admin'
        )
        self.user = CustomUser.objects.create_user(
            username='user', email='user@example.com', password='pass', role='attendee'
        )

    def test_list_public(self):
        Category.objects.create(name='Conf', description='Conference')
        url = reverse('category-list-create')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)

    def test_create_requires_auth(self):
        url = reverse('category-list-create')
        resp = self.client.post(url, {'name': 'Meetup', 'description': 'Local'}, format='json')
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_create_requires_admin(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('category-list-create')
        resp = self.client.post(url, {'name': 'Meetup', 'description': 'Local'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_and_duplicate_blocked(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('category-list-create')
        resp = self.client.post(url, {'name': 'Meetup', 'description': 'Local'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # duplicate name should fail
        resp2 = self.client.post(url, {'name': 'Meetup', 'description': 'Other'}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_update_and_delete(self):
        cat = Category.objects.create(name='Old', description='Old')
        url = reverse('category-detail', args=[cat.pk])

        # non-admin cannot update
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch(url, {'name': 'New'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # admin can update
        self.client.force_authenticate(user=self.admin)
        resp2 = self.client.patch(url, {'name': 'New'}, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        cat.refresh_from_db()
        self.assertEqual(cat.name, 'New')

        # admin can delete
        resp3 = self.client.delete(url)
        self.assertEqual(resp3.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(pk=cat.pk).exists())
