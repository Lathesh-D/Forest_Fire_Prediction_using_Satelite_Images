import sys
with open('debug_log.txt', 'a') as f:
    f.write(f"Python running: {sys.version}\n")
print("Logged to debug_log.txt")
