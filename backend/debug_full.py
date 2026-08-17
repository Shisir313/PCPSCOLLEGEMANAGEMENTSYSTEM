#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("=" * 70)
print("DEBUG: Testing Event API Loading")
print("=" * 70)

# Test 1: Check database
print("\n1. Database check:")
from events.models import Event
event_count = Event.objects.count()
print(f"   Events in DB: {event_count}")

# Test 2: Check serialization
print("\n2. Serialization check:")
try:
    from events.serializers import EventSerializer
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/events/')
    
    events = Event.objects.all()[:2]
    serializer = EventSerializer(events, many=True, context={'request': request})
    print(f"   ✓ Serialization successful")
    print(f"   First event keys: {list(serializer.data[0].keys()) if serializer.data else 'No events'}")
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Check queryset filtering
print("\n3. Queryset check:")
try:
    from events.views import EventListCreateView
    from django.db.models import Case, IntegerField, Value, When
    from datetime import date
    
    queryset = Event.objects.select_related('organizer', 'category').prefetch_related('rsvps').order_by(
        Case(
            When(date__gte=date.today(), then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        ),
        'date',
        'time',
    )
    print(f"   Queryset count: {queryset.count()}")
    print(f"   ✓ Queryset generated successfully")
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
