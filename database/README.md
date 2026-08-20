# Database Layer & Schema Documentation
**SIH 2026 - Problem Statement: Unified Multimodal Freight Visibility Platform**
**Team: Jugaad Junction**

## 1. Overview

The relational PostgreSQL schema models the complete multimodal handoff lifecycle, tracking consignments across Road (FASTag), Rail (FOIS CRIS), ICD Dry Ports (ICEGATE/CONCOR), and Sea Ports (PCS1x IPA).

---

## 2. Entity-Relationship Model

```mermaid
erDiagram
    CORRIDORS ||--o{ SHIPMENTS : routes
    USERS ||--o{ SHIPMENTS : owns
    SHIPMENTS ||--|{ LEGS : contains
    LEGS ||--o{ DELAY_PREDICTIONS : predicts
    SHIPMENTS ||--o{ TRACKING_EVENTS : logs
    SHIPMENTS ||--o{ COORDINATION_ALERTS : triggers
    DELAY_PREDICTIONS ||--o{ COORDINATION_ALERTS : generates

    CORRIDORS {
        string id PK
        string code UK
        string name
        string origin
        string destination
        float distance_km
        boolean dfc_connected
    }

    SHIPMENTS {
        string id PK
        string tracking_number UK
        string consignment_title
        string commodity_type
        boolean is_perishable
        string current_mode
        string status
        float cargo_weight_tons
        int cumulative_delay_minutes
    }

    LEGS {
        string id PK
        string shipment_id FK
        int sequence_order
        string mode
        string from_node
        string to_node
        datetime planned_start
        datetime planned_end
        datetime actual_start
        datetime actual_end
        int delay_minutes
        string status
        string source
        float current_lat
        float current_lng
    }

    DELAY_PREDICTIONS {
        string id PK
        string leg_id FK
        float risk_score
        string risk_label
        int expected_delay_minutes
        string suggested_action
        string plain_language_reason
        json feature_attributions
    }
```

---

## 3. Running Migrations & Seeding

### Direct SQL:
```bash
# Apply schema
psql -U postgres -d freight_visibility -f schema.sql

# Seed initial corridors and shipments
psql -U postgres -d freight_visibility -f seed.sql
```

### Prisma ORM (TypeScript):
```bash
# Push schema to database
npx prisma db push

# Seed data
npx prisma db seed
```
