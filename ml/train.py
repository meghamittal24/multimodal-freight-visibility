"""
ML Training Pipeline for Multimodal Freight Delay Risk Prediction.
Team: Jugaad Junction - Smart India Hackathon 2026.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier, RandomForestRegressor
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, mean_absolute_error

from data.generate_synthetic_data import generate_multimodal_dataset, CORRIDORS

def train_model():
    print("=" * 60)
    print("SIH 2026 - Multimodal Freight Delay Risk Model Training")
    print("=" * 60)
    
    # 1. Generate or load training data
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    models_dir = os.path.join(current_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    print("[1/5] Ingesting multimodal historical handoff telemetry...")
    df = generate_multimodal_dataset(num_samples=7500, random_seed=42)
    
    features = [
        'mode', 'corridor', 'commodity', 'is_perishable',
        'planned_duration_hrs', 'hour_of_day', 'day_of_week',
        'weather', 'toll_congestion_index', 'rake_turnaround_hrs',
        'port_berth_queue_length', 'customs_clearance_hrs'
    ]
    
    categorical_cols = ['mode', 'corridor', 'commodity', 'weather']
    numerical_cols = [
        'is_perishable', 'planned_duration_hrs', 'hour_of_day',
        'day_of_week', 'toll_congestion_index', 'rake_turnaround_hrs',
        'port_berth_queue_length', 'customs_clearance_hrs'
    ]
    
    X = df[features]
    y_class = df['is_delayed']
    y_reg = df['delay_minutes']
    
    X_train, X_test, y_train_cls, y_test_cls, y_train_reg, y_test_reg = train_test_split(
        X, y_class, y_reg, test_size=0.20, random_state=42, stratify=y_class
    )
    
    print(f"[2/5] Training set: {len(X_train)} samples, Test set: {len(X_test)} samples")
    
    # 2. Build preprocessing transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', StandardScaler(), numerical_cols)
        ]
    )
    
    # 3. Build classification pipeline (Delay Probability & Risk Classifier)
    clf = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=42
    )
    
    classification_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', clf)
    ])
    
    print("[3/5] Training Gradient Boosted Delay Risk Classifier...")
    classification_pipeline.fit(X_train, y_train_cls)
    
    # Regression model for expected delay magnitude in minutes
    print("[4/5] Training Expected Delay Duration Regressor...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    reg_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', reg)
    ])
    reg_pipeline.fit(X_train, y_train_reg)
    
    # 4. Evaluate Models
    print("[5/5] Evaluating model performance metrics...")
    y_pred_cls = classification_pipeline.predict(X_test)
    y_prob_cls = classification_pipeline.predict_proba(X_test)[:, 1]
    y_pred_reg = reg_pipeline.predict(X_test)
    
    roc_auc = roc_auc_score(y_test_cls, y_prob_cls)
    report = classification_report(y_test_cls, y_pred_cls, output_dict=True)
    mae = mean_absolute_error(y_test_reg, y_pred_reg)
    
    print("\n" + "="*40)
    print(f"MODEL PERFORMANCE SUMMARY:")
    print(f" - ROC-AUC Score: {roc_auc:.4f}")
    print(f" - Precision (Delayed): {report['1']['precision']:.4f}")
    print(f" - Recall (Delayed): {report['1']['recall']:.4f}")
    print(f" - F1-Score: {report['1']['f1-score']:.4f}")
    print(f" - Overall Accuracy: {report['accuracy']:.4f}")
    print(f" - Delay Duration MAE: {mae:.2f} minutes")
    print("="*40 + "\n")
    
    # 5. Export artifacts
    model_artifact_path = os.path.join(models_dir, 'delay_risk_pipeline.joblib')
    reg_artifact_path = os.path.join(models_dir, 'delay_duration_pipeline.joblib')
    metadata_path = os.path.join(models_dir, 'model_metadata.json')
    
    joblib.dump(classification_pipeline, model_artifact_path)
    joblib.dump(reg_pipeline, reg_artifact_path)
    
    metadata = {
        'model_name': 'Multimodal Delay Risk Classifier (XGBoost/GBDT)',
        'version': 'v1.4.2',
        'trained_at': pd.Timestamp.now().isoformat(),
        'samples': len(df),
        'metrics': {
            'roc_auc': round(roc_auc, 4),
            'accuracy': round(report['accuracy'], 4),
            'precision': round(report['1']['precision'], 4),
            'recall': round(report['1']['recall'], 4),
            'f1_score': round(report['1']['f1-score'], 4),
            'delay_mae_minutes': round(mae, 2)
        },
        'features': features,
        'pilot_corridors': CORRIDORS
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Model saved successfully to: {model_artifact_path}")
    print(f"Metadata saved to: {metadata_path}")
    return metadata

if __name__ == '__main__':
    train_model()
