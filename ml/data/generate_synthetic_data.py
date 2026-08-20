"""
Synthetic Multimodal Logistics Dataset Generator for SIH 2026.
Simulates realistic Indian freight conditions across Road (FASTag), Rail (FOIS CRIS),
ICD Dry Ports, and Sea Ports (PCS1x IPA).
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os

MODES = ['ROAD', 'RAIL', 'PORT', 'VESSEL', 'WAREHOUSE']
CORRIDORS = ['COR-LDH-MUN', 'COR-DEL-JNP', 'COR-SOL-NHA', 'COR-BBU-VIZ']
COMMODITIES = ['Agro Perishables', 'Auto Components', 'Textiles', 'Electronics', 'Chemicals & Steel']
WEATHER_CONDITIONS = ['CLEAR', 'MODERATE_RAIN', 'HEAVY_MONSOON', 'FOG_LOW_VISIBILITY']

def generate_multimodal_dataset(num_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)
    
    records = []
    
    for i in range(num_samples):
        mode = np.random.choice(MODES, p=[0.35, 0.30, 0.20, 0.10, 0.05])
        corridor = np.random.choice(CORRIDORS, p=[0.45, 0.30, 0.15, 0.10])
        commodity = np.random.choice(COMMODITIES, p=[0.30, 0.25, 0.20, 0.15, 0.10])
        weather = np.random.choice(WEATHER_CONDITIONS, p=[0.65, 0.20, 0.10, 0.05])
        
        hour_of_day = int(np.random.randint(0, 24))
        day_of_week = int(np.random.randint(0, 7)) # 0=Mon, 6=Sun
        is_perishable = 1 if commodity == 'Agro Perishables' else 0
        
        # Planned duration in hours
        if mode == 'ROAD':
            planned_duration_hrs = round(np.random.uniform(4.0, 24.0), 2)
            toll_congestion_index = round(np.random.uniform(0.1, 0.95), 2)
            rake_turnaround_hrs = 0.0
            port_berth_queue_length = 0
            customs_clearance_hrs = round(np.random.uniform(0.5, 2.0), 2)
        elif mode == 'RAIL':
            planned_duration_hrs = round(np.random.uniform(12.0, 48.0), 2)
            toll_congestion_index = 0.0
            rake_turnaround_hrs = round(np.random.uniform(2.0, 14.0), 2)
            port_berth_queue_length = 0
            customs_clearance_hrs = round(np.random.uniform(1.0, 6.0), 2)
        elif mode in ['PORT', 'VESSEL']:
            planned_duration_hrs = round(np.random.uniform(6.0, 36.0), 2)
            toll_congestion_index = 0.0
            rake_turnaround_hrs = round(np.random.uniform(0.0, 8.0), 2)
            port_berth_queue_length = int(np.random.randint(1, 12))
            customs_clearance_hrs = round(np.random.uniform(3.0, 18.0), 2)
        else: # WAREHOUSE
            planned_duration_hrs = round(np.random.uniform(2.0, 12.0), 2)
            toll_congestion_index = 0.1
            rake_turnaround_hrs = round(np.random.uniform(1.0, 5.0), 2)
            port_berth_queue_length = 0
            customs_clearance_hrs = round(np.random.uniform(1.0, 8.0), 2)
            
        # Ground-truth delay probability formulation mirroring Indian freight dynamics
        base_risk = 0.15
        
        # Ports and Handoffs have historically higher delay risk
        if mode in ['PORT', 'VESSEL']:
            base_risk += 0.35 + (port_berth_queue_length * 0.04)
        elif mode == 'RAIL':
            base_risk += 0.20 + (rake_turnaround_hrs * 0.02)
        elif mode == 'ROAD':
            base_risk += 0.10 + (toll_congestion_index * 0.25)
            
        # Peak traffic hours (08:00 - 11:00 and 17:00 - 21:00)
        if (8 <= hour_of_day <= 11) or (17 <= hour_of_day <= 21):
            base_risk += 0.12
            
        # Weather impact
        if weather == 'HEAVY_MONSOON':
            base_risk += 0.25
        elif weather == 'FOG_LOW_VISIBILITY':
            base_risk += 0.30
        elif weather == 'MODERATE_RAIN':
            base_risk += 0.08
            
        # Customs delay
        if customs_clearance_hrs > 8.0:
            base_risk += 0.20
            
        # Clamp probability between 0.05 and 0.95
        delay_prob = max(0.05, min(0.95, base_risk + np.random.normal(0, 0.05)))
        
        # Binary target: 1 = delayed (>60 mins delay), 0 = on-time
        is_delayed = 1 if np.random.rand() < delay_prob else 0
        
        if is_delayed:
            # Delay in minutes
            delay_minutes = int(np.random.exponential(scale=150) + 60)
        else:
            delay_minutes = int(max(0, np.random.normal(10, 15)))
            
        # Suggested action logic
        if delay_prob > 0.70:
            if mode in ['PORT', 'VESSEL'] or port_berth_queue_length >= 5:
                suggested_action = 'HOLD'
            elif mode == 'ROAD' and toll_congestion_index > 0.6:
                suggested_action = 'REROUTE'
            else:
                suggested_action = 'RESCHEDULE'
        elif delay_prob > 0.40:
            suggested_action = 'RESCHEDULE' if mode == 'RAIL' else 'PROCEED'
        else:
            suggested_action = 'PROCEED'
            
        records.append({
            'mode': mode,
            'corridor': corridor,
            'commodity': commodity,
            'is_perishable': is_perishable,
            'planned_duration_hrs': planned_duration_hrs,
            'hour_of_day': hour_of_day,
            'day_of_week': day_of_week,
            'weather': weather,
            'toll_congestion_index': toll_congestion_index,
            'rake_turnaround_hrs': rake_turnaround_hrs,
            'port_berth_queue_length': port_berth_queue_length,
            'customs_clearance_hrs': customs_clearance_hrs,
            'delay_minutes': delay_minutes,
            'is_delayed': is_delayed,
            'suggested_action': suggested_action
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, 'synthetic_multimodal_freight.csv')
    df = generate_multimodal_dataset(6000)
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} synthetic multimodal freight records to: {csv_path}")
    print("Class distribution (is_delayed):", df['is_delayed'].value_counts(normalize=True).to_dict())
