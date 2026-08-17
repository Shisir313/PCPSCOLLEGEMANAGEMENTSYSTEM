#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from events.views import EventListCreateView

factory = RequestFactory()
request = factory.get('/api/events/')
view = EventListCreateView.as_view()

try:
    response = view(request)
    print(f'Status: {response.status_code}')
    print(f'Content type: {response.get("Content-Type", "unknown")}')
    if response.status_code == 200:
        print(f'Response preview: {str(response.data)[:200]}...')
    else:
        print(f'Error content: {str(response.content)[:500]}')
except Exception as e:
    print(f'Exception: {type(e).__name__}: {e}')
    import traceback
    traceback.print_exc()
