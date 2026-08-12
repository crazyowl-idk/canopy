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
   
Due to GitHub file size limits, the heavy datasets (.tif and .parquet) are ignored via .gitignore.
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

---

## From Cooling Nodes to Digital-Infrastructure Resilience

The current hackathon demonstrator starts with mobile-network locations, but its planning unit is deliberately extensible to an **infrastructure site**. A future deployment can assess shared 5G towers, backhaul and fibre hubs, edge data cabinets, site power systems and cooling systems. This recognises that heat can affect a whole service chain, not only the radio equipment.

### Decision support, not only a score

The dashboard converts thermal conditions into a transparent planning priority:

| Priority band | Suggested action |
|---|---|
| Below 65 | Monitor and include in planned maintenance |
| 65–80 | Inspect site conditions and optimise cooling before the next hot period |
| 80–90 | Prioritise a field thermal and power audit within 14 days |
| Above 90 | Heat-emergency response: inspect cooling, power and service continuity immediately |

The **Resilience Priority** shown in the UI combines thermal strain (55%), service criticality (25%) and community vulnerability (20%). These prototype weights are explicit and adjustable; they are not an operational safety threshold.

### Economic, climate and equity view

Each cooling scenario provides an indicative energy saving, capital-cost input, avoided-downtime value and payback period. All values are planning assumptions that must be replaced with local tariffs, contractor quotes, maintenance requirements and operator incident-cost data before investment approval.

Users can also test present-day, +1.5°C and +2°C warming outlooks. This supports resilient investment decisions under future heat conditions. A production carbon assessment would report cooling electricity saved alongside intervention maintenance and embodied-carbon impacts.

The community-vulnerability input is designed to be replaced by aggregated local indicators, such as population density, low-income or public-housing exposure, proximity to clinics/schools and dependence on digital public services. It ensures that heat adaptation does not only protect commercially important sites.

### Partnership and data governance

| Stakeholder | Role |
|---|---|
| Telecom and tower operators | Site telemetry, cooling and service-continuity action |
| Local councils and regulators | Planning approvals, urban greening coordination and oversight |
| Building owners | Roof access, cool-roof approval and site constraints |
| Utilities | Power-resilience, tariff and backup-power review |
| Communities | Vulnerability context and local intervention priorities |

Start with aggregated, privacy-preserving performance indicators and a small voluntary pilot. Raw operational data should remain with its owner and only be shared under an agreed security, access-control and data-retention agreement.

### Validation and ASEAN scaling plan

Satellite land-surface temperature is not equipment temperature. Before operational use, the model must be calibrated against on-site air and cabinet sensors, weather-station observations, power/HVAC readings and anonymised alarms or service-quality changes. The team should report error metrics and recalibrate the model and intervention coefficients per city.

The workflow, data model and API are portable across ASEAN. Each city deployment must adapt its imagery availability, local weather, urban form, equipment mix, electricity tariff, building rules, intervention costs and decision thresholds. The non-Kuala Lumpur UI profiles are demonstration data, not measured city results.

### Interoperability and continuation

The existing REST API is the base for interoperable endpoints such as `GET /assets`, `GET /risk-summary`, `POST /scenarios` and `GET /priorities`. Operators can consume prioritised outputs while retaining sensitive raw telemetry in their own systems.

After the hackathon, the proposed path is: open prototype and documented methodology → one-district, one-operator validation pilot → governed multi-stakeholder platform with API or subscription-supported services. This preserves public value while funding calibration, maintenance and city-by-city adaptation.
