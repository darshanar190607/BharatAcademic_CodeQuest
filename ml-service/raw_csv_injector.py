import pandas as pd
import numpy as np
import requests
import time
import sys
import os

API_URL = "http://localhost:8000/api/bci-data"
SAMPLING_RATE = 500  # Based on project config
WINDOW_SIZE = 1000   # 2 seconds of data per "prediction" (500Hz * 2s)

def extract_bands(segment):
    """Perform FFT and extract EEG bands (Delta, Theta, Alpha, Beta, Gamma)"""
    # Normalize signal to match training data pre-processing
    mean = np.mean(segment)
    std = np.std(segment)
    if std > 0:
        segment = (segment - mean) / std
        
    # 1. FFT
    fft_vals = np.fft.rfft(segment)
    # 2. Power Spectral Density
    psd = (1.0 / (SAMPLING_RATE * len(segment))) * (np.abs(fft_vals)**2)
    psd[1:-1] *= 2
    # 3. Frequency bins
    freqs = np.fft.rfftfreq(len(segment), d=1/SAMPLING_RATE)
    
    bands = {
        'delta': (0.5, 4), 
        'theta': (4, 8), 
        'alpha': (8, 12),
        'beta': (12, 30), 
        'gamma': (30, 45)
    }
    
    features = {}
    for band, (low, high) in bands.items():
        idx = np.logical_and(freqs >= low, freqs <= high)
        if any(idx):
            features[band] = float(np.mean(psd[idx]))
        else:
            features[band] = 0.0
    return features

def run_raw_injector(file_path):
    print("="*60)
    print(f" [RUNNING] NEUROBRIGHT RAW EEG INJECTOR: {os.path.basename(file_path)}")
    print("="*60)
    
    if not os.path.exists(file_path):
        print(f"[-] Error: Could not find '{file_path}'")
        return

    # Load CSV
    print(f"[+] Loading CSV into memory (this might take a second for 13MB)...")
    df = pd.read_csv(file_path)
    
    if 'ch1_uv' not in df.columns:
        print("[-] Error: CSV must have a 'ch1_uv' column.")
        return
        
    raw_signal = df['ch1_uv'].values
    print(f"[+] Successfully loaded {len(raw_signal)} samples. Starting stream...")
    print("[!] Press Ctrl+C to stop.\n")

    # Process in windows to mimic real-time hardware
    window_count = 0
    try:
        for i in range(0, len(raw_signal) - WINDOW_SIZE, WINDOW_SIZE):
            segment = raw_signal[i : i + WINDOW_SIZE]
            
            # Calculate the 5 brainwave bands
            payload = extract_bands(segment)
            
            try:
                # Send to FastAPI ML Service
                resp = requests.post(API_URL, json=payload, timeout=2)
                if resp.status_code == 200:
                    data = resp.json()
                    prediction = data.get('prediction', {}).get('predicted_emotion')
                    print(f"Window {window_count:03} | Signal Mean: {np.mean(segment):+7.2f} | UI -> {prediction}")
                else:
                    print(f"API Error: {resp.status_code}")
            except requests.exceptions.ConnectionError:
                print("!! Connection Refused! Make sure FastAPI is running (python main.py)")
                break
            except Exception as e:
                print(f"[-] Error: {e}")
            
            window_count += 1
            time.sleep(1) # Broadcast one state per second

    except KeyboardInterrupt:
        print("\n[+] Stream stopped.")

if __name__ == "__main__":
    # Get filename from arg or default to drowsy
    fname = sys.argv[1] if len(sys.argv) > 1 else "friends_drowsy.csv"
    run_raw_injector(fname)
