"""
FastAPI Microservice for Multimodal Delay Risk Prediction.
SIH 2026 - Team Jugaad Junction.
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import predictor

app = FastAPI(
    title="Multimodal Freight Delay Prediction Service",
    description="ML Inference service predicting leg-level delay probability and plain-language coordination actions for Indian freight corridors.",
    version="1.4.2"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    mode: str = Field(..., example="RAIL", description="Transport mode: ROAD, RAIL, PORT, VESSEL, WAREHOUSE")
    corridor: Optional[str] = Field("COR-LDH-MUN", example="COR-LDH-MUN", description="Corridor code")
    from_node: Optional[str] = Field("Ludhiana ICD", example="Ludhiana ICD")
    to_node: Optional[str] = Field("Mundra Port Terminal", example="Mundra Port Terminal")
    commodity: Optional[str] = Field("General Cargo", example="Kinnow Citrus")
    is_perishable: Optional[int] = Field(0, example=1, description="1 if perishable/cold chain, 0 otherwise")
    planned_duration_hrs: Optional[float] = Field(18.0, example=18.0)
    hour_of_day: Optional[int] = Field(14, example=14, ge=0, le=23)
    day_of_week: Optional[int] = Field(2, example=2, ge=0, le=6)
    weather: Optional[str] = Field("CLEAR", example="HEAVY_MONSOON")
    toll_congestion_index: Optional[float] = Field(0.2, example=0.75, ge=0.0, le=1.0)
    rake_turnaround_hrs: Optional[float] = Field(2.5, example=6.0)
    port_berth_queue_length: Optional[int] = Field(1, example=5)
    customs_clearance_hrs: Optional[float] = Field(2.0, example=4.5)

class PredictionResponse(BaseModel):
    risk_score: float
    risk_label: str
    expected_delay_minutes: int
    suggested_action: str
    plain_language_reason: str
    feature_attributions: Dict[str, Any]
    model_version: str
    execution_ready: bool

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ml-delay-prediction-service",
        "model_loaded": predictor.clf is not None,
        "version": predictor.metadata.get("version", "v1.4.2")
    }

@app.get("/model-info")
def model_info():
    return {
        "metadata": predictor.metadata,
        "supported_modes": ["ROAD", "RAIL", "PORT", "VESSEL", "WAREHOUSE"],
        "supported_actions": ["PROCEED", "HOLD", "REROUTE", "RESCHEDULE"],
        "pilot_corridor": "Ludhiana (Punjab) -> Rewari (WDFC) -> Mundra Port (Gujarat)"
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_delay_risk(req: PredictionRequest):
    try:
        res = predictor.predict(req.model_dump())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch")
def predict_batch(requests: List[PredictionRequest]):
    results = []
    for req in requests:
        results.append(predictor.predict(req.model_dump()))
    return {"results": results, "count": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
