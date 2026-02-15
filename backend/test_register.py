import requests
import sys

url = "http://127.0.0.1:8000/register"
data = {
    "username": "testuser_db_check",
    "password": "password123",
    "fullname": "Test User",
    "email": "test@example.com",
    "phone": "1234567890"
}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=data, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request Failed: {e}")
