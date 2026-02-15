import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"Current Working Directory: {os.getcwd()}")
print(f"Path: {sys.path}")

try:
    import mysql.connector
    print("SUCCESS: mysql.connector imported successfully.")
    print(f"mysql.connector file: {mysql.connector.__file__}")
except ImportError as e:
    print(f"FAILURE: Could not import mysql.connector. Error: {e}")

try:
    import pip
    print(f"pip version: {pip.__version__}")
except ImportError:
    print("pip not found in this environment.")
