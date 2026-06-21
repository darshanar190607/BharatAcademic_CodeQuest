import os
import sys
import json
import pickle
import numpy as np
import pandas as pd
from dataclasses import dataclass

from src.exception import CustomException
from src.logger import logging
from src.components.model_trainer_lite import NearestCentroidClassifier
from src.components.feature_engineering import LabelEncoderFake

# Map classes to __main__ for unpickling
import sys
sys.modules['__main__'].NearestCentroidClassifier = NearestCentroidClassifier
sys.modules['__main__'].LabelEncoderFake = LabelEncoderFake

@dataclass
class PredictionPipelineConfig:
    model_path: str = os.path.join('artifacts', 'best_model.pkl')
    # Using label encoder if available
    label_encoder_path: str = os.path.join('data', 'final', 'label_encoder.pkl')

class PredictionPipeline:
    def __init__(self):
        self.config = PredictionPipelineConfig()
        self.model = None
        self.label_encoder = None
        self.model_version = "v1-lite"
        self.load_latest_model()

    def load_latest_model(self):
        """
        Load the best model from artifacts.
        """
        try:
            print(f"Loading model from {self.config.model_path}...")
            
            if not os.path.exists(self.config.model_path):
                raise FileNotFoundError(f"Model file not found at {self.config.model_path}")
                
            with open(self.config.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            if os.path.exists(self.config.label_encoder_path):
                with open(self.config.label_encoder_path, 'rb') as f:
                    self.label_encoder = pickle.load(f)
                print("Label encoder loaded.")
            else:
                print("Warning: Label encoder not found. Using fallback labels.")
            
            print("Model loaded successfully.")
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise CustomException(e, sys)

    def validate_input_features(self, features):
        """
        Ensure incoming data matches expected format.
        Expected: [delta, theta, alpha, beta, gamma]
        """
        try:
            if not isinstance(features, (list, np.ndarray)):
                 raise TypeError("Input must be a list or numpy array")
            
            features_list = list(features)
            
            if len(features_list) != 5:
                raise ValueError(f"Expected 5 features (Delta, Theta, Alpha, Beta, Gamma), got {len(features_list)}")
            
            # Check for numeric types
            if not all(isinstance(x, (int, float)) for x in features_list):
                 raise ValueError("All features must be numeric")
                 
            return np.array(features_list).reshape(1, -1)
            
        except Exception as e:
            raise CustomException(e, sys)

    def preprocess_input_data(self, input_array):
        """
        No preprocessing needed for current lite version as transformation is done in data_transformation.
        """
        try:
            return input_array
        except Exception as e:
            raise CustomException(e, sys)

    def predict_emotion(self, processed_input):
        """
        Generate emotion prediction.
        """
        try:
            prediction = self.model.predict(processed_input)
            
            # Get probability if supported
            if hasattr(self.model, "predict_proba"):
                probabilities = self.model.predict_proba(processed_input)
                confidence = np.max(probabilities)
            else:
                confidence = 1.0 # Fallback
                
            return prediction[0], confidence
        except Exception as e:
            raise CustomException(e, sys)

    def decode_prediction_label(self, label_idx):
        """
        Convert numeric label into human-readable emotion.
        """
        try:
            # Using our defined quadrant mapped states
            mapping = {0: "Drowsy", 1: "Neutral", 2: "Neutral", 3: "Focused"}
            return mapping.get(int(label_idx), "Unknown")
        except Exception as e:
             raise CustomException(e, sys)

    def return_prediction_output(self, emotion, confidence):
        """
        Return structured prediction result.
        """
        try:
            return {
                "predicted_emotion": emotion,
                "confidence_score": round(float(confidence), 4),
                "model_version": self.model_version
            }
        except Exception as e:
             raise CustomException(e, sys)

    def predict_eeg_emotion(self, features):
        """
        Master prediction function.
        """
        try:
            # 1. Validate
            input_array = self.validate_input_features(features)
            
            # 2. Preprocess
            processed_input = self.preprocess_input_data(input_array)
            
            # 3. Predict
            label_idx, confidence = self.predict_emotion(processed_input)
            
            # 4. Decode
            emotion = self.decode_prediction_label(label_idx)
            
            # 5. Return
            result = self.return_prediction_output(emotion, confidence)
            
            # logging.info(f"Prediction: {result}")
            return result
            
        except Exception as e:
            print(f"Prediction Error: {e}")
            raise CustomException(e, sys)

if __name__ == "__main__":
    try:
        # Test with dummy data
        pipeline = PredictionPipeline()
        dummy_input = [0.1, 0.2, 0.3, 0.4, 0.5]
        result = pipeline.predict_eeg_emotion(dummy_input)
        print(f"\nTest Prediction Result: {json.dumps(result, indent=4)}")
        
    except Exception as e:
        print(e)
