import mysql.connector
import os
from dotenv import load_dotenv

# Load .env variables
# Load .env variables
from pathlib import Path
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "forest_fire_db")

def create_database():
    try:
        # Connect to MySQL Server (without specifying DB yet)
        cnx = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = cnx.cursor()

        # Create Database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' checked/created.")

        # Connect to the specific database
        cnx.database = DB_NAME

        # Create Users Table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            fullname VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(50),
            role VARCHAR(50) DEFAULT 'Standard User',
            profile_image LONGTEXT
        )
        """
        cursor.execute(create_table_query)
        print("Table 'users' checked/created successfully.")

        cursor.close()
        cnx.close()
        return True

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False

if __name__ == "__main__":
    if create_database():
        print("MySQL Setup Complete!")
    else:
        print("MySQL Setup Failed.")
