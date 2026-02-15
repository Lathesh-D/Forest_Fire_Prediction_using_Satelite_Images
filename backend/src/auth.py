import mysql.connector
import hashlib
import os
from dotenv import load_dotenv

# Robust .env loading
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "forest_fire_db")

def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                fullname VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(255),
                profile_image LONGTEXT
            )
        ''')
        conn.commit()
    except mysql.connector.Error as e:
        print(f"DB Init Error: {e}")
    finally:
        c.close()
        conn.close()

def make_hashes(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def check_hashes(password, hashed_text):
    if make_hashes(password) == hashed_text:
        return hashed_text
    return False

def add_user(username, password, fullname, email, phone):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute(
            'INSERT INTO users(username, password, fullname, email, phone) VALUES (%s,%s,%s,%s,%s)', 
            (username, make_hashes(password), fullname, email, phone)
        )
        conn.commit()
    except mysql.connector.Error:
        return False
    finally:
        c.close()
        conn.close()
    return True

def login_user(username, password):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username =%s AND password = %s', (username, make_hashes(password)))
    data = c.fetchall()
    c.close()
    conn.close()
    return data

def update_user_profile(username, email, phone, profile_image=None):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        if profile_image:
            # Update image as well if provided
            c.execute(
                'UPDATE users SET email=%s, phone=%s, profile_image=%s WHERE username=%s',
                (email, phone, profile_image, username)
            )
        else:
            c.execute(
                'UPDATE users SET email=%s, phone=%s WHERE username=%s',
                (email, phone, username)
            )
        conn.commit()
        return True
    except mysql.connector.Error as e:
        print(f"Error updating profile: {e}")
        return False
    finally:
        c.close()
        conn.close()
