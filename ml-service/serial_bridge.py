import serial
import struct
import time
import requests
import numpy as np
from scipy.signal import butter, filtfilt, iirnotch

SERIAL_PORT   = "COM7"
BAUD_RATE     = 230400
SAMPLE_RATE   = 500
API_URL       = "http://localhost:8000/api/bci-data"
SYNC1         = 0xC7
SYNC2         = 0x7C
END_BYTE      = 0x01
PACKET_LEN    = 16
WINDOW_SIZE   = 1000    # 2 seconds at 500Hz
STEP_SIZE     = 250     # 0.5 second step
ADC_MAX       = 16383
VREF          = 3.3

def adc_to_microvolts(raw):
    return ((raw / ADC_MAX) - 0.5) * VREF * 1_000_000 / 1000

def find_packet_start(ser):
    # Sync to packet boundary by finding SYNC1 SYNC2
    while True:
        byte = ser.read(1)
        if byte and byte[0] == SYNC1:
            next_byte = ser.read(1)
            if next_byte and next_byte[0] == SYNC2:
                return True

def read_packet(ser):
    # Already consumed SYNC1 SYNC2, read remaining 14 bytes
    remaining = ser.read(14)
    if len(remaining) < 14:
        return None
    ch1_raw = struct.unpack('>H', remaining[0:2])[0]
    ch2_raw = struct.unpack('>H', remaining[2:4])[0]
    ch3_raw = struct.unpack('>H', remaining[4:6])[0]
    end_byte = remaining[13]
    if end_byte != END_BYTE:
        return None
    return [
        adc_to_microvolts(ch1_raw),
        adc_to_microvolts(ch2_raw),
        adc_to_microvolts(ch3_raw)
    ]

def notch_filter(data, freq=50, fs=500, Q=30):
    b, a = iirnotch(freq / (fs/2), Q)
    return filtfilt(b, a, data)

def bandpass_filter(data, low=1, high=45, fs=500, order=4):
    b, a = butter(order, [low/(fs/2), high/(fs/2)], btype='band')
    return filtfilt(b, a, data)

def compute_band_powers(window_3ch, fs=500):
    bands = {
        'delta': (1, 4), 'theta': (4, 8),
        'alpha': (8, 12), 'beta': (13, 30), 'gamma': (30, 45)
    }
    powers = {}
    for name, (lo, hi) in bands.items():
        band_power = 0
        for ch in range(3):
            fft_vals = np.abs(np.fft.rfft(window_3ch[:, ch]))**2
            freqs    = np.fft.rfftfreq(len(window_3ch[:, ch]), 1/fs)
            idx      = np.where((freqs >= lo) & (freqs <= hi))
            band_power += np.mean(fft_vals[idx]) if len(idx[0]) > 0 else 0
        powers[name] = float(band_power / 3)
    total = sum(powers.values()) + 1e-10
    return {k: round(v/total, 4) for k, v in powers.items()}

def process_window(samples):
    arr = np.array(samples)  # (1000, 3)
    for ch in range(3):
        arr[:, ch] = notch_filter(arr[:, ch])
        arr[:, ch] = bandpass_filter(arr[:, ch])
        mean = arr[:, ch].mean()
        std  = arr[:, ch].std() + 1e-10
        arr[:, ch] = (arr[:, ch] - mean) / std
    band_powers = compute_band_powers(arr)
    return {
        "delta": band_powers['delta'],
        "theta": band_powers['theta'],
        "alpha": band_powers['alpha'],
        "beta":  band_powers['beta'],
        "gamma": band_powers['gamma'],
        "ch1_std": float(np.std(arr[:, 0])),
        "ch2_std": float(np.std(arr[:, 1])),
        "ch3_std": float(np.std(arr[:, 2]))
    }

def post_to_api(features):
    try:
        resp = requests.post(API_URL, json=features, timeout=2)
        if resp.status_code == 200:
            result = resp.json()
            print(f"State: {result.get('state','?')} | "
                  f"Confidence: {result.get('confidence', 0):.2f} | "
                  f"Beta: {features['beta']:.3f}")
        else:
            print(f"API error: {resp.status_code}")
    except Exception as e:
        print(f"POST failed: {e}")

def main():
    print("NeuroBright Serial Bridge starting...")
    print(f"Connecting to Arduino on {SERIAL_PORT} at {BAUD_RATE} baud...")
    
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=3)
    except serial.SerialException as e:
        print(f"ERROR: Cannot open {SERIAL_PORT}: {e}")
        print("Check that Arduino is plugged in and firmware is running")
        return
    
    time.sleep(2)
    
    # Handshake
    ser.write(b"WHORU\n")
    time.sleep(0.5)
    response = ser.readline().decode('utf-8', errors='ignore').strip()
    if "UNO-R4" not in response:
        print(f"Unexpected response: {response}")
        print("Expected UNO-R4-NEUROBRIGHT. Check firmware is uploaded.")
        ser.close()
        return
    
    print(f"Connected: {response}")
    
    # Start streaming
    ser.write(b"START\n")
    time.sleep(0.3)
    response = ser.readline().decode('utf-8', errors='ignore').strip()
    print(f"Arduino response: {response}")
    
    # Sync to first packet
    find_packet_start(ser)
    
    print("Streaming EEG data... Press Ctrl+C to stop")
    
    sample_buffer = []
    
    try:
        while True:
            if find_packet_start(ser):
                packet = read_packet(ser)
                if packet:
                    sample_buffer.append(packet)
                    
                    # Process when window is full
                    if len(sample_buffer) >= WINDOW_SIZE:
                        features = process_window(sample_buffer[-WINDOW_SIZE:])
                        post_to_api(features)
                        # Slide window forward by STEP_SIZE
                        sample_buffer = sample_buffer[STEP_SIZE:]
                        
    except KeyboardInterrupt:
        print("\nStopping...")
        ser.write(b"STOP\n")
        ser.close()
        print("Serial bridge stopped.")

if __name__ == "__main__":
    main()
