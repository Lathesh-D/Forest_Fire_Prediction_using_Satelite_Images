import sys
import os
sys.path.append('src')

try:
    import auth
    print("Testing DB Connection...")
    conn = auth.get_db_connection()
    if conn.is_connected():
        print("SUCCESS: Database connection established!")
        conn.close()
    else:
        print("FAILURE: Connection object returned but not connected.")
except Exception as e:
    print(f"FAILURE: {e}")
