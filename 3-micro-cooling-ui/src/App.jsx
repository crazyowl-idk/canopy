import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [interventions, setInterventions] = useState({});
  const [apiNodes, setApiNodes] = useState([]); // Replaces INITIAL_NODES

  // Fetch real data from the Java Spring Boot backend on load
  useEffect(() => {
    fetch('http://localhost:8080/api/v1/nodes')
      .then(res => res.json())
      .then(data => setApiNodes(data))
      .catch(err => console.error("Failed to fetch nodes from Java API. Is Spring Boot running?", err));
  }, []);

  // Helper: Calculate real-time strain for any node based on its specific interventions
  const calculateStrain = (node) => {
    const nodeMods = interventions[node.id] || { canopy: 0, roof: 0 };
    const tempReduction = (nodeMods.canopy * 0.012) + (nodeMods.roof * 0.018);
    const currentTemp = node.baseLST - tempReduction;
    const rawScore = (currentTemp * node.baseDensity) + node.networkPenalty - (tempReduction * 2.5);
    const finalScore = Math.max(0, Math.min(100, rawScore)); // Clamp between 0-100
    
    return {
      currentTemp: currentTemp.toFixed(1),
      score: finalScore.toFixed(1),
      reduction: tempReduction.toFixed(1),
      status: finalScore > 80 ? 'CRITICAL' : finalScore > 65 ? 'ELEVATED' : 'OPTIMAL',
      color: finalScore > 80 ? '#ef4444' : finalScore > 65 ? '#f59e0b' : '#10b981'
    };
  };

  // Update slider values for the currently selected node
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

  // Data processing for the UI
  const analyzedNodes = apiNodes.map(node => ({ ...node, ...calculateStrain(node) }));
  const criticalCount = analyzedNodes.filter(n => n.status === 'CRITICAL').length;
  const activeNode = analyzedNodes.find(n => n.id === selectedNodeId);
  const activeMods = interventions[selectedNodeId] || { canopy: 0, roof: 0 };

  return (
    <div style={styles.appContainer}>
      
      {/* MCMC Command Header */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <div style={styles.logoBadge}>MCMC</div>
          <h1 style={styles.headerTitle}>ThermoNet 5G Infrastructure Monitor</h1>
        </div>
        <div style={styles.metricsGroup}>
          <div style={styles.globalMetric}>
            <span style={styles.metricLabel}>Active Nodes</span>
            <span style={styles.metricValue}>{analyzedNodes.length}</span>
          </div>
          <div style={styles.globalMetric}>
            <span style={styles.metricLabel}>Critical Throttling</span>
            <span style={{ ...styles.metricValue, color: criticalCount > 0 ? '#ef4444' : '#10b981' }}>
              {criticalCount}
            </span>
          </div>
        </div>
      </header>

      <div style={styles.workspace}>
        {/* Left: City-Wide Map */}
        <main style={styles.mapPanel}>
          <MapContainer center={[3.1466, 101.7000]} zoom={14} style={{ height: "100%", width: "100%", backgroundColor: '#0f172a' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            
            {analyzedNodes.map((node) => (
              <CircleMarker
                key={node.id}
                center={[node.lat, node.lng]}
                radius={selectedNodeId === node.id ? 12 : 8}
                pathOptions={{ 
                  color: node.color, 
                  fillColor: node.color, 
                  fillOpacity: selectedNodeId === node.id ? 0.8 : 0.4,
                  weight: selectedNodeId === node.id ? 3 : 1
                }}
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
          </MapContainer>
        </main>

        {/* Right: Dynamic Triage Sidebar */}
        <aside style={styles.sidebar}>
          
          {!activeNode ? (
            /* STATE 1: No Node Selected - Show Priority Triage List */
            <div style={styles.triageView}>
              <h2 style={styles.sidebarTitle}>Priority Triage Queue</h2>
              <p style={styles.subtitle}>Select a high-risk node on the map to model cooling interventions.</p>
              
              <div style={styles.nodeList}>
                {analyzedNodes.sort((a, b) => b.score - a.score).map(node => (
                  <div 
                    key={node.id} 
                    style={{ ...styles.nodeListItem, borderLeft: `4px solid ${node.color}` }}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
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
            /* STATE 2: Node Selected - Show Telemetry & Simulator */
            <div style={styles.simulatorView}>
              <button style={styles.backButton} onClick={() => setSelectedNodeId(null)}>
                ← Back to Overview
              </button>
              
              <div style={styles.activeHeader}>
                <h2 style={styles.sidebarTitle}>{activeNode.id}</h2>
                <span style={styles.nodeLocation}>{activeNode.location}</span>
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
  subtitle: { fontSize: "13px", color: "#94a3b8", margin: "0 0 20px 0", lineHeight: "1.5" },
  nodeList: { display: "flex", flexDirection: "column", gap: "12px" },
  nodeListItem: { backgroundColor: "#1e293b", padding: "16px", borderRadius: "6px", cursor: "pointer", transition: "transform 0.2s ease, background 0.2s ease" },
  nodeListHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  nodeId: { fontSize: "14px", fontWeight: "bold", color: "#e2e8f0" },
  nodeScore: { fontSize: "16px", fontWeight: "900" },
  nodeLocation: { fontSize: "12px", color: "#94a3b8" },
  backButton: { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: "600", padding: 0, textAlign: "left", marginBottom: "16px" },
  activeHeader: { borderBottom: "1px solid #334155", paddingBottom: "16px", marginBottom: "8px" },
  card: { backgroundColor: "#1e293b", borderRadius: "8px", padding: "20px", border: "1px solid #334155" },
  cardTitle: { fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#94a3b8", margin: "0 0 16px 0" },
  dataRow: { display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #334155" },
  dataLabel: { fontSize: "13px", color: "#cbd5e1" },
  dataValue: { fontSize: "13px", fontWeight: "600", color: "#f8fafc" },
  scoreBox: { marginTop: "16px", padding: "16px", backgroundColor: "#020617", borderRadius: "6px", border: "1px solid", display: "flex", justifyContent: "space-between", alignItems: "center" },
  controlGroup: { marginBottom: "20px" },
  labelRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  slider: { width: "100%", accentColor: "#3b82f6", cursor: "pointer" },
  popup: { fontFamily: "system-ui, sans-serif" }
};

export default App;