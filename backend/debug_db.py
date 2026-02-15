import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'forest_fire_db')
    )
    c = conn.cursor()
    c.execute('DESCRIBE users')
    rows = c.fetchall()
    
    with open('db_schema.txt', 'w') as f:
        f.write("USERS TABLE SCHEMA:\n")
        for row in rows:
            f.write(str(row) + "\n")
            
    conn.close()
except Exception as e:
    with open('db_schema.txt', 'w') as f:
        f.write(f"Error: {e}")
