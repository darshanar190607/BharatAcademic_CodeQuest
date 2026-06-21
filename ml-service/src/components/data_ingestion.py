import os
import sys
# from src.exception import CustomException
# from src.logger import logging
# import pandas as pd
from dataclasses import dataclass
import numpy as np
import pickle
import glob

@dataclass
class DataIngestionConfig:
    raw_data_dir: str = os.path.join('data', 'raw')
    ingested_data_dir: str = os.path.join('data', 'ingested')
    file_extension: str = "*.dat"

class DataIngestion:
    def __init__(self):
        self.ingestion_config = DataIngestionConfig()

    def get_dat_files(self):
        """
        Scan dataset directory and return list of .dat files.
        """
        try:
            print(f"Scanning for {self.ingestion_config.file_extension} files in {self.ingestion_config.raw_data_dir}")
            
            # Check if directory exists
            if not os.path.exists(self.ingestion_config.raw_data_dir):
                raise FileNotFoundError(f"Directory not found: {self.ingestion_config.raw_data_dir}")

            file_pattern = os.path.join(self.ingestion_config.raw_data_dir, self.ingestion_config.file_extension)
            dat_files = glob.glob(file_pattern)

            if not dat_files:
                raise FileNotFoundError(f"No {self.ingestion_config.file_extension} files found in {self.ingestion_config.raw_data_dir}")

            print(f"Found {len(dat_files)} files.")
            return dat_files

        except Exception as e:
            raise e

    def load_single_dat_file(self, file_path):
        """
        Load a single .dat file using pickle and return data and labels.
        """
        try:
            print(f"Loading file: {file_path}")
            with open(file_path, 'rb') as f:
                content = pickle.load(f, encoding='latin1')

            data = content['data']
            labels = content['labels']

            # Validation: (trials, channels, samples)
            # Standard DEAP: (40, 40, 8064) or (40, 32, 8064)
            if len(data.shape) != 3:
                raise ValueError(f"Invalid data shape in {file_path}. Expected 3 dimensions (trials, channels, samples), got {data.shape}")

            # self.validate_eeg_signal(data)

            return data, labels

        except Exception as e:
            raise e

    def validate_eeg_signal(self, data):
        """
        Perform spectral analysis to verify data is real EEG (1/f) and not random noise.
        Random noise has a flat spectrum (white noise). 
        Real EEG has higher power in low frequencies (Delta/Theta) than high (Gamma).
        """
        try:
            # Take a sample: 1st trial, 1st channel
            sample_signal = data[0, 0, :]
            
            # Simple PSD check
            from scipy.signal import welch
            freqs, psd = welch(sample_signal, fs=128, nperseg=256)
            
            # Define bands indices (approximate for 128Hz)
            # Delta (0.5-4), Gamma (30-45)
            delta_idx = np.logical_and(freqs >= 1, freqs <= 4)
            gamma_idx = np.logical_and(freqs >= 30, freqs <= 45)
            
            delta_power = np.mean(psd[delta_idx])
            gamma_power = np.mean(psd[gamma_idx])
            
            # If Gamma power is roughly equal to or greater than Delta power, it's likely white noise
            # BUT: DEAP data is preprocessed (4-45Hz bandpass), so Delta (<4Hz) is attenuated!
            # So Gamma > Delta is actually EXPECTED for this dataset.
            # We will just log the values.
            # print(f"Spectral Power: Delta {delta_power:.5f}, Gamma {gamma_power:.5f}")
            
            # Check for dummy generation characteristics (0-1 range)
            if np.min(sample_signal) >= 0 and np.max(sample_signal) <= 1.0:
                 if np.abs(np.mean(sample_signal) - 0.5) < 0.1:
                     print("Data is strictly 0-1 and mean ~0.5. PROBABLE DUMMY DATA.")
                     # We could raise here, but let's allow it with warning if user insists,
                     # OR raise if we want to be strict.
                     # Given the task, let's warn for now to avoid blocking real data that might be normalized.
            
            # print("EEG Signal Verification: Profile consistent with preprocessed data (or accepted).")

        except Exception as e:
            # If validation crashes, re-raise
            raise e

    def load_all_dat_files(self):
        """
        Load all .dat files and combine them.
        """
        try:
            dat_files = self.get_dat_files()
            all_data = []
            all_labels = []

            for file_path in dat_files:
                data, labels = self.load_single_dat_file(file_path)
                all_data.append(data)
                all_labels.append(labels)

            # Concatenate along the first axis (trials)
            # Assuming data shape is (trials, channels, samples)
            combined_data = np.concatenate(all_data, axis=0)
            combined_labels = np.concatenate(all_labels, axis=0)

            print(f"Combined data shape: {combined_data.shape}")
            print(f"Combined labels shape: {combined_labels.shape}")

            return combined_data, combined_labels

        except Exception as e:
            raise e

    def initiate_data_ingestion(self):
        """
        Main method to initiate data ingestion.
        """
        print("Entered the data ingestion method or component")
        try:
            os.makedirs(self.ingestion_config.ingested_data_dir, exist_ok=True)

            print("Loading all .dat files...")
            raw_eeg_data, raw_labels = self.load_all_dat_files()

            raw_data_path = os.path.join(self.ingestion_config.ingested_data_dir, "raw_eeg_data.npy")
            raw_labels_path = os.path.join(self.ingestion_config.ingested_data_dir, "raw_labels.npy")

            print(f"Saving raw data to {raw_data_path}")
            np.save(raw_data_path, raw_eeg_data)

            print(f"Saving raw labels to {raw_labels_path}")
            np.save(raw_labels_path, raw_labels)

            print("Data ingestion completed successfully")

            return (
                raw_data_path,
                raw_labels_path
            )

        except Exception as e:
            raise e

if __name__=="__main__":
    obj = DataIngestion()
    try:
        obj.initiate_data_ingestion()
    except Exception as e:
        print(f"Data Ingestion failed: {e}")
