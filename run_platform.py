import subprocess
import sys
import os
import time
import signal
import urllib.request

# Get the directory of the current script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Setup environment
os.environ["PYTHONPATH"] = BASE_DIR
os.environ["BACKEND_API_URL"] = "http://127.0.0.1:8000/api/v1"

processes = []

def signal_handler(sig, frame):
    print("\n[System] Stopping servers...")
    for p in processes:
        try:
            p.terminate()
            p.wait(timeout=2)
        except Exception:
            pass
    print("[System] Both servers stopped. Goodbye!")
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def wait_for_url(url, timeout=15):
    """Wait until a service at `url` becomes reachable or timeout expires."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=2) as resp:
                if resp.status in (200, 301, 302, 307):
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def run():
    print("====================================================")
    print("      Expert Decision Replay Platform Runner        ")
    print("====================================================")
    
    # 1. Start FastAPI Backend
    print("[Backend] Launching FastAPI server on http://127.0.0.1:8000...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", 
        "backend.app.main:app", 
        "--host", "127.0.0.1", 
        "--port", "8000"
    ]
    p_backend = subprocess.Popen(backend_cmd, cwd=BASE_DIR)
    processes.append(p_backend)
    
    # Wait for backend server to be ready
    print("[Backend] Waiting for FastAPI server to become ready...")
    if wait_for_url("http://127.0.0.1:8000/docs"):
        print("[Backend] Backend API is up and running at http://127.0.0.1:8000")
    else:
        print("[Backend] Warning: Backend API took longer than expected to start.")
    
    # 2. Start Flask Web UI
    print("[Web UI] Launching Flask frontend on http://127.0.0.1:5000...")
    frontend_cmd = [
        sys.executable, 
        os.path.join(BASE_DIR, "frontend_web", "app", "main.py")
    ]
    p_frontend = subprocess.Popen(frontend_cmd, cwd=BASE_DIR)
    processes.append(p_frontend)

    # Wait for web UI server to be ready
    print("[Web UI] Waiting for Flask Web UI to become ready...")
    if wait_for_url("http://127.0.0.1:5000/"):
        print("[Web UI] Web UI is up and running at http://127.0.0.1:5000")
    else:
        print("[Web UI] Warning: Web UI took longer than expected to start.")

    # 3. Start Desktop GUI Client
    print("[Desktop App] Launching Desktop GUI app...")
    desktop_cmd = [
        sys.executable,
        os.path.join(BASE_DIR, "frontend_desktop", "desktop_app.py")
    ]
    p_desktop = subprocess.Popen(desktop_cmd, cwd=BASE_DIR)
    processes.append(p_desktop)

    # 4. Open Web UI Home Page & Backend Swagger Docs in Browser
    import webbrowser
    print("[Browser] Opening Web Workspace UI (http://127.0.0.1:5000/)...")
    webbrowser.open("http://127.0.0.1:5000/")
    time.sleep(1)
    print("[Browser] Opening Backend Swagger API Docs (http://127.0.0.1:8000/docs)...")
    webbrowser.open("http://127.0.0.1:8000/docs")

    print("\n[System] All components (Backend, Web UI, Desktop App, Browser Tabs) are running! Press Ctrl+C to terminate.")
    print("----------------------------------------------------")
    print("  • Web Workspace UI:        http://127.0.0.1:5000/")
    print("  • REST API & Swagger Docs: http://127.0.0.1:8000/docs")
    print("  • Desktop App:             Active window")
    print("====================================================\n")
    
    # Keep the runner script alive
    try:
        while True:
            # Check if any process has terminated
            for p in processes:
                if p.poll() is not None:
                    print(f"\n[System] One of the servers stopped unexpectedly (Code: {p.returncode}). Shutting down...")
                    signal_handler(None, None)
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    run()
