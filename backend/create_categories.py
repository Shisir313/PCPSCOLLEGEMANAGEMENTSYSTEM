import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from categories.models import Category

# Create sample categories
categories = [
    'Academic',
    'Sports',
    'Cultural',
    'Technology',
    'Competition',
    'Networking',
]

for cat in categories:
    obj, created = Category.objects.get_or_create(
        name=cat, 
        defaults={'description': f'{cat} event'}
    )
    status = "Created" if created else "Already exists"
    print(f"{status}: {cat}")

print(f"\nTotal categories: {Category.objects.count()}")
