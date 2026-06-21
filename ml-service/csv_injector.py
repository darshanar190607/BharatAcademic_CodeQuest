import time
import requests
import pandas as pd
import sys
import os

API_URL = "http://localhost:8000/api/bci-data"

def run_csv_injector(csv_file_path):
    print("="*55)
    print(" 🚀 NEUROBRIGHT CSV DATA INJECTOR (FRIEND'S DATA)")
    print("="*55)
    if not os.path.exists(csv_file_path):
        print(f"[-] Error: Could not find '{csv_file_path}'")
        return

    # 1. Load the CSV using Pandas
    df = pd.read_csv(csv_file_path)
    
    required = ["delta", "theta", "alpha", "beta", "gamma"]
    for req in required:
        if req not in df.columns:
            print(f"[-] Error: Your friend's CSV must have columns: {required}")
            print("If the CSV has raw voltage (e.g. Channel1, Channel2), you must first run an FFT script to extract bands.")
            return

    print(f"[+] Successfully loaded {len(df)} rows from CSV. Starting stream...")

    # 2. Loop through the rows like real time
    for index, row in df.iterrows():
        payload = {
            "delta": float(row["delta"]),
            "theta": float(row["theta"]),
            "alpha": float(row["alpha"]),
            "beta":  float(row["beta"]),
            "gamma": float(row["gamma"])
        }
        try:
            # 3. Send it to the Machine Learning Model
            resp = requests.post(API_URL, json=payload, timeout=2)
            if resp.status_code == 200:
                pred = resp.json().get('prediction', {}).get('predicted_emotion')
                print(f"CSV Row {index} 📡 Sent | UI Status -> 🔵 {pred}")
            else:
                print(f"API Error: {resp.status_code}")
        except requests.exceptions.ConnectionError:
            print("❌ Connection Refused! Make sure FastAPI is running (python main.py)")
            
        time.sleep(1) # Send one row per second (mimic hardware stream)

if __name__ == "__main__":
    file_name = sys.argv[1] if len(sys.argv) > 1 else "friends_data.csv"
    
    # Generate a dummy CSV if the file doesn't exist to show how it should look
    if not os.path.exists(file_name):
        import csv
        with open(file_name, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["delta", "theta", "alpha", "beta", "gamma"])
            # Drowsy pattern (high theta)
            writer.writerow([0.05, 0.20, 0.15, 0.08, 0.02]) 
            # Focused pattern (high beta)
            writer.writerow([0.02, 0.05, 0.10, 0.50, 0.20]) 
            # Neutral pattern
            writer.writerow([0.10, 0.10, 0.10, 0.10, 0.10])
        print(f"[+] I generated a template '{file_name}' for you since one wasn't provided.")
        
    run_csv_injector(file_name)
