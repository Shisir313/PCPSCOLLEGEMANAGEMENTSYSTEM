#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from events.models import Event
from events.serializers import EventSerializer

print("=" * 60)
print("Testing Event API")
print("=" * 60)

# Check events in database
print(f"\n✓ Events in database: {Event.objects.count()}")

# Test serialization
print("\nTesting Serialization:")
evt = Event.objects.first()
if evt:
    try:
        serializer = EventSerializer(evt, context={'request': None})
        print(f"  ✓ Serialization successful")
        print(f"  Event ID: {serializer.data['id']}")
        print(f"  Event Title: {serializer.data['title']}")
        print(f"  Image URL: {serializer.data.get('image_url')}")
    except Exception as e:
        print(f"  ✗ Serialization failed: {e}")

# Test API endpoint
print("\nTesting API Endpoint:")
client = Client()
response = client.get('/api/events/')
print(f"  Status Code: {response.status_code}")
if response.status_code == 200:
    data = response.data
    if isinstance(data, dict) and 'results' in data:
        print(f"  Results Count: {len(data['results'])}")
        if data['results']:
            print(f"  First Event Title: {data['results'][0]['title']}")
    else:
        print(f"  Response format: {type(data)}")
else:
    print(f"  Error: {response.data}")

print("\n" + "=" * 60)
