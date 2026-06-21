# 🧠 NeuroBright: Neuroadaptive Learning Platform

## Overview
NeuroBright is an advanced educational technology platform that adapts to a learner's cognitive and emotional states in real-time. By integrating continuous physiological feedback (such as EEG signals), the system predicts user emotional states (Happy, Sad, Angry, Calm) and dynamically adjusts the learning interface, content delivery, and collaborative environments to optimize engagement and comprehension.

## 🎯 Key Features
- **Adaptive Learning Interface**: A high-performance, responsive React web frontend that dynamically reacts to the learner's state.
- **Real-Time Emotion Detection**: Analyzes frequency band power features (Delta, Theta, Alpha, Beta, Gamma) to accurately predict emotional responses.
- **AI-Powered Course Assistant**: Integrated LLM capabilities for generating personalized roadmaps, answering questions, and providing context-aware help.
- **Immersive 3D Collaboration**: Interactive 3D rooms for student-to-student and student-to-teacher interactions.
- **Microservices Architecture**: A decoupled system featuring a Node.js application backend and a dedicated Python-based prediction engine for real-time signal processing.

## 🏗️ System Architecture & Structure

The repository is structured into distinct modules to handle the UI, business logic, and predictive analytics independently:

```text
NeuroBright_Ml/
├── Frontend/                  # React/Vite Web Application
│   ├── src/                   # Core UI components, pages, and state management
│   └── public/                # Static assets (images, 3D models)
│
├── Backend/                   # Node.js/Express Application Server
│   ├── server.js              # Main API server
│   ├── routes/                # Application API endpoints
│   └── controllers/           # Business logic
│
├── src/                       # Prediction Engine (Python)
│   ├── components/            # Data processing & feature engineering
│   ├── pipeline/              # Prediction workflows
│   └── logger.py              # System logging
│
├── main.py                    # Prediction Engine API
├── run_pipeline.py            # Automated training & pipeline orchestrator
└── data/, artifacts/          # Processed data and model registries
```

## 🚀 Getting Started

### 1. Web Frontend (UI)
The user interface is built with React, Vite, and Tailwind CSS.
```bash
cd Frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`*

### 2. Application Backend (Node.js)
The core application server handling user sessions, AI integrations, and database interactions.
```bash
cd Backend
npm install
node server.js
```
*The Node.js backend runs on `http://localhost:5000` (or as configured in `.env`).*

### 3. Emotion Prediction Engine (Python)
The high-speed prediction engine that processes physiological data.
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the Prediction API
python main.py
```
*The Prediction API starts at `http://localhost:8000`*

## 🧠 Emotion Detection Engine
The system uses a **Valence-Arousal** dimensional model to classify states:
- **Happy**: High Valence (≥5) + High Arousal (≥5)
- **Calm**: High Valence (≥5) + Low Arousal (<5)
- **Angry**: Low Valence (<5) + High Arousal (≥5)
- **Sad**: Low Valence (<5) + Low Arousal (<5)

It processes the following frequency bands:

| Band | Frequency Range | Associated State |
|------|----------------|------------------|
| Delta (δ) | 0.5-4 Hz | Deep rest, unconscious |
| Theta (θ) | 4-8 Hz | Meditative, relaxed focus |
| Alpha (α) | 8-13 Hz | Calmness, flow state |
| Beta (β) | 13-30 Hz | Active thinking, high focus |
| Gamma (γ) | 30-45 Hz | High-level cognition, insight |

## 📚 API Endpoints Overview

### Frontend
- Connects to both the Application Backend and the Prediction Engine APIs to render the adaptive experience.

### Node.js Backend
- `POST /api/chat`: AI assistant integration
- `GET /api/user/progress`: Fetch learning roadmap

### Prediction Engine
- `POST /predict`: Receives physiological data (delta, theta, alpha, beta, gamma) and returns the predicted emotional state and confidence score.
- `GET /health`: Engine status check

## 🛠️ Development & Extending
- **UI Adjustments**: Core UI components in `Frontend/src/components`.
- **Adding New Application Features**: Web application routes go to the `Backend` directory.
- **Refining Predictions**: Modify `src/components/data_transformation.py` to extract additional features or retrain using `run_pipeline.py`.

## 📄 License
MIT License - See LICENSE file for details

## 👥 Contributors
Developed for Neuroadaptive EdTech Hackathon.

---
**Note**: This system is for research and educational purposes. Not intended for clinical diagnosis.