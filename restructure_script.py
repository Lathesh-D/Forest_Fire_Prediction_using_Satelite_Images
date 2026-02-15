import os
import shutil
import glob

# Define root
root = r"l:\Forest1"
backend_root = os.path.join(root, "backend")

# Create backend dir
if not os.path.exists(backend_root):
    os.makedirs(backend_root)
    print(f"Created {backend_root}")

# Files and dirs to move to backend
to_move = [
    "api.py",
    "requirements.txt",
    "users.db",
    "evaluate.py",
    "src",
    "models",
    "data"
]

for item in to_move:
    src_path = os.path.join(root, item)
    dst_path = os.path.join(backend_root, item)
    
    if os.path.exists(src_path):
        try:
            if os.path.isdir(src_path):
                # For directories, if dst exists, remove it first to avoid collision
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                shutil.move(src_path, backend_root)
                print(f"Moved directory {item} to backend/")
            else:
                shutil.move(src_path, dst_path)
                print(f"Moved file {item} to backend/")
        except Exception as e:
            print(f"Failed to move {item}: {e}")

# Files to delete
to_delete = [
    "3d_animation.html",
    "backend_log.txt",
    "index.html",
    "streamlit_app_backup.py"
]

for item in to_delete:
    path = os.path.join(root, item)
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"Deleted {item}")
        except Exception as e:
            print(f"Failed to delete {item}: {e}")

# Delete test files
for test_file in glob.glob(os.path.join(root, "test_*.py")):
    try:
        os.remove(test_file)
        print(f"Deleted {os.path.basename(test_file)}")
    except Exception as e:
        print(f"Failed to delete {test_file}: {e}")

print("Restructure complete.")
