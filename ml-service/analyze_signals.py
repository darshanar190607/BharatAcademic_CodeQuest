import pandas as pd
import numpy as np
import os

SAMPLING_RATE = 500
WINDOW_SIZE = 1000

def extract_bands(segment):
    # Normalize signal
    mean = np.mean(segment)
    std = np.std(segment)
    if std > 0:
        segment = (segment - mean) / std
        
    fft_vals = np.fft.rfft(segment)
    psd = (1.0 / (SAMPLING_RATE * len(segment))) * (np.abs(fft_vals)**2)
    psd[1:-1] *= 2
    freqs = np.fft.rfftfreq(len(segment), d=1/SAMPLING_RATE)
    
    bands = {
        'delta': (0.5, 4), 'theta': (4, 8), 'alpha': (8, 12),
        'beta': (12, 30), 'gamma': (30, 45)
    }
    
    features = {}
    for band, (low, high) in bands.items():
        idx = np.logical_and(freqs >= low, freqs <= high)
        features[band] = np.mean(psd[idx]) if any(idx) else 0.0
    return features

def analyze(file_path):
    df = pd.read_csv(file_path)
    raw_signal = df['ch1_uv'].values
    print(f"Normalized Analysis for {file_path}")
    for w in range(5):
        start = w * WINDOW_SIZE
        segment = raw_signal[start : start + WINDOW_SIZE]
        bands = extract_bands(segment)
        print(f"W{w}: Th={bands['theta']:.6f}, Be={bands['beta']:.6f}, Ga={bands['gamma']:.6f}")

if __name__ == "__main__":
    analyze("friends_drowsy.csv")
    print("-" * 30)
    analyze("friends_focused.csv")
