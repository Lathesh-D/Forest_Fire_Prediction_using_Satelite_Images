import os
import shutil
import sys

def log(msg):
    with open("restructure_log.txt", "a") as f:
        f.write(msg + "\n")
    print(msg)

log("Starting restructure process...")

root = r"l:\Forest1"
backend = os.path.join(root, "backend")

if not os.path.exists(backend):
    os.makedirs(backend)
    log(f"Created {backend}")

to_move = ["api.py", "requirements.txt", "users.db", "evaluate.py"]

for item in to_move:
    src = os.path.join(root, item)
    dst = os.path.join(backend, item)
    if os.path.exists(src):
        try:
            shutil.copy2(src, dst)
            log(f"Copied {item} to backend/")
            os.remove(src)
            log(f"Deleted original {item}")
        except Exception as e:
            log(f"Error handling {item}: {e}")
    else:
        log(f"Source {item} does not exist")

log("Process finished.")
