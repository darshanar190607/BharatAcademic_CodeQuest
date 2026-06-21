import numpy as np
import pickle
import os
import sys

# Add project root and ml-service to path for imports
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "ml-service"))

def check_real_data_performance():
    data_dir = "ml-service/data/final"
    model_path = "ml-service/artifacts/best_model.pkl"
    label_encoder_path = "ml-service/data/final/label_encoder.pkl"

    if not os.path.exists(os.path.join(data_dir, "X_train.npy")):
        print("Error: Real data (X_train.npy) not found.")
        return

    # Load data
    X = np.load(os.path.join(data_dir, "X_train.npy"))
    y = np.load(os.path.join(data_dir, "y_train.npy"))
    
    # Load model
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    # Get predictions
    y_pred = model.predict(X)
    
    print("="*50)
    print("NEUROBRIGHT REAL DATA PERFORMANCE REPORT")
    print("="*50)
    print(f"Total Samples: {len(X)}")
    print(f"Data Shape:    {X.shape}")
    
    # Calculate Accuracy
    accuracy = np.sum(y_pred == y) / len(y)
    print(f"Final Accuracy: {accuracy:.2%}")
    print("-" * 30)
    
    # Check class distribution in predictions
    unique_pred, counts_pred = np.unique(y_pred, return_counts=True)
    pred_dist = dict(zip(unique_pred, counts_pred))
    print(f"Prediction Distribution: {pred_dist}")
    
    unique_actual, counts_actual = np.unique(y, return_counts=True)
    actual_dist = dict(zip(unique_actual, counts_actual))
    print(f"Actual Label Distribution: {actual_dist}")
    print("-" * 30)
    
    # Show first 20 samples comparison
    print("SAMPLE COMPARISON (FIRST 20):")
    print(f"{'Index':<8} | {'Actual Value':<15} | {'Model Output':<15} | {'Status'}")
    print("-" * 60)
    
    for i in range(min(20, len(X))):
        match = "MATCH (OK)" if y[i] == y_pred[i] else "MISMATCH"
        print(f"{i:<8} | {str(y[i]):<15} | {str(y_pred[i]):<15} | {match}")

    print("-" * 60)
    
    # Per-class accuracy
    print("PER-CLASS ACCURACY:")
    for cls in actual_dist:
        cls_mask = (y == cls)
        cls_acc = np.sum(y_pred[cls_mask] == cls) / np.sum(cls_mask)
        print(f"Class {cls}: {cls_acc:.2%}")

if __name__ == "__main__":
    check_real_data_performance()
