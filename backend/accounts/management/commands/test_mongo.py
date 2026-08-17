import os
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Test MongoDB Atlas connection using MONGODB_URI env var'

    def handle(self, *args, **options):
        uri = os.environ.get('MONGODB_URI')
        if not uri:
            self.stdout.write(self.style.ERROR('MONGODB_URI is not set'))
            return
        try:
            from pymongo import MongoClient
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            info = client.server_info()
            self.stdout.write(self.style.SUCCESS('MongoDB connection OK'))
            self.stdout.write(str(info.get('version')))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'MongoDB connection failed: {e}'))
