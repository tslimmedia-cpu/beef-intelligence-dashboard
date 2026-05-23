# Beef Index — Global Beef Market Intelligence Dashboard

Real-time beef market intelligence platform for Beef.com. Aggregates live price data, supply chain alerts, settlement network activity, and trade intelligence into a single dashboard.

## Quick Start

```bash
npm install
cp .env.example .env   # Then add your API keys to .env
npm run dev             # Frontend only (localhost:5173)
npm run server          # Backend API only (localhost:3001)
npm run dev:all         # Both frontend + backend
```

## Architecture

**5-panel dashboard layout:**
- Header bar with live prices and alert count
- Scrolling price ticker
- Left sidebar — map layer controls, intelligence feed toggles, alert triage
- Center — Leaflet global intelligence map with drought/wildfire/FMD overlays
- Right panel — 5 tabbed views (Intel Feed, Alerts, USDA, Trade/Settlement, AI Analyst)
- Bottom bar — 4 data cards with Recharts sparklines

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + Tailwind CSS 4 |
| Map | Leaflet via react-leaflet |
| Charts | Recharts |
| Backend | Node.js + Express (server/index.js) |
| Data | USDA AMS, USDA NASS, Drought Monitor, NIFC Wildfire, RSS feeds |

## Project Structure

```
├── server/
│   └── index.js          # Express API server — polls USDA feeds, caches in memory
├── src/
│   ├── App.jsx            # Main layout — 5-panel dashboard
│   ├── components/
│   │   ├── Header.jsx     # Top bar — prices, clock, alerts badge
│   │   ├── PriceTicker.jsx # Scrolling price ticker
│   │   ├── LeftSidebar.jsx # Map layers, feed toggles, alert summary
│   │   ├── IntelligenceMap.jsx  # Leaflet map with markers
│   │   ├── RightPanel.jsx # Tab container for 5 right-panel views
│   │   ├── BottomBar.jsx  # Price cards with sparklines
│   │   └── tabs/
│   │       ├── IntelFeedTab.jsx   # Industry news feed
│   │       ├── AlertsTab.jsx      # Alert feed with severity filters
│   │       ├── USDATab.jsx        # USDA reports + release calendar
│   │       ├── TradeTab.jsx       # Trade flows + settlement dashboard
│   │       └── AIAnalystTab.jsx   # Conversational AI (Claude API)
│   ├── data/
│   │   └── mockData.js    # Fallback mock data for all 9 modules
│   └── hooks/
│       └── useBeefData.js # React hooks for live API consumption
├── .env.example           # Environment variable template
├── .env                   # Your actual keys (gitignored)
└── package.json
```

## API Keys Required

| Key | Where to Get | Used For |
|-----|-------------|----------|
| `USDA_NASS_KEY` | https://quickstats.nass.usda.gov/api/ | Cattle on Feed, Placements |
| `USDA_AMS_KEY` | https://mymarketnews.ams.usda.gov/ | Boxed Beef Cutout, Cash Cattle |
| `USDA_FAS_KEY` | https://apps.fas.usda.gov/opendataweb/home | Export sales (optional) |

**Free, no key needed:**
- USDA AMS Datamart (mpr.datamart.ams.usda.gov) — cutout + cash cattle
- US Drought Monitor (usdmdataservices.unl.edu) — weekly drought severity
- NIFC Wildfire Perimeters (ArcGIS) — active fire data

## Backend API Endpoints

The Express server runs on port 3001 and exposes:

| Endpoint | Data |
|----------|------|
| `GET /api/health` | Server status |
| `GET /api/feeds` | All feeds combined |
| `GET /api/feeds/ams` | USDA AMS cutout + cash cattle prices |
| `GET /api/feeds/nass` | USDA NASS cattle inventory data |
| `GET /api/feeds/fas` | USDA FAS export data |
| `GET /api/feeds/drought` | US Drought Monitor severity stats |
| `GET /api/feeds/wildfire` | NIFC wildfire perimeters |
| `GET /api/feeds/disease-alerts` | Disease alert RSS feeds |

**Auto-refresh schedule** (via node-cron):
- AMS: every 30 min
- NASS: daily 3 PM ET
- Drought: weekly Thursday
- Wildfire: daily 6 AM ET
- Disease alerts: every 4 hours

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build    # Outputs to dist/
```
Set `VITE_API_URL` to your production backend URL.

### Backend (Railway/Render/Fly.io)
Deploy `server/index.js` with environment variables from `.env`.
Set `PORT` if the platform assigns one.

### Embedding in Beef.com
The app is designed to be embedded at `beefindex.beef.com` or `beef.com/index`. The frontend is a standalone SPA that can be served from any CDN or subdomain.

## 9 MVP Modules

1. **Live Price Dashboard** — CME futures, USDA AMS cutout/cash, sparklines
2. **Global Alert Feed** — Disease, drought, wildfire, trade alerts with severity triage
3. **Settlement Network Dashboard** — Beef.com corridor map, transaction volume, cleared prices
4. **Trade Flow Intelligence** — Export markets, quota utilization, corridor status
5. **Supply Chain Conditions Map** — Leaflet with drought/wildfire/FMD layers
6. **USDA Data Center** — Cattle on Feed, Cold Storage, Slaughter + release calendar
7. **Industry Intelligence Feed** — BeefNews.org, FOIA, regulatory, packer news
8. **BeefMaps Integration Feed** — Producer listings, certified rancher badges
9. **AI Analyst** — Conversational queries against live feed data (Claude API)

## Notes for Developer

- The frontend uses **mock data as fallback** when the backend is unreachable — it will always render
- AMS data takes ~20s to load on startup (60K+ records) — be patient on first boot
- The NASS key format is `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- Tailwind 4 is used — styles are in `src/index.css` using `@theme` for design tokens
- The dark terminal aesthetic uses custom colors defined in `--color-*` theme variables
- Map tile layer has a CSS filter to invert to dark mode
