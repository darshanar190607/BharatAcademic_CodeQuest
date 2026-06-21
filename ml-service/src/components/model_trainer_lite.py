import os
import sys
import numpy as np
import pickle
import json
from dataclasses import dataclass
from src.exception import CustomException
from src.logger import logging

@dataclass
class ModelTrainerConfig:
    trained_model_path: str = os.path.join('artifacts', 'best_model.pkl')
    model_report_path: str = os.path.join('artifacts', 'model_report.json')
    transformed_train_path: str = os.path.join('artifacts', 'X_train.npy')
    transformed_test_path: str = os.path.join('artifacts', 'X_test.npy')
    train_labels_path: str = os.path.join('artifacts', 'y_train.npy')
    test_labels_path: str = os.path.join('artifacts', 'y_test.npy')

class NearestCentroidClassifier:
    """A pure NumPy implemention of Nearest Centroid Classifier."""
    def __init__(self):
        self.centroids = {}
        self.classes = []

    def fit(self, X, y):
        self.classes = np.unique(y)
        for c in self.classes:
            self.centroids[c] = np.mean(X[y == c], axis=0)

    def predict(self, X):
        preds = []
        for x in X:
            distances = {c: np.linalg.norm(x - self.centroids[c]) for c in self.classes}
            preds.append(min(distances, key=distances.get))
        return np.array(preds)

class ModelTrainer:
    def __init__(self):
        self.config = ModelTrainerConfig()
        # Fallback to a single directory for both final and artifacts if needed
        # But here we use what feature_engineering provides
        self.config.transformed_train_path = os.path.join('data', 'final', 'X_train.npy')
        self.config.transformed_test_path = os.path.join('data', 'final', 'X_test.npy')
        self.config.train_labels_path = os.path.join('data', 'final', 'y_train.npy')
        self.config.test_labels_path = os.path.join('data', 'final', 'y_test.npy')

    def initiate_model_trainer(self):
        try:
            logging.info("Loading data for NumPy model training...")
            X_train = np.load(self.config.transformed_train_path)
            y_train = np.load(self.config.train_labels_path)
            X_test = np.load(self.config.transformed_test_path)
            y_test = np.load(self.config.test_labels_path)

            logging.info(f"Training NearestCentroidClassifier on {X_train.shape}...")
            model = NearestCentroidClassifier()
            model.fit(X_train, y_train)

            y_pred = model.predict(X_test)
            accuracy = np.sum(y_pred == y_test) / len(y_test)
            
            logging.info(f"Model Accuracy: {accuracy:.4f}")
            print(f"\n>>> FINAL MODEL ACCURACY (3 Channels): {accuracy:.2%} <<<\n")

            os.makedirs('artifacts', exist_ok=True)
            with open(self.config.trained_model_path, 'wb') as f:
                pickle.dump(model, f)
            
            report = {"NearestCentroid": {"accuracy": accuracy}}
            with open(self.config.model_report_path, 'w') as f:
                json.dump(report, f)

            return self.config.trained_model_path

        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    obj = ModelTrainer()
    obj.initiate_model_trainer()
