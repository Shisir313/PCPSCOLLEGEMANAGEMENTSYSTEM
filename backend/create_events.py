import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Event
from categories.models import Category

User = get_user_model()

# Get or create alex user as organizer
alex, created = User.objects.get_or_create(
    username='alex',
    defaults={
        'email': 'alex@pcps.edu',
        'first_name': 'Alex',
        'last_name': 'Johnson',
        'role': 'organizer',
        'is_active': True
    }
)
print(f"User: {'Created' if created else 'Already exists'} — alex (organizer)")

# Get categories
categories = list(Category.objects.all())
if not categories:
    print("ERROR: No categories found. Run create_categories.py first!")
    exit(1)

# Sample event data
event_titles = [
    'Annual Tech Summit 2026',
    'Python Workshop Series',
    'Web Development Bootcamp',
    'Data Science Deep Dive',
    'Cloud Computing Masterclass',
    'AI & Machine Learning Conference',
    'Cybersecurity Awareness Day',
    'Full Stack Development Course',
    'DevOps Workshop',
    'Mobile App Development Sprint',
]

event_descriptions = [
    'Join us for an exciting day of learning and networking with industry experts.',
    'Hands-on workshop covering the latest technologies and best practices.',
    'Comprehensive course designed for beginners and intermediate developers.',
    'Deep dive into advanced concepts with live coding demonstrations.',
    'Conference featuring keynote speakers and interactive panel discussions.',
    'Learn from experts and connect with peers in this exclusive event.',
    'Practical training with real-world projects and case studies.',
    'Interactive workshop with hands-on exercises and group activities.',
    'Seminar covering current trends and future technologies.',
    'Professional development event with networking opportunities.',
]

locations = [
    'Main Auditorium',
    'Conference Room A',
    'Library Hall',
    'Innovation Center',
    'Tech Lab',
    'Student Center',
    'Meeting Room 201',
    'Grand Ballroom',
    'Seminar Room 5',
    'Virtual Event',
]

# Create 10 events
print("\nCreating 10 events for alex...")
created_count = 0

for i in range(10):
    # Random dates (spread over next 90 days)
    days_offset = random.randint(1, 90)
    event_date = datetime.now().date() + timedelta(days=days_offset)
    event_time = f"{random.choice([9, 10, 14, 15, 16])}:00"
    
    # Random capacity
    capacity = random.choice([50, 100, 150, 200, 300])
    
    # Random category
    category = random.choice(categories)
    
    event, created = Event.objects.get_or_create(
        title=event_titles[i],
        organizer=alex,
        defaults={
            'description': event_descriptions[i],
            'date': event_date,
            'time': event_time,
            'location': locations[i],
            'capacity': capacity,
            'category': category,
        }
    )
    
    if created:
        created_count += 1
        print(f"  ✓ {event.title} — {event.date} at {event.location}")
    else:
        print(f"  ○ {event.title} — (already exists)")

print(f"\n✅ Total: {created_count} new events created for alex")
print(f"📊 Total events by alex: {Event.objects.filter(organizer=alex).count()}")
