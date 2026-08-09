# Canopy AI x ThermoNet 5G 🌳📡

**The GeoAI Engine Bridging Urban Forestry and Digital Resilience**

High-density 5G micro-cells generate massive heat. In tropical urban centers like Kuala Lumpur, the Urban Heat Island (UHI) effect pushes this critical network hardware to failure points, leading to thermal throttling and localized outages. 

**Canopy AI x ThermoNet 5G** is a microservices platform that fuses environmental satellite data with telecommunications telemetry. By predicting hardware throttling using spatial Machine Learning, it allows city planners and telecom operators to collaboratively deploy natural cooling interventions (like targeted urban tree canopies) to protect digital infrastructure and calculate the exact financial ROI of those green investments.

---

## ✨ Key Features

*   **GeoAI Predictive Alerts:** Analyzes raw thermal and spatial data to predict the 72-hour probability of telecom hardware failure.
*   **Targeted Cooling Simulator:** An interactive digital twin that allows city councils to model the thermodynamic impact of planting tree canopies or applying cool-roof coatings at specific GPS coordinates.
*   **Dynamic Financial ROI:** Automatically calculates the annual HVAC energy savings for telecom operators based on the simulated temperature drops, using real-world commercial electricity tariffs.
*   **Cross-Sector Data Fusion:** Bridges the gap between municipal greening budgets and enterprise telecommunications maintenance.

---

## 🏗️ System Architecture

The project is built on a modern, decoupled microservices architecture:

1. **GeoAI Data Fusion Engine (Python)**
   * **Role:** Ingests and intersects real-world spatial datasets, calculates localized concrete density and thermal baselines, and executes the Machine Learning inference pipeline.
2. **RESTful API Backend (Java / Spring Boot)**
   * **Role:** Acts as the mathematical and financial routing hub. It serves the processed GeoAI intelligence to the frontend and calculates the dynamic financial ROI of cooling interventions using thermodynamic formulas.
3. **Interactive Digital Twin UI (React.js / Vite)**
   * **Role:** A dark-mode, map-based dashboard allowing users to visualize thermal strain, identify high-risk 5G nodes, and slide intervention parameters to see real-time environmental and financial impacts.

---

## 📊 Data Utilisation

The platform achieves true GeoAI integration by fusing three distinct, real-world datasets:

*   **USGS Landsat 8-9:** Level-2 Thermal Infrared (Band 10) rasters used to establish the baseline Land Surface Temperature (LST) across the metro grid.
*   **Ookla Open Data:** Mobile performance spatial network tiles (Parquet format) utilized to extract real-world network latency, acting as a proxy for RF hardware power load and internal heat generation.
*   **OpenStreetMap (OSM):** 3D building footprint geometries used to calculate localized concrete density and map heat-trapping street canyons.

---

## 🧠 Machine Learning Core

Instead of relying purely on static thermodynamic formulas, the platform utilizes a **Random Forest Regressor** to predict the realistic probability of hardware throttling. 

*   **Features ($X$):** The model evaluates the satellite surface temperature (`baseLST`), the urban concrete re-radiation factor (`baseDensity`), and the active network hardware load (`networkPenalty`).
*   **Target ($Y$):** It outputs a continuous probability score representing the 72-hour risk of critical hardware failure, allowing for predictive maintenance rather than reactive repairs.

---

## 🏆 Project Context

*   **Event:** ASEAN GeoAI Fusion 2026 Hackathon
*   **Challenge Domain:** Sustainability 
*   **Author:** HACK-MY-068  YOW JIA YEN, VICTORIA KEW KIM TIAN, GOH CHING YEE
