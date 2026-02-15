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
    
    # Check if column exists
    c.execute("SHOW COLUMNS FROM users LIKE 'profile_image'")
    result = c.fetchone()
    
    if result:
        print("Column profile_image exists. Modifying to LONGTEXT...")
        # Modify existing column
        c.execute("ALTER TABLE users MODIFY COLUMN profile_image LONGTEXT")
    else:
        print("Column profile_image does not exist. Adding as LONGTEXT...")
        # Add new column
        c.execute("ALTER TABLE users ADD COLUMN profile_image LONGTEXT")
        
    conn.commit()
    print("Database schema updated successfully!")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
