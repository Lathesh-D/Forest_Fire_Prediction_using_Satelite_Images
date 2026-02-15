import sqlite3
import hashlib

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT NOT NULL UNIQUE, 
            password TEXT NOT NULL,
            fullname TEXT,
            email TEXT,
            phone TEXT
        )
    ''')
    conn.commit()
    conn.close()

def make_hashes(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def check_hashes(password, hashed_text):
    if make_hashes(password) == hashed_text:
        return hashed_text
    return False

def add_user(username, password, fullname, email, phone):
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    try:
        c.execute(
            'INSERT INTO users(username, password, fullname, email, phone) VALUES (?,?,?,?,?)', 
            (username, make_hashes(password), fullname, email, phone)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()
    return True

def login_user(username, password):
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username =? AND password = ?', (username, make_hashes(password)))
    data = c.fetchall()
    conn.close()
    return data
