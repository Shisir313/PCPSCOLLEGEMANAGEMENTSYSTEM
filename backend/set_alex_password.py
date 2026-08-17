import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Set password for alex
alex = User.objects.get(username='alex')
alex.set_password('alex123')
alex.save()

print(f"✅ Password set for alex")
print(f"   Username: alex")
print(f"   Password: alex123")
print(f"   Email: {alex.email}")
print(f"   Role: {alex.role}")
