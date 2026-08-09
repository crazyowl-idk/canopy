import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Fix for Custom DivIcon (Retro Tree Sprite)
const TreeIcon = L.divIcon({
  className: 'custom-tree-icon',
  html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid #14532d;box-shadow:2px 2px 0 rgba(0,0,0,0.6);border-radius:2px;"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Helper Component: Controls Map Pan & Zoom Animations
function MapController({ activeNode }) {
  const map = useMap();
  useEffect(() => {
    if (activeNode) {
      map.flyTo([activeNode.lat, activeNode.lng], 17, { duration: 1.5 });
    } else {
      map.flyTo([3.1466, 101.7000], 14, { duration: 1.5 });
    }
  }, [activeNode, map]);
  return null;
}

const generateTreeOffsets = (lat, lng) => [
  [lat + 0.0003, lng + 0.0003], [lat - 0.0003, lng - 0.0003],
  [lat + 0.0004, lng - 0.0002], [lat - 0.0002, lng + 0.0004],
  [lat + 0.0001, lng + 0.0005], [lat - 0.0005, lng - 0.0001],
  [lat + 0.0005, lng + 0.0001], [lat - 0.0001, lng - 0.0005],
  [lat + 0.0002, lng - 0.0004], [lat - 0.0004, lng + 0.0002],
  [lat + 0.0006, lng + 0.0002], [lat - 0.0002, lng - 0.0006]
];

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [interventions, setInterventions] = useState({});
  const [apiNodes, setApiNodes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/nodes')
      .then(res => res.json())
      .then(data => setApiNodes(data))
      .catch(err => console.error("Java API fetch error:", err));
  }, []);

  const calculateStrain = (node) => {
    const nodeMods = interventions[node.id] || { canopy: 0, roof: 0 };
    const tempReduction = (nodeMods.canopy * 0.012) + (nodeMods.roof * 0.018);
    const currentTemp = node.baseLST - tempReduction;
    const rawScore = (currentTemp * node.baseDensity) + node.networkPenalty - (tempReduction * 2.5);
    const finalScore = Math.max(0, Math.min(100, rawScore));
    
    // --- DYNAMIC ROI CALCULATOR ---
    // Safely parse the backend variables (with fallbacks just in case the fetch hasn't completed)
    const powerW = node.basePowerW || 11577;
    const tnbRate = node.tnbRateKwh || 0.435;
    const coolingDep = node.coolingDependency || 0.35;

    // 1. Calculate Daily Energy Cost (Watts converted to kW * 24h * TNB Rate)
    const dailyEnergyCost = (powerW / 1000) * 24 * tnbRate;
    
    // 2. Isolate the Cooling Cost
    const dailyCoolingCost = dailyEnergyCost * coolingDep;
    
    // 3. Dynamic Savings: Each 1°C drop saves roughly 3% of cooling energy
    const coolingSavingsPercentage = tempReduction * 0.03; 
    const annualSavingsRM = (dailyCoolingCost * coolingSavingsPercentage * 365).toFixed(0);
    // -------------------------------

    // GeoAI Prediction
    const baseRawScore = (node.baseLST * node.baseDensity) + node.networkPenalty;
    const geoAiRisk = Math.min(99, Math.max(15, Math.floor(baseRawScore * 0.82)));
    
    return {
      currentTemp: currentTemp.toFixed(1),
      score: finalScore.toFixed(1),
      reduction: tempReduction.toFixed(1),
      savings: Number(annualSavingsRM).toLocaleString(),
      geoAiProb: geoAiRisk,
      status: finalScore > 80 ? 'CRITICAL' : finalScore > 65 ? 'ELEVATED' : 'OPTIMAL',
      color: finalScore > 80 ? '#ef4444' : finalScore > 65 ? '#f59e0b' : '#10b981'
    };
  };

  const handleIntervention = (type, value) => {
    if (!selectedNodeId) return;
    setInterventions(prev => ({
      ...prev,
      [selectedNodeId]: {
        ...prev[selectedNodeId],
        [type]: Number(value)
      }
    }));
  };

  const analyzedNodes = apiNodes.map(node => ({ ...node, ...calculateStrain(node) }));
  const criticalCount = analyzedNodes.filter(n => n.status === 'CRITICAL').length;
  const activeNode = analyzedNodes.find(n => n.id === selectedNodeId);
  const activeMods = interventions[selectedNodeId] || { canopy: 0, roof: 0 };

  const visibleTreePositions = activeNode 
    ? generateTreeOffsets(activeNode.lat, activeNode.lng).slice(0, Math.floor(activeMods.canopy / 40)) 
    : [];

  const roofPolygonCoords = activeNode ? [
    [activeNode.lat + 0.0005, activeNode.lng + 0.0005],
    [activeNode.lat + 0.0005, activeNode.lng + 0.0012],
    [activeNode.lat + 0.0001, activeNode.lng + 0.0012],
    [activeNode.lat + 0.0001, activeNode.lng + 0.0005]
  ] : [];

  const roofColor = activeMods.roof > 60 ? "#3b82f6" : (activeMods.roof > 25 ? "#f59e0b" : "#ef4444");

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <div style={styles.logoBadge}>CANOPY</div>
          <h1 style={styles.headerTitle}>ThermoNet 5G Infrastructure Monitor</h1>
        </div>
        <div style={styles.metricsGroup}>
          <div style={styles.globalMetric}>
            <span style={styles.metricLabel}>Active Nodes</span>
            <span style={styles.metricValue}>{analyzedNodes.length}</span>
          </div>
          <div style={styles.globalMetric}>
            <span style={styles.SmetricLabel}>Critical Throttling</span>
            <span style={{ ...styles.metricValue, color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>
              {criticalCount}
            </span>
          </div>
        </div>
      </header>

      <div style={styles.workspace}>
        <main style={styles.mapPanel}>
          <MapContainer center={[3.1466, 101.7000]} zoom={14} style={{ height: "100%", width: "100%", backgroundColor: '#0f172a' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <MapController activeNode={activeNode} />
            
            {analyzedNodes.map((node) => (
              <CircleMarker
                key={node.id} center={[node.lat, node.lng]} radius={selectedNodeId === node.id ? 14 : 8}
                pathOptions={{ color: node.color, fillColor: node.color, fillOpacity: selectedNodeId === node.id ? 0.9 : 0.5, weight: selectedNodeId === node.id ? 3 : 1 }}
                eventHandlers={{ click: () => setSelectedNodeId(node.id) }}
              >
                <Popup>
                  <div style={styles.popup}>
                    <strong style={{color: '#0f172a'}}>{node.id}</strong><br/>
                    Strain Score: <span style={{color: node.color, fontWeight: 'bold'}}>{node.score}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {activeNode && <Polygon positions={roofPolygonCoords} pathOptions={{ color: roofColor, fillColor: roofColor, fillOpacity: 0.45, weight: 2 }} />}
            {visibleTreePositions.map((pos, idx) => <Marker key={idx} position={pos} icon={TreeIcon} />)}
          </MapContainer>
        </main>

        <aside style={styles.sidebar}>
          {!activeNode ? (
            <div style={styles.triageView}>
              <h2 style={styles.sidebarTitle}>Priority Triage Queue</h2>
              <p style={styles.subtitle}>Select a high-risk node on the map to model cooling interventions.</p>
              <div style={styles.nodeList}>
                {analyzedNodes.sort((a, b) => b.score - a.score).map(node => (
                  <div key={node.id} style={{ ...styles.nodeListItem, borderLeft: `4px solid ${node.color}` }} onClick={() => setSelectedNodeId(node.id)}>
                    <div style={styles.nodeListHeader}>
                      <span style={styles.nodeId}>{node.id}</span>
                      <span style={{ ...styles.nodeScore, color: node.color }}>{node.score}</span>
                    </div>
                    <span style={styles.nodeLocation}>{node.location}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.simulatorView}>
              <button style={styles.backButton} onClick={() => setSelectedNodeId(null)}>← Back to Overview</button>
              
              <div style={styles.activeHeader}>
                <h2 style={styles.sidebarTitle}>{activeNode.id}</h2>
                <span style={styles.nodeLocation}>{activeNode.location}</span>
              </div>

              <div style={{ ...styles.alertBox, borderColor: activeNode.geoAiProb > 75 ? '#ef4444' : '#f59e0b', backgroundColor: activeNode.geoAiProb > 75 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <p style={styles.alertText}>
                  <strong style={{ color: '#e2e8f0' }}>GeoAI Alert: </strong> 
                  {activeNode.geoAiProb}% probability of thermal hardware throttling within the next 72 hours due to localized heat stress.
                </p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Telemetry & Strain Formula</h3>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Landsat Surface Temp</span>
                  <span style={{ color: activeNode.currentTemp > 34 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{activeNode.currentTemp} °C</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>OSM Density Multiplier</span>
                  <span style={styles.dataValue}>{activeNode.baseDensity}x</span>
                </div>
                <div style={styles.dataRow}>
                  <span style={styles.dataLabel}>Ookla Load Penalty</span>
                  <span style={styles.dataValue}>+{activeNode.networkPenalty}</span>
                </div>
                <div style={{ ...styles.scoreBox, borderColor: activeNode.color }}>
                  <span style={styles.dataLabel}>Thermal Strain Score</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: activeNode.color }}>{activeNode.score}</span>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Targeted Cooling Intervention</h3>
                <p style={styles.subtitle}>Model infrastructure resilience upgrades for this specific location.</p>
                <div style={styles.controlGroup}>
                  <div style={styles.labelRow}>
                    <label style={styles.dataLabel}>Urban Canopy Expansion</label>
                    <span style={{color: '#38bdf8', fontSize: '12px', fontWeight: 'bold'}}>{activeMods.canopy} m²</span>
                  </div>
                  <input type="range" min="0" max="500" value={activeMods.canopy} onChange={(e) => handleIntervention('canopy', e.target.value)} style={styles.slider} />
                </div>
                <div style={styles.controlGroup}>
                  <div style={styles.labelRow}>
                    <label style={styles.dataLabel}>Cool-Roof Coating</label>
                    <span style={{color: '#38bdf8', fontSize: '12px', fontWeight: 'bold'}}>{activeMods.roof}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={activeMods.roof} onChange={(e) => handleIntervention('roof', e.target.value)} style={styles.slider} />
                </div>

                <div style={styles.roiBox}>
                  <span style={styles.roiLabel}>Projected Cooling Energy Savings</span>
                  <span style={styles.roiValue}>RM {activeNode.savings} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>/ yr</span></span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { height: "100vh", width: "100vw", display: "flex", flexDirection: "column", backgroundColor: "#020617", color: "#f8fafc", fontFamily: "system-ui, sans-serif", overflow: "hidden" },
  header: { height: "70px", backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" },
  brandGroup: { display: "flex", alignItems: "center", gap: "16px" },
  logoBadge: { backgroundColor: "#3b82f6", color: "#fff", fontWeight: "900", padding: "6px 12px", borderRadius: "4px", fontSize: "14px", letterSpacing: "1px" },
  headerTitle: { fontSize: "20px", fontWeight: "600", margin: 0, color: '#e2e8f0' },
  metricsGroup: { display: "flex", gap: "24px" },
  globalMetric: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  metricLabel: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b" },
  metricValue: { fontSize: "20px", fontWeight: "bold", color: "#f8fafc" },
  workspace: { flex: 1, display: "flex", overflow: "hidden" },
  mapPanel: { flex: 1, height: "100%", backgroundColor: '#0f172a' },
  sidebar: { width: "420px", backgroundColor: "#0f172a", borderLeft: "1px solid #1e293b", display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 1000 },
  triageView: { padding: "24px" },
  simulatorView: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  sidebarTitle: { fontSize: "18px", fontWeight: "600", margin: "0 0 8px 0" },
  subtitle: { fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0", lineHeight: "1.5" },
  nodeList: { display: "flex", flexDirection: "column", gap: "12px" },
  nodeListItem: { backgroundColor: "#1e293b", padding: "16px", borderRadius: "6px", cursor: "pointer", transition: "transform 0.2s ease" },
  nodeListHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  nodeId: { fontSize: "14px", fontWeight: "bold", color: "#e2e8f0" },
  nodeScore: { fontSize: "16px", fontWeight: "900" },
  nodeLocation: { fontSize: "12px", color: "#94a3b8" },
  backButton: { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: "600", padding: 0, textAlign: "left", marginBottom: "8px" },
  activeHeader: { borderBottom: "1px solid #334155", paddingBottom: "16px" },
  alertBox: { display: "flex", gap: "12px", padding: "12px", border: "1px solid", borderRadius: "6px", alignItems: "flex-start" },
  alertText: { margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" },
  card: { backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" },
  cardTitle: { fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", margin: "0 0 16px 0" },
  dataRow: { display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #334155" },
  dataLabel: { fontSize: "13px", color: "#cbd5e1" },
  dataValue: { fontSize: "13px", fontWeight: "600", color: "#f8fafc" },
  scoreBox: { marginTop: "16px", padding: "16px", backgroundColor: "#020617", borderRadius: "6px", border: "1px solid", display: "flex", justifyContent: "space-between", alignItems: "center" },
  controlGroup: { marginBottom: "20px" },
  labelRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  slider: { width: "100%", accentColor: "#3b82f6", cursor: "pointer" },
  roiBox: { marginTop: "16px", padding: "12px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  roiLabel: { fontSize: "12px", color: "#a7f3d0", fontWeight: "600" },
  roiValue: { fontSize: "18px", fontWeight: "bold", color: "#34d399" },
  popup: { fontFamily: "system-ui, sans-serif" }
};

export default App;