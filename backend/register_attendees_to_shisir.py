#!/usr/bin/env python
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Event
from registrations.models import RSVP
import uuid

User = get_user_model()

print("=" * 70)
print("Registering attendees to shisir's events")
print("=" * 70)

# Get shisir organizer
try:
    shisir = User.objects.get(username='shisir')
    print(f"\n✓ Found organizer: {shisir.username}")
except User.DoesNotExist:
    print("✗ Organizer 'shisir' not found")
    exit(1)

# Get shisir's events
shisir_events = Event.objects.filter(organizer=shisir)
print(f"✓ Found {shisir_events.count()} events by shisir")

if not shisir_events.exists():
    print("✗ No events found for shisir")
    exit(1)

# Get all attendee users
attendees = User.objects.filter(username__startswith='attendee')
print(f"✓ Found {attendees.count()} attendee users")

if not attendees.exists():
    print("✗ No attendee users found")
    exit(1)

# Register attendees to events
print("\nRegistering attendees to events...")
total_rsvps = 0

for attendee in attendees:
    # Register to 3-7 random events
    num_events = random.randint(3, 7)
    random_events = random.sample(list(shisir_events), min(num_events, shisir_events.count()))
    
    for event in random_events:
        try:
            # Create RSVP with unique QR token
            rsvp, created = RSVP.objects.get_or_create(
                attendee=attendee,
                event=event,
                defaults={
                    'qr_token': uuid.uuid4(),
                }
            )
            if created:
                total_rsvps += 1
        except Exception as e:
            print(f"  ⚠️  Error registering {attendee.username} to {event.title}: {e}")

print(f"\n✅ Created {total_rsvps} RSVP registrations")

# Summary by event
print("\n" + "=" * 70)
print("📊 ATTENDEE REGISTRATION SUMMARY BY EVENT")
print("=" * 70)

for event in shisir_events.order_by('date'):
    rsvp_count = event.rsvps.count()
    print(f"  • {event.title:45} — {rsvp_count} attendees registered")

# Summary statistics
print("\n" + "=" * 70)
print("📊 OVERALL STATISTICS")
print("=" * 70)
print(f"Total attendees: {attendees.count()}")
print(f"Total events by shisir: {shisir_events.count()}")
print(f"Total RSVPs created: {total_rsvps}")
print(f"Average RSVPs per event: {total_rsvps // max(1, shisir_events.count())}")
print("=" * 70)
