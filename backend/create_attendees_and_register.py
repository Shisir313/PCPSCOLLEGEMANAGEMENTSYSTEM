import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Event
from registrations.models import RSVP

User = get_user_model()

# Sample attendee names
first_names = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Jessica',
               'William', 'Maria', 'Joseph', 'Jennifer', 'Thomas', 'Patricia', 'Charles', 'Barbara', 'Christopher', 'Susan']
last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
              'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

# Create 20 attendee users
print("Creating 20 attendee users...")
attendees = []
created_count = 0

for i in range(1, 21):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    username = f"attendee{i}"
    email = f"attendee{i}@pcps.edu"
    
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': 'attendee',
            'is_active': True
        }
    )
    
    # Set password for each attendee
    user.set_password('attendee123')
    user.save()
    
    attendees.append(user)
    
    if created:
        created_count += 1
        print(f"  ✓ {username} — {first_name} {last_name}")
    else:
        print(f"  ○ {username} — (already exists)")

print(f"\n✅ Created {created_count} attendee users")

# Get all events by alex
events = Event.objects.filter(organizer__username='alex')
print(f"\n📍 Found {events.count()} events by alex")

# Register attendees to events
print("\nRegistering attendees to events...")
rsvp_count = 0

for attendee in attendees:
    # Each attendee registers for 3-7 random events
    num_events = random.randint(3, min(7, events.count()))
    selected_events = random.sample(list(events), num_events)
    
    for event in selected_events:
        rsvp, created = RSVP.objects.get_or_create(
            attendee=attendee,
            event=event
        )
        if created:
            rsvp_count += 1

print(f"✅ Created {rsvp_count} RSVP registrations")

# Stats
print("\n" + "="*50)
print("📊 SUMMARY")
print("="*50)
print(f"Total attendees: {User.objects.filter(role='attendee').count()}")
print(f"Total events: {events.count()}")
print(f"Total RSVPs: {RSVP.objects.count()}")

# Show details per event
print("\n📋 Events & Attendee Count:")
for event in events.order_by('date'):
    rsvp_count = event.rsvps.count()
    print(f"  • {event.title:<40} — {rsvp_count} attendees registered")

print("\n✨ All attendees can login with password: attendee123")
