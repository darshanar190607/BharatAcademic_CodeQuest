import os
import sys
import json
import pickle
import shutil
from datetime import datetime
from dataclasses import dataclass

from src.exception import CustomException
from src.logger import logging

@dataclass
class ModelRegistryConfig:
    registry_base_dir: str = os.path.join('artifacts', 'model_registry')
    metadata_file_path: str = os.path.join('artifacts', 'model_registry', 'registry_metadata.json')
    models_dir: str = os.path.join('artifacts', 'model_registry', 'models')
    preprocessors_dir: str = os.path.join('artifacts', 'model_registry', 'preprocessors')
    logs_dir: str = os.path.join('artifacts', 'model_registry', 'logs')

class ModelRegistry:
    def __init__(self):
        self.config = ModelRegistryConfig()
        self.initialize_registry()

    def initialize_registry(self):
        """
        Create registry folder structure.
        """
        try:
            os.makedirs(self.config.registry_base_dir, exist_ok=True)
            os.makedirs(self.config.models_dir, exist_ok=True)
            os.makedirs(self.config.preprocessors_dir, exist_ok=True)
            os.makedirs(self.config.logs_dir, exist_ok=True)
            
            # Initialize metadata file if not exists
            if not os.path.exists(self.config.metadata_file_path):
                with open(self.config.metadata_file_path, 'w') as f:
                    json.dump([], f)
                    
        except Exception as e:
            raise CustomException(e, sys)

    def generate_model_version(self):
        """
        Create unique model version ID.
        Format: MODEL_V1_TIMESTAMP
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            return f"EEG_MODEL_v1_{timestamp}"
        except Exception as e:
            raise CustomException(e, sys)

    def register_model(self, model, preprocessor, metrics, model_name="Best_Model"):
        """
        Store trained model and metadata.
        """
        try:
            version_id = self.generate_model_version()
            logging.info(f"Registering new model version: {version_id}")
            
            # Create version subdirectories
            model_version_dir = os.path.join(self.config.models_dir, version_id)
            preprocessor_version_dir = os.path.join(self.config.preprocessors_dir, version_id)
            os.makedirs(model_version_dir, exist_ok=True)
            os.makedirs(preprocessor_version_dir, exist_ok=True)
            
            # Save Model
            model_path = os.path.join(model_version_dir, "model.pkl")
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
                
            # Save Preprocessor
            preprocessor_path = os.path.join(preprocessor_version_dir, "preprocessor.pkl")
            with open(preprocessor_path, 'wb') as f:
                pickle.dump(preprocessor, f)
                
            # Save Metadata
            self.update_registry_metadata(version_id, model_name, metrics, model_path, preprocessor_path)
            
            return version_id
            
        except Exception as e:
            raise CustomException(e, sys)

    def update_registry_metadata(self, version_id, model_name, metrics, model_path, preprocessor_path):
        """
        Maintain central registry file.
        """
        try:
            entry = {
                "version_id": version_id,
                "model_name": model_name,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "metrics": metrics,
                "paths": {
                    "model": model_path,
                    "preprocessor": preprocessor_path
                }
            }
            
            # Load existing metadata
            if os.path.exists(self.config.metadata_file_path):
                with open(self.config.metadata_file_path, 'r') as f:
                    try:
                        metadata = json.load(f)
                    except json.JSONDecodeError:
                        metadata = []
            else:
                metadata = []
                
            metadata.append(entry)
            
            # Save updated metadata
            with open(self.config.metadata_file_path, 'w') as f:
                json.dump(metadata, f, indent=4)
                
            logging.info(f"Updated registry metadata for version {version_id}")
            
        except Exception as e:
            raise CustomException(e, sys)

    def get_latest_model(self):
        """
        Retrieve most recent model version.
        """
        try:
            if not os.path.exists(self.config.metadata_file_path):
                raise FileNotFoundError("Registry metadata not found")
                
            with open(self.config.metadata_file_path, 'r') as f:
                metadata = json.load(f)
                
            if not metadata:
                return None, None
                
            latest_entry = metadata[-1]
            return latest_entry['paths']['model'], latest_entry['paths']['preprocessor']
            
        except Exception as e:
            raise CustomException(e, sys)

    def load_model_by_version(self, version_id):
        """
        Load a specific model version.
        """
        try:
             if not os.path.exists(self.config.metadata_file_path):
                raise FileNotFoundError("Registry metadata not found")
                
             with open(self.config.metadata_file_path, 'r') as f:
                metadata = json.load(f)
                
             target_entry = next((item for item in metadata if item["version_id"] == version_id), None)
             
             if not target_entry:
                 raise ValueError(f"Version {version_id} not found in registry")
                 
             model_path = target_entry['paths']['model']
             preprocessor_path = target_entry['paths']['preprocessor']
             
             with open(model_path, 'rb') as f:
                 model = pickle.load(f)
                 
             with open(preprocessor_path, 'rb') as f:
                 preprocessor = pickle.load(f)
                 
             return model, preprocessor
             
        except Exception as e:
            raise CustomException(e, sys)

    def register_trained_model(self, tuned_model_path, preprocessor_path, metrics):
        """
        Master registry function: Load artifacts and register them.
        """
        try:
            logging.info("Starting model registration process...")
            
            # Load artifacts
            with open(tuned_model_path, 'rb') as f:
                model = pickle.load(f)
                
            with open(preprocessor_path, 'rb') as f:
                preprocessor = pickle.load(f)
                
            # Register
            model_name = model.__class__.__name__
            version_id = self.register_model(model, preprocessor, metrics, model_name)
            
            logging.info(f"Model registration completed. Version: {version_id}")
            return version_id
            
        except Exception as e:
            raise CustomException(e, sys)

if __name__ == "__main__":
    try:
        # Example usage: Register the currently tuned model
        tuned_model_path = os.path.join('artifacts', 'tuned_best_model.pkl')
        preprocessor_path = os.path.join('artifacts', 'preprocessor.pkl')
        
        # Load Report for metrics
        report_path = os.path.join('artifacts', 'hyperparameter_report.json')
        if os.path.exists(report_path):
             with open(report_path, 'r') as f:
                 report = json.load(f)
             # Extract metrics (just taking the best score of the best model for now as a placeholder)
             # Ideally validation metrics should be passed
             # Identifying best model from report
             best_model_name = max(report, key=lambda k: report[k]['best_score'])
             metrics = {"f1_score": report[best_model_name]['best_score']}
        else:
            metrics = {"f1_score": 0.0}

        if os.path.exists(tuned_model_path) and os.path.exists(preprocessor_path):
            registry = ModelRegistry()
            registry.register_trained_model(tuned_model_path, preprocessor_path, metrics)
        else:
            logging.info("Artifacts not found for registration.")
            
    except Exception as e:
        logging.info("Model Registry failed")
        print(e)
