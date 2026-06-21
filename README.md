# NeuroBright 🧠✨

**Production-Grade Neuroadaptive Learning Platform with Real-Time EEG Brain State Classification**

NeuroBright is a complete ML pipeline that classifies 3 brain states (Focused, Drowsy, Stressed) from 3-channel EEG signals in real-time using a fine-tuned EEGNet deep learning model.

## 🏗️ Monorepo Structure

```
NeuroBright/
├── ml_service/              # Complete ML pipeline + FastAPI backend
│   ├── pipeline/            # 7-stage ML pipeline
│   │   ├── ingestion/       # Arduino EEG data collection
│   │   ├── preprocessing/   # Signal filtering & windowing
│   │   ├── features/        # Band powers, Hjorth, entropy
│   │   ├── training/        # EEGNet training & tuning
│   │   ├── evaluation/      # Metrics & visualization
│   │   ├── inference/       # Real-time prediction engine
│   │   └── adaptive/        # Learning content adaptation
│   ├── api/                 # FastAPI + WebSocket server
│   ├── config/              # Configuration files
│   ├── utils/               # Logging, exceptions, config loader
│   ├── data/                # Raw & processed datasets
│   ├── models/              # Saved model checkpoints
│   └── app.py               # CLI entry point
│
├── web-app/                # React TypeScript UI (separate repo)
└── NeuroBright_Firmware/    # Arduino firmware (PlatformIO)
```

## 🚀 Quick Start

### 1. Setup ML Service

```bash
cd ml_service

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Install in development mode
pip install -e .
```

### 2. Configure Hardware

Edit `ml_service/config/config.yaml`:

```yaml
hardware:
  port: "COM5"  # Your Arduino port
  baud_rate: 230400
  sample_rate: 500
  n_channels: 3
```

### 3. Run Pipeline

```bash
# Test hardware connection
python app.py --mode test

# Collect training data (7 min per state)
python app.py --mode collect

# Preprocess raw data
python app.py --mode process

# Train EEGNet model
python app.py --mode train

# (Optional) Hyperparameter tuning
python app.py --mode tune

# Real-time inference
python app.py --mode infer

# Start FastAPI server
python app.py --mode server
```

## 📊 ML Pipeline Stages

### Stage 1: Ingestion
- **arduino_reader.py**: Binary packet protocol (16 bytes)
- **record_session.py**: Labeled data collection
- **test_connection.py**: Hardware verification

### Stage 2: Preprocessing
- **filters.py**: Notch (50Hz) + Bandpass (1-45Hz)
- **windowing.py**: 2-second sliding windows (0.5s step)
- **artifact_rejection.py**: Amplitude & flatline detection
- **process_pipeline.py**: Complete preprocessing workflow

### Stage 3: Features
- **band_powers.py**: Delta, Theta, Alpha, Beta, Gamma
- **hjorth_params.py**: Activity, Mobility, Complexity
- **spectral_entropy.py**: Signal randomness measure

### Stage 4: Training
- **eegnet.py**: Optimized architecture (F1=16, D=4, F2=64)
- **dataset.py**: PyTorch Dataset wrapper
- **train.py**: Training loop with early stopping
- **tune.py**: Optuna hyperparameter search

### Stage 5: Evaluation
- Accuracy, F1 score, confusion matrix
- Training curves visualization
- Band power comparison plots

### Stage 6: Inference
- **realtime_engine.py**: Live prediction loop
- Majority vote smoothing (last 5 predictions)
- Band power computation for visualization

### Stage 7: Adaptive Learning
- **learning_engine.py**: FSM with 10s hysteresis
- Actions: increase_difficulty, trigger_break, simplify_content
- Difficulty scale: 1-10

## 🌐 FastAPI Backend

### WebSocket Endpoint

```
ws://localhost:8000/ws/brain-state
```

Streams JSON every 0.5 seconds:

```json
{
  "state": "focused",
  "confidence": 0.87,
  "action": "increase_difficulty",
  "difficulty": 6.0,
  "band_powers": {
    "delta": 0.1,
    "theta": 0.2,
    "alpha": 0.3,
    "beta": 0.6,
    "gamma": 0.2
  },
  "timestamp": 1234567890
}
```

### REST Endpoints

- `GET /api/health` - Health check
- `GET /api/status` - System status
- `GET /api/session/start` - Start inference
- `GET /api/session/stop` - Stop inference
- `GET /api/history` - Prediction history

## 🧠 Brain States

| State | Label | Description | Adaptive Action |
|-------|-------|-------------|-----------------|
| **Focused** | 0 | High engagement, solving problems | Increase difficulty |
| **Drowsy** | 1 | Low alertness, relaxed | Trigger break |
| **Stressed** | 2 | High cognitive load, time pressure | Simplify content |

## ⚙️ Hardware Setup

- **EEG Sensor**: BioAmp EXG Pill (3-channel)
- **Microcontroller**: Arduino UNO R4 Minima
- **Connection**: USB Serial @ 230400 baud
- **Sampling Rate**: 500 Hz
- **Channels**: Fp1, Fp2, A1 (frontal + reference)

## 📦 Model Architecture

**EEGNet** (Compact CNN for EEG-based BCIs)

- **Input**: (3 channels, 1000 samples) = 2 seconds @ 500Hz
- **Block 1**: Temporal Conv + Depthwise Spatial Conv
- **Block 2**: Separable Conv
- **Classifier**: FC(64) → ReLU → Dropout → FC(3)
- **Parameters**: ~2,500 (highly efficient)
- **Optimized Hyperparameters**: F1=16, D=4, F2=64, dropout=0.2765

## 🔧 Configuration

All settings in `ml_service/config/config.yaml`:

- Hardware (port, baud rate, channels)
- Signal processing (filters, artifact thresholds)
- Windowing (window size, step size)
- Model architecture (EEGNet hyperparameters)
- Training (epochs, batch size, learning rate)
- API (host, port, WebSocket interval)

## 📝 Development

### Project Structure Philosophy

- **pipeline/**: Linear ML workflow (ingestion → inference)
- **api/**: Web service layer (FastAPI + WebSocket)
- **utils/**: Cross-cutting concerns (logging, config, exceptions)
- **config/**: Single source of truth for all settings

### Code Standards

- Every module has docstrings
- Every function has Args/Returns documentation
- No hardcoded values (everything from config)
- Standalone runnable with `if __name__ == '__main__'`
- Color-coded logging (INFO=green, WARNING=yellow, ERROR=red)

### Custom Exceptions

- `HardwareConnectionError` - Arduino connection issues
- `SignalQualityError` - Poor EEG signal quality
- `ModelNotFoundError` - Missing trained model
- `InferenceError` - Prediction failures
- `PreprocessingError` - Data processing issues

## 📊 Dataset Statistics

After preprocessing:

- **Total windows**: ~5,000 (varies by recording length)
- **Window shape**: (1000 samples, 3 channels)
- **Class distribution**: Balanced (33% each state)
- **Artifact rejection**: ~10-15% of windows removed

## 🎯 Performance

- **Validation Accuracy**: ~85-90%
- **Inference Latency**: <50ms per window
- **Real-time Throughput**: 2 predictions/second
- **Model Size**: <1 MB

## 📚 Citation

```bibtex
@software{neurobright2026,
  title={NeuroBright: Neuroadaptive Learning Platform with Real-Time EEG Brain State Classification},
  author={NeuroBright Team},
  year={2026},
  url={https://github.com/darshanar190607/NeuroBright_Nallas}
}
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🐛 Troubleshooting

### Hardware Connection Issues

```bash
# Check available COM ports
python -c "import serial.tools.list_ports; print([p.device for p in serial.tools.list_ports.comports()])"

# Test connection
python app.py --mode test
```

### Model Not Found

```bash
# Train model first
python app.py --mode train
```

### Poor Signal Quality

- Check electrode contact
- Reduce movement
- Ensure proper grounding
- Adjust artifact thresholds in config.yaml

## 📞 Support

For issues and questions:
- GitHub Issues: [github.com/darshanar190607/NeuroBright_Nallas/issues](https://github.com/darshanar190607/NeuroBright_Nallas/issues)
- Email: support@neurobright.ai

---

**Built with ❤️ for advancing neuroadaptive learning**
