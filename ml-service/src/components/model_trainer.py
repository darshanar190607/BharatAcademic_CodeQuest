import os
import sys
import numpy as np
import pandas as pd
from dataclasses import dataclass
import pickle
import json

from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from src.exception import CustomException
from src.logger import logging

@dataclass
class ModelTrainerConfig:
    trained_model_path: str = os.path.join('artifacts', 'best_model.pkl')
    model_report_path: str = os.path.join('artifacts', 'model_report.json')
    transformed_train_path: str = os.path.join('artifacts', 'X_train_transformed.npy')
    transformed_test_path: str = os.path.join('artifacts', 'X_test_transformed.npy')
    train_labels_path: str = os.path.join('artifacts', 'y_train.npy')
    test_labels_path: str = os.path.join('artifacts', 'y_test.npy')

class ModelTrainer:
    def __init__(self):
        self.config = ModelTrainerConfig()

    def load_transformed_data(self):
        """
        Load transformed dataset from artifacts.
        """
        try:
            logging.info("Loading transformed data for model training...")
            
            if not os.path.exists(self.config.transformed_train_path):
                 raise FileNotFoundError(f"Transformed train data not found at {self.config.transformed_train_path}")

            X_train = np.load(self.config.transformed_train_path)
            X_test = np.load(self.config.transformed_test_path)
            y_train = np.load(self.config.train_labels_path)
            y_test = np.load(self.config.test_labels_path)
            
            logging.info(f"Loaded X_train: {X_train.shape}, y_train: {y_train.shape}")
            return X_train, X_test, y_train, y_test
        except Exception as e:
            raise CustomException(e, sys)

    def get_models(self):
        """
        Define multiple ML models to train.
        """
        try:
            models = {
                "RandomForest": RandomForestClassifier(random_state=42),
                "DecisionTree": DecisionTreeClassifier(random_state=42),
                "LogisticRegression": LogisticRegression(random_state=42, max_iter=1000),
                "KNeighbors": KNeighborsClassifier(),
                "SVC": SVC(),
                "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
            }
            return models
        except Exception as e:
            raise CustomException(e, sys)

    def train_models(self, X_train, y_train, X_test, y_test, models):
        """
        Train all models and evaluate performance.
        Return dictionary of results.
        { model_name: { metrics... } }
        """
        try:
            logging.info("Starting model training loop...")
            results = {}
            
            for name, model in models.items():
                logging.info(f"Training {name}...")
                model.fit(X_train, y_train)
                
                logging.info(f"Predicting with {name}...")
                y_pred = model.predict(X_test)
                
                # Metrics
                accuracy = accuracy_score(y_test, y_pred)
                precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
                recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
                f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
                
                results[name] = {
                    "accuracy": accuracy,
                    "precision": precision,
                    "recall": recall,
                    "f1_score": f1,
                    "model_object": model 
                }
                
                logging.info(f"{name} Results: Accuracy={accuracy:.4f}, F1={f1:.4f}")
                
            return results
        except Exception as e:
            raise CustomException(e, sys)

    def select_best_model(self, results):
        """
        Select model with highest F1-score.
        """
        try:
            best_model_name = None
            best_model_score = -1.0
            best_model_object = None
            
            for name, metrics in results.items():
                if metrics['f1_score'] > best_model_score:
                    best_model_score = metrics['f1_score']
                    best_model_name = name
                    best_model_object = metrics['model_object']
            
            logging.info(f"Best Model Selected: {best_model_name} with F1-Score: {best_model_score:.4f}")
            return best_model_name, best_model_object, best_model_score
            
        except Exception as e:
            raise CustomException(e, sys)

    def save_best_model(self, model):
        """
        Persist trained model.
        """
        try:
            os.makedirs(os.path.dirname(self.config.trained_model_path), exist_ok=True)
            with open(self.config.trained_model_path, 'wb') as f:
                pickle.dump(model, f)
            logging.info(f"Saved best model to {self.config.trained_model_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def save_model_report(self, results):
        """
        Save evaluation metrics to JSON.
        Remove model objects before saving to JSON.
        """
        try:
            report = {}
            for name, metrics in results.items():
                report[name] = {k: v for k, v in metrics.items() if k != 'model_object'}
            
            os.makedirs(os.path.dirname(self.config.model_report_path), exist_ok=True)
            with open(self.config.model_report_path, 'w') as f:
                json.dump(report, f, indent=4)
                
            logging.info(f"Saved model report to {self.config.model_report_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def initiate_model_trainer(self):
        """
        Master pipeline for model training.
        """
        try:
            # 1. Load Data
            X_train, X_test, y_train, y_test = self.load_transformed_data()
            
            # 2. Get Models
            models = self.get_models()
            
            # 3. Train and Evaluate
            model_results = self.train_models(X_train, y_train, X_test, y_test, models)
            
            # 4. Save Report
            self.save_model_report(model_results)
            
            # 5. Select Best Model
            best_name, best_model, best_score = self.select_best_model(model_results)
            
            if best_model is None:
                raise CustomException("No best model found", sys)
            
            # 6. Save Best Model
            self.save_best_model(best_model)
            
            logging.info("Model Training Pipeline Completed Successfully")
            return self.config.trained_model_path
            
        except Exception as e:
            raise CustomException(e, sys)


from sklearn.model_selection import GridSearchCV

@dataclass
class HyperparameterTuningConfig:
    tuned_model_path: str = os.path.join('artifacts', 'tuned_best_model.pkl')
    tuning_report_path: str = os.path.join('artifacts', 'hyperparameter_report.json')
    train_data_path: str = os.path.join('artifacts', 'X_train_transformed.npy')
    train_labels_path: str = os.path.join('artifacts', 'y_train.npy')
    cv_folds: int = 5

class HyperparameterTuner:
    def __init__(self):
        self.config = HyperparameterTuningConfig()

    def load_training_data(self):
        """
        Load transformed training data.
        """
        try:
            logging.info("Loading training data for hyperparameter tuning...")
            if not os.path.exists(self.config.train_data_path):
                 raise FileNotFoundError(f"Train data not found at {self.config.train_data_path}")

            X_train = np.load(self.config.train_data_path)
            y_train = np.load(self.config.train_labels_path)
            
            logging.info(f"Loaded X_train: {X_train.shape}, y_train: {y_train.shape}")
            return X_train, y_train
        except Exception as e:
            raise CustomException(e, sys)

    def define_param_grids(self):
        """
        Define hyperparameter search spaces for each model.
        """
        try:
            param_grids = {
                "RandomForest": {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [None, 10, 20],
                    'min_samples_split': [2, 5]
                },
                "DecisionTree": {
                    'max_depth': [5, 10, 20],
                    'min_samples_split': [2, 5]
                },
                "LogisticRegression": {
                    'C': [0.1, 1, 10],
                    'solver': ['lbfgs']
                },
                "KNeighbors": {
                    'n_neighbors': [3, 5, 7],
                    'weights': ['uniform', 'distance']
                },
                "SVC": {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf']
                },
                "XGBoost": {
                    'n_estimators': [100, 200],
                    'learning_rate': [0.01, 0.1],
                    'max_depth': [3, 5]
                }
            }
            return param_grids
        except Exception as e:
            raise CustomException(e, sys)

    def perform_grid_search(self, X_train, y_train, models, param_grids):
        """
        Perform GridSearchCV for all models.
        Return dictionary of best params and scores.
        """
        try:
            logging.info("Starting GridSearchCV...")
            tuning_results = {}
            
            for name, model in models.items():
                if name not in param_grids:
                    continue
                
                logging.info(f"Tuning {name}...")
                grid_search = GridSearchCV(
                    estimator=model,
                    param_grid=param_grids[name],
                    cv=self.config.cv_folds,
                    scoring='f1_weighted',
                    n_jobs=-1,
                    verbose=1
                )
                
                grid_search.fit(X_train, y_train)
                
                tuning_results[name] = {
                    "best_params": grid_search.best_params_,
                    "best_score": grid_search.best_score_,
                    "best_estimator": grid_search.best_estimator_
                }
                
                logging.info(f"{name} Best Score: {grid_search.best_score_:.4f}")
                
            return tuning_results
        except Exception as e:
            raise CustomException(e, sys)

    def select_final_best_model(self, tuning_results):
        """
        Select model with highest cross-validation score.
        """
        try:
            best_model_name = None
            best_model_score = -1.0
            best_model_object = None
            
            for name, result in tuning_results.items():
                if result['best_score'] > best_model_score:
                    best_model_score = result['best_score']
                    best_model_name = name
                    best_model_object = result['best_estimator']
            
            logging.info(f"Final Best Tuned Model: {best_model_name} with CV Score: {best_model_score:.4f}")
            return best_model_name, best_model_object, best_model_score
            
        except Exception as e:
            raise CustomException(e, sys)

    def save_tuned_model(self, model):
        """
        Persist optimized model.
        """
        try:
            os.makedirs(os.path.dirname(self.config.tuned_model_path), exist_ok=True)
            with open(self.config.tuned_model_path, 'wb') as f:
                pickle.dump(model, f)
            logging.info(f"Saved tuned model to {self.config.tuned_model_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def save_tuning_report(self, tuning_results):
        """
        Save hyperparameter results to JSON.
        """
        try:
            report = {}
            for name, result in tuning_results.items():
                report[name] = {
                    "best_params": result['best_params'],
                    "best_score": result['best_score']
                }
            
            os.makedirs(os.path.dirname(self.config.tuning_report_path), exist_ok=True)
            with open(self.config.tuning_report_path, 'w') as f:
                json.dump(report, f, indent=4)
                
            logging.info(f"Saved tuning report to {self.config.tuning_report_path}")
        except Exception as e:
            raise CustomException(e, sys)

    def initiate_hyperparameter_tuning(self):
        """
        Master pipeline for hyperparameter tuning.
        """
        try:
            # 1. Load Data
            X_train, y_train = self.load_training_data()
            
            # 2. Get Models and Grids
            trainer = ModelTrainer()
            models = trainer.get_models()
            param_grids = self.define_param_grids()
            
            # 3. Perform Grid Search
            tuning_results = self.perform_grid_search(X_train, y_train, models, param_grids)
            
            # 4. Save Report
            self.save_tuning_report(tuning_results)
            
            # 5. Select Best Model
            best_name, best_model, best_score = self.select_final_best_model(tuning_results)
            
            if best_model is None:
                raise CustomException("No best model found after tuning", sys)
            
            # 6. Save Best Tuned Model
            self.save_tuned_model(best_model)
            
            logging.info("Hyperparameter Tuning Pipeline Completed Successfully")
            return self.config.tuned_model_path
            
        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "tune":
            obj = HyperparameterTuner()
            obj.initiate_hyperparameter_tuning()
        else:
            obj = ModelTrainer()
            obj.initiate_model_trainer()
    except Exception as e:
        logging.info("Model Training/Tuning failed")
        print(e)
