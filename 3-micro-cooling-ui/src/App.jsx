import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Blocky Pixel-Art Tree Icon
const TreeIcon = L.divIcon({
  className: 'custom-tree-icon',
  html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid #14532d;box-shadow:2px 2px 0 rgba(0,0,0,0.5);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Pre-defined random coordinates around the KLCC node to spawn trees
const PREDEFINED_TREES = [
  [3.1462, 101.6953], [3.1469, 101.6951], [3.1461, 101.6964], [3.1468, 101.6966],
  [3.1464, 101.6950], [3.1463, 101.6967], [3.1471, 101.6957], [3.1460, 101.6958],
  [3.1465, 101.6948], [3.1470, 101.6965], [3.1473, 101.6954], [3.1458, 101.6961],
  [3.1467, 101.6949], [3.1462, 101.6969], [3.1474, 101.6960], [3.1459, 101.6955],
  [3.1466, 101.6970], [3.1472, 101.6949], [3.1457, 101.6963], [3.1469, 101.6968]
];

// Nearby Building Footprint
const BUILDING_ROOF = [
  [3.1472, 101.6952], [3.1472, 101.6962], [3.1468, 101.6962], [3.1468, 101.6952]
];

function App() {
  const baseLST = 34.5; 
  const baseDensity = 1.45; 
  const networkPenalty = 38.5; 

  const [canopyArea, setCanopyArea] = useState(0);
  const [coolRoof, setCoolRoof] = useState(0);

  const tempReduction = Number(((canopyArea * 0.012) + (coolRoof * 0.018)).toFixed(1));
  const currentTemp = Number((baseLST - tempReduction).toFixed(1));
  const currentStrainScore = Math.max(0, Number(((currentTemp * baseDensity) + networkPenalty - (tempReduction * 2.5)).toFixed(1)));

  const getStatus = (score) => {
    if (score > 80) return { label: "CRITICAL THROTTLING RISK", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)" };
    if (score > 60) return { label: "ELEVATED THERMAL RISK", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
    return { label: "OPTIMAL OPERATING TEMP", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" };
  };

  const statusInfo = getStatus(currentStrainScore);

  // Map Animation Logic
  const visibleTrees = PREDEFINED_TREES.slice(0, Math.floor(canopyArea / 25)); // 1 tree spawns per 25 sqm
  const roofColor = coolRoof > 60 ? "#3b82f6" : (coolRoof > 25 ? "#eab308" : "#ef4444"); // Shifts from Red -> Yellow -> Blue

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <span style={styles.logoBadge}>5G</span>
          <h1 style={styles.headerTitle}>ThermoNet Engine</h1>
        </div>
        <div style={{ ...styles.statusBadge, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
          <span style={{ ...styles.statusDot, backgroundColor: statusInfo.color }}></span>
          <span>{statusInfo.label}</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <main style={styles.mapPanel}>
          <MapContainer center={[3.1466, 101.6958]} zoom={17} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            
            {/* The 5G Node */}
            <Marker position={[3.1466, 101.6958]}>
              <Popup>
                <div style={{ fontFamily: "sans-serif" }}>
                  <h4 style={{ margin: "0 0 4px 0" }}>Node 5G-KLCC-01</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: statusInfo.color, fontWeight: "bold" }}>
                    Strain Score: {currentStrainScore}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Simulated Cool Roof Polygon */}
            <Polygon 
              positions={BUILDING_ROOF} 
              pathOptions={{ color: roofColor, fillColor: roofColor, fillOpacity: 0.5, weight: 2 }} 
            />

            {/* Simulated Canopy Spawning */}
            {visibleTrees.map((pos, index) => (
              <Marker key={index} position={pos} icon={TreeIcon} />
            ))}

          </MapContainer>
        </main>

        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Thermal Strain Telemetry</h3>
            
            <div style={styles.telemetryRow}>
              <div style={styles.labelRow}>
                <span style={styles.label}>Landsat Surface Temp (LST)</span>
                <span style={{ ...styles.valText, color: currentTemp > 32 ? "#f43f5e" : "#10b981" }}>{currentTemp} °C</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${(currentTemp / 40) * 100}%`, backgroundColor: currentTemp > 32 ? "#f43f5e" : "#10b981" }}></div>
              </div>
            </div>

            <div style={styles.telemetryRow}>
              <div style={styles.labelRow}>
                <span style={styles.label}>Ookla Traffic Load Penalty</span>
                <span style={{ ...styles.valText, color: "#f59e0b" }}>+{networkPenalty} pts</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${(networkPenalty / 50) * 100}%`, backgroundColor: "#f59e0b" }}></div>
              </div>
            </div>

            <div style={styles.formulaBox}>
              <span style={styles.formulaLabel}>Calculated Strain Score</span>
              <span style={{ ...styles.formulaScore, color: statusInfo.color }}>
                {currentStrainScore} <span style={{ fontSize: "14px", color: "#64748b" }}>/ 100</span>
              </span>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Green Cooling Interventions</h3>
            
            <div style={styles.controlGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Canopy Planting Area</label>
                <span style={styles.valueBadge}>{canopyArea} m²</span>
              </div>
              <input type="range" min="0" max="500" value={canopyArea} onChange={(e) => setCanopyArea(Number(e.target.value))} style={styles.slider} />
            </div>

            <div style={styles.controlGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Cool-Roof Coating</label>
                <span style={styles.valueBadge}>{coolRoof}%</span>
              </div>
              <input type="range" min="0" max="100" value={coolRoof} onChange={(e) => setCoolRoof(Number(e.target.value))} style={styles.slider} />
            </div>

            <div style={styles.impactCard}>
              <span style={styles.impactLabel}>Temperature Reduction</span>
              <span style={styles.impactValue}>-{tempReduction} °C</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { height: "100vh", width: "100vw", display: "flex", flexDirection: "column", backgroundColor: "#090d16", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", overflow: "hidden" },
  header: { height: "60px", backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" },
  brandGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logoBadge: { backgroundColor: "#2563eb", color: "#fff", fontWeight: "bold", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" },
  headerTitle: { fontSize: "18px", fontWeight: "600", margin: 0 },
  statusBadge: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", transition: "all 0.3s ease" },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", transition: "all 0.3s ease" },
  workspace: { flex: 1, display: "flex", overflow: "hidden" },
  mapPanel: { flex: 1, height: "100%" },
  sidebar: { width: "380px", backgroundColor: "#0f172a", borderLeft: "1px solid #1e293b", padding: "20px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", zIndex: 1000 },
  card: { backgroundColor: "#1e293b", borderRadius: "12px", padding: "16px", border: "1px solid #334155" },
  cardTitle: { fontSize: "15px", fontWeight: "600", margin: "0 0 16px 0", color: "#f8fafc" },
  telemetryRow: { marginBottom: "12px" },
  labelRow: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  label: { fontSize: "12px", color: "#94a3b8" },
  valText: { fontSize: "12px", fontWeight: "bold", transition: "all 0.3s ease" },
  progressBarBg: { height: "6px", width: "100%", backgroundColor: "#0f172a", borderRadius: "3px", overflow: "hidden" },
  progressBarFill: { height: "100%", transition: "all 0.3s ease" },
  formulaBox: { marginTop: "16px", padding: "12px", backgroundColor: "#0f172a", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #334155" },
  formulaLabel: { fontSize: "12px", color: "#94a3b8" },
  formulaScore: { fontSize: "22px", fontWeight: "bold", transition: "all 0.3s ease" },
  controlGroup: { marginBottom: "16px" },
  valueBadge: { fontSize: "12px", fontWeight: "bold", color: "#38bdf8" },
  slider: { width: "100%", accentColor: "#2563eb", cursor: "pointer" },
  impactCard: { marginTop: "12px", padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  impactLabel: { fontSize: "12px", color: "#a7f3d0" },
  impactValue: { fontSize: "16px", fontWeight: "bold", color: "#34d399" }
};

export default App;