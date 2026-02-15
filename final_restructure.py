import os
import shutil
import glob

# Ensure absolute paths for maximum reliability
ROOT = r"l:\Forest1"
BACKEND = os.path.join(ROOT, "backend")
FRONTEND = os.path.join(ROOT, "frontend")

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

def force_move(src, dst_dir):
    src_path = os.path.join(ROOT, src)
    if not os.path.exists(src_path):
        print(f"Skipping {src}: Source does not exist.")
        return

    ensure_dir(dst_dir)
    dst_path = os.path.join(dst_dir, os.path.basename(src_path))

    try:
        if os.path.isdir(src_path):
            if os.path.exists(dst_path):
                # If destination dir exists, merge content or replace? 
                # For this task, we replace to ensure a clean state as requested.
                shutil.rmtree(dst_path)
            shutil.move(src_path, dst_dir)
            print(f"Moved directory {src} to {dst_dir}")
        else:
            if os.path.exists(dst_path):
                os.remove(dst_path)
            shutil.move(src_path, dst_path)
            print(f"Moved file {src} to {dst_dir}")
    except Exception as e:
        print(f"Error moving {src}: {e}")

# Phase 1: Move essential backend files
backend_files = ["api.py", "requirements.txt", "users.db", "evaluate.py", "index.html", "backend_log.txt"]
for f in backend_files:
    force_move(f, BACKEND)

# Phase 2: Move backend directories
backend_dirs = ["src", "models", "data"]
for d in backend_dirs:
    force_move(d, BACKEND)

# Phase 3: Move/Cleanup other files
# 3d_animation.html could be part of frontend
force_move("3d_animation.html", FRONTEND)

# Phase 4: Delete redundant/test files
to_delete = ["streamlit_app_backup.py", "restructure.bat", "restructure_script.py", "restructure_log_script.py"]
for f in to_delete:
    p = os.path.join(ROOT, f)
    if os.path.exists(p):
        try:
            os.remove(p)
            print(f"Deleted {f}")
        except Exception as e:
            print(f"Error deleting {f}: {e}")

# Cleanup test files
for test_file in glob.glob(os.path.join(ROOT, "test_*.py")):
    try:
        os.remove(test_file)
        print(f"Deleted {os.path.basename(test_file)}")
    except Exception as e:
        print(f"Error deleting {test_file}: {e}")

# Special case: restructure_log.txt (if exists)
log_file = os.path.join(ROOT, "restructure_log.txt")
if os.path.exists(log_file):
    os.remove(log_file)

print("Migration completed successfully.")
