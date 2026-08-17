#!/usr/bin/env python
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from events.models import Event
from categories.models import Category
import random

User = get_user_model()

# Step 1: Create organizer user
print("Creating organizer account...")
try:
    organizer = User.objects.create_user(
        username='shisir',
        email='shisir@pcps.edu',
        password='1shisir123',
        first_name='Shisir',
        last_name='Organizer',
        role='organizer'
    )
    print(f"✅ Organizer created: {organizer.username}")
except Exception as e:
    organizer = User.objects.get(username='shisir')
    print(f"⚠️  Organizer already exists: {organizer.username}")

# Step 2: Get or create categories
categories = Category.objects.all()
if not categories.exists():
    print("Creating categories...")
    cat_names = ['Academic', 'Sports', 'Cultural', 'Technology', 'Competition', 'Networking']
    for name in cat_names:
        Category.objects.get_or_create(name=name)

# Step 3: Parse and create events
# Converting dates (Jul07 = July 7, Jun06 = June 6, etc.)
month_map = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
}

events_data = [
    {'title': 'Career Connect', 'location': 'PCPS College', 'date_str': 'Jul07', 'category': 'Networking'},
    {'title': 'Futsal Tournament', 'location': 'PCPS College', 'date_str': 'Jul07', 'category': 'Sports'},
    {'title': 'Upstart Market Simulation', 'location': 'PCPS College', 'date_str': 'Jul07', 'category': 'Technology'},
    {'title': 'Graduation Ceremony', 'location': 'Soltee Hotel', 'date_str': 'Jul07', 'category': 'Academic'},
    {'title': 'Upstart', 'location': 'PCPS College', 'date_str': 'Jun06', 'category': 'Technology'},
    {'title': 'DGO World Cup Engagement', 'location': 'PCPS College', 'date_str': 'Apr04', 'category': 'Sports'},
    {'title': 'Into the Industry: Jiri Edition', 'location': 'PCPS College', 'date_str': 'Mar03', 'category': 'Networking'},
    {'title': 'Sports Week', 'location': 'PCPS College', 'date_str': 'Mar03', 'category': 'Sports'},
    {'title': '1st Demo Pitch', 'location': 'PCPS College', 'date_str': 'Mar03', 'category': 'Technology'},
    {'title': 'Basketball League 1', 'location': 'Basketball Court', 'date_str': 'Feb02', 'category': 'Sports', 'time': '11:00'},
    {'title': 'Holi Umanga', 'location': 'PCPS College', 'date_str': 'Mar03', 'category': 'Cultural', 'time': '10:30'},
    {'title': 'Upstart - Incubation', 'location': 'Learning Hub', 'date_str': 'Mar03', 'category': 'Technology', 'time': '13:00'},
    {'title': 'PCPS Community presents BasketBall League', 'location': 'PCPS College', 'date_str': 'Feb02', 'category': 'Sports'},
    {'title': 'Upstart - Concept Preparation', 'location': 'PCPS College', 'date_str': 'Jan01', 'category': 'Technology', 'time': '15:00'},
    {'title': 'Pubg Tournament', 'location': 'PCPS', 'date_str': 'Jan01', 'category': 'Competition', 'time': '13:45', 'description': 'Exciting campus tournament with cash prize for winners. Open to all students. Registration at the office.'},
    {'title': 'Community Inauguration', 'location': 'PCPS', 'date_str': 'Jan01', 'category': 'Networking', 'description': 'Community event at PCPS'},
]

print(f"\nCreating {len(events_data)} events for shisir...")
created_count = 0

for event_data in events_data:
    try:
        # Parse date: Jul07 -> July 7, 2026
        date_str = event_data['date_str']
        month_str = date_str[:3]
        day_str = date_str[3:]
        
        month = month_map.get(month_str, 7)
        day = int(day_str)
        year = 2026
        
        event_date = datetime(year, month, day).date()
        
        # Get time (default to 10:00 AM)
        time_str = event_data.get('time', '10:00')
        if isinstance(time_str, str):
            if ':' not in time_str:
                event_time = datetime.strptime('10:00', '%H:%M').time()
            else:
                event_time = datetime.strptime(time_str, '%H:%M').time()
        else:
            event_time = datetime.strptime('10:00', '%H:%M').time()
        
        # Get category
        category_name = event_data.get('category', 'Academic')
        category = Category.objects.filter(name=category_name).first()
        if not category:
            category = Category.objects.first()
        
        # Create event
        event, created = Event.objects.get_or_create(
            title=event_data['title'],
            organizer=organizer,
            defaults={
                'date': event_date,
                'time': event_time,
                'location': event_data['location'],
                'category': category,
                'capacity': random.randint(50, 500),
                'description': event_data.get('description', f"{event_data['title']} at {event_data['location']}")
            }
        )
        
        if created:
            print(f"  ✓ {event.title} — {event.date} at {event.location}")
            created_count += 1
        else:
            print(f"  ⚠️  {event.title} already exists")
            
    except Exception as e:
        print(f"  ✗ Error creating event: {e}")

print(f"\n✅ Total: {created_count} new events created for shisir")
print(f"📊 Total events by shisir: {Event.objects.filter(organizer=organizer).count()}")
