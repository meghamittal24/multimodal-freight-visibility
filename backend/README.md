# Backend REST API Service
**SIH 2026 - Problem Statement: Unified Multimodal Freight Visibility Platform**
**Team: Jugaad Junction**

## 1. Overview

The Node.js + TypeScript + Express backend unifies disconnected freight tracking systems (CRIS FOIS for Rail, NPCI FASTag for Road, and IPA PCS1x for Sea Ports) through a single ULIP-style data layer. It connects to the Python ML Delay Prediction microservice and serves real-time handoff state mutations and coordination actions (`HOLD`, `REROUTE`, `RESCHEDULE`).

---

## 2. API Endpoints

### Authentication & Roles
- `POST /api/v1/auth/login`: Issue JWT with role claim (`SHIPPER`, `TRANSPORTER`, `PORT_OPERATOR`, `ADMIN`).
- `GET /api/v1/auth/me`: Fetch authenticated user profile.
- `GET /api/v1/auth/demo-users`: List all demo stakeholder profiles for one-click hackathon evaluation.

### Shipments & Multimodal Handoffs
- `GET /api/v1/shipments`: List active consignments (filterable by `corridorId`, `mode`, `status`).
- `GET /api/v1/shipments/:id`: Full details of consignment including cargo weight, cold chain status, and container ID.
- `GET /api/v1/shipments/:id/timeline`: End-to-end multimodal handoff timeline with planned vs actual timestamps and sensor telemetry.
- `GET /api/v1/shipments/:id/ripple-effect`: Delay propagation graph across rakes, yard sidings, and downstream ocean vessels.

### ML Delay Prediction & Actions
- `POST /api/v1/predictions/shipments/:id/predict`: Trigger on-demand ML delay risk prediction for the active or next handoff leg.
- `POST /api/v1/actions/execute`: Execute coordination decision (`HOLD`, `REROUTE`, `RESCHEDULE`) with immediate state mutation and notification logging.

### ULIP Live Stream Ingestion & Analytics
- `POST /api/v1/tracking/ping`: Ingest real-time FOIS/FASTag/PCS1x telemetry ping.
- `GET /api/v1/ulip/fois`: Live simulated CRIS FOIS rail train rake feed.
- `GET /api/v1/ulip/fastag`: Live simulated NPCI NETC FASTag toll plaza feed.
- `GET /api/v1/ulip/pcs1x`: Live simulated IPA PCS1x marine port terminal feed.
- `GET /api/v1/analytics/impact`: National Logistics Policy impact metrics (14.0% vs 8.5% GDP cost benchmark, carbon abated, demurrage savings).

---

## 3. Resilience & ML Fallback

If the ML microservice (`http://localhost:8001`) becomes unreachable, the backend's `mlClient.service.ts` automatically switches to an internal heuristic rule engine. This guarantees zero downtime and uninterrupted hackathon demos.

---

## 4. Local Execution

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run integration tests
npm test
```
