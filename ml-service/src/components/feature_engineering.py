import os
import sys
import numpy as np
# import pandas as pd
from dataclasses import dataclass
# from sklearn.preprocessing import LabelEncoder
# from sklearn.model_selection import train_test_split
import pickle

# from src.exception import CustomException
# from src.logger import logging

class LabelEncoderFake:
    def __init__(self, mapping, classes):
        self.mapping = mapping
        self.classes_ = np.array(classes)
    def inverse_transform(self, labels):
        inv_map = {v: k for k, v in self.mapping.items()}
        return np.array([inv_map[l] for l in labels])

@dataclass
class FeatureEngineeringConfig:
    processed_data_dir: str = os.path.join('data', 'processed')
    feature_output_dir: str = os.path.join('data', 'final')
    test_size: float = 0.2
    random_state: int = 42

class FeatureEngineering:
    def __init__(self):
        self.config = FeatureEngineeringConfig()

    def load_preprocessed_data(self):
        """
        Load transformed EEG features and labels.
        """
        try:
            print("Loading preprocessed data...")
            feature_path = os.path.join(self.config.processed_data_dir, "X_features.npy")
            label_path = os.path.join(self.config.processed_data_dir, "y_labels.npy")

            if not os.path.exists(feature_path) or not os.path.exists(label_path):
                raise FileNotFoundError("Processed data not found.")

            X = np.load(feature_path)
            y = np.load(label_path)
            
            print(f"Loaded features shape: {X.shape}, labels shape: {y.shape}")
            return X, y
        except Exception as e:
            raise e

    def extract_emotion_labels(self, y_raw):
        """
        Convert DEAP emotional ratings (Valence, Arousal) into ML labels.
        Valence >= 5 AND Arousal >= 5 → "Happy"
        Valence >= 5 AND Arousal < 5 → "Calm"
        Valence < 5 AND Arousal >= 5 → "Angry"
        Valence < 5 AND Arousal < 5 → "Sad"
        
        Assuming y_raw structure is (Valence, Arousal, Dominance, Liking) or similar.
        """
        try:
            print("Extracting emotion labels from Valence and Arousal...")
            emotion_labels = []
            
            # Check if y_raw is 2D array
            if len(y_raw.shape) > 1:
                # Iterate through samples
                for i in range(len(y_raw)):
                    valence = y_raw[i, 0] # Index 0 for Valence
                    arousal = y_raw[i, 1] # Index 1 for Aousal
                    
                    if valence >= 5 and arousal >= 5:
                        emotion_labels.append("Happy")
                    elif valence >= 5 and arousal < 5:
                        emotion_labels.append("Calm")
                    elif valence < 5 and arousal >= 5:
                        emotion_labels.append("Angry")
                    else:
                        emotion_labels.append("Sad")
            else:
                 # Single sample logic or if y_raw is somehow 1D strings? 
                 # But input is typically numerical ratings.
                 raise ValueError("Unexpected label format.")

            return np.array(emotion_labels)
        except Exception as e:
            raise e

    def encode_labels(self, emotion_labels):
        try:
            print("Encoding emotion labels manually...")
            classes = sorted(list(set(emotion_labels)))
            label_mapping = {label: i for i, label in enumerate(classes)}
            encoded_labels = np.array([label_mapping[label] for label in emotion_labels])
            print(f"Label mapping: {label_mapping}")
            
            return encoded_labels, LabelEncoderFake(label_mapping, classes)
        except Exception as e:
            raise e

    def create_feature_dataframe(self, X, encoded_labels):
        """
        Convert features into structured DataFrame.
        Columns: delta_mean, theta_mean, alpha_mean, beta_mean, gamma_mean, emotion_label
        """
        try:
            print("Creating feature DataFrame...")
            columns = ['delta_mean', 'theta_mean', 'alpha_mean', 'beta_mean', 'gamma_mean']
            
            # df = pd.DataFrame(X, columns=columns) # Commented out as pandas is removed
            # df['emotion_label'] = encoded_labels
            
            # return df
            # Since pandas is commented out, this function is effectively disabled or needs a numpy alternative.
            # For now, we'll return None or raise an error if it's called.
            # However, the initiate_feature_engineering method comments out its call, so it's fine.
            return None 
        except Exception as e:
            raise e

    def split_dataset(self, X, y):
        try:
            print("Splitting dataset into train and test sets (Manual NumPy split)...")
            np.random.seed(self.config.random_state)
            indices = np.arange(len(X))
            np.random.shuffle(indices)
            
            test_count = int(len(X) * self.config.test_size)
            test_idx = indices[:test_count]
            train_idx = indices[test_count:]
            
            # Note: This is a simple random split, not stratified like the original sklearn call.
            # For a stratified split, you would need to iterate through unique classes in y
            # and split indices for each class proportionally.
            
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]

            print(f"Train shape: {X_train.shape}, Test shape: {X_test.shape}")
            return X_train, X_test, y_train, y_test
        except Exception as e:
            raise e

    def save_final_dataset(self, X_train, X_test, y_train, y_test, label_encoder):
        try:
            os.makedirs(self.config.feature_output_dir, exist_ok=True)
            np.save(os.path.join(self.config.feature_output_dir, "X_train.npy"), X_train)
            np.save(os.path.join(self.config.feature_output_dir, "X_test.npy"), X_test)
            np.save(os.path.join(self.config.feature_output_dir, "y_train.npy"), y_train)
            np.save(os.path.join(self.config.feature_output_dir, "y_test.npy"), y_test)
            encoder_path = os.path.join(self.config.feature_output_dir, "label_encoder.pkl")
            with open(encoder_path, 'wb') as f:
                pickle.dump(label_encoder, f)
            print(f"Saved final dataset to {self.config.feature_output_dir}")
            return (os.path.join(self.config.feature_output_dir, "X_train.npy"),
                    os.path.join(self.config.feature_output_dir, "X_test.npy"),
                    encoder_path)
        except Exception as e:
            raise e

    def initiate_feature_engineering(self):
        """
        Master pipeline for feature engineering.
        """
        try:
            # 1. Load Data
            X, y_raw = self.load_preprocessed_data()
            
            # 2. Extract Emotion Labels
            emotion_labels = self.extract_emotion_labels(y_raw)
            
            # 3. Encode Labels
            y_encoded, label_encoder = self.encode_labels(emotion_labels)
            
            # 4. Split Dataset
            X_train, X_test, y_train, y_test = self.split_dataset(X, y_encoded)
            
            # 5. Save Final Dataset
            self.save_final_dataset(X_train, X_test, y_train, y_test, label_encoder)
            
            print("Feature engineering completed successfully.")
            return True
            
        except Exception as e:
            raise e

if __name__ == "__main__":
    try:
        obj = FeatureEngineering()
        obj.initiate_feature_engineering()
    except Exception as e:
        print(f"Feature Engineering failed: {e}")

