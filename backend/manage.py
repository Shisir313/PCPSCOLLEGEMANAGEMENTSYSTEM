#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    # If MONGODB_URI is provided, attempt a quick connect so errors surface early.
    MONGODB_URI = os.environ.get('MONGODB_URI')
    if MONGODB_URI:
        try:
            import mongoengine
            mongoengine.connect(host=MONGODB_URI)
            print('MongoDB: connected (via MONGODB_URI)')
        except Exception as e:
            print('MongoDB connection warning:', e)
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
