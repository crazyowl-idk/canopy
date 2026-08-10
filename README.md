# Canopy AI x ThermoNet 5G 🌳📡

**A GeoAI planning prototype for urban cooling and digital resilience**

High-density 5G equipment operates in hot, built-up urban environments where surface temperature, surrounding density and network-load proxies can be considered together during planning. In Kuala Lumpur, the Urban Heat Island (UHI) context makes it useful to explore where cooling interventions may warrant closer assessment.

**Canopy AI x ThermoNet 5G** is a three-tier prototype that combines local spatial datasets, a Spring Boot REST API and a React micro-cooling simulator. It helps city planners and telecom stakeholders compare canopy and cool-roof scenarios, while clearly treating temperature, risk and cost outputs as planning estimates that require field calibration.

---

## ✨ Key Features

*   **GeoAI Feature Pipeline:** Reads local Landsat and Ookla data, samples or falls back to surface-temperature values, and creates node features for a Kuala Lumpur prototype.
*   **Targeted Cooling Simulator:** Lets users select a node and model tree-canopy area and cool-roof coverage at a specific map location.
*   **Scenario-Based Energy Estimate:** Calculates an estimated annual cooling-energy saving using explicit prototype coefficients, node power, electricity tariff and cooling-dependency inputs.
*   **Cross-Sector Planning View:** Connects urban heat, mobile-network proxies and cooling interventions in one stakeholder-facing dashboard.

---

## 🏗️ System Architecture

The project uses a simple, decoupled three-tier prototype architecture:

1. **GeoAI Data Fusion Engine (Python)**
   * **Role:** Reads local Ookla Parquet tiles, samples the Landsat raster when available, derives density and network-penalty proxies, and can run inference from a saved model artifact.
2. **RESTful API Backend (Java / Spring Boot)**
   * **Role:** Serves `processed_nodes.json` from the active API module as JSON through `GET /api/v1/nodes`.
3. **Interactive Digital Twin UI (React.js / Vite)**
   * **Role:** Displays the node list on a Leaflet map, applies client-side cooling-scenario formulas, and generates a browser-side executive PDF summary.

---

## 📊 Data Utilisation

The prototype is designed around three local spatial data sources:

*   **Landsat LST raster:** Used by `rasterio` to sample baseline land-surface temperature at Ookla-tile centroids. The pipeline uses a fallback temperature when the raster cannot be opened.
*   **Ookla Open Data:** Mobile-performance tiles in Parquet format. Tile geometry is converted from WKT, filtered to a Kuala Lumpur bounding box, and average latency is used as a prototype network-penalty proxy.
*   **OpenStreetMap (OSM) building GeoJSON:** Included as the intended source for urban-form features; it is not yet read by the current preprocessing script.

---

## 🧠 Machine Learning Core

The project includes a **Random Forest Regressor** to demonstrate the model-inference workflow. The current training script generates a synthetic 5,000-row dataset, so its output is a prototype throttling-risk score rather than a validated operational forecast.

*   **Features ($X$):** The model uses satellite surface temperature (`baseLST`), a density proxy (`baseDensity`), and a latency-derived network-penalty proxy (`networkPenalty`).
*   **Target ($Y$):** The model is trained against synthetic `throttling_risk` values. A real deployment would require governed operator telemetry, historical events, evaluation metrics and calibration.

---

## 🏆 Project Context

*   **Event:** ASEAN GeoAI Fusion 2026 Hackathon
*   **Challenge Domain:** Sustainability
*   **Author:** HACK-MY-068  YOW JIA YEN, VICTORIA KEW KIM TIAN, GOH CHING YEE
