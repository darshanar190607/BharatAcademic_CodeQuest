from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from src.pipeline.predict_pipeline import PredictionPipeline
from src.exception import CustomException
from src.components.model_trainer_lite import NearestCentroidClassifier
import sys

app = FastAPI(title="Neuroadaptive EEG Emotion Detection")

# Configure CORS so React (localhost:5173 / localhost:3000) can access the API directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")

import os
import subprocess
import time

startup_time = time.time()

if not os.path.exists("artifacts/best_model.pkl"):
    print("WARNING: Model not found. Running training pipeline...")
    result = subprocess.run(
        ["python", "run_pipeline.py"], 
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print("Model trained successfully")
    else:
        print(f"Training failed: {result.stderr}")

# Initialize prediction pipeline
try:
    pipeline = PredictionPipeline()
except Exception as e:
    print(f"Error loading model: {e}")
    pipeline = None


# --- JSON API DEFINITIONS FOR INTEGRATION ---

class EEGData(BaseModel):
    delta: float
    theta: float
    alpha: float
    beta: float
    gamma: float

# Global variable to hold the most recent state
latest_bci_state = {
    "emotion": "Neutral",
    "confidence": 0.0,
    "features": None
}

@app.post("/api/bci-data")
async def receive_bci_data(data: EEGData):
    """
    Called by the Python Serial Bridge (PySerial)
    Receives live EEG bands from hardware -> Updates global state
    """
    global latest_bci_state
    try:
        if pipeline is None or pipeline.model is None:
            return JSONResponse(status_code=500, content={"error": "Model not loaded."})
        
        features = [data.delta, data.theta, data.alpha, data.beta, data.gamma]
        result = pipeline.predict_eeg_emotion(features)
        
        latest_bci_state["emotion"] = result["predicted_emotion"]
        latest_bci_state["confidence"] = result["confidence_score"]
        latest_bci_state["features"] = features
        
        return JSONResponse(content={"status": "success", "prediction": result})
    except Exception as e:
        return JSONResponse(content={"status": "error", "prediction": latest_bci_state, "error": str(e)})

@app.get("/api/bci-state")
async def get_bci_state():
    """
    Called by the React Frontend polling algorithm (CourseChat.tsx)
    """
    if pipeline is None or getattr(pipeline, "model", None) is None:
        return {
            "state": "NEUTRAL",
            "confidence": 0.0,
            "band_powers": {},
            "error": "Model not loaded — run python run_pipeline.py"
        }
    return JSONResponse(content=latest_bci_state)



# --- LEGACY HTML ENDPOINTS (From Previous Version) ---

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/predict", response_class=HTMLResponse)
async def predict(
    request: Request,
    delta: float = Form(...),
    theta: float = Form(...),
    alpha: float = Form(...),
    beta: float = Form(...),
    gamma: float = Form(...)
):
    try:
        if pipeline is None:
            return templates.TemplateResponse("index.html", {
                "request": request,
                "error": "Model not loaded. Please train the model first."
            })
        
        features = [delta, theta, alpha, beta, gamma]
        result = pipeline.predict_eeg_emotion(features)
        
        return templates.TemplateResponse("result.html", {
            "request": request,
            "emotion": result["predicted_emotion"],
            "confidence": result["confidence_score"],
            "model_version": result["model_version"],
            "features": {
                "delta": delta, "theta": theta, "alpha": alpha, 
                "beta": beta, "gamma": gamma
            }
        })
    except Exception as e:
        return templates.TemplateResponse("index.html", {"request": request, "error": f"Prediction failed: {str(e)}"})

@app.get("/health")
async def health():
    return {
      "status": "ok",
      "model_loaded": pipeline is not None and getattr(pipeline, "model", None) is None,
      "hardware_connected": True,
      "last_state": latest_bci_state.get("emotion"),
      "uptime": time.time() - startup_time
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
