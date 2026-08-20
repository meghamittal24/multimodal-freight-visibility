-- Unified Multimodal Freight Visibility Platform
-- Database Schema (PostgreSQL)
-- Smart India Hackathon 2026 - Team Jugaad Junction

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('SHIPPER', 'TRANSPORTER', 'PORT_OPERATOR', 'ADMIN');
CREATE TYPE transport_mode AS ENUM ('ROAD', 'RAIL', 'PORT', 'VESSEL', 'WAREHOUSE');
CREATE TYPE shipment_status AS ENUM ('CREATED', 'IN_TRANSIT', 'AT_HANDOFF', 'DELAYED', 'DELIVERED', 'HELD', 'REROUTED');
CREATE TYPE leg_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'HELD', 'SKIPPED');
CREATE TYPE data_source AS ENUM ('FOIS', 'FASTAG', 'PCS1X', 'ICEGATE', 'VAHAN', 'IOT_TELEMETRY', 'MOCK');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE suggested_action_type AS ENUM ('PROCEED', 'HOLD', 'REROUTE', 'RESCHEDULE', 'ALERT_STAKEHOLDERS');

-- 2. Corridors Table
CREATE TABLE IF NOT EXISTS corridors (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    primary_modes TEXT[] DEFAULT ARRAY['ROAD', 'RAIL', 'PORT'],
    distance_km NUMERIC(10, 2) NOT NULL,
    average_transit_hours NUMERIC(10, 2) NOT NULL,
    dfc_connected BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'SHIPPER',
    organization VARCHAR(255) NOT NULL,
    corridor_access TEXT[] DEFAULT ARRAY['ALL'],
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(36) PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    consignment_title VARCHAR(255) NOT NULL,
    commodity_type VARCHAR(100) NOT NULL,
    is_perishable BOOLEAN DEFAULT FALSE,
    target_temperature_celsius NUMERIC(5, 2),
    shipper_id VARCHAR(36) REFERENCES users(id),
    corridor_id VARCHAR(36) REFERENCES corridors(id),
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    current_mode transport_mode NOT NULL DEFAULT 'ROAD',
    status shipment_status NOT NULL DEFAULT 'IN_TRANSIT',
    cargo_weight_tons NUMERIC(10, 2) NOT NULL,
    container_number VARCHAR(50),
    total_planned_hours NUMERIC(10, 2) NOT NULL,
    cumulative_delay_minutes INTEGER DEFAULT 0,
    carbon_estimate_kg NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Legs Table (Multimodal Handoff Journey)
CREATE TABLE IF NOT EXISTS legs (
    id VARCHAR(36) PRIMARY KEY,
    shipment_id VARCHAR(36) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    mode transport_mode NOT NULL,
    from_node VARCHAR(150) NOT NULL,
    to_node VARCHAR(150) NOT NULL,
    planned_start TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    delay_minutes INTEGER DEFAULT 0,
    status leg_status NOT NULL DEFAULT 'PLANNED',
    source data_source NOT NULL DEFAULT 'MOCK',
    asset_id VARCHAR(100),
    current_lat NUMERIC(10, 6),
    current_lng NUMERIC(10, 6),
    temperature_reading_celsius NUMERIC(5, 2),
    last_telemetry_ping TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shipment_id, sequence_order)
);

-- 6. Delay Predictions Table (ML Output)
CREATE TABLE IF NOT EXISTS delay_predictions (
    id VARCHAR(36) PRIMARY KEY,
    leg_id VARCHAR(36) NOT NULL REFERENCES legs(id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 4) NOT NULL,
    risk_label risk_level NOT NULL,
    expected_delay_minutes INTEGER NOT NULL,
    suggested_action suggested_action_type NOT NULL DEFAULT 'PROCEED',
    plain_language_reason TEXT NOT NULL,
    feature_attributions JSONB,
    model_version VARCHAR(50) NOT NULL DEFAULT 'xgboost-v1.4.2',
    action_executed BOOLEAN DEFAULT FALSE,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tracking Events / Telemetry Stream (Simulated ULIP Feed)
CREATE TABLE IF NOT EXISTS tracking_events (
    id VARCHAR(36) PRIMARY KEY,
    shipment_id VARCHAR(36) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    leg_id VARCHAR(36) REFERENCES legs(id),
    source data_source NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Coordination Alerts Table
CREATE TABLE IF NOT EXISTS coordination_alerts (
    id VARCHAR(36) PRIMARY KEY,
    shipment_id VARCHAR(36) NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    prediction_id VARCHAR(36) REFERENCES delay_predictions(id),
    alert_type VARCHAR(50) NOT NULL,
    severity risk_level NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recommended_action suggested_action_type NOT NULL,
    action_taken suggested_action_type,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_corridor ON shipments(corridor_id);
CREATE INDEX IF NOT EXISTS idx_legs_shipment ON legs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_delay_pred_leg ON delay_predictions(leg_id);
CREATE INDEX IF NOT EXISTS idx_tracking_shipment ON tracking_events(shipment_id);
