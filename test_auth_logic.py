import sys
import os
sys.path.insert(0, './src')
from auth import init_db, add_user, login_user

def test_auth():
    print("Initializing DB...")
    init_db()
    
    test_user = "test_user_789"
    test_pass = "test_pass_123"
    
    print(f"Adding user {test_user}...")
    result = add_user(test_user, test_pass, "Test User", "test@example.com", "1234567890")
    print(f"Add user result: {result}")
    
    print(f"Logging in user {test_user}...")
    user_data = login_user(test_user, test_pass)
    print(f"Login result: {user_data}")
    
    if user_data:
        print("Auth logic works!")
    else:
        print("Auth logic FAILED!")

if __name__ == "__main__":
    test_auth()
