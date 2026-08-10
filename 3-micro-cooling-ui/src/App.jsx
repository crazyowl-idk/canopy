import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Polygon, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CITY_OPTIONS = [
  { id: 'kuala-lumpur', country: 'Malaysia', city: 'Kuala Lumpur', lat: 3.139, lng: 101.687, currency: 'RM', tariff: 0.435 },
  { id: 'singapore', country: 'Singapore', city: 'Singapore', lat: 1.352, lng: 103.820, currency: 'S$', tariff: 0.29 },
  { id: 'jakarta', country: 'Indonesia', city: 'Jakarta', lat: -6.195, lng: 106.823, currency: 'Rp', tariff: 1444 },
  { id: 'bangkok', country: 'Thailand', city: 'Bangkok', lat: 13.756, lng: 100.502, currency: '฿', tariff: 4.2 },
  { id: 'manila', country: 'Philippines', city: 'Manila', lat: 14.599, lng: 120.985, currency: '₱', tariff: 11.2 },
  { id: 'hanoi', country: 'Vietnam', city: 'Hanoi', lat: 21.028, lng: 105.835, currency: '₫', tariff: 2500 },
  { id: 'phnom-penh', country: 'Cambodia', city: 'Phnom Penh', lat: 11.556, lng: 104.928, currency: '៛', tariff: 750 },
  { id: 'vientiane', country: 'Laos', city: 'Vientiane', lat: 17.975, lng: 102.633, currency: '₭', tariff: 2100 },
  { id: 'bandar-seri-begawan', country: 'Brunei', city: 'Bandar Seri Begawan', lat: 4.903, lng: 114.939, currency: 'B$', tariff: 0.1 },
  { id: 'naypyidaw', country: 'Myanmar', city: 'Naypyidaw', lat: 19.763, lng: 96.078, currency: 'K', tariff: 210 },
];

const treeIcon = L.divIcon({
  className: 'custom-tree-icon',
  html: '<div style="width:14px;height:14px;background:#22c55e;border:2px solid #14532d;border-radius:50%;box-shadow:0 1px 3px #000"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7],
});

const ASSET_PROFILES = [
  { assetType: 'Shared 5G tower', criticality: 88, vulnerability: 72, lead: 'Tower operator + mobile operators' },
  { assetType: 'Backhaul / fibre hub', criticality: 82, vulnerability: 58, lead: 'Network operator + utility provider' },
  { assetType: 'Edge data cabinet', criticality: 92, vulnerability: 80, lead: 'Operator + building owner' },
];

const CLIMATE_SCENARIOS = [
  { id: 'today', label: 'Today', uplift: 0 },
  { id: 'warming-15', label: '+1.5°C planning', uplift: 1.5 },
  { id: 'warming-20', label: '+2.0°C planning', uplift: 2 },
];

function MapController({ city, activeNode }) {
  const map = useMap();
  useEffect(() => {
    const target = activeNode ? [activeNode.lat, activeNode.lng] : [city.lat, city.lng];
    map.flyTo(target, activeNode ? 16 : 12, { duration: 0.8 });
  }, [city, activeNode, map]);
  return null;
}

const CITY_NODE_PROFILES = {
  'kuala-lumpur': [
    ['5G-BUKIT-BINTANG-04', 'Pavilion Intersection', 36.5, 1.8, 45, 11950],
    ['5G-PUDU-09', 'Pudu Commercial Dist', 37.0, 1.9, 40, 11500],
    ['5G-CHOW-KIT-02', 'Chow Kit Market', 35.0, 1.6, 35, 11300],
    ['5G-KLCC-01', 'KLCC Park Edge', 31.5, 1.2, 20, 12650],
  ],
  singapore: [['ORCHARD', 'Orchard Road retail corridor', 34.4, 1.78, 42, 12100], ['MARINA-BAY', 'Marina Bay financial district', 35.7, 1.88, 55, 13050], ['JURONG', 'Jurong East transport hub', 33.6, 1.42, 29, 11000]],
  jakarta: [['KUNINGAN', 'Kuningan business district', 37.8, 1.93, 57, 13200], ['SUDIRMAN', 'Sudirman office corridor', 36.9, 1.84, 49, 12500], ['KEMANG', 'Kemang mixed-use district', 35.2, 1.51, 34, 11400]],
  bangkok: [['SUKHUMVIT', 'Sukhumvit commercial corridor', 38.1, 1.89, 54, 12900], ['SILOM', 'Silom financial district', 37.3, 1.82, 47, 12300], ['CHATUCHAK', 'Chatuchak transport hub', 35.5, 1.46, 32, 11150]],
  manila: [['MAKATI', 'Makati central business district', 38.4, 1.95, 58, 13400], ['BGC', 'Bonifacio Global City', 37.1, 1.76, 46, 12250], ['QUEZON-CITY', 'Quezon City urban centre', 36.3, 1.58, 39, 11600]],
  hanoi: [['HOAN-KIEM', 'Hoan Kiem central district', 35.9, 1.68, 41, 11800], ['CAU-GIAY', 'Cau Giay technology district', 34.7, 1.54, 35, 11300], ['BA-DINH', 'Ba Dinh administrative district', 33.8, 1.39, 26, 10850]],
  'phnom-penh': [['RIVERSIDE', 'Riverside commercial district', 36.8, 1.63, 38, 11500], ['SEN-SOK', 'Sen Sok development corridor', 35.1, 1.43, 30, 10900], ['TOUL-KORK', 'Toul Kork urban district', 36.0, 1.57, 34, 11200]],
  vientiane: [['SISATTANAK', 'Sisattanak urban district', 34.8, 1.36, 25, 10600], ['CHANTHABOULY', 'Chanthabouly city centre', 35.6, 1.49, 31, 11000], ['XAYSETHA', 'Xaysettha growth corridor', 34.2, 1.31, 22, 10300]],
  'bandar-seri-begawan': [['GADONG', 'Gadong commercial district', 33.4, 1.34, 24, 10500], ['KIULAP', 'Kiulap business district', 34.1, 1.41, 28, 10800], ['BERAKAS', 'Berakas residential corridor', 32.8, 1.22, 18, 9900]],
  naypyidaw: [['ZABUTHIRI', 'Zabuthiri administrative zone', 36.5, 1.44, 30, 11000], ['DEKKHINATHIRI', 'Dekkhinathiri civic district', 35.7, 1.35, 24, 10500], ['OTTARATHIRI', 'Ottarathiri urban corridor', 36.1, 1.39, 27, 10700]],
};

function demoNodes(city) {
  const profile = CITY_NODE_PROFILES[city.id] || [];
  return profile.map((item, index) => {
    if (typeof item === 'object' && !Array.isArray(item) && item.id) {
      const node = {
        ...item,
        basePowerW: item.basePowerW || 11577,
        tnbRateKwh: city.tariff,
        coolingDependency: 0.35,
        isDemo: true,
      };
      return node;
    }

    const [zone, location, baseLST, baseDensity, networkPenalty, basePowerW] = item;
    const fallbackId = Array.isArray(zone) ? zone[0] : zone;
    const nodeId = typeof fallbackId === 'string' && fallbackId.toUpperCase().startsWith('5G-')
      ? fallbackId
      : `5G-${fallbackId}-${String(index + 1).padStart(2, '0')}`;

    return {
      id: nodeId,
      lat: city.lat + (index - 1) * 0.012,
      lng: city.lng + (index - 1) * 0.009,
      location,
      baseLST,
      baseDensity,
      networkPenalty,
      basePowerW,
      tnbRateKwh: city.tariff,
      coolingDependency: 0.35,
      isDemo: true,
    };
  });
}

function calculateForecast(node, intervention, climateUplift = 0) {
  const canopy = intervention.canopy || 0;
  const roof = intervention.roof || 0;
  // Prototype coefficients: replace with locally validated intervention studies before operational use.
  const temperatureDrop = canopy * 0.012 + roof * 0.018;
  const currentTemp = node.baseLST + climateUplift - temperatureDrop;
  const baselineStrain = (node.baseLST + climateUplift) * node.baseDensity + node.networkPenalty;
  const strain = Math.max(0, Math.min(100, (currentTemp * node.baseDensity) + node.networkPenalty - temperatureDrop * 2.5));
  const powerW = node.basePowerW || 11577;
  const tariff = node.tnbRateKwh || 0.435;
  const coolingDependency = node.coolingDependency || 0.35;
  const dailyCoolingCost = (powerW / 1000) * 24 * tariff * coolingDependency;
  const annualSavings = dailyCoolingCost * (temperatureDrop * 0.03) * 365;
  const calculatedRisk = Math.min(99, Math.max(15, Math.round(baselineStrain * 0.82)));
  const baselineRisk = Number.isFinite(node.geoAiProb) ? Math.round(node.geoAiProb + climateUplift * 2) : calculatedRisk;
  const risk = Math.max(5, Math.round(baselineRisk - temperatureDrop * 3));
  const criticality = node.criticality || 70;
  const vulnerability = node.vulnerability || 50;
  const resiliencePriority = Math.round(strain * .55 + criticality * .25 + vulnerability * .20);
  const interventionCost = canopy * 45 + roof * 55;
  const avoidedDowntime = Math.max(0, (baselineRisk - risk) * criticality * 1.5);
  const annualBenefit = annualSavings + avoidedDowntime;
  const paybackYears = annualBenefit > 0 && interventionCost > 0 ? interventionCost / annualBenefit : null;
  const action = strain > 90 ? 'Heat-emergency response: inspect cooling, power and service continuity now.' : strain > 80 ? 'Prioritise a field thermal and power audit within 14 days.' : strain > 65 ? 'Inspect site conditions and optimise cooling before the next hot period.' : 'Monitor conditions and include this site in planned maintenance.';
  return { canopy, roof, temperatureDrop, currentTemp, strain, annualSavings, dailyCoolingCost, baselineRisk, risk, criticality, vulnerability, resiliencePriority, interventionCost, avoidedDowntime, annualBenefit, paybackYears, action, status: strain > 80 ? 'Critical' : strain > 65 ? 'Elevated' : 'Lower risk' };
}

const format = (value, digits = 1) => new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);
const colorFor = strain => strain > 80 ? '#ef4444' : strain > 65 ? '#f59e0b' : '#10b981';

function downloadExecutiveSummary({ city, node, forecast }) {
  const currencyCode = { 'RM': 'MYR', 'S$': 'SGD', 'Rp': 'IDR', '฿': 'THB', '₱': 'PHP', '₫': 'VND', '៛': 'KHR', '₭': 'LAK', 'B$': 'BND', 'K': 'MMK' }[city.currency] || city.currency;
  const money = `${currencyCode} ${format(forecast.annualSavings, 0)}`;
  const escapePdf = text => text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const stream = [];
  const text = (value, x, y, size = 10, bold = false, color = '0.12 0.18 0.27') => stream.push(`${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`);
  const left = 54; const right = 541; const valueX = 345;
  const navy = '0.106 0.310 0.569'; const dark = '0.180 0.180 0.180'; const gray = '0.541 0.541 0.541'; const divider = '0.878 0.878 0.878';
  const rule = (y) => stream.push(`${divider} RG 0.5 w ${left} ${y} m ${right} ${y} l S`);
  const heading = (value, y) => { text(value.toUpperCase(), left, y, 10, true, navy); rule(y - 8); };
  const row = (label, value, y) => { text(label, left, y, 10, false, dark); text(value, valueX, y, 10, true, dark); rule(y - 13); };
  const note = (value, y) => text(value, left, y, 8, false, gray);
  // A4 page: 595 x 842 points with standard 54-point margins. Each section follows a consistent two-column report table.
  text('CANOPY AI X THERMONET 5G', left, 785, 10, true, navy);
  text('Executive Cooling Scenario Summary', left, 752, 21, true, dark);
  text('Planning and infrastructure budget decision support', left, 731, 9, false, gray);
  rule(713);

  heading('Site and intervention - selected planning scenario', 688);
  row('Location', `${city.city}, ${city.country}`, 662);
  row('Network node', node.id, 632);
  row('Tree-canopy expansion', `${forecast.canopy} m2`, 602);
  row('Cool-roof coverage', `${forecast.roof}%`, 572);
  note('Scenario inputs are user-selected planning values; they are not records of completed works.', 548);

  heading('Thermal outlook - baseline and projected condition', 510);
  row('Baseline surface temperature', `${format(node.baseLST)} C`, 484);
  row('Predicted temperature reduction', `-${format(forecast.temperatureDrop)} C`, 454);
  row('Projected surface temperature', `${format(forecast.currentTemp)} C`, 424);
  row('Thermal strain after intervention', `${format(forecast.strain)} / 100 - ${forecast.status}`, 394);
  row('72-hour throttling-risk indicator', `${forecast.risk}%`, 364);
  note('Thermal results are modelled scenario estimates, not live equipment measurements or validated outage forecasts.', 340);

  heading('Budget estimate - cooling-energy planning inputs', 300);
  row('Estimated node power draw', `${format(node.basePowerW || 11577, 0)} W`, 274);
  row('Electricity tariff used', `${currencyCode} ${format(node.tnbRateKwh || city.tariff, 3)} / kWh`, 244);
  row('Cooling share of energy use', `${format((node.coolingDependency || .35) * 100, 0)}%`, 214);
  row('Estimated annual energy saving', `${money} / year`, 184);
  note('Savings assume 3% cooling-energy reduction for every 1 C temperature reduction; field calibration is required.', 160);

  rule(58);
  text('Planning scenario using prototype/demo inputs. Validate local climate studies, tariffs and operator telemetry before approval.', left, 39, 8, false, gray);
  text('CANOPY AI X THERMONET 5G - HACKATHON USE ONLY', left, 24, 8, true, gray);
  const content = stream.join('\n');
  const nextStream = [];
  const nextText = (value, x, y, size = 10, bold = false, color = dark) => nextStream.push(`${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`);
  const nextRule = y => nextStream.push(`${divider} RG 0.5 w ${left} ${y} m ${right} ${y} l S`);
  const nextHeading = (value, y) => { nextText(value.toUpperCase(), left, y, 10, true, navy); nextRule(y - 8); };
  const nextRow = (label, value, y) => { nextText(label, left, y); nextText(value, valueX, y, 10, true); nextRule(y - 13); };
  nextText('CANOPY AI X THERMONET 5G', left, 785, 10, true, navy);
  nextText('Executive Cooling Scenario Summary', left, 752, 21, true);
  nextText(`${city.city}, ${city.country}  |  ${node.id}  |  Continued`, left, 731, 9, false, gray);
  nextRule(713);
  nextHeading('Recommended decision - from scenario to approval', 684);
  nextRow('Resilience priority', `${forecast.resiliencePriority}/100 - ${forecast.status}`, 654);
  nextRow('Accountable lead', node.lead || 'Joint operator and site-owner review', 614);
  nextText(forecast.action, left, 588, 8, false, gray);
  nextRow('1. Verify site conditions', 'On-site heat, power and cooling readings', 554);
  nextRow('2. Confirm feasibility', 'Canopy/roof survey and site constraints', 514);
  nextRow('3. Validate the financial case', 'Tariff, quote and maintenance review', 474);
  nextText('Use aggregated, privacy-preserving telemetry and agreed security controls for a pilot.', left, 450, 8, false, gray);
  nextHeading('Implementation evidence - minimum data to collect', 420);
  nextRow('Environmental evidence', 'Weather, thermal and canopy metrics', 390);
  nextRow('Infrastructure evidence', 'Cabinet heat, traffic, power and HVAC data', 350);
  nextRow('Outcome evidence', 'Alarms and before-after readings', 310);
  nextText('Data should be aggregated and governed under agreed access, privacy and operational-security controls.', left, 282, 8, false, gray);
  nextRule(58);
  nextText('Planning scenario using prototype/demo inputs. Validate local climate studies, tariffs and operator telemetry before approval.', left, 39, 8, false, gray);
  nextText('CANOPY AI X THERMONET 5G - HACKATHON USE ONLY', left, 24, 8, true, gray);
  const nextContent = nextStream.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 8 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Length ${nextContent.length} >>\nstream\n${nextContent}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  link.download = `canopy-executive-summary-${city.id}-${node.id}.pdf`;
  link.click(); URL.revokeObjectURL(link.href);
}

export default function App() {
  const [cityId, setCityId] = useState('kuala-lumpur');
  const [apiNodes, setApiNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [intervention, setIntervention] = useState({ canopy: 0, roof: 0 });
  const [climateScenarioId, setClimateScenarioId] = useState('today');
  const [savedForecast, setSavedForecast] = useState(null);

  const city = CITY_OPTIONS.find(item => item.id === cityId);
  useEffect(() => {
    fetch('http://localhost:8080/api/v1/nodes')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('API unavailable')))
      .then(setApiNodes)
      .catch(() => setApiNodes([]));
  }, []);
  useEffect(() => { setSelectedId(null); setIntervention({ canopy: 0, roof: 0 }); setSavedForecast(null); }, [cityId]);

  const nodes = useMemo(() => (cityId === 'kuala-lumpur' && apiNodes.length
    ? apiNodes.map(node => ({ ...node, isDemo: true, tnbRateKwh: node.tnbRateKwh || city.tariff }))
    : demoNodes(city)).map((node, index) => ({ ...node, ...ASSET_PROFILES[index % ASSET_PROFILES.length] })), [city, cityId, apiNodes]);
  const activeNode = nodes.find(node => node.id === selectedId);
  const climateScenario = CLIMATE_SCENARIOS.find(item => item.id === climateScenarioId);
  const forecast = activeNode && calculateForecast(activeNode, intervention, climateScenario.uplift);
  const criticalCount = nodes.filter(node => calculateForecast(node, { canopy: 0, roof: 0 }, climateScenario.uplift).strain > 80).length;
  const treePositions = activeNode ? Array.from({ length: Math.min(12, Math.floor(intervention.canopy / 40)) }, (_, i) => [activeNode.lat + ((i % 4) - 1.5) * 0.00035, activeNode.lng + (Math.floor(i / 4) - 1) * 0.00035]) : [];
  const roof = activeNode ? [[activeNode.lat + .0005, activeNode.lng + .0005], [activeNode.lat + .0005, activeNode.lng + .0011], [activeNode.lat + .0001, activeNode.lng + .0011], [activeNode.lat + .0001, activeNode.lng + .0005]] : [];

  return <div className="app">
    <header className="header">
      <div className="brand-block"><div className="brand">CANOPY AI X THERMONET 5G</div><span className="title">Digital-infrastructure resilience planner</span></div>
      <label className="city-picker">Location <select value={cityId} onChange={e => setCityId(e.target.value)}>{CITY_OPTIONS.map(item => <option key={item.id} value={item.id}>{item.city}, {item.country}</option>)}</select></label>
      <label className="city-picker">Climate outlook <select value={climateScenarioId} onChange={e => setClimateScenarioId(e.target.value)}>{CLIMATE_SCENARIOS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <div className="header-metric" aria-label={`${nodes.length} nodes shown; ${criticalCount} high-strain nodes`}>
        <div><span>Nodes shown</span><strong>{nodes.length}</strong></div>
        <div className={`high-strain ${criticalCount === 0 ? 'clear' : ''}`}><span>High strain</span><strong>{criticalCount}</strong></div>
      </div>
    </header>
    <div className="notice"><strong>Prototype declaration:</strong> This hackathon demonstrator uses demo/aggregated inputs and hard-coded planning coefficients. Temperature, risk and cost outputs are scenario estimates - not live measurements or validated investment forecasts. Live operator telemetry, local climate studies and field calibration are required before operational or budget approval.</div>
    <div className="workspace">
      <main className="map-panel"><MapContainer center={[city.lat, city.lng]} zoom={12} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" /><MapController city={city} activeNode={activeNode} />
        {nodes.map(node => { const base = calculateForecast(node, { canopy: 0, roof: 0 }, climateScenario.uplift); const color = colorFor(base.strain); return <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={node.id === selectedId ? 13 : 8} pathOptions={{ color, fillColor: color, fillOpacity: .75, weight: node.id === selectedId ? 3 : 1 }} eventHandlers={{ click: () => setSelectedId(node.id) }} />; })}
        {activeNode && <Polygon positions={roof} pathOptions={{ color: intervention.roof ? '#60a5fa' : '#64748b', fillOpacity: .3 }} />}{treePositions.map((position, i) => <Marker key={i} position={position} icon={treeIcon} />)}
      </MapContainer></main>
      <aside className="sidebar">{!activeNode ? <><h2>Choose an infrastructure site</h2><p className="muted">Each point represents a prototype asset site: a shared tower, backhaul hub or edge cabinet. Select one to build a resilience plan.</p><div className="node-list">{nodes.map(node => { const base = calculateForecast(node, { canopy: 0, roof: 0 }, climateScenario.uplift); return <button key={node.id} className="node" onClick={() => setSelectedId(node.id)}><i style={{ background: colorFor(base.strain) }} /><span><strong>{node.id}</strong><small>{node.assetType} · {node.location}</small></span><b>{format(base.resiliencePriority)}</b></button>; })}</div></> : <><button className="back" onClick={() => setSelectedId(null)}>← All sites</button><div className="node-heading"><h2>{activeNode.id}</h2><span>{activeNode.assetType}</span></div><p className="muted">{activeNode.location}</p>
        <section className="risk"><strong>Priority {forecast.resiliencePriority}/100 · {forecast.status}</strong><span>{forecast.risk}% prototype throttling risk under the selected climate outlook.</span></section>
        <section className="card"><h3>Site context</h3><div className="metric-grid"><div className="metric-box"><span>Surface temperature</span><b>{format(activeNode.baseLST + climateScenario.uplift)} °C</b></div><div className="metric-box"><span>Built-up multiplier</span><b>{format(activeNode.baseDensity, 2)}×</b></div><div className="metric-box"><span>Service criticality</span><b>{forecast.criticality}/100</b></div><div className="metric-box"><span>Community vulnerability</span><b>{forecast.vulnerability}/100</b></div></div><small className="card-note">Priority combines thermal strain (55%), service criticality (25%) and community vulnerability (20%).</small></section>
        <section className="card"><h3>Build your cooling plan</h3><label>Tree-canopy area <output>{intervention.canopy} m²</output><input type="range" min="0" max="500" step="10" value={intervention.canopy} onChange={e => setIntervention(v => ({ ...v, canopy: Number(e.target.value) }))} /></label><label>Cool-roof coverage <output>{intervention.roof}%</output><input type="range" min="0" max="100" step="5" value={intervention.roof} onChange={e => setIntervention(v => ({ ...v, roof: Number(e.target.value) }))} /></label></section>
        <section className="forecast"><h3>Scenario outcome and economic case</h3><div className="outcome-grid"><div><span>Temperature reduction</span><strong>−{format(forecast.temperatureDrop)} °C</strong></div><div><span>New surface temperature</span><strong>{format(forecast.currentTemp)} °C</strong></div><div><span>Annual energy saving</span><strong>{city.currency} {format(forecast.annualSavings, 0)}</strong></div><div><span>Potential avoided downtime</span><strong>{city.currency} {format(forecast.avoidedDowntime, 0)}</strong></div><div className="outcome-wide"><span>Indicative payback</span><strong>{forecast.paybackYears ? `${format(forecast.paybackYears, 1)} years` : 'Add an intervention to estimate'}</strong></div></div><small>Planning-only local-currency assumptions: capital cost, energy saving and avoided downtime must be replaced with site quotes and operator data.</small><button className="save" onClick={() => { downloadExecutiveSummary({ city, node: activeNode, forecast }); setSavedForecast({ ...forecast, node: activeNode.id, city: city.city }); }}>Download executive PDF summary</button></section>
        <section className="card decision-card"><h3>Recommended decision</h3><p>{forecast.action}</p><div><strong>Accountable lead:</strong> {activeNode.lead}</div><div><strong>City / regulator role:</strong> convene approval, greening and data-governance review.</div><small className="card-note">Use aggregated, privacy-preserving telemetry for a pilot; share raw operational data only under agreed security controls.</small></section>
        <section className="card decision-card"><h3>Before approval</h3><div><strong>Validate:</strong> compare satellite surface temperature with on-site cabinet/air sensors, weather, power and cooling readings.</div><div><strong>Integrate:</strong> send the approved priority to operator monitoring through the API; retain raw telemetry with its owner.</div><div><strong>Carbon check:</strong> confirm energy saved exceeds the intervention's maintenance and embodied-carbon impact.</div></section>
        {savedForecast && <section className="saved" role="status"><strong>Executive PDF downloaded</strong><span>{savedForecast.city} · {savedForecast.node}: −{format(savedForecast.temperatureDrop)} °C and {city.currency} {format(savedForecast.annualSavings, 0)}/year estimated saving.</span></section>}
      </>}</aside>
    </div>
    <footer className="app-footer"><strong>CANOPY AI X THERMONET 5G</strong><span>Prototype decision-support dashboard - HACKATHON USE ONLY</span></footer>
  </div>;
}
