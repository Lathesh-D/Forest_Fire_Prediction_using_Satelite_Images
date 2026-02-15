import os
import shutil
import glob

# Ensure absolute paths
ROOT = r"l:\Forest1"
BACKEND = os.path.join(ROOT, "backend")
FRONTEND = os.path.join(ROOT, "frontend")

def log(msg):
    print(msg)

def safe_move(src_name, dst_dir):
    src = os.path.join(ROOT, src_name)
    if not os.path.exists(src):
        return
    
    if not os.path.exists(dst_dir):
        os.makedirs(dst_dir)
        
    dst = os.path.join(dst_dir, src_name)
    
    try:
        if os.path.isdir(src):
            # If directory exists in destination, we might have a collision
            if os.path.exists(os.path.join(dst_dir, os.path.basename(src))):
                log(f"Warning: Destination {dst_dir}\\{os.path.basename(src)} already exists.")
            shutil.move(src, dst_dir)
            log(f"Successfully moved directory {src_name} to {dst_dir}")
        else:
            if os.path.exists(dst):
                os.remove(dst)
            shutil.move(src, dst)
            log(f"Successfully moved file {src_name} to {dst_dir}")
    except Exception as e:
        log(f"Failed to move {src_name}: {e}")

def safe_delete(name):
    path = os.path.join(ROOT, name)
    if not os.path.exists(path):
        return
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
        log(f"Successfully deleted {name}")
    except Exception as e:
        log(f"Failed to delete {name}: {e}")

log("--- Starting Migration ---")

# Target backend moves
for f in ["api.py", "requirements.txt", "users.db", "evaluate.py", "index.html", "backend_log.txt"]:
    safe_move(f, BACKEND)

for d in ["models", "data", "src"]:
    safe_move(d, BACKEND)

# Target frontend moves
safe_move("3d_animation.html", FRONTEND)

# Root Cleanup
for f in ["streamlit_app_backup.py", "restructure.bat", "final_restructure.py", "restructure_log_script.py", "restructure_script.py"]:
    safe_delete(f)

# Test files
for test_file in glob.glob(os.path.join(ROOT, "test_*.py")):
    safe_delete(os.path.basename(test_file))

log("--- Migration Finished ---")
