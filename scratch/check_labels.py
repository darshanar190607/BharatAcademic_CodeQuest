import numpy as np
import os

raw_labels_path = os.path.join('ml-service', 'data', 'ingested', 'raw_labels.npy')
if os.path.exists(raw_labels_path):
    labels = np.load(raw_labels_path)
    print(f"Labels shape: {labels.shape}")
    print(f"First 5 labels: {labels[:5]}")
else:
    print("Not found")
