import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "forest_fire_db")

try:
    cnx = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = cnx.cursor()
    cursor.execute("DESCRIBE users")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
    
    cursor.close()
    cnx.close()
except Exception as e:
    print(e)
