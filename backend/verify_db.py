import os
from dotenv import load_dotenv
import mysql.connector

# Debug paths
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
print(f"Looking for .env at: {env_path}")
print(f"File exists: {os.path.exists(env_path)}")

# Explicitly load
loaded = load_dotenv(env_path)
print(f"load_dotenv returned: {loaded}")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "forest_fire_db")

print(f"Loaded HOST: {DB_HOST}")
print(f"Loaded USER: {DB_USER}")
# Mask password for security in logs, but check length
print(f"Loaded PASSWORD Length: {len(DB_PASSWORD)}")
print(f"Loaded PASSWORD First/Last: {DB_PASSWORD[:2]}...{DB_PASSWORD[-2:]}" if DB_PASSWORD else "PASSWORD IS EMPTY")

print("\nAttempting connection...")
try:
    cnx = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    print("SUCCESS: Connected to MySQL!")
    
    cursor = cnx.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    print(f"SUCCESS: Database {DB_NAME} ensured.")
    cnx.close()
except mysql.connector.Error as err:
    print(f"FAILURE: {err}")
