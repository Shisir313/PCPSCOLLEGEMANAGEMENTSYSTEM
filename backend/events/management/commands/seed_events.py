from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, time

from accounts.models import CustomUser
from categories.models import Category
from events.models import Event


class Command(BaseCommand):
    help = 'Seed the database with sample past and upcoming events.'

    def handle(self, *args, **options):
        now = timezone.now()

        # Ensure an organizer user exists
        organizer, created = CustomUser.objects.get_or_create(
            username='seed_organizer',
            defaults={'email': 'seed_organizer@example.com', 'role': 'organizer'}
        )
        if created:
            organizer.set_password('password')
            organizer.save()

        # Ensure some categories exist
        categories = []
        for name in ('Conference', 'Meetup', 'Workshop', 'Webinar'):
            cat, _ = Category.objects.get_or_create(name=name, defaults={'description': f'{name} events'})
            categories.append(cat)

        created_events = []

        # Past events (3)
        for i, days in enumerate((10, 5, 1), start=1):
            d = (now - timedelta(days=days)).date()
            t = time(18, 0)
            title = f'Past Event {i}'
            ev, _ = Event.objects.get_or_create(
                title=title,
                defaults={
                    'description': f'{title} description',
                    'date': d,
                    'time': t,
                    'location': 'Venue A',
                    'capacity': 100,
                    'organizer': organizer,
                    'category': categories[i % len(categories)],
                }
            )
            created_events.append(ev)

        # Upcoming events (5)
        for i, days in enumerate((1, 2, 7, 30, 60), start=1):
            d = (now + timedelta(days=days)).date()
            t = time(19, 30)
            title = f'Upcoming Event {i}'
            ev, _ = Event.objects.get_or_create(
                title=title,
                defaults={
                    'description': f'{title} description',
                    'date': d,
                    'time': t,
                    'location': 'Venue B',
                    'capacity': 200,
                    'organizer': organizer,
                    'category': categories[(i+1) % len(categories)],
                }
            )
            created_events.append(ev)

        self.stdout.write(self.style.SUCCESS(f'Created/verified {len(created_events)} sample events.'))