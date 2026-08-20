"""
Unified Multimodal Freight Visibility & Coordination Platform.
Enterprise Supply Chain Operations Launcher.
"""

import os
import sys
import json
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(CURRENT_DIR, 'ml')
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

from predictor import predictor

app = FastAPI(
    title="FreightPulse OS - Unified Multimodal Logistics Platform",
    description="Real-Time Multimodal Logistics & Predictive Coordination System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "platform": "FreightPulse OS",
        "service": "Multimodal Freight Visibility & Dispatch Engine"
    }

class PredictRequest(BaseModel):
    mode: str = "RAIL"
    corridor: Optional[str] = "COR-LDH-MUN"
    toll_congestion_index: Optional[float] = 0.2
    rake_turnaround_hrs: Optional[float] = 2.0
    port_berth_queue_length: Optional[int] = 1
    weather: Optional[str] = "CLEAR"

@app.post("/api/v1/predictions/predict")
@app.post("/predict")
def predict_delay(req: PredictRequest):
    return predictor.predict(req.model_dump())

FRONTEND_DIR = os.path.join(CURRENT_DIR, 'frontend')

@app.get("/")
def serve_index():
    index_path = os.path.join(FRONTEND_DIR, 'index.html')
    return FileResponse(index_path)

@app.get("/src/main.js")
def serve_main_js():
    js_path = os.path.join(FRONTEND_DIR, 'src', 'main.js')
    return FileResponse(js_path, media_type="application/javascript")

if __name__ == "__main__":
    port = 8000
    print("=" * 65)
    print(" FreightPulse OS - Multimodal Freight Operations Control Tower")
    print(" Running live on: http://localhost:8000")
    print("=" * 65)
    uvicorn.run("start_platform:app", host="0.0.0.0", port=port, reload=False)
