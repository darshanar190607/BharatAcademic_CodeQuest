import time
import requests
import pickle
import numpy as np
import sys
import os

from src.components.model_trainer_lite import NearestCentroidClassifier

API_URL = "http://localhost:8000/api/bci-data"

def start_injector():
    print("="*55)
    print(" 🚀 NEUROBRIGHT HARDWARE-LESS DEMO INJECTOR")
    print("="*55)
    
    # Load the trained model to get the exact perfect state values
    try:
        with open("artifacts/best_model.pkl", "rb") as f:
            model = pickle.load(f)
        print("[+] Loaded Real Data Centroids for perfect simulation!")
    except Exception as e:
        print(f"[-] Error: Could not load model. Run 'python run_pipeline.py'.\nDetails: {e}")
        exit(1)

    print(f"[+] Target Fast API: {API_URL}")
    print("[!] Press Ctrl+C at any time to stop the automatic stream.\n")
    
    # Define the states to loop through
    # Class mapping: 3=Focused, 0=Drowsy, 1=Neutral
    states_to_simulate = [3, 0, 1]
    state_names = {3: "FOCUSED", 0: "DROWSY", 1: "NEUTRAL"}
    
    cycle = 0
    try:
        while True:
            # Change state every 10 loops (10 seconds)
            target_class = states_to_simulate[(cycle // 10) % len(states_to_simulate)]
            
            if cycle % 10 == 0:
                print(f"\n{"-"*40}")
                print(f"---> HARDWARE INJECTING: {state_names[target_class]} <---")
                print(f"{"-"*40}")
                
            # Fetch the perfect centroid pattern for this class
            if target_class in model.centroids:
                centroid = model.centroids[target_class]
                # Remove noise completely to guarantee the exact status is hit. 
                # The ML clusters in the trained model are extremely dense (distance < 0.0001)
                features = centroid
            else:
                # Fallback if class missing in real data
                features = [0.1, 0.2, 0.4, 0.1, 0.1]
                
            # Build JSON payload
            payload = {
                "delta": float(features[0]),
                "theta": float(features[1]),
                "alpha": float(features[2]),
                "beta":  float(features[3]),
                "gamma": float(features[4])
            }
            
            # Send HTTP request to FastAPI bridge
            try:
                resp = requests.post(API_URL, json=payload, timeout=2)
                if resp.status_code == 200:
                    data = resp.json()
                    prediction = data.get('prediction', {}).get('predicted_emotion')
                    print(f"📡 Sent {state_names[target_class]:<7} | UI Status -> 🔵 {prediction}")
                else:
                    print(f"API Error: {resp.status_code}")
            except requests.exceptions.ConnectionError:
                print("❌ Connection Refused! Make sure FastAPI is running (python main.py)")
                time.sleep(1)
            
            time.sleep(1) # Broadcast every 1 second
            cycle += 1
            
    except KeyboardInterrupt:
        print("\n[+] Demo Injector stopped successfully. Good luck with the presentation!")

if __name__ == '__main__':
    start_injector()
