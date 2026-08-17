#!/usr/bin/env python
import urllib.request
import json

print("Testing API endpoint: http://127.0.0.1:8000/api/events/\n")

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/api/events/')
    data = json.loads(response.read().decode())
    
    print(f"✓ Status Code: {response.status}")
    print(f"✓ Response Type: {type(data).__name__}")
    
    if isinstance(data, dict):
        print(f"✓ Results Count: {len(data.get('results', []))}")
        if data.get('results'):
            print(f"✓ First Event: {data['results'][0]['title']}")
            print(f"✓ Event ID: {data['results'][0]['id']}")
    else:
        print(f"✓ Events List Length: {len(data)}")
        if data:
            print(f"✓ First Event: {data[0]['title']}")
    
    print("\n✅ API is working correctly!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
