# Frontend Web Application
**SIH 2026 - Problem Statement: Unified Multimodal Freight Visibility Platform**
**Team: Jugaad Junction**

## 1. Overview

The React + TypeScript + Tailwind frontend gives logistics operators, shippers, transporters, and port masters a unified, real-time control center across Road, Rail, ICD Dry Ports, and Marine Gateways.

---

## 2. Key Interactive Features

1. **Live Multimodal Geospatial Map**: Interactive Leaflet map visualizing the Western Dedicated Freight Corridor (WDFC), National Highways, ICD dry ports, and Mundra/JNPT marine terminals with animated asset locations.
2. **End-to-End Handoff Journey Stepper**: Visual tracking of every modal handoff (Road $\rightarrow$ Warehouse $\rightarrow$ Rail $\rightarrow$ Port $\rightarrow$ Vessel) with live cold chain sensor telemetry.
3. **ML Delay Prediction & Action Card (Hero Feature)**:
   - Delay probability risk gauge (0-100%).
   - Plain-language suggested action: `HOLD`, `REROUTE`, or `RESCHEDULE`.
   - Delay attribution waterfall chart.
   - One-click action confirmation button.
4. **Ripple Effect Delay Cascade Visualizer**: Graph visualizer demonstrating how upstream delays cascade to downstream vessel slots and financial exposure.
5. **SIH Disruption Scenario Sandbox**: One-click scenario simulator for hackathon judges to test *Normal Flow*, *Port Congestion (HOLD)*, *Highway Jam (REROUTE)*, and *Cold Chain Spoilage (RESCHEDULE)*.
6. **National Logistics Policy Impact**: Chart.js graphs tracking India's 14.0% GDP logistics cost vs the 8.5% developed economies target.

---

## 3. Local Execution

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```
