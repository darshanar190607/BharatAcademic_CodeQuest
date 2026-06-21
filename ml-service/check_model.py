import pickle
import os

if os.path.exists("artifacts/best_model.pkl"):
    with open("artifacts/best_model.pkl", "rb") as f:
        model = pickle.load(f)
    print("Class mapping: 3=Focused, 0=Drowsy, 1=Neutral")
    for cls, centroid in model.centroids.items():
        print(f"Class {cls}: {centroid}")
else:
    print("Model not found")
