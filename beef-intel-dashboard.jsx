import { useState, useEffect, useRef } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #0d0b08;
    --surface: #141209;
    --border: #2a2418;
    --border-bright: #3d3326;
    --amber: #c8882a;
    --amber-dim: #7a5218;
    --bone: #e8e0d0;
    --bone-dim: #8a8070;
    --red: #c0392b;
    --red-dim: #7a2318;
    --green: #4a8c3f;
    --green-bright: #6ab860;
    --blue: #2a6080;
    --yellow: #d4a017;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--bone);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    overflow: hidden;
    height: 100vh;
  }

  .terminal-char {
    animation: blink 1.2s step-end infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse-dot {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .scanline {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(transparent, rgba(200,136,42,0.06), transparent);
    pointer-events: none;
    z-index: 9999;
    animation: scanline 8s linear infinite;
  }

  .dashboard {
    display: grid;
    grid-template-rows: 48px 1fr;
    height: 100vh;
    overflow: hidden;
  }

  /* HEADER */
  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border-bright);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 24px;
    position: relative;
    animation: fadeUp 0.4s ease both;
  }

  .header-logo {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 18px;
    color: var(--amber);
    letter-spacing: -0.5px;
    white-space: nowrap;
  }

  .header-logo span {
    color: var(--bone-dim);
    font-weight: 400;
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    margin-left: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .header-divider {
    width: 1px;
    height: 24px;
    background: var(--border-bright);
  }

  .live-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--green-bright);
    text-transform: uppercase;
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green-bright);
    animation: pulse-dot 1.5s ease-in-out infinite;
  }

  .header-stats {
    display: flex;
    gap: 20px;
    margin-left: auto;
  }

  .header-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .header-stat-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--bone-dim);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .header-stat-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: var(--amber);
  }

  .header-stat-value.up { color: var(--green-bright); }
  .header-stat-value.down { color: var(--red); }

  /* MAIN LAYOUT */
  .main {
    display: grid;
    grid-template-columns: 220px 1fr 280px;
    overflow: hidden;
    height: 100%;
  }

  /* SIDEBAR */
  .sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    animation: fadeUp 0.5s ease 0.1s both;
  }

  .sidebar::-webkit-scrollbar { width: 3px; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border-bright); }

  .sidebar-section {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--amber-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .layer-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 6px;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.15s;
    margin-bottom: 2px;
  }

  .layer-toggle:hover { background: rgba(200,136,42,0.06); }

  .layer-toggle.active { background: rgba(200,136,42,0.1); }

  .toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid var(--border-bright);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .layer-toggle.active .toggle-dot {
    border-color: var(--amber);
    background: var(--amber);
    box-shadow: 0 0 6px rgba(200,136,42,0.5);
  }

  .toggle-label {
    font-size: 11px;
    color: var(--bone-dim);
    transition: color 0.2s;
  }

  .layer-toggle.active .toggle-label { color: var(--bone); }

  /* CENTER */
  .center {
    display: grid;
    grid-template-rows: 1fr 200px;
    overflow: hidden;
  }

  .map-area {
    position: relative;
    background: var(--bg);
    overflow: hidden;
    animation: fadeUp 0.5s ease 0.15s both;
  }

  .map-container {
    position: absolute;
    inset: 0;
  }

  .map-svg {
    width: 100%;
    height: 100%;
    opacity: 0.7;
  }

  .map-overlay-label {
    position: absolute;
    top: 12px;
    left: 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--amber-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .map-legend {
    position: absolute;
    bottom: 12px;
    left: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--bone-dim);
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* PRICE TICKER */
  .ticker-bar {
    background: var(--surface);
    border-top: 1px solid var(--border-bright);
    display: flex;
    overflow: hidden;
    position: relative;
    align-items: center;
  }

  .ticker-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--amber);
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 0 14px;
    white-space: nowrap;
    border-right: 1px solid var(--border-bright);
    height: 100%;
    display: flex;
    align-items: center;
    background: var(--surface);
    z-index: 2;
  }

  .ticker-scroll-wrap {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    align-items: center;
  }

  @keyframes scroll-ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .ticker-track {
    display: flex;
    gap: 0;
    animation: scroll-ticker 40s linear infinite;
    white-space: nowrap;
  }

  .ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 20px;
    border-right: 1px solid var(--border);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
  }

  .ticker-name { color: var(--bone-dim); }
  .ticker-price { color: var(--bone); font-weight: 600; }
  .ticker-change.pos { color: var(--green-bright); }
  .ticker-change.neg { color: var(--red); }

  /* CHARTS BOTTOM */
  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--border);
    overflow: hidden;
  }

  .chart-cell {
    border-right: 1px solid var(--border);
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    animation: fadeUp 0.5s ease 0.2s both;
  }

  .chart-cell:last-child { border-right: none; }

  .chart-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--bone-dim);
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .chart-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    color: var(--amber);
  }

  .chart-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--bone-dim);
  }

  .sparkline {
    flex: 1;
    min-height: 40px;
  }

  /* RIGHT PANEL */
  .right-panel {
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fadeUp 0.5s ease 0.2s both;
  }

  .panel-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-bright);
    flex-shrink: 0;
  }

  .panel-tab {
    flex: 1;
    padding: 10px 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--bone-dim);
    cursor: pointer;
    border-right: 1px solid var(--border);
    text-align: center;
    transition: all 0.2s;
  }

  .panel-tab:last-child { border-right: none; }
  .panel-tab:hover { color: var(--bone); background: rgba(200,136,42,0.05); }
  .panel-tab.active { color: var(--amber); border-bottom: 2px solid var(--amber); background: rgba(200,136,42,0.07); }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .panel-content::-webkit-scrollbar { width: 3px; }
  .panel-content::-webkit-scrollbar-thumb { background: var(--border-bright); }

  /* FEED ITEMS */
  .feed-item {
    border-bottom: 1px solid var(--border);
    padding: 10px 0;
    animation: fadeUp 0.4s ease both;
  }

  .feed-item:last-child { border-bottom: none; }

  .feed-category {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: var(--amber-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .feed-category.alert { color: var(--red); }
  .feed-category.market { color: var(--green); }
  .feed-category.policy { color: var(--blue); }

  .feed-headline {
    font-size: 11px;
    color: var(--bone);
    line-height: 1.5;
    margin-bottom: 4px;
  }

  .feed-meta {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--bone-dim);
  }

  /* ALERT ITEMS */
  .alert-item {
    background: rgba(192,57,43,0.08);
    border: 1px solid rgba(192,57,43,0.25);
    border-radius: 3px;
    padding: 10px;
    margin-bottom: 8px;
  }

  .alert-level {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: var(--red);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .alert-text { font-size: 11px; color: var(--bone); line-height: 1.5; }
  .alert-region { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--bone-dim); margin-top: 4px; }

  /* USDA REPORTS */
  .report-item {
    border-bottom: 1px solid var(--border);
    padding: 10px 0;
  }

  .report-title { font-size: 11px; color: var(--bone); margin-bottom: 4px; }
  .report-date { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--bone-dim); }
  .report-badge {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    padding: 2px 6px;
    border-radius: 2px;
    background: rgba(200,136,42,0.15);
    color: var(--amber);
    margin-left: 6px;
  }

  /* TRADE TABLE */
  .trade-table { width: 100%; border-collapse: collapse; }
  .trade-table th {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: var(--bone-dim);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-align: left;
    padding: 6px 4px;
    border-bottom: 1px solid var(--border-bright);
  }
  .trade-table td {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--bone);
    padding: 6px 4px;
    border-bottom: 1px solid var(--border);
  }
  .trade-table td.pos { color: var(--green-bright); }
  .trade-table td.neg { color: var(--red); }

  .section-header {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: var(--amber-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 8px 0 6px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }

  .ai-chat-area {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ai-messages {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 8px;
  }

  .ai-messages::-webkit-scrollbar { width: 3px; }
  .ai-messages::-webkit-scrollbar-thumb { background: var(--border-bright); }

  .ai-msg {
    margin-bottom: 12px;
    animation: fadeUp 0.3s ease both;
  }

  .ai-msg-role {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: var(--amber-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .ai-msg-role.user { color: var(--bone-dim); }

  .ai-msg-body {
    font-size: 11px;
    color: var(--bone);
    line-height: 1.6;
    background: rgba(255,255,255,0.03);
    border-left: 2px solid var(--border-bright);
    padding: 6px 8px;
    border-radius: 0 3px 3px 0;
  }

  .ai-msg-body.user-bubble {
    background: rgba(200,136,42,0.06);
    border-left-color: var(--amber-dim);
    color: var(--bone-dim);
  }

  .ai-input-row {
    display: flex;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  .ai-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-bright);
    border-radius: 3px;
    color: var(--bone);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 6px 10px;
    outline: none;
    transition: border-color 0.2s;
  }

  .ai-input:focus { border-color: var(--amber-dim); }
  .ai-input::placeholder { color: var(--bone-dim); opacity: 0.5; }

  .ai-send-btn {
    background: var(--amber);
    border: none;
    border-radius: 3px;
    color: var(--bg);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    padding: 6px 12px;
    cursor: pointer;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: opacity 0.2s;
  }

  .ai-send-btn:hover { opacity: 0.85; }
  .ai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .typing-indicator {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 4px 0;
  }

  .typing-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--amber-dim);
    animation: pulse-dot 1s ease-in-out infinite;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
`;

// --- MOCK DATA ---
const TICKER_DATA = [
  { name: "LV CME FEB", price: "182.40", change: "+1.23", pct: "+0.68%", pos: true },
  { name: "LC CME APR", price: "184.10", change: "+0.85", pct: "+0.46%", pos: true },
  { name: "FC CME MAR", price: "253.75", change: "-0.60", pct: "-0.24%", pos: false },
  { name: "FC CME APR", price: "254.90", change: "-0.40", pct: "-0.16%", pos: false },
  { name: "LH CME FEB", price: "88.20", change: "+1.10", pct: "+1.26%", pos: true },
  { name: "USDA CHOICE", price: "317.84", change: "+2.14", pct: "+0.68%", pos: true },
  { name: "USDA SELECT", price: "291.23", change: "+1.70", pct: "+0.59%", pos: true },
  { name: "CORN MAR", price: "482.25", change: "-3.50", pct: "-0.72%", pos: false },
  { name: "SOYBEAN MAR", price: "995.50", change: "+5.75", pct: "+0.58%", pos: true },
];

const FEED_ITEMS = [
  { cat: "USDA REPORT", catClass: "policy", headline: "Cattle on Feed report shows January placements up 4.2% YOY — feedlot inventories tightest since 2015.", time: "08:00 • USDA NASS" },
  { cat: "WILDFIRE ALERT", catClass: "alert", headline: "Texas Panhandle fire weather conditions elevated — Red Flag Warning issued across 14 counties. 200k+ acres at risk.", time: "06:43 • NWS Amarillo" },
  { cat: "TRADE FLOW", catClass: "market", headline: "Japan raises quarterly beef import quota by 8%. US exporters positioned to capture estimated $340M uplift.", time: "Yesterday • USDA FAS" },
  { cat: "MARKET INTEL", catClass: "market", headline: "Packer margins turned negative for third consecutive week. Live cattle basis widening against April futures.", time: "Yesterday • USDA AMS" },
  { cat: "FOIA SOURCE", catClass: "policy", headline: "NCBA lobbying expenditures Q4 2024 filing: $2.4M in federal lobbying, 63% directed at USDA-FSIS regulatory proceedings.", time: "2 days ago • OpenSecrets" },
  { cat: "DISEASE ALERT", catClass: "alert", headline: "Brazil MAPA confirms FMD outbreak in Pará state — 6 properties under quarantine. Potential export suspension risk.", time: "2 days ago • PAHO/WHO" },
];

const ALERTS = [
  { level: "HIGH", text: "FMD Detection — Pará, Brazil. 6 properties quarantined. Risk of Brazil USDA export suspension within 72hrs.", region: "South America · Brazil" },
  { level: "WATCH", text: "Drought Monitor: D3-D4 conditions expanding across NM, TX Panhandle, Western KS. Pasture condition declining.", region: "Great Plains · CONUS" },
  { level: "WATCH", text: "HPAI confirmed in commercial turkey flock, Brown County SD. Feed grain disruption possible.", region: "Northern Plains · USA" },
];

const USDA_REPORTS = [
  { title: "Cattle on Feed", date: "Feb 21, 2025", status: "NEW" },
  { title: "Cold Storage Report", date: "Feb 20, 2025", status: "NEW" },
  { title: "Livestock Slaughter Monthly", date: "Feb 18, 2025", status: "" },
  { title: "Boxed Beef Cutout — USDA AMS", date: "Mar 01, 2025 (daily)", status: "LIVE" },
  { title: "World Agricultural Supply & Demand (WASDE)", date: "Feb 11, 2025", status: "" },
  { title: "Export Sales Reporting Weekly", date: "Feb 27, 2025", status: "NEW" },
];

const TRADE_ROWS = [
  { country: "Japan", volume: "312K MT", value: "$1.84B", change: "+8.2%", pos: true },
  { country: "South Korea", volume: "284K MT", value: "$1.63B", change: "+3.1%", pos: true },
  { country: "Mexico", volume: "509K MT", value: "$1.21B", change: "-1.4%", pos: false },
  { country: "Canada", volume: "398K MT", value: "$0.98B", change: "+0.6%", pos: true },
  { country: "China", volume: "188K MT", value: "$0.72B", change: "-12.3%", pos: false },
  { country: "Taiwan", volume: "91K MT", value: "$0.44B", change: "+5.8%", pos: true },
];

const LAYERS = [
  { id: "drought", label: "Drought Monitor", color: "#d4a017", defaultOn: true },
  { id: "wildfire", label: "Wildfire Perimeters", color: "#c0392b", defaultOn: true },
  { id: "feedlots", label: "Feedlot Density", color: "#c8882a", defaultOn: true },
  { id: "processing", label: "Processing Plants", color: "#4a8c3f", defaultOn: false },
  { id: "fmd", label: "FMD Zones (Global)", color: "#9b59b6", defaultOn: true },
  { id: "trade", label: "Trade Routes", color: "#2a6080", defaultOn: false },
  { id: "pasture", label: "Pasture Conditions", color: "#6ab860", defaultOn: false },
];

const SIDEBAR_FILTERS = [
  { id: "prices", label: "CME Futures" },
  { id: "usda", label: "USDA Reports" },
  { id: "disease", label: "Disease Alerts" },
  { id: "drought", label: "Drought & Fire" },
  { id: "trade", label: "Trade Flows" },
  { id: "rancher", label: "BeefMaps Feed" },
];

// Simple sparkline SVG generator
function Sparkline({ data, color, height = 40 }) {
  const w = 200, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts.join(" ")} ${w},${h}`}
        fill={`url(#sg-${color})`}
      />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
      {last && (
        <circle cx={last.split(",")[0]} cy={last.split(",")[1]} r="3" fill={color} />
      )}
    </svg>
  );
}

const CATTLE_SPARK = [178, 179.5, 181, 180, 179, 181.5, 182, 181, 183, 182.4];
const CHOICE_SPARK = [310, 312, 314, 313, 315, 316, 315, 317, 318, 317.84];
const TRADE_SPARK = [2.1, 2.3, 2.0, 2.4, 2.5, 2.3, 2.6, 2.7, 2.8, 2.81];

// World map SVG paths (simplified major beef regions)
function BeefWorldMap({ activeLayers }) {
  const showDrought = activeLayers.includes("drought");
  const showFMD = activeLayers.includes("fmd");
  const showFeedlots = activeLayers.includes("feedlots");
  const showWildfire = activeLayers.includes("wildfire");

  return (
    <svg viewBox="0 0 900 460" className="map-svg" style={{ background: "#0a0906" }}>
      {/* Grid lines */}
      {[...Array(9)].map((_, i) => (
        <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={460} stroke="#1a1710" strokeWidth="0.5" />
      ))}
      {[...Array(5)].map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 90} x2={900} y2={i * 90} stroke="#1a1710" strokeWidth="0.5" />
      ))}

      {/* Continents — simplified fills */}
      {/* North America */}
      <path d="M80,60 L220,55 L280,80 L290,160 L260,200 L240,250 L200,280 L180,260 L160,230 L100,180 L70,140 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />
      {/* South America */}
      <path d="M190,290 L250,285 L280,310 L280,380 L250,420 L210,430 L190,400 L170,360 L175,310 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />
      {/* Europe */}
      <path d="M390,50 L470,50 L490,90 L470,120 L430,130 L390,110 L370,80 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />
      {/* Africa */}
      <path d="M390,140 L460,135 L490,160 L490,240 L470,300 L430,330 L400,320 L375,290 L365,240 L370,170 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />
      {/* Asia */}
      <path d="M510,50 L750,45 L820,80 L810,160 L760,200 L680,210 L610,190 L550,170 L510,130 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />
      {/* Australia */}
      <path d="M690,280 L790,270 L830,300 L820,360 L770,380 L710,370 L680,340 L685,300 Z"
        fill="#1e1a12" stroke="#2a2418" strokeWidth="0.8" />

      {/* DROUGHT ZONE — US Great Plains */}
      {showDrought && (
        <ellipse cx="185" cy="175" rx="55" ry="40" fill="rgba(212,160,23,0.18)" stroke="#d4a017" strokeWidth="1" strokeDasharray="4,3" />
      )}

      {/* WILDFIRE */}
      {showWildfire && (
        <>
          <circle cx="165" cy="170" r="8" fill="rgba(192,57,43,0.35)" />
          <circle cx="175" cy="162" r="5" fill="rgba(192,57,43,0.5)" />
        </>
      )}

      {/* FEEDLOT DENSITY — US, Australia, Brazil */}
      {showFeedlots && (
        <>
          <circle cx="185" cy="175" r="16" fill="rgba(200,136,42,0.15)" stroke="rgba(200,136,42,0.4)" strokeWidth="0.8" />
          <circle cx="750" cy="320" r="12" fill="rgba(200,136,42,0.12)" stroke="rgba(200,136,42,0.3)" strokeWidth="0.8" />
          <circle cx="240" cy="340" r="10" fill="rgba(200,136,42,0.12)" stroke="rgba(200,136,42,0.3)" strokeWidth="0.8" />
        </>
      )}

      {/* FMD ZONE — Brazil Pará */}
      {showFMD && (
        <circle cx="255" cy="315" r="12" fill="rgba(155,89,182,0.25)" stroke="#9b59b6" strokeWidth="1.2" strokeDasharray="3,2" />
      )}

      {/* Country labels */}
      {[
        { x: 165, y: 175, label: "USA", anchor: "middle" },
        { x: 230, y: 350, label: "BRA", anchor: "middle" },
        { x: 750, y: 325, label: "AUS", anchor: "middle" },
        { x: 660, y: 130, label: "IND", anchor: "middle" },
        { x: 430, y: 80, label: "EUR", anchor: "middle" },
        { x: 680, y: 80, label: "CHN", anchor: "middle" },
      ].map((l) => (
        <text key={l.label} x={l.x} y={l.y} textAnchor={l.anchor}
          fill="rgba(232,224,208,0.35)" fontSize="9" fontFamily="IBM Plex Mono, monospace"
          letterSpacing="2">
          {l.label}
        </text>
      ))}

      {/* Alert pulse — Brazil FMD */}
      {showFMD && (
        <circle cx="255" cy="315" r="6" fill="#9b59b6">
          <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Wildfire pulse */}
      {showWildfire && (
        <circle cx="170" cy="165" r="6" fill="#c0392b">
          <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

// --- AI CHAT ---
const INITIAL_MESSAGES = [
  {
    role: "analyst",
    text: "BeefDeck AI Analyst online. Ask me about cattle prices, USDA data, trade flows, disease alerts, or rancher-direct markets.",
  },
];

const CANNED_RESPONSES = {
  default: "Based on current USDA data and CME futures: Live cattle April contracts are trading at $184.10, up 0.46%. The most significant risk factor this week is the Texas Panhandle fire weather — historically, Red Flag conditions in Q1 correlate with 3–5% supply disruption in the Southern Plains feedlot corridor.",
  price: "Live cattle futures are showing strength. April contracts at $184.10/cwt, feeder cattle under mild pressure at $253.75. Packer margins are negative for a third consecutive week, which historically precedes either a cattle price pullback or a packing plant throughput cut.",
  disease: "Active disease flags: FMD detected in Pará, Brazil — 6 properties under quarantine. Brazil represents ~14% of global traded beef volume. A full USDA suspension would redirect significant tonnage to Australian and US exporters. HPAI in South Dakota turkey flock is secondary concern.",
  trade: "Top US beef export destinations this week: Japan leading at $1.84B annualized, South Korea at $1.63B. Japan raised its quarterly import quota by 8% — estimated $340M uplift for US producers. China volume down 12.3% YOY amid trade friction.",
  drought: "D3-D4 exceptional drought conditions expanding across eastern New Mexico, Texas Panhandle, and western Kansas. This is prime stocker and backgrounder country. Early-season drought at this severity typically forces early liquidation, which depresses feeder prices short-term but tightens supply by Q3.",
};

function getAIResponse(q) {
  const lower = q.toLowerCase();
  if (lower.includes("price") || lower.includes("futures") || lower.includes("cattle")) return CANNED_RESPONSES.price;
  if (lower.includes("disease") || lower.includes("fmd") || lower.includes("outbreak")) return CANNED_RESPONSES.disease;
  if (lower.includes("trade") || lower.includes("export") || lower.includes("japan")) return CANNED_RESPONSES.trade;
  if (lower.includes("drought") || lower.includes("fire") || lower.includes("wildfire")) return CANNED_RESPONSES.drought;
  return CANNED_RESPONSES.default;
}

// ============ MAIN COMPONENT ============
export default function BeefDeck() {
  const [activeLayers, setActiveLayers] = useState(
    LAYERS.filter((l) => l.defaultOn).map((l) => l.id)
  );
  const [activeFilters, setActiveFilters] = useState(["prices", "usda", "disease", "drought", "trade"]);
  const [rightTab, setRightTab] = useState("feed");
  const [aiMessages, setAiMessages] = useState(INITIAL_MESSAGES);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const toggleLayer = (id) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleFilter = (id) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const q = aiInput.trim();
    setAiInput("");
    setAiMessages((m) => [...m, { role: "user", text: q }]);
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setAiMessages((m) => [...m, { role: "analyst", text: getAIResponse(q) }]);
    setAiLoading(false);
  };

  const tickerDouble = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <>
      <style>{STYLE}</style>
      <div className="scanline" />
      <div className="dashboard">
        {/* HEADER */}
        <header className="header">
          <div className="header-logo">
            BeefDeck<span>INTELLIGENCE</span>
          </div>
          <div className="header-divider" />
          <div className="live-badge">
            <div className="live-dot" />
            Live Feeds Active
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "var(--bone-dim)", marginLeft: 8 }}>
            {clock.toUTCString().slice(0, 25)} UTC
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-label">Live Cattle Apr</span>
              <span className="header-stat-value up">$184.10 ▲</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">Choice Cutout</span>
              <span className="header-stat-value up">$317.84 ▲</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">Feeder Mar</span>
              <span className="header-stat-value down">$253.75 ▼</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">Active Alerts</span>
              <span className="header-stat-value" style={{ color: "var(--red)" }}>3 ⬥</span>
            </div>
          </div>
        </header>

        <div className="main">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-section-label">Map Layers</div>
              {LAYERS.map((l) => (
                <div
                  key={l.id}
                  className={`layer-toggle${activeLayers.includes(l.id) ? " active" : ""}`}
                  onClick={() => toggleLayer(l.id)}
                >
                  <div className="toggle-dot" style={activeLayers.includes(l.id) ? { background: l.color, borderColor: l.color, boxShadow: `0 0 6px ${l.color}80` } : {}} />
                  <span className="toggle-label">{l.label}</span>
                </div>
              ))}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-label">Intelligence Feeds</div>
              {SIDEBAR_FILTERS.map((f) => (
                <div
                  key={f.id}
                  className={`layer-toggle${activeFilters.includes(f.id) ? " active" : ""}`}
                  onClick={() => toggleFilter(f.id)}
                >
                  <div className="toggle-dot" />
                  <span className="toggle-label">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="sidebar-section" style={{ flex: 1 }}>
              <div className="sidebar-section-label">Alert Summary</div>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ marginBottom: 8, padding: "6px 8px", background: "rgba(192,57,43,0.07)", borderRadius: 3, borderLeft: `2px solid ${a.level === "HIGH" ? "#c0392b" : "#d4a017"}` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: a.level === "HIGH" ? "var(--red)" : "var(--yellow)", letterSpacing: 2, marginBottom: 3 }}>{a.level}</div>
                  <div style={{ fontSize: 10, color: "var(--bone)", lineHeight: 1.4 }}>{a.text.slice(0, 60)}...</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "var(--bone-dim)", marginTop: 2 }}>{a.region}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* CENTER */}
          <div className="center">
            {/* MAP */}
            <div className="map-area">
              <div className="map-container">
                <BeefWorldMap activeLayers={activeLayers} />
              </div>
              <div className="map-overlay-label">Global Beef Intelligence Map</div>
              <div className="map-legend">
                {activeLayers.map((id) => {
                  const l = LAYERS.find((x) => x.id === id);
                  return l ? (
                    <div key={id} className="legend-item">
                      <div className="legend-dot" style={{ background: l.color }} />
                      {l.label}
                    </div>
                  ) : null;
                })}
              </div>
              {/* TICKER */}
              <div className="ticker-bar" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36 }}>
                <div className="ticker-label">CME · USDA</div>
                <div className="ticker-scroll-wrap">
                  <div className="ticker-track">
                    {tickerDouble.map((t, i) => (
                      <div key={i} className="ticker-item">
                        <span className="ticker-name">{t.name}</span>
                        <span className="ticker-price">{t.price}</span>
                        <span className={`ticker-change ${t.pos ? "pos" : "neg"}`}>{t.change} ({t.pct})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="charts-row">
              <div className="chart-cell">
                <div className="chart-title">Live Cattle — Apr CME</div>
                <div className="chart-value">$184.10</div>
                <div className="chart-sub" style={{ color: "var(--green-bright)" }}>▲ +0.85 (+0.46%) 30-day</div>
                <div className="sparkline">
                  <Sparkline data={CATTLE_SPARK} color="#c8882a" height={50} />
                </div>
              </div>
              <div className="chart-cell">
                <div className="chart-title">Choice Cutout — USDA AMS</div>
                <div className="chart-value">$317.84</div>
                <div className="chart-sub" style={{ color: "var(--green-bright)" }}>▲ +2.14 (+0.68%) 30-day</div>
                <div className="sparkline">
                  <Sparkline data={CHOICE_SPARK} color="#6ab860" height={50} />
                </div>
              </div>
              <div className="chart-cell">
                <div className="chart-title">US Beef Exports — Annualized $B</div>
                <div className="chart-value">$8.34B</div>
                <div className="chart-sub" style={{ color: "var(--green-bright)" }}>▲ YOY +4.2% — Top mkt: Japan</div>
                <div className="sparkline">
                  <Sparkline data={TRADE_SPARK} color="#2a6080" height={50} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="panel-tabs">
              {[["feed", "Intel Feed"], ["alerts", "Alerts"], ["usda", "USDA"], ["trade", "Trade"], ["ai", "AI Analyst"]].map(([id, label]) => (
                <div
                  key={id}
                  className={`panel-tab${rightTab === id ? " active" : ""}`}
                  onClick={() => setRightTab(id)}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="panel-content">
              {rightTab === "feed" && (
                <>
                  {FEED_ITEMS.map((item, i) => (
                    <div key={i} className="feed-item" style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className={`feed-category ${item.catClass}`}>{item.cat}</div>
                      <div className="feed-headline">{item.headline}</div>
                      <div className="feed-meta">{item.time}</div>
                    </div>
                  ))}
                </>
              )}
              {rightTab === "alerts" && (
                <>
                  <div className="section-header">Active Alerts — {new Date().toLocaleDateString()}</div>
                  {ALERTS.map((a, i) => (
                    <div key={i} className="alert-item" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="alert-level">
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.level === "HIGH" ? "var(--red)" : "var(--yellow)", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                        {a.level}
                      </div>
                      <div className="alert-text">{a.text}</div>
                      <div className="alert-region">{a.region}</div>
                    </div>
                  ))}
                </>
              )}
              {rightTab === "usda" && (
                <>
                  <div className="section-header">USDA Reports</div>
                  {USDA_REPORTS.map((r, i) => (
                    <div key={i} className="report-item" style={{ animationDelay: `${i * 0.07}s`, paddingBottom: 10 }}>
                      <div className="report-title">
                        {r.title}
                        {r.status && <span className="report-badge">{r.status}</span>}
                      </div>
                      <div className="report-date">{r.date}</div>
                    </div>
                  ))}
                </>
              )}
              {rightTab === "trade" && (
                <>
                  <div className="section-header">US Beef Export Flows — 2024 YTD</div>
                  <table className="trade-table">
                    <thead>
                      <tr>
                        <th>MARKET</th>
                        <th>VOLUME</th>
                        <th>VALUE</th>
                        <th>YOY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRADE_ROWS.map((r, i) => (
                        <tr key={i}>
                          <td>{r.country}</td>
                          <td>{r.volume}</td>
                          <td>{r.value}</td>
                          <td className={r.pos ? "pos" : "neg"}>{r.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {rightTab === "ai" && (
                <div className="ai-chat-area">
                  <div className="ai-messages">
                    {aiMessages.map((m, i) => (
                      <div key={i} className="ai-msg" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className={`ai-msg-role${m.role === "user" ? " user" : ""}`}>
                          {m.role === "user" ? "YOU" : "BEEFDECK ANALYST"}
                        </div>
                        <div className={`ai-msg-body${m.role === "user" ? " user-bubble" : ""}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="ai-msg">
                        <div className="ai-msg-role">BEEFDECK ANALYST</div>
                        <div className="ai-msg-body">
                          <div className="typing-indicator">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="ai-input-row">
                    <input
                      className="ai-input"
                      placeholder="Ask about prices, drought, FMD, trade..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendAI()}
                    />
                    <button className="ai-send-btn" onClick={sendAI} disabled={aiLoading}>
                      ASK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
