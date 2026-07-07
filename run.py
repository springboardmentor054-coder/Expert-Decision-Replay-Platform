
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"


def run_command(command, cwd, name):
    print(f"Starting {name}...")
    process = subprocess.Popen(command, cwd=str(cwd), shell=True)
    return process


def main():
    backend = run_command("py -3 backend/app/main.py", ROOT, "backend")
    time.sleep(2)
    frontend = run_command("py -3 -m http.server 3000 --directory frontend", ROOT, "frontend")
    print("\nApplication is running:")
    print("- Frontend: http://127.0.0.1:3000")
    print("- Backend: http://127.0.0.1:8000")
    print("\nPress Ctrl+C to stop both services.")
    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        backend.terminate()
        frontend.terminate()
        print("\nStopped services.")


if __name__ == "__main__":
    main()
