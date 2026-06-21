from dataclasses import dataclass
import numpy as np
import os
import sys

from src.exception import CustomException

# from scipy.signal import butter, filtfilt, welch
class DataTransformationConfig:
    processed_data_dir: str = os.path.join('data', 'final')
    sampling_rate: int = 500
    window_size_seconds: int = 2
    overlap_ratio: float = 0.5

class DataTransformation:
    def __init__(self):
        self.config = DataTransformationConfig()

    def select_eeg_channels(self, raw_data):
        try:
            if raw_data.shape[1] < 3:
                raise ValueError(f"Input data has fewer than 3 channels: {raw_data.shape[1]}")
            return raw_data[:, :3, :]
        except Exception as e:
            raise e

    def bandpass_filter_signal(self, signal):
        try:
            n = len(signal)
            freqs = np.fft.fftfreq(n, d=1/self.config.sampling_rate)
            fft_signal = np.fft.fft(signal)
            mask = (np.abs(freqs) >= 1.0) & (np.abs(freqs) <= 45.0)
            fft_signal[~mask] = 0
            return np.real(np.fft.ifft(fft_signal))
        except Exception as e:
            raise e

    def normalize_signal(self, signal):
        try:
            mean = np.mean(signal)
            std = np.std(signal)
            if std == 0: return signal
            return (signal - mean) / std
        except Exception as e:
            raise e

    def segment_signal(self, signal):
        try:
            window_size_samples = int(self.config.sampling_rate * self.config.window_size_seconds)
            step_size = int(window_size_samples * (1 - self.config.overlap_ratio))
            segments = []
            if len(signal) < window_size_samples: return np.array([])
            for start in range(0, len(signal) - window_size_samples + 1, step_size):
                segments.append(signal[start : start + window_size_samples])
            return np.array(segments)
        except Exception as e:
            raise e

    def compute_psd(self, segment):
        try:
            n = len(segment)
            fft_vals = np.fft.rfft(segment)
            psd = (1.0 / (self.config.sampling_rate * n)) * (np.abs(fft_vals)**2)
            psd[1:-1] *= 2
            freqs = np.fft.rfftfreq(n, d=1/self.config.sampling_rate)
            return freqs, psd
        except Exception as e:
            raise e

    def extract_band_power(self, freqs, psd):
        """
        Calculate brainwave power features.
        """
        try:
            bands = {
                'delta': (0.5, 4),
                'theta': (4, 8),
                'alpha': (8, 12),
                'beta': (12, 30),
                'gamma': (30, 45)
            }
            
            features = {}
            for band, (low, high) in bands.items():
                idx = np.logical_and(freqs >= low, freqs <= high)
                features[band] = np.mean(psd[idx])
            
            return features
        except Exception as e:
            raise CustomException(e, sys)

    def aggregate_channel_features(self, channel_features_list):
        """
        Compute mean band power across all channels.
        Input: List of feature dicts (one per channel)
        Output: List of mean band powers [delta, theta, alpha, beta, gamma]
        """
        try:
            bands = ['delta', 'theta', 'alpha', 'beta', 'gamma']
            aggregated_features = []
            
            for band in bands:
                 # Extract the specific band power from all channels
                band_powers = [ch_feat[band] for ch_feat in channel_features_list]
                aggregated_features.append(np.mean(band_powers))
                
            return aggregated_features
        except Exception as e:
            raise CustomException(e, sys)

    def transform_trial(self, trial_data):
        """
        Process a single trial (32 channels, samples).
        Returns aggregated features for all windows in the trial.
        Shape: (num_windows, 5)
        """
        try:
            num_channels = trial_data.shape[0]
            
            # 1. Preprocess each channel: Filter -> Normalize -> Segment
            # Result: list of (num_windows, window_size) arrays
            all_channel_segments = [] 
            
            for i in range(num_channels):
                signal = trial_data[i]
                filtered = self.bandpass_filter_signal(signal)
                normalized = self.normalize_signal(filtered)
                segments = self.segment_signal(normalized)
                all_channel_segments.append(segments)
            
            # Convert to numpy array: (num_channels, num_windows, window_size)
            all_channel_segments = np.array(all_channel_segments)
            
            if all_channel_segments.size == 0 or len(all_channel_segments.shape) != 3:
                return np.array([])

            num_windows = all_channel_segments.shape[1]
            trial_features = []

            # 2. Iterate over windows
            for w in range(num_windows):
                window_channel_features = []
                
                # 3. Iterate over channels for this window
                for c in range(num_channels):
                    segment = all_channel_segments[c, w, :]
                    freqs, psd = self.compute_psd(segment)
                    features = self.extract_band_power(freqs, psd)
                    window_channel_features.append(features)
                
                # 4. Aggregate features across channels
                agg_features = self.aggregate_channel_features(window_channel_features)
                trial_features.append(agg_features)
            
            return np.array(trial_features)

        except Exception as e:
            raise e

    def transform_raw_eeg_data(self, raw_data):
        try:
            eeg_data = self.select_eeg_channels(raw_data)
            num_trials = eeg_data.shape[0]
            all_trials_features = []
            print(f"Processing {num_trials} trials...")
            for i in range(num_trials):
                trial_features = self.transform_trial(eeg_data[i])
                if trial_features.size > 0:
                    all_trials_features.append(trial_features)
            return all_trials_features
        except Exception as e:
            raise e

    def initiate_data_transformation(self, raw_data_path, raw_labels_path):
        try:
            print("Loading raw data for transformation")
            raw_data = np.load(raw_data_path)
            raw_labels = np.load(raw_labels_path)
            print(f"Raw data shape: {raw_data.shape}")
            all_trials_features = self.transform_raw_eeg_data(raw_data)
            X_list = []
            y_list = []
            for i, trial_features in enumerate(all_trials_features):
                num_windows = trial_features.shape[0]
                X_list.append(trial_features)
                trial_label_raw = raw_labels[i]
                # Map Valence/Arousal to 4 quadrants (DEAP standard threshold=5)
                v, a = trial_label_raw[0], trial_label_raw[1]
                class_label = 0
                if v >= 5 and a >= 5: class_label = 3 # High V, High A (Focused)
                elif v >= 5 and a < 5: class_label = 2 # High V, Low A
                elif v < 5 and a >= 5: class_label = 1 # Low V, High A
                else: class_label = 0                  # Low V, Low A (Drowsy)
                
                replicated_labels = np.full(num_windows, class_label)
                y_list.append(replicated_labels)
            X = np.concatenate(X_list, axis=0)
            y = np.concatenate(y_list, axis=0)
            os.makedirs(self.config.processed_data_dir, exist_ok=True)
            feature_path = os.path.join(self.config.processed_data_dir, "X_train.npy")
            label_path = os.path.join(self.config.processed_data_dir, "y_train.npy")
            np.save(feature_path, X)
            np.save(label_path, y)
            print(f"Transformation complete. Saved features shape: {X.shape}, labels shape: {y.shape}")
            return feature_path, label_path
        except Exception as e:
            raise e

if __name__ == "__main__":
    try:
        raw_data_path = os.path.join('data', 'ingested', 'raw_eeg_data.npy')
        raw_labels_path = os.path.join('data', 'ingested', 'raw_labels.npy')
        if os.path.exists(raw_data_path):
            obj = DataTransformation()
            obj.initiate_data_transformation(raw_data_path, raw_labels_path)
        else:
            print("Raw data not found.")
    except Exception as e:
        print(f"Data Transformation failed: {e}")

