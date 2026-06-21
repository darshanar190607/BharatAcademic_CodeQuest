import os
import sys
import numpy as np
import pickle

def generate_synthetic_data(n_samples=500):
    print("No real data found. Generating synthetic training data...")
    np.random.seed(42)
    X = []
    y = []
    states = ["FOCUSED", "DROWSY", "NEUTRAL"]
    
    for label, state in enumerate(states):
        for _ in range(n_samples // 3):
            # Synthetic band powers for each state
            if state == "FOCUSED":
                sample = [
                    np.random.uniform(0.05, 0.15),  # delta low
                    np.random.uniform(0.10, 0.20),  # theta low
                    np.random.uniform(0.15, 0.25),  # alpha medium
                    np.random.uniform(0.45, 0.65),  # beta HIGH
                    np.random.uniform(0.10, 0.20),  # gamma medium
                ]
            elif state == "DROWSY":
                sample = [
                    np.random.uniform(0.20, 0.40),  # delta HIGH
                    np.random.uniform(0.25, 0.40),  # theta HIGH
                    np.random.uniform(0.15, 0.25),  # alpha medium
                    np.random.uniform(0.05, 0.15),  # beta low
                    np.random.uniform(0.03, 0.10),  # gamma low
                ]
            else:  # NEUTRAL
                sample = [
                    np.random.uniform(0.10, 0.25),  # delta medium
                    np.random.uniform(0.15, 0.25),  # theta medium
                    np.random.uniform(0.25, 0.40),  # alpha HIGH
                    np.random.uniform(0.20, 0.30),  # beta medium
                    np.random.uniform(0.08, 0.15),  # gamma medium
                ]
            # Add noise
            sample = [v + np.random.normal(0, 0.02) for v in sample]
            X.append(sample)
            y.append(state)
    
    return np.array(X), np.array(y)

def load_real_data():
    if os.path.exists("data/final/X_train.npy") and os.path.exists("data/final/y_train.npy"):
        X = np.load("data/final/X_train.npy")
        y = np.load("data/final/y_train.npy")
        return X, y
    raise FileNotFoundError

if __name__ == "__main__":
    os.makedirs("artifacts", exist_ok=True)
    os.makedirs("data/final", exist_ok=True)

    try:
        X, y = load_real_data()
        print("Loaded real data from data/final.")
    except (FileNotFoundError, ValueError):
        X, y = generate_synthetic_data(n_samples=500)

    from src.components.model_trainer_lite import NearestCentroidClassifier
    model = NearestCentroidClassifier()
    model.fit(X, y)
    
    y_pred = model.predict(X)
    accuracy = np.sum(y_pred == y) / len(y)
    
    with open("artifacts/best_model.pkl", "wb") as f:
        pickle.dump(model, f)
        
    with open("data/final/label_encoder.pkl", "wb") as f:
        pickle.dump(np.unique(y), f)
        
    print(f"Model saved to artifacts/best_model.pkl")
    print(f"Label encoder saved to data/final/label_encoder.pkl")
    print(f"Training accuracy: {accuracy:.3f}")
    print("Run 'python main.py' to start API server")
