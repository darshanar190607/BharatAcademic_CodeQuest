import os
import sys
import numpy as np
import pickle
import json
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

from src.exception import CustomException
from src.logger import logging

@dataclass
class ModelEvaluationConfig:
    tuned_model_path: str = os.path.join('artifacts', 'tuned_best_model.pkl')
    transformed_test_data_path: str = os.path.join('artifacts', 'X_test_transformed.npy')
    test_labels_path: str = os.path.join('artifacts', 'y_test.npy')
    evaluation_output_dir: str = os.path.join('artifacts', 'evaluation')
    confusion_matrix_path: str = os.path.join('artifacts', 'evaluation', 'confusion_matrix.png')
    classification_metrics_path: str = os.path.join('artifacts', 'evaluation', 'classification_metrics.png')
    performance_summary_path: str = os.path.join('artifacts', 'evaluation', 'performance_summary.png')
    evaluation_report_path: str = os.path.join('artifacts', 'evaluation', 'model_evaluation_report.json')

class ModelEvaluation:
    def __init__(self):
        self.config = ModelEvaluationConfig()

    def load_model(self):
        """
        Load tuned best model.
        """
        try:
            logging.info("Loading tuned model for evaluation...")
            if not os.path.exists(self.config.tuned_model_path):
                 raise FileNotFoundError(f"Tuned model not found at {self.config.tuned_model_path}")

            with open(self.config.tuned_model_path, 'rb') as f:
                model = pickle.load(f)
            return model
        except Exception as e:
            raise CustomException(e, sys)

    def load_test_dataset(self):
        """
        Load transformed test data.
        """
        try:
            logging.info("Loading test data for evaluation...")
            if not os.path.exists(self.config.transformed_test_data_path):
                 raise FileNotFoundError(f"Test data not found at {self.config.transformed_test_data_path}")

            X_test = np.load(self.config.transformed_test_data_path)
            y_test = np.load(self.config.test_labels_path)
            return X_test, y_test
        except Exception as e:
            raise CustomException(e, sys)

    def generate_predictions(self, model, X_test):
        """
        Predict labels using trained model.
        """
        try:
            logging.info("Generating predictions...")
            y_pred = model.predict(X_test)
            return y_pred
        except Exception as e:
            raise CustomException(e, sys)

    def compute_metrics(self, y_test, y_pred):
        """
        Calculate classification performance metrics.
        """
        try:
            logging.info("Computing metrics...")
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            
            metrics = {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1
            }
            return metrics
        except Exception as e:
            raise CustomException(e, sys)

    def generate_confusion_matrix(self, y_test, y_pred):
        """
        Create confusion matrix visualization.
        """
        try:
            logging.info("Generating confusion matrix...")
            os.makedirs(self.config.evaluation_output_dir, exist_ok=True)
            
            cm = confusion_matrix(y_test, y_pred)
            plt.figure(figsize=(10, 7))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
            plt.title('Confusion Matrix')
            plt.ylabel('Actual Label')
            plt.xlabel('Predicted Label')
            plt.savefig(self.config.confusion_matrix_path)
            plt.close()
            logging.info(f"Saved confusion matrix to {self.config.confusion_matrix_path}")
        except Exception as e:
            raise CustomException(e, sys)
            
    def plot_model_performance_summary(self, metrics):
        """
        Create bar chart showing performance metrics.
        """
        try:
            logging.info("Plotting performance summary...")
            os.makedirs(self.config.evaluation_output_dir, exist_ok=True)
            
            names = list(metrics.keys())
            values = list(metrics.values())
            
            plt.figure(figsize=(10, 6))
            plt.bar(names, values, color=['blue', 'green', 'orange', 'red'])
            plt.ylim(0, 1)
            plt.title('Model Performance Summary')
            plt.ylabel('Score')
            
            for i, v in enumerate(values):
                plt.text(i, v + 0.01, f"{v:.4f}", ha='center')
                
            plt.savefig(self.config.performance_summary_path)
            plt.close()
            logging.info(f"Saved performance summary to {self.config.performance_summary_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def save_evaluation_report(self, metrics, model_name):
        """
        Save evaluation results in JSON.
        """
        try:
            report = {
                "model_name": model_name,
                "metrics": metrics
            }
            
            os.makedirs(self.config.evaluation_output_dir, exist_ok=True)
            with open(self.config.evaluation_report_path, 'w') as f:
                json.dump(report, f, indent=4)
                
            logging.info(f"Saved evaluation report to {self.config.evaluation_report_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def initiate_model_evaluation(self):
        """
        Master pipeline for model evaluation.
        """
        try:
            # 1. Load Model and Data
            model = self.load_model()
            X_test, y_test = self.load_test_dataset()
            
            # 2. Generate Predictions
            y_pred = self.generate_predictions(model, X_test)
            
            # 3. Compute Metrics
            metrics = self.compute_metrics(y_test, y_pred)
            
            # 4. Visualizations
            self.generate_confusion_matrix(y_test, y_pred)
            self.plot_model_performance_summary(metrics)
            
            # 5. Save Report
            model_name = model.__class__.__name__
            self.save_evaluation_report(metrics, model_name)
            
            logging.info("Model Evaluation Pipeline Completed Successfully")
            return self.config.evaluation_report_path
            
        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    try:
        obj = ModelEvaluation()
        obj.initiate_model_evaluation()
    except Exception as e:
        logging.info("Model Evaluation failed")
        print(e)
