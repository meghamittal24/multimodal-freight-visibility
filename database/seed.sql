-- Seed Data for Unified Multimodal Freight Visibility Platform
-- Corridors, Users, Shipments, Multimodal Legs, and Delay Predictions

-- 1. Corridors
INSERT INTO corridors (id, code, name, origin, destination, primary_modes, distance_km, average_transit_hours, dfc_connected, active)
VALUES
('cor-001', 'COR-LDH-MUN', 'Ludhiana to Mundra Port Export Corridor', 'Ludhiana ICD, Punjab', 'Mundra Port Terminal, Gujarat', ARRAY['ROAD', 'RAIL', 'PORT'], 1280.00, 36.50, true, true),
('cor-002', 'COR-DEL-JNP', 'NCR Dadri to JNPT Gateway Corridor', 'ICD Dadri, Greater Noida', 'JNPT Port (Nhava Sheva), Mumbai', ARRAY['RAIL', 'PORT'], 1420.00, 42.00, true, true),
('cor-003', 'COR-SOL-NHA', 'Solapur Cold-Chain Agro Corridor', 'Solapur Agro Cluster, Maharashtra', 'Nhava Sheva Gateway Port', ARRAY['ROAD', 'PORT'], 420.00, 14.00, false, true),
('cor-004', 'COR-BBU-VIZ', 'Bhubaneswar Mineral & Steel Rail Corridor', 'Kalinganagar / Bhubaneswar', 'Visakhapatnam Port Berth 4', ARRAY['RAIL', 'PORT'], 480.00, 18.00, false, true);

-- 2. Users
INSERT INTO users (id, name, email, password_hash, role, organization, corridor_access, phone)
VALUES
('usr-001', 'Vikramaditya Sharma', 'ops.admin@jugaadjunction.in', '$2b$10$E9x8dY.mockhashedpasswordforadmin', 'ADMIN', 'National Logistics Portal / Jugaad Junction', ARRAY['ALL'], '+91-98112-45001'),
('usr-002', 'Harpreet Singh Sandhu', 'harpreet@punjabagrifresh.co.in', '$2b$10$E9x8dY.mockhashedpasswordforshipper', 'SHIPPER', 'Punjab Agro Export Consortium', ARRAY['COR-LDH-MUN'], '+91-98765-12345'),
('usr-003', 'Rajesh K. Verma', 'dispatch@delhidelhiverylogistics.in', '$2b$10$E9x8dY.mockhashedpasswordfortransporter', 'TRANSPORTER', 'North India Intermodal Fleet', ARRAY['COR-LDH-MUN', 'COR-DEL-JNP'], '+91-99887-23456'),
('usr-004', 'Captain Cyrus Mistry', 'terminal.master@mundraport.in', '$2b$10$E9x8dY.mockhashedpasswordforport', 'PORT_OPERATOR', 'APSEZ Mundra Marine Operations', ARRAY['COR-LDH-MUN'], '+91-94260-98765');

-- 3. Shipments
INSERT INTO shipments (id, tracking_number, consignment_title, commodity_type, is_perishable, target_temperature_celsius, shipper_id, corridor_id, origin, destination, current_mode, status, cargo_weight_tons, container_number, total_planned_hours, cumulative_delay_minutes, carbon_estimate_kg)
VALUES
('shp-101', 'SIH-2026-LDH-001', 'Kinnow Citrus & Fresh Produce Export', 'Agricultural Citrus Fruit (Cold Chain)', true, 4.50, 'usr-002', 'cor-001', 'Abohar / Ludhiana ICD', 'Mundra Port Container Terminal', 'RAIL', 'AT_HANDOFF', 26.50, 'MSCU-908234-1', 38.00, 195, 412.00),
('shp-102', 'SIH-2026-LDH-002', 'Industrial Precision Auto Spares', 'Automotive Components (Tier-1)', false, NULL, 'usr-001', 'cor-001', 'Ludhiana Industrial Hub', 'Jebel Ali Port via Mundra', 'ROAD', 'IN_TRANSIT', 18.20, 'CMAU-482109-8', 34.00, 45, 780.00),
('shp-103', 'SIH-2026-DEL-003', 'Solar Inverters & Electronic Assemblies', 'Electronics & High-Tech', false, NULL, 'usr-001', 'cor-002', 'Noida / ICD Dadri', 'Rotterdam via JNPT', 'RAIL', 'IN_TRANSIT', 22.00, 'TGHU-773412-0', 44.00, 15, 340.00),
('shp-104', 'SIH-2026-SOL-004', 'Fresh Table Grapes & Pomegranates', 'Reefer Horticultural Cargo', true, 2.00, 'usr-002', 'cor-003', 'Solapur Cold Hub', 'Nhava Sheva Reefer Yard', 'ROAD', 'DELAYED', 14.80, 'HAPAG-612984-3', 14.00, 240, 520.00),
('shp-105', 'SIH-2026-LDH-005', 'Textiles & Garment Consignment', 'Apparel & Cotton Yarn', false, NULL, 'usr-001', 'cor-001', 'Ludhiana Focal Point', 'New York via Mundra', 'PORT', 'IN_TRANSIT', 31.00, 'MEDU-119283-4', 40.00, 0, 390.00);

-- 4. Multimodal Legs for Shipment 101 (Hero Demo Shipment: Ludhiana to Mundra)
INSERT INTO legs (id, shipment_id, sequence_order, mode, from_node, to_node, planned_start, planned_end, actual_start, actual_end, delay_minutes, status, source, asset_id, current_lat, current_lng, temperature_reading_celsius, last_telemetry_ping)
VALUES
('leg-101-1', 'shp-101', 1, 'ROAD', 'Kinnow Orchard Farm / Ludhiana Hub', 'ICD Ludhiana (CONCOR Dry Port)', '2026-08-19 06:00:00+05:30', '2026-08-19 10:00:00+05:30', '2026-08-19 06:15:00+05:30', '2026-08-19 10:45:00+05:30', 45, 'COMPLETED', 'FASTAG', 'PB-10-CZ-8812', 30.9010, 75.8573, 4.20, '2026-08-19 10:45:00+05:30'),
('leg-101-2', 'shp-101', 2, 'WAREHOUSE', 'ICD Ludhiana Aggregation & Customs Scan', 'ICD Rake Siding Track 3', '2026-08-19 10:00:00+05:30', '2026-08-19 14:00:00+05:30', '2026-08-19 10:45:00+05:30', '2026-08-19 15:30:00+05:30', 90, 'COMPLETED', 'ICEGATE', 'ICD-LDH-GATE-02', 30.8850, 75.8710, 4.80, '2026-08-19 15:30:00+05:30'),
('leg-101-3', 'shp-101', 3, 'RAIL', 'ICD Ludhiana Rake Siding', 'Western DFC Rewari Hub $\rightarrow$ Palanpur Junction', '2026-08-19 14:30:00+05:30', '2026-08-20 08:30:00+05:30', '2026-08-19 16:00:00+05:30', NULL, 60, 'IN_PROGRESS', 'FOIS', 'RAKE-WDFC-9021', 27.2038, 73.7374, 5.10, '2026-08-20 13:45:00+05:30'),
('leg-101-4', 'shp-101', 4, 'PORT', 'Mundra Port Inward Rail Siding', 'Mundra Container Terminal (MICT Berth 2)', '2026-08-20 09:30:00+05:30', '2026-08-20 16:30:00+05:30', NULL, NULL, 0, 'PLANNED', 'PCS1X', 'PCS-MUN-GATE-4', 22.8390, 69.7042, NULL, NULL),
('leg-101-5', 'shp-101', 5, 'VESSEL', 'Mundra Container Terminal Berth 2', 'Jebel Ali Container Port, UAE', '2026-08-20 18:00:00+05:30', '2026-08-23 12:00:00+05:30', NULL, NULL, 0, 'PLANNED', 'PCS1X', 'IMO-9482101-EVER-GIVEN', 22.8300, 69.7100, NULL, NULL);

-- 5. Delay Prediction for Active Rail Leg & Downstream Handoff
INSERT INTO delay_predictions (id, leg_id, risk_score, risk_label, expected_delay_minutes, suggested_action, plain_language_reason, feature_attributions, model_version, action_executed, predicted_at)
VALUES
('prd-101-3', 'leg-101-3', 0.8840, 'HIGH', 210, 'HOLD', 'Mundra Port Berth 2 vessel MV Ocean Giant delayed by 9.5 hours due to tidal backlog. If rake arrives on current schedule, reefer container will sit in unshaded open yard with demurrage cost ₹32,000. Recommend HOLD rake at Palanpur DFC staging yard for 4 hours to synchronize with adjusted berthing slot.', 
'{"port_berth_congestion_mins": 140, "railyard_shunting_dwell_mins": 45, "weather_visibility_factor": 15, "historical_corridor_risk": 0.82}', 'xgboost-v1.4.2', false, '2026-08-20 13:50:00+05:30');

-- 6. Coordination Alerts
INSERT INTO coordination_alerts (id, shipment_id, prediction_id, alert_type, severity, title, message, recommended_action, action_taken, acknowledged, created_at)
VALUES
('alt-101-1', 'shp-101', 'prd-101-3', 'PORT_BERTH_DISRUPTION', 'HIGH', 'Cascading Port Berth Congestion Warning', 'Vessel berth delay at Mundra MICT will cause 3.5h handoff stall and potential perishable quality degradation.', 'HOLD', NULL, false, '2026-08-20 13:51:00+05:30');
