// ============================================================
// BEEF INDEX - Mock Data Layer
// All 9 modules with realistic beef market data
// ============================================================

// --- Module 01: Live Price Dashboard ---
export const livePrices = {
  cme: {
    liveCattle: { price: 184.10, change: +0.85, changePct: +0.46, period: '30-day', contract: 'APR', sparkline: [178.2, 179.1, 180.5, 179.8, 181.2, 182.0, 181.5, 183.1, 182.8, 183.5, 183.9, 184.1] },
    feederCattle: { price: 253.75, change: +1.25, changePct: +0.50, period: '30-day', contract: 'APR', sparkline: [247.5, 248.2, 249.8, 250.1, 249.5, 251.2, 252.0, 251.8, 252.5, 253.1, 253.4, 253.75] },
  },
  usda: {
    choiceCutout: { price: 317.84, change: +2.14, changePct: +0.68, period: '30-day', source: 'USDA AMS', sparkline: [308.5, 310.2, 311.8, 309.5, 312.4, 314.1, 313.8, 315.2, 316.0, 316.5, 317.1, 317.84] },
    selectCutout: { price: 298.42, change: +1.87, changePct: +0.63, period: '30-day', source: 'USDA AMS', sparkline: [290.1, 291.5, 292.8, 291.2, 293.5, 294.8, 295.1, 296.2, 297.0, 297.5, 298.0, 298.42] },
  },
  cashPrices: [
    { region: 'TX/OK/NM', price: 186.00, change: +1.00, grade: 'Live' },
    { region: 'KS', price: 187.00, change: +1.50, grade: 'Live' },
    { region: 'NE', price: 189.00, change: +2.00, grade: 'Live' },
    { region: 'CO', price: 188.00, change: +1.00, grade: 'Live' },
    { region: 'IA/MN', price: 188.50, change: +1.50, grade: 'Dressed' },
  ],
  exports: { value: 8.34, unit: 'B', change: +4.2, yoy: true, topMarket: 'Japan' },
};

export const tickerItems = [
  { label: 'LIVE CATTLE - APR CME', value: '$184.10', change: '+1.10 (+1.26%)' },
  { label: 'USDA CHOICE', value: '317.84', change: '+2.14 (+0.68%)' },
  { label: 'FEEDER CATTLE - APR', value: '$253.75', change: '+1.25 (+0.50%)' },
  { label: 'USDA SELECT', value: '298.42', change: '+1.87 (+0.63%)' },
  { label: 'NE CASH LIVE', value: '$189.00', change: '+2.00' },
  { label: 'KS CASH LIVE', value: '$187.00', change: '+1.50' },
  { label: 'TX/OK/NM CASH', value: '$186.00', change: '+1.00' },
  { label: 'CHOICE-SELECT SPREAD', value: '19.42', change: '+0.27' },
];

// --- Module 02: Global Alert Feed ---
export const alerts = [
  {
    id: 1, severity: 'HIGH', category: 'DISEASE ALERT',
    title: 'FMD Detection — Pará, Brazil. 6 properties quarantined. Risk...',
    region: 'South America — Brazil',
    source: 'PAHO/WHO', time: '2 days ago',
    detail: 'Brazil MAPA confirms FMD outbreak in Pará state — 6 properties under quarantine. Potential export suspension risk.'
  },
  {
    id: 2, severity: 'WATCH', category: 'DROUGHT MONITOR',
    title: 'Drought Monitor: D3-D4 conditions expanding across NM, TX Pa...',
    region: 'Great Plains — USA',
    source: 'USDM', time: '3 days ago',
    detail: 'Exceptional drought conditions expanding across the Texas Panhandle and eastern New Mexico. 200k+ acres at risk.'
  },
  {
    id: 3, severity: 'WATCH', category: 'AVIAN INFLUENZA',
    title: 'HPAI confirmed in commercial turkey flock, Brown County SD...',
    region: 'Northern Plains — USA',
    source: 'USDA APHIS', time: '4 days ago',
    detail: 'HPAI confirmed in commercial turkey operation. No cattle impact expected but monitoring cross-species risk.'
  },
  {
    id: 4, severity: 'INFO', category: 'TRADE FLOW',
    title: 'Japan raises quarterly beef import quota by 8%. US exporters positioned...',
    region: 'Asia-Pacific',
    source: 'USDA FAS', time: 'Yesterday',
    detail: 'Japan raises quarterly beef import quota by 8%. US exporters positioned to capture estimated $340M uplift.'
  },
  {
    id: 5, severity: 'INFO', category: 'WILDFIRE ALERT',
    title: 'Texas Panhandle fire weather conditions elevated — Red Flag Warning...',
    region: 'Texas Panhandle',
    source: 'NWS Amarillo', time: '06:43',
    detail: 'Red Flag Warning issued across 14 counties. 200k+ acres at risk. Feedlot operations monitoring evacuation readiness.'
  },
  {
    id: 6, severity: 'HIGH', category: 'MARKET INTEL',
    title: 'Packer margins turned negative for third consecutive week...',
    region: 'National — USA',
    source: 'USDA AMS', time: 'Yesterday',
    detail: 'Packer margins turned negative for third consecutive week. Live cattle basis widening against April futures.'
  },
  {
    id: 7, severity: 'INFO', category: 'FOIA SOURCE',
    title: 'NCBA lobbying expenditures Q4 2024 filing: $2.4M in federal...',
    region: 'Washington, D.C.',
    source: 'OpenSecrets', time: '2 days ago',
    detail: 'NCBA lobbying expenditures Q4 2024 filing: $2.4M in federal lobbying. 63% directed at USDA-FSIS regulatory proceedings.'
  },
];

// --- Module 03: Settlement Network Dashboard ---
export const settlementData = {
  corridors: [
    { name: 'El Salvador — Phase 1', status: 'active', volume: 147, avgSettlement: '4.2 min', method: 'Lightning' },
    { name: 'TX Regional Auctions', status: 'pipeline', volume: 0, avgSettlement: '—', method: 'Liquid' },
    { name: 'NE Direct Sales', status: 'pipeline', volume: 0, avgSettlement: '—', method: 'Lightning' },
    { name: 'KS Feedlot Network', status: 'pipeline', volume: 0, avgSettlement: '—', method: 'Liquid' },
  ],
  networkHealth: { uptime: 99.7, confirmationSpeed: '3.8 min', escrowStatus: 'Active' },
  volumeByPeriod: { daily: 12, weekly: 84, monthly: 347 },
  clearedPrices: [
    { region: 'El Salvador', grade: 'Commercial', price: 4.85, unit: 'USD/lb', verified: true },
    { region: 'El Salvador', grade: 'Premium', price: 5.20, unit: 'USD/lb', verified: true },
  ],
  volumeChart: [
    { month: 'Oct', volume: 45 }, { month: 'Nov', volume: 72 }, { month: 'Dec', volume: 98 },
    { month: 'Jan', volume: 124 }, { month: 'Feb', volume: 189 }, { month: 'Mar', volume: 247 },
    { month: 'Apr', volume: 347 },
  ],
};

// --- Module 04: Trade Flow Intelligence ---
export const tradeFlowData = {
  exports: [
    { country: 'Japan', value: 2.41, change: +4.2, quota: 82, trend: [2.1, 2.15, 2.2, 2.28, 2.35, 2.41] },
    { country: 'South Korea', value: 1.89, change: +2.8, quota: 74, trend: [1.72, 1.75, 1.78, 1.82, 1.85, 1.89] },
    { country: 'China', value: 1.52, change: -1.4, quota: 68, trend: [1.61, 1.58, 1.56, 1.54, 1.53, 1.52] },
    { country: 'Mexico', value: 1.34, change: +3.1, quota: null, trend: [1.22, 1.25, 1.28, 1.30, 1.32, 1.34] },
    { country: 'Canada', value: 1.18, change: +1.9, quota: null, trend: [1.10, 1.12, 1.14, 1.15, 1.17, 1.18] },
  ],
  corridorStatus: [
    { corridor: 'US → Japan', status: 'active', risk: 'low' },
    { corridor: 'US → South Korea', status: 'active', risk: 'low' },
    { corridor: 'US → China', status: 'restricted', risk: 'medium' },
    { corridor: 'US → EU', status: 'restricted', risk: 'high' },
    { corridor: 'US → Mexico', status: 'active', risk: 'low' },
    { corridor: 'Brazil → China', status: 'suspended', risk: 'high' },
    { corridor: 'Australia → Japan', status: 'active', risk: 'low' },
    { corridor: 'El Salvador (Beef.com)', status: 'active', risk: 'low' },
  ],
};

// --- Module 05: Supply Chain Conditions Map ---
export const mapLayers = {
  droughtMonitor: { enabled: true, label: 'Drought Monitor', color: '#e74c3c' },
  wildfirePerimeters: { enabled: true, label: 'Wildfire Perimeters', color: '#f39c12' },
  feedlotDensity: { enabled: false, label: 'Feedlot Density', color: '#3498db' },
  processingPlants: { enabled: false, label: 'Processing Plants', color: '#9b59b6' },
  fmdZones: { enabled: true, label: 'FMD Zones (Global)', color: '#e74c3c' },
  tradeRoutes: { enabled: false, label: 'Trade Routes', color: '#2ecc71' },
  pastureConditions: { enabled: false, label: 'Pasture Conditions', color: '#27ae60' },
};

export const mapMarkers = [
  { lat: 35.2, lng: -101.8, type: 'drought', label: 'TX Panhandle D4', severity: 'high' },
  { lat: 34.5, lng: -106.5, type: 'drought', label: 'NM D3-D4', severity: 'watch' },
  { lat: -2.5, lng: -48.5, type: 'fmd', label: 'Pará FMD Zone', severity: 'high' },
  { lat: 35.5, lng: -100.5, type: 'wildfire', label: 'Panhandle Fire Risk', severity: 'watch' },
  { lat: 41.2, lng: -100.8, type: 'feedlot', label: 'NE Feedlot Cluster', severity: 'info' },
  { lat: 37.5, lng: -99.3, type: 'feedlot', label: 'KS Feedlot Cluster', severity: 'info' },
  { lat: 13.7, lng: -89.2, type: 'settlement', label: 'El Salvador Corridor', severity: 'active' },
];

// --- Module 06: USDA Data Center ---
export const usdaData = {
  cattleOnFeed: {
    title: 'Cattle on Feed',
    lastRelease: 'Mar 22, 2026',
    nextRelease: 'Apr 25, 2026',
    highlights: [
      { label: 'On Feed Apr 1', value: '11.73M', change: -2.1 },
      { label: 'Placements Mar', value: '1.82M', change: +4.2 },
      { label: 'Marketings Mar', value: '1.91M', change: +1.1 },
    ],
    source: 'USDA NASS',
  },
  coldStorage: {
    title: 'Cold Storage',
    lastRelease: 'Mar 21, 2026',
    nextRelease: 'Apr 22, 2026',
    highlights: [
      { label: 'Total Beef', value: '467.2M lbs', change: -3.8 },
      { label: 'Month/Month', value: '-18.4M lbs', change: -3.8 },
    ],
    source: 'USDA NASS',
  },
  livestockSlaughter: {
    title: 'Livestock Slaughter',
    lastRelease: 'Apr 10, 2026',
    nextRelease: 'May 8, 2026',
    highlights: [
      { label: 'Weekly FI Cattle', value: '612K head', change: +0.8 },
      { label: 'Steer %', value: '54.2%', change: +1.2 },
    ],
    source: 'USDA NASS',
  },
  releaseCalendar: [
    { report: 'Cattle on Feed', date: 'Apr 25, 2026', time: '3:00 PM ET' },
    { report: 'Cold Storage', date: 'Apr 22, 2026', time: '3:00 PM ET' },
    { report: 'Livestock Slaughter', date: 'May 8, 2026', time: '3:00 PM ET' },
    { report: 'Crop Progress', date: 'Apr 14, 2026', time: '4:00 PM ET' },
    { report: 'Grain Stocks', date: 'Jun 30, 2026', time: '12:00 PM ET' },
  ],
};

// --- Module 07: Industry Intelligence Feed ---
export const intelFeed = [
  {
    id: 1, category: 'USDA REPORT',
    title: 'Cattle on Feed report shows January placements up 4.2% YOY — feedlot inventories tightest since 2015.',
    source: 'USDA NASS', time: '08:00',
  },
  {
    id: 2, category: 'WILDFIRE ALERT',
    title: 'Texas Panhandle fire weather conditions elevated — Red Flag Warning issued across 14 counties. 200k+ acres at risk.',
    source: 'NWS Amarillo', time: '06:43',
  },
  {
    id: 3, category: 'TRADE FLOW',
    title: 'Japan raises quarterly beef import quota by 8%. US exporters positioned to capture estimated $340M uplift.',
    source: 'USDA FAS', time: 'Yesterday',
  },
  {
    id: 4, category: 'MARKET INTEL',
    title: 'Packer margins turned negative for third consecutive week. Live cattle basis widening against April futures.',
    source: 'USDA AMS', time: 'Yesterday',
  },
  {
    id: 5, category: 'FOIA SOURCE',
    title: 'NCBA lobbying expenditures Q4 2024 filing: $2.4M in federal lobbying. 63% directed at USDA-FSIS regulatory proceedings.',
    source: 'OpenSecrets', time: '2 days ago',
  },
  {
    id: 6, category: 'DISEASE ALERT',
    title: 'Brazil MAPA confirms FMD outbreak in Pará state — 6 properties under quarantine. Potential export suspension risk.',
    source: 'PAHO/WHO', time: '2 days ago',
  },
  {
    id: 7, category: 'REGULATORY',
    title: 'USDA-FSIS proposed rule on "Product of USA" labeling enters 60-day comment period. Impacts voluntary origin claims.',
    source: 'Federal Register', time: '3 days ago',
  },
  {
    id: 8, category: 'PACKER NEWS',
    title: 'Tyson Foods Q1 earnings: beef segment operating margin at -1.2%. Third consecutive quarter of negative packer margins.',
    source: 'SEC Filing', time: '5 days ago',
  },
];

// --- Module 08: BeefMaps Integration Feed ---
export const beefMapsData = {
  newListings: [
    { name: 'Triple R Ranch', location: 'Amarillo, TX', certified: true, days: 3 },
    { name: 'Big Sky Beef Co.', location: 'Billings, MT', certified: true, days: 7 },
    { name: 'Heartland Cattle', location: 'Dodge City, KS', certified: false, days: 12 },
    { name: 'Sierra Madre Ranch', location: 'Las Cruces, NM', certified: true, days: 18 },
    { name: 'Blue Ridge Farms', location: 'Staunton, VA', certified: false, days: 22 },
  ],
  stats: {
    totalProducers: 1247,
    certifiedProducers: 834,
    activeRegions: 38,
    newThisMonth: 47,
  },
};

// --- Module 09: AI Analyst ---
export const aiAnalystSuggestions = [
  "What's driving the basis widening on April futures?",
  "Which corridors are at risk from the Brazil FMD outbreak?",
  "What did USDA Cattle on Feed show this month vs. last year?",
  "Summarize packer margin trends for Q1 2026",
  "What's the drought impact on TX Panhandle feedlot operations?",
];

// --- Intelligence feeds for map layer controls ---
export const intelligenceFeeds = [
  { id: 'cme', label: 'CME Futures', enabled: true },
  { id: 'usda', label: 'USDA Reports', enabled: true },
  { id: 'disease', label: 'Disease Alerts', enabled: true },
  { id: 'drought', label: 'Drought & Fire', enabled: true },
  { id: 'trade', label: 'Trade Flows', enabled: true },
  { id: 'beefmaps', label: 'BeefMaps Feed', enabled: false },
];

// Current timestamp for header
export const getCurrentTime = () => {
  const now = new Date();
  return now.toUTCString().replace('GMT', 'UTC');
};
