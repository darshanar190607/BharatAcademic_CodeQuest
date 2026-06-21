import subprocess
import sys
import time
import os
import webbrowser

def run_in_terminal(command, cwd, title):
    if sys.platform == "win32":
        return subprocess.Popen(
            f'start cmd /k "title {title} && {command}"',
            shell=True,
            cwd=cwd
        )

def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    ml_service   = os.path.join(project_root, "ml-service")
    backend      = os.path.join(project_root, "web-app", "Backend")
    webapp       = os.path.join(project_root, "web-app")
    
    print("=" * 50)
    print("  NEUROBRIGHT — Starting All Services")
    print("=" * 50)
    
    # Step 1: Train model if needed
    model_path = os.path.join(ml_service, "artifacts", "best_model.pkl")
    if not os.path.exists(model_path):
        print("\n[1/4] Training ML model (first time setup)...")
        result = subprocess.run(
            [sys.executable, "run_pipeline.py"],
            cwd=ml_service
        )
        if result.returncode != 0:
            print("ERROR: Model training failed!")
            print("Check ml-service/run_pipeline.py")
            return
        print("Model trained successfully!")
    else:
        print("\n[1/4] Model already trained — skipping")
    
    # Step 2: Start FastAPI ML service
    print("\n[2/4] Starting FastAPI ML service on port 8000...")
    run_in_terminal(
        f"{sys.executable} main.py",
        ml_service,
        "NeuroBright ML Service :8000"
    )
    time.sleep(3)
    
    # Step 3: Start Node.js backend
    print("\n[3/4] Starting Node.js backend on port 5000...")
    run_in_terminal(
        "node server.js",
        backend,
        "NeuroBright Node Backend :5000"
    )
    time.sleep(2)
    
    # Step 4: Start React frontend
    print("\n[4/4] Starting React frontend on port 5173...")
    run_in_terminal(
        "npm run dev",
        webapp,
        "NeuroBright React Frontend :5173"
    )
    time.sleep(4)
    
    # Open browser
    print("\n" + "=" * 50)
    print("  ALL SERVICES STARTED!")
    print("=" * 50)
    print("  ML Service:  http://localhost:8000")
    print("  API Docs:    http://localhost:8000/docs")
    print("  Node:        http://localhost:5000")
    print("  Frontend:    http://localhost:5173")
    print("=" * 50)
    print("\nOpening browser...")
    time.sleep(1)
    webbrowser.open("http://localhost:5173")
    
    print("\nTo connect Arduino hardware:")
    print("  Plug in Arduino (firmware must be uploaded)")
    print("  Run: cd ml-service && python serial_bridge.py")

if __name__ == "__main__":
    main()
