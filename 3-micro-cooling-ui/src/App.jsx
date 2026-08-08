import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const klPosition = [3.1466, 101.6958];

  // Fetch the Thermal Strain Scores from your Java Spring Boot API
  useEffect(() => {
    fetch('http://localhost:8080/api/v1/nodes/risk-summary')
      .then(res => res.json())
      .then(data => setNodes(data))
      .catch(err => console.log('Backend offline, using fallback mock data', err));
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "16px", backgroundColor: "#0f172a", color: "#f8fafc" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>ThermoNet 5G — Micro-Site Cooling Engine</h1>
      </header>

      {/* Main Workspace */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left Panel: The React-Leaflet Map */}
        <div style={{ flex: 2, height: "100%" }}>
          <MapContainer center={klPosition} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {nodes.map((node, index) => (
                <Marker key={index} position={[node.lat, node.lng]}>
                  <Popup>
                    <strong>{node.id}</strong><br />
                    Location: {node.location}<br />
                    Thermal Strain Score: {node.thermalStrainScore}/100<br />
                    Status: {node.status}
                  </Popup>
                </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right Panel: The Micro-Cooling Simulator */}
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#1e293b", color: "#f8fafc" }}>
          <h2>Green Micro-Cooling Simulator</h2>
          <hr style={{ borderColor: "#334155" }} />
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Adjust cooling interventions to model the impact on node performance.
          </p>
          
          <div style={{ marginTop: "20px" }}>
            <label>Canopy Planting Area (m²)</label>
            <input type="range" min="0" max="500" defaultValue="100" style={{ width: "100%", margin: "10px 0" }} />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Cool-Roof Coating Coverage (%)</label>
            <input type="range" min="0" max="100" defaultValue="50" style={{ width: "100%", margin: "10px 0" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;