#!/usr/bin/env python
import urllib.request
import json

print("Testing proxy through Vite dev server: http://localhost:5174/api/events/\n")

try:
    response = urllib.request.urlopen('http://localhost:5174/api/events/', timeout=5)
    data = json.loads(response.read().decode())
    
    print(f"✓ Status Code: {response.status}")
    if isinstance(data, dict):
        print(f"✓ Results Count: {len(data.get('results', []))}")
        if data.get('results'):
            print(f"✓ First Event: {data['results'][0]['title']}")
    
    print("\n✅ Frontend proxy is working correctly!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
