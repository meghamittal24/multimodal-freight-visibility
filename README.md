
### *Unified Multimodal Freight Visibility & Predictive Coordination Platform*

[![Theme](https://img.shields.io/badge/Theme-Transportation%20%26%20Logistics-blue?style=for-the-badge)](https://sih.gov.in/)
[![Category](https://img.shields.io/badge/PS%20Category-Software-green?style=for-the-badge)](https://sih.gov.in/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**Predicting delays and suggesting active coordination across Road, Rail, and Ports before bottlenecks occur.**

[Key Features](#-key-differentiators) • [Architecture](#-technical-architecture) • [Team Roles](#-team-contributions--task-assignments) • [Setup](#-getting-started)

---

</div>

## 📌 Project Overview

India's cargo moves across three transport modes (**Road, Rail, and Ports**), but these systems operate in silos. Shippers lack end-to-end visibility, and the heaviest delays happen at mode handoffs—causing India's logistics costs to hover around **~14% of GDP** compared to 8–9% in developed economies.

**Jugaad Junction** connects these fragmented data streams (ULIP, FOIS, FASTag, PCS1x) into a single, proactive intelligence platform that does not just monitor shipments—it **predicts handoff delays** and delivers **actionable suggestions** (*hold, reroute, reschedule*) before delays cascade.

---

## 🔥 Key Differentiators

| Feature | Existing Tools (Intugine / FourKites) | Jugaad Junction |
| :--- | :--- | :--- |
| **Visibility Scope** | Fragmented / Single-mode tracking | **Unified Multimodal Timeline** (Truck → Rail → Port → Vessel) |
| **Operational Stance** | Passive tracking (Where is cargo now?) | **Predictive Intelligence** (Where will it get stuck?) |
| **Actionability** | Displays raw alerts/status | **Active Coordination** (*e.g., Hold truck by 90 mins*) |
| **Cascading Analysis** | None | **Ripple-Effect Visualization** for bottleneck chains |

---

## 🛠 Technical Architecture
- **Frontend:** React.js, Chart.js, Tailwind CSS
- **Backend:** Node.js, Express.js, PostgreSQL
- **ML / Prediction Engine:** Python, XGBoost, LightGBM, FastAPI
- **Data Protocols:** REST APIs (Simulating ULIP, FOIS, FASTag, PCS1x)

---

## 👥 Team Contributions & Task Assignments

> Update team member names and roles according to your team's actual structure!

| Avatar | Member | Role | Assigned Work & Responsibilities | Status |
| :---: | :--- | :--- | :--- | :---: |
| 👨‍💻 | **[Member 1 Name]** | Team Lead / ML Engineer | • ML Delay Prediction model using XGBoost<br>• Historical dwell-time risk scoring API | 🔄 In Progress |
| 👩‍💻 | **[Member 2 Name]** | Frontend Developer | • Unified Dashboard UI & Status Timeline<br>• Chart.js analytics & Gantt charts | 🔄 In Progress |
| 👨‍💻 | **[Member 3 Name]** | Backend Engineer | • Node.js REST APIs & PostgreSQL models<br>• Unified ULIP event aggregator store | 🔄 In Progress |
| 👩‍💻 | **[Member 4 Name]** | Data / Integration | • Mock data generators for FOIS, FASTag, PCS1x<br>• Corridor Simulation (Ludhiana → Mundra) | 🔄 In Progress |
| 👨‍💻 | **[Member 5 Name]** | UI/UX & Frontend | • Active Coordination Alert banners<br>• Ripple-effect bottleneck visualization | ⏳ Pending |
| 👩‍💻 | **[Member 6 Name]** | QA / Presentation | • SIH PPT alignment, API testing, & Pitch deck | ⏳ Pending |

---

## 🗺 Corridor Pilot Demo Workflow (Ludhiana ➔ Mundra Port)

1. 🚚 **Road Leg:** Truck loaded at Ludhiana, tracked via FASTag toll-crossing pings.
2. 🚂 **Rail Transition:** Cargo loaded onto rail rake; timeline updates to `Road ➔ Rail`.
3. 🤖 **ML Risk Analysis:** Machine learning model evaluates route slot history and flags a **68% delay risk** at port entry.
4. ⚠️ **Proactive Action:** Coordination engine triggers alert: *"Delay rake departure by 90 mins to avoid port congestion."*
5. 🛳 **Port Gate-In:** PCS1x event feeds auto-populate gate-in and vessel loading upon arrival.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- PostgreSQL
