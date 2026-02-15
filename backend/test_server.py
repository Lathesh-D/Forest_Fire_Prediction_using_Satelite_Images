import requests
import sys

try:
    print("Attempting to connect to http://127.0.0.1:8000/...")
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Status Code: {response.status_code}")
    print("Server is reachable!")
except Exception as e:
    print(f"Connection Failed: {e}")
    sys.exit(1)
