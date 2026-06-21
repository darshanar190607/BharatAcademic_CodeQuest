import time
import requests
import numpy as np
import sys
import os

API_URL = "http://localhost:8000/api/bci-data"

def start_dataset_injector():
    print("="*55)
    print(" 🚀 NEUROBRIGHT DEAP/SEED DATASET INJECTOR")
    print("="*55)
    
    # We load the data from your "final" processed folder.
    # The pipeline already turned the massive DEAP s28.dat file into clean X_test Numpy arrays.
    test_features_path = "data/final/X_test.npy"
    test_labels_path = "data/final/y_test.npy"
    
    if not os.path.exists(test_features_path):
         print(f"[-] Error: Could not load test dataset. Make sure to run 'python src/pipeline/training_pipeline.py' first.")
         return

    x_test = np.load(test_features_path)
    y_test = np.load(test_labels_path)
    
    print(f"[+] Loaded Processed DEAP Data: {len(x_test)} real patient trials found.")
    print("[!] Streaming real patient EEG data into the ML Model and UI...\n")
    
    # Maps DEAP dataset truth labels to your names
    label_map = {0: "DROWSY", 1: "NEUTRAL", 3: "FOCUSED"}

    try:
        for idx in range(len(x_test)):
            features = x_test[idx]
            actual_label = y_test[idx]
            
            payload = {
                "delta": float(features[0]),
                "theta": float(features[1]),
                "alpha": float(features[2]),
                "beta":  float(features[3]),
                "gamma": float(features[4])
            }
            
            try:
                # Shoot the raw patient data to the ML Server
                resp = requests.post(API_URL, json=payload, timeout=2)
                if resp.status_code == 200:
                    data = resp.json()
                    prediction = data.get('prediction', {}).get('predicted_emotion')
                    
                    real_state = label_map.get(actual_label, "UNKNOWN")
                    # Compare what the DEAP Dataset says vs what your ML predicts!
                    print(f"DEAP Data (True Patient State: {real_state:<7}) | ML Prediction → 🔵 {prediction}")
                else:
                    print(f"API Error: {resp.status_code}")
            except requests.exceptions.ConnectionError:
                print("❌ Connection Refused! Make sure FastAPI is running.")
                
            time.sleep(1.5) # Wait 1.5 seconds so you can watch it in the UI
            
    except KeyboardInterrupt:
        print("\n[!] Stopped Stream.")

if __name__ == "__main__":
    start_dataset_injector()
