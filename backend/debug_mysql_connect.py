import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

print(f"Attempting connection with: User={DB_USER}, Host={DB_HOST}, Password={'******' if DB_PASSWORD else '(empty)'}")

try:
    cnx = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    if cnx.is_connected():
        print("Successfully connected to MySQL Server.")
        cursor = cnx.cursor()
        cursor.execute("SHOW DATABASES")
        dbs = [x[0] for x in cursor.fetchall()]
        print(f"Existing Databases: {dbs}")
        
        db_name = os.getenv("DB_NAME", "forest_fire_db")
        if db_name in dbs:
            print(f"Database '{db_name}' EXISTS.")
        else:
            print(f"Database '{db_name}' DOES NOT EXIST.")
            
        cnx.close()
except mysql.connector.Error as err:
    print(f"Connection Failed: {err}")
