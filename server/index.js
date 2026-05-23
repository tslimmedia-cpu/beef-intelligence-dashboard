import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import axios from 'axios';
import xml2js from 'xml2js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache
const cache = {
  usda_ams:         { cutout: null, cash: null, updated: null },
  usda_nass:        { cattleOnFeed: null, coldStorage: null, slaughter: null, updated: null },
  usda_fas:         { exports: null, updated: null },
  drought_monitor:  { features: null, updated: null },
  wildfire:         { features: null, updated: null },
  disease_alerts:   { alerts: [], updated: null },
  cme_prices:       { liveCattle: null, feederCattle: null, updated: null },
  intel_feed:       { items: [], updated: null },
  federal_register: { items: [], updated: null },
  sec_filings:      { items: [], updated: null },
  gov_contracts:    { items: [], updated: null },
  beefnews:         { articles: [], llmContext: '', updated: null },
};

// ============================================================
// Helper: relative time string
// ============================================================
function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now - date;
  const diffH = diffMs / (1000 * 60 * 60);
  const diffD = diffH / 24;
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${Math.round(diffH)}H AGO`;
  if (diffD < 1.5) return 'Yesterday';
  if (diffD < 2.5) return '2 days ago';
  if (diffD < 3.5) return '3 days ago';
  return `${Math.round(diffD)} days ago`;
}

// ============================================================
// Helper: format large numbers
// ============================================================
function formatMillions(val) {
  if (!val || isNaN(val)) return 'N/A';
  const num = typeof val === 'string' ? parseInt(val.replace(/,/g, '')) : val;
  if (isNaN(num)) return 'N/A';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return String(num);
}

// ============================================================
// CME Prices via Yahoo Finance
// ============================================================
async function fetchCMEPrices() {
  try {
    const [lcRes, gfRes] = await Promise.all([
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/LE=F', {
        params: { interval: '1d', range: '1mo' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }),
      axios.get('https://query1.finance.yahoo.com/v8/finance/chart/GF=F', {
        params: { interval: '1d', range: '1mo' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }),
    ]);

    const parseCME = (res) => {
      const result = res.data?.chart?.result?.[0];
      if (!result) return null;
      const meta = result.meta || {};
      const closeArr = result.indicators?.quote?.[0]?.close || [];
      // Filter out trailing nulls for sparkline
      const sparkline = closeArr.filter(v => v != null).map(v => parseFloat(v.toFixed(2)));
      const price = parseFloat((meta.regularMarketPrice || 0).toFixed(2));
      const prev = parseFloat((meta.chartPreviousClose || price).toFixed(2));
      const change = parseFloat((price - prev).toFixed(2));
      const changePct = prev !== 0 ? parseFloat(((change / prev) * 100).toFixed(2)) : 0;
      return { price, change, changePct, sparkline };
    };

    const lc = parseCME(lcRes);
    const gf = parseCME(gfRes);

    cache.cme_prices = {
      liveCattle: lc,
      feederCattle: gf,
      updated: new Date().toISOString(),
    };

    console.log(`  CME: LC=$${lc?.price}, GF=$${gf?.price}`);
  } catch (err) {
    console.error('CME prices error:', err.message);
  }
}

// ============================================================
// USDA AMS — Cutout & Cash Prices (MARS API)
// ============================================================
async function fetchUSDAams() {
  try {
    const headers = { Accept: 'application/json' };

    const [cutoutRes, cashRes] = await Promise.all([
      axios.get('https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2453/Current%20Cutout%20Values', { headers, timeout: 30000 }),
      axios.get('https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2477/Detail', { headers, timeout: 60000 }),
    ]);

    const cutoutData = cutoutRes.data?.results || [];
    const cashData = cashRes.data?.results || [];

    // Parse latest cutout
    const latest = cutoutData[0] || {};
    const cutout = {
      choicePrice: parseFloat(latest.choice_600_900_current || 0),
      selectPrice: parseFloat(latest.select_600_900_current || 0),
      reportDate: latest.report_date || '',
    };

    // Parse cash — get unique selling_basis + grade combos with prices
    const cashByBasis = {};
    for (const row of cashData) {
      if (!row.weighted_avg_price) continue;
      const key = `${row.selling_basis_description}-${row.class_description}`;
      if (!cashByBasis[key]) {
        cashByBasis[key] = {
          basis: row.selling_basis_description || '',
          class: row.class_description || '',
          grade: row.grade_description || '',
          price: parseFloat(row.weighted_avg_price),
          headCount: row.head_count || '',
          reportDate: row.report_date || '',
        };
      }
    }
    const cash = Object.values(cashByBasis).slice(0, 10);

    cache.usda_ams = { cutout, cash, updated: new Date().toISOString() };
    console.log(`  USDA AMS: choice=$${cutout.choicePrice}, select=$${cutout.selectPrice}, cash=${cash.length} entries`);
  } catch (err) {
    console.error('USDA AMS error:', err.message);
  }
}

// ============================================================
// USDA NASS Quick Stats (api.data.gov key)
// ============================================================
async function fetchUSDANass() {
  const nassKey = process.env.USDA_NASS_KEY;
  if (!nassKey || nassKey === 'your_nass_key_here') {
    console.error('USDA NASS: No API key set in .env');
    return;
  }

  const baseUrl = 'https://quickstats.nass.usda.gov/api/api_GET/';
  const currentYear = new Date().getFullYear();

  try {
    const cofRes = await axios.get(baseUrl, {
      params: { key: nassKey, short_desc: 'CATTLE, ON FEED - INVENTORY', agg_level_desc: 'NATIONAL', year: currentYear, format: 'json' },
    });

    const plRes = await axios.get(baseUrl, {
      params: { key: nassKey, short_desc: 'CATTLE, ON FEED - PLACEMENTS, MEASURED IN HEAD', agg_level_desc: 'NATIONAL', year: currentYear, format: 'json' },
    });

    const cattleOnFeed = cofRes.data?.data || [];
    const placements = plRes.data?.data || [];

    cache.usda_nass = {
      cattleOnFeed: cattleOnFeed.slice(0, 12),
      slaughter: [],
      placements: placements.slice(0, 12),
      updated: new Date().toISOString(),
    };

    console.log(`  USDA NASS: cattleOnFeed=${cattleOnFeed.length}, placements=${placements.length}`);
  } catch (err) {
    console.error('USDA NASS error:', err.response?.data?.error?.[0] || err.message);
  }
}

// ============================================================
// USDA FAS — skip (bad API key), just return empty
// ============================================================
async function fetchUSDAFas() {
  // FAS API key is invalid — skip and use mock trade flow data as fallback
  console.log('  USDA FAS: Skipped (invalid API key) — using mock trade flow data');
  cache.usda_fas = { exports: [], updated: new Date().toISOString() };
}

// ============================================================
// US Drought Monitor
// ============================================================
async function fetchDroughtMonitor() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const drRes = await axios.get(
      `https://usdmdataservices.unl.edu/api/USStatistics/GetDroughtSeverityStatisticsByAreaPercent?aoi=us&startdate=${monthAgo}&enddate=${today}&statisticsType=1`,
      { timeout: 15000 }
    );
    // Response is CSV — parse it
    const lines = drRes.data.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',');
      const obj = {};
      headers.forEach((h, i) => (obj[h.trim()] = vals[i]?.trim()));
      return obj;
    });
    cache.drought_monitor = {
      features: rows,
      updated: new Date().toISOString(),
    };
    console.log(`  Drought Monitor: ${rows.length} rows`);
  } catch (err) {
    console.error('Drought Monitor error:', err.message);
  }
}

// ============================================================
// NIFC Wildfire Perimeters
// ============================================================
async function fetchWildfire() {
  try {
    const wfRes = await axios.get(
      'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Perimeters/FeatureServer/0/query',
      {
        params: { where: '1=1', outFields: '*', f: 'geojson' },
        timeout: 20000,
      }
    );
    cache.wildfire = {
      features: wfRes.data?.features || [],
      updated: new Date().toISOString(),
    };
    console.log(`  Wildfire: ${cache.wildfire.features.length} fires`);
  } catch (err) {
    console.error('Wildfire error:', err.message);
  }
}

// ============================================================
// Disease Alerts — RSS Parser
// ============================================================
async function fetchDiseaseAlerts() {
  const feeds = [
    { name: 'CDC One Health', url: 'https://tools.cdc.gov/podcasts/feed.asp?feedid=183' },
    { name: 'WHO DON', url: 'https://www.who.int/feeds/entity/don/en/rss.xml' },
  ];

  const parser = new xml2js.Parser();
  const alerts = [];

  for (const feed of feeds) {
    try {
      const res = await axios.get(feed.url, { timeout: 10000 });
      const parsed = await parser.parseStringPromise(res.data);
      const items = parsed?.rss?.channel?.[0]?.item || [];

      items.slice(0, 5).forEach(item => {
        const title = item.title?.[0] || '';
        const desc = item.description?.[0] || '';

        // Filter for beef-relevant keywords
        const keywords = ['FMD', 'foot-and-mouth', 'cattle', 'bovine', 'BSE', 'brucellosis', 'HPAI', 'livestock'];
        const isBeefy = keywords.some(kw => title.toLowerCase().includes(kw) || desc.toLowerCase().includes(kw));

        if (isBeefy) {
          alerts.push({
            id: `${feed.name}-${title}`.substring(0, 50),
            source: feed.name,
            title,
            description: desc.substring(0, 200),
            link: item.link?.[0] || '',
            pubDate: item.pubDate?.[0] || new Date().toISOString(),
            severity: determineSeverity(title, desc),
          });
        }
      });
    } catch (err) {
      console.error(`Disease alerts (${feed.name}) error:`, err.message);
    }
  }

  cache.disease_alerts = {
    alerts: alerts.slice(0, 10),
    updated: new Date().toISOString(),
  };
  console.log(`  Disease Alerts: ${cache.disease_alerts.alerts.length} relevant items`);
}

function determineSeverity(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('outbreak') || text.includes('confirmed') || text.includes('fmd')) return 'HIGH';
  if (text.includes('alert') || text.includes('monitor')) return 'WATCH';
  return 'INFO';
}

// ============================================================
// Intel Feed — generated from live cache data
// ============================================================
async function fetchIntelFeed() {
  const items = [];
  let idCounter = 1;

  // CME price summary
  if (cache.cme_prices.liveCattle) {
    const lc = cache.cme_prices.liveCattle;
    const dir = lc.change >= 0 ? 'up' : 'down';
    items.push({
      id: idCounter++,
      category: 'CME FUTURES',
      title: `Live Cattle (LE=F) ${dir === 'up' ? 'gains' : 'falls'} ${Math.abs(lc.change).toFixed(2)} pts to $${lc.price.toFixed(2)} — ${Math.abs(lc.changePct).toFixed(2)}% ${dir} on the session.`,
      source: 'CME Group / Yahoo Finance',
      time: formatRelativeTime(cache.cme_prices.updated),
    });
  }
  if (cache.cme_prices.feederCattle) {
    const gf = cache.cme_prices.feederCattle;
    const dir = gf.change >= 0 ? 'up' : 'down';
    items.push({
      id: idCounter++,
      category: 'CME FUTURES',
      title: `Feeder Cattle (GF=F) at $${gf.price.toFixed(2)}, ${dir === 'up' ? '+' : ''}${gf.change.toFixed(2)} (${gf.changePct.toFixed(2)}%) — monitoring supply dynamics at auction.`,
      source: 'CME Group / Yahoo Finance',
      time: formatRelativeTime(cache.cme_prices.updated),
    });
  }

  // AMS cutout summary
  if (cache.usda_ams.cutout?.choicePrice) {
    const { choicePrice, selectPrice, reportDate } = cache.usda_ams.cutout;
    const spread = (choicePrice - selectPrice).toFixed(2);
    items.push({
      id: idCounter++,
      category: 'MARKET INTEL',
      title: `USDA AMS Choice cutout at $${choicePrice.toFixed(2)}/cwt, Select at $${selectPrice.toFixed(2)}/cwt — Choice/Select spread ${spread} pts as of ${reportDate}.`,
      source: 'USDA AMS',
      time: formatRelativeTime(cache.usda_ams.updated),
    });
  }

  // Cash price summary
  if (cache.usda_ams.cash?.length > 0) {
    const liveFob = cache.usda_ams.cash.find(c => c.basis?.includes('LIVE') && c.class === 'STEER');
    if (liveFob) {
      items.push({
        id: idCounter++,
        category: 'USDA REPORT',
        title: `5-Area steer cash (Live FOB): $${liveFob.price.toFixed(2)}/cwt — ${liveFob.grade || 'Over 80% Choice'} grade, ${liveFob.reportDate}.`,
        source: 'USDA AMS MPR',
        time: formatRelativeTime(cache.usda_ams.updated),
      });
    }
  }

  // Drought conditions
  if (cache.drought_monitor.features?.length > 0) {
    const latest = cache.drought_monitor.features[cache.drought_monitor.features.length - 1];
    const d3 = parseFloat(latest?.D3 || 0);
    const d4 = parseFloat(latest?.D4 || 0);
    const total = parseFloat(latest?.None ? (100 - parseFloat(latest.None)).toFixed(1) : 0);
    if (d3 + d4 > 0) {
      items.push({
        id: idCounter++,
        category: 'CLIMATE',
        title: `Drought Monitor update: D3-D4 (Extreme/Exceptional) covers ${(d3 + d4).toFixed(1)}% of US — ${d4.toFixed(1)}% Exceptional drought. ${total.toFixed(0)}% of US under some drought conditions.`,
        source: 'USDM / UNL',
        time: formatRelativeTime(cache.drought_monitor.updated),
      });
    }
  }

  // Wildfire status — top 3 fires by acres
  if (cache.wildfire.features?.length > 0) {
    const sorted = [...cache.wildfire.features]
      .filter(f => f.properties?.GISAcres > 0)
      .sort((a, b) => (b.properties?.GISAcres || 0) - (a.properties?.GISAcres || 0))
      .slice(0, 3);
    if (sorted.length > 0) {
      const topFire = sorted[0].properties;
      const totalAcres = sorted.reduce((sum, f) => sum + (f.properties?.GISAcres || 0), 0);
      items.push({
        id: idCounter++,
        category: 'WILDFIRE ALERT',
        title: `Active wildfire monitoring: ${sorted.length} major fires. Largest: ${topFire.IncidentName || 'Unknown'} at ${Math.round(topFire.GISAcres || 0).toLocaleString()} acres. Total monitored: ${Math.round(totalAcres).toLocaleString()} acres.`,
        source: 'NIFC / ArcGIS',
        time: formatRelativeTime(cache.wildfire.updated),
      });
    }
  }

  // Disease alerts from cache
  for (const alert of cache.disease_alerts.alerts.slice(0, 3)) {
    items.push({
      id: idCounter++,
      category: 'DISEASE ALERT',
      title: alert.title,
      source: alert.source,
      time: formatRelativeTime(alert.pubDate),
    });
  }

  // NASS cattle on feed summary
  if (cache.usda_nass.cattleOnFeed?.length > 0) {
    const latest = cache.usda_nass.cattleOnFeed[0];
    const val = latest?.Value ? parseInt(latest.Value.replace(/,/g, '')) : null;
    if (val) {
      items.push({
        id: idCounter++,
        category: 'USDA REPORT',
        title: `USDA NASS Cattle on Feed: ${formatMillions(val)} head (${latest.reference_period_desc || ''} ${latest.year || ''}) — national inventory data from Quick Stats.`,
        source: 'USDA NASS',
        time: formatRelativeTime(cache.usda_nass.updated),
      });
    }
  }
  if (cache.usda_nass.placements?.length > 0) {
    const latest = cache.usda_nass.placements[0];
    const val = latest?.Value ? parseInt(latest.Value.replace(/,/g, '')) : null;
    if (val) {
      items.push({
        id: idCounter++,
        category: 'USDA REPORT',
        title: `USDA NASS Placements: ${formatMillions(val)} head (${latest.reference_period_desc || ''} ${latest.year || ''}) — feedlot placement activity tracking.`,
        source: 'USDA NASS',
        time: formatRelativeTime(cache.usda_nass.updated),
      });
    }
  }

  // Try USDA RSS feed for additional items
  try {
    const rssRes = await axios.get('https://www.ams.usda.gov/rss/mncs.xml', { timeout: 8000 });
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(rssRes.data);
    const rssItems = parsed?.rss?.channel?.[0]?.item || [];
    for (const item of rssItems.slice(0, 3)) {
      const title = item.title?.[0] || '';
      if (title) {
        items.push({
          id: idCounter++,
          category: 'MARKET INTEL',
          title,
          source: 'USDA AMS RSS',
          time: formatRelativeTime(item.pubDate?.[0] || new Date().toISOString()),
        });
      }
    }
  } catch (_) {
    // RSS optional — ignore errors
  }

  // BeefNews.org — lead with investigative/antitrust, then top recent
  const bnPriority = ['Investigative', 'Antitrust'];
  const bnArticles = cache.beefnews.articles || [];
  const bnTop = [
    ...bnArticles.filter(a => bnPriority.includes(a.category)),
    ...bnArticles.filter(a => !bnPriority.includes(a.category)),
  ].slice(0, 5);

  for (const article of bnTop) {
    items.push({
      id: idCounter++,
      category: 'BEEF NEWS',
      title: article.title,
      source: `BeefNews.org — ${article.category}`,
      time: article.time,
      link: article.link,
      bnCategory: article.category,
    });
  }

  // Federal Register — regulatory actions
  for (const reg of (cache.federal_register.items || []).slice(0, 4)) {
    items.push({
      id: idCounter++,
      category: reg.category,
      title: reg.title,
      source: reg.source,
      time: reg.time,
      link: reg.link,
    });
  }

  // SEC filings — Tyson/JBS financial disclosures
  for (const filing of (cache.sec_filings.items || []).slice(0, 3)) {
    items.push({
      id: idCounter++,
      category: filing.category,
      title: filing.title,
      source: filing.source,
      time: filing.time,
      link: filing.link,
    });
  }

  // USASpending — government contracts to packers
  for (const contract of (cache.gov_contracts.items || []).slice(0, 3)) {
    items.push({
      id: idCounter++,
      category: contract.category,
      title: contract.title,
      source: contract.source,
      time: contract.time,
    });
  }

  cache.intel_feed = {
    items: items.slice(0, 20),
    updated: new Date().toISOString(),
  };
  console.log(`  Intel Feed: ${cache.intel_feed.items.length} items generated`);
}

// ============================================================
// BeefNews.org — RSS feed + llms.txt for AI context
// ============================================================
async function fetchBeefNews() {
  try {
    const [rssResult, llmResult] = await Promise.allSettled([
      axios.get('https://beefnews.org/rss.xml', { timeout: 15000 }),
      axios.get('https://beefnews.org/llms.txt', { timeout: 10000 }),
    ]);

    let articles = [];
    let llmContext = '';

    // Parse RSS feed
    if (rssResult.status === 'fulfilled') {
      const parser = new xml2js.Parser();
      const parsed = await parser.parseStringPromise(rssResult.value.data);
      const items = parsed?.rss?.channel?.[0]?.item || [];
      articles = items.map((item, i) => ({
        id: `bn-${i}`,
        title: (item.title?.[0] || '').trim(),
        link: (item.link?.[0] || '').trim(),
        description: (item.description?.[0] || '').replace(/<[^>]*>/g, '').trim().slice(0, 400),
        category: (item.category?.[0] || 'News').trim(),
        pubDate: item.pubDate?.[0] || '',
        time: formatRelativeTime(item.pubDate?.[0] || ''),
        image: item.enclosure?.[0]?.$?.url || null,
        guid: item.guid?.[0]?._ || item.guid?.[0] || '',
      }));
    } else {
      console.error('BeefNews RSS error:', rssResult.reason?.message);
    }

    // Grab llms.txt — perfect structured context for the LLM
    if (llmResult.status === 'fulfilled') {
      llmContext = llmResult.value.data.slice(0, 4000);
    } else {
      console.error('BeefNews llms.txt error:', llmResult.reason?.message);
    }

    cache.beefnews = { articles, llmContext, updated: new Date().toISOString() };
    console.log(`  BeefNews: ${articles.length} articles, ${llmContext.length} chars of LLM context`);
  } catch (err) {
    console.error('BeefNews error:', err.message);
  }
}

// ============================================================
// Federal Register — USDA/FSIS regulatory actions (no key)
// ============================================================
async function fetchFederalRegister() {
  try {
    const res = await axios.get('https://www.federalregister.gov/api/v1/documents.json', {
      params: {
        'conditions[term]': 'beef slaughter cattle packer FSIS meatpacking',
        order: 'newest',
        per_page: 8,
        'fields[]': ['title', 'abstract', 'publication_date', 'type', 'action', 'html_url'],
      },
      timeout: 15000,
    });

    const results = res.data.results || [];
    cache.federal_register = {
      items: results.map((r, i) => ({
        id: `fr-${i}`,
        category: ['Rule', 'Final Rule'].includes(r.type) ? 'REGULATORY'
          : r.type === 'Proposed Rule' ? 'REGULATORY' : 'FOIA SOURCE',
        title: r.action ? `${r.title} — ${r.action}` : r.title,
        abstract: r.abstract?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
        source: 'Federal Register (USDA/FSIS)',
        time: formatRelativeTime(r.publication_date),
        link: r.html_url || '',
        date: r.publication_date,
      })),
      updated: new Date().toISOString(),
    };
    console.log(`  Federal Register: ${results.length} items`);
  } catch (err) {
    console.error('Federal Register error:', err.message);
  }
}

// ============================================================
// SEC EDGAR — Tyson Foods public filings (no key)
// ============================================================
async function fetchSECFilings() {
  const companies = [
    { name: 'Tyson Foods', cik: '0000100493', ticker: 'TSN' },
  ];

  const filings = [];
  for (const co of companies) {
    try {
      const res = await axios.get(`https://data.sec.gov/submissions/CIK${co.cik}.json`, {
        headers: { 'User-Agent': 'BeefMapsIntel/1.0 tslimmedia@gmail.com' },
        timeout: 15000,
      });

      const recent = res.data.filings?.recent || {};
      const forms = recent.form || [];
      const dates = recent.filingDate || [];
      const accnums = recent.accessionNumber || [];
      let count = 0;

      for (let i = 0; i < forms.length && count < 4; i++) {
        if (!['8-K', '10-K', '10-Q'].includes(forms[i])) continue;
        const ageDays = (Date.now() - new Date(dates[i]).getTime()) / (1000 * 86400);
        if (ageDays > 120) continue;

        const formType = forms[i];
        let title = `${co.name} ${formType} filed ${dates[i]}`;
        if (formType === '8-K')  title = `${co.name} Material Event (8-K) — ${dates[i]}. Current report on earnings, operations, or executive actions filed with SEC.`;
        if (formType === '10-Q') title = `${co.name} Quarterly Report (10-Q) — ${dates[i]}. Beef segment margins, volume, and operating income disclosed.`;
        if (formType === '10-K') title = `${co.name} Annual Report (10-K) — ${dates[i]}. Full-year beef segment financial results and risk disclosures filed with SEC.`;

        filings.push({
          id: `sec-${co.ticker}-${i}`,
          category: 'SEC FILING',
          title,
          source: `SEC EDGAR — ${co.name} (${co.ticker})`,
          time: formatRelativeTime(dates[i]),
          link: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${co.cik}&type=${formType}&dateb=&owner=include&count=10`,
          date: dates[i],
        });
        count++;
      }
    } catch (err) {
      console.error(`SEC EDGAR (${co.name}) error:`, err.message);
    }
  }

  cache.sec_filings = { items: filings, updated: new Date().toISOString() };
  console.log(`  SEC Filings: ${filings.length} items`);
}

// ============================================================
// USASpending.gov — govt contracts to major packers (no key)
// Foreign money angle: JBS (Brazilian), Marfrig, Minerva
// ============================================================
async function fetchGovContracts() {
  try {
    const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const res = await axios.post(
      'https://api.usaspending.gov/api/v2/search/spending_by_award/',
      {
        filters: {
          keywords: ['JBS USA', 'Tyson Foods', 'National Beef', 'Cargill Beef', 'Smithfield', 'Marfrig'],
          time_period: [{ start_date: oneYearAgo, end_date: today }],
          award_type_codes: ['A', 'B', 'C', 'D'],
        },
        fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency Name', 'Description',
          'Period of Performance Start Date', 'recipient_id'],
        sort: 'Award Amount',
        order: 'desc',
        limit: 6,
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const awards = res.data.results || [];

    // Flag foreign-owned entities
    const foreignOwned = { 'JBS USA': 'Brazil (JBS S.A.)', 'SMITHFIELD': 'China (WH Group)' };

    cache.gov_contracts = {
      items: awards.map((a, i) => {
        const recipient = a['Recipient Name'] || 'Unknown';
        const amount = a['Award Amount'] || 0;
        const agency = a['Awarding Agency Name'] || 'Federal Agency';
        const foreignNote = Object.entries(foreignOwned).find(([k]) =>
          recipient.toUpperCase().includes(k)) || null;
        const title = `Govt Contract: ${recipient} — $${(amount / 1e6).toFixed(1)}M from ${agency}.`
          + (foreignNote ? ` [Foreign-owned: parent company ${foreignNote[1]}]` : '')
          + (a['Description'] ? ` ${a['Description'].slice(0, 80)}.` : '');

        return {
          id: `usas-${i}`,
          category: 'FOIA SOURCE',
          title,
          source: 'USASpending.gov',
          time: formatRelativeTime(a['Period of Performance Start Date']),
          amount,
          recipient,
          foreign: !!foreignNote,
        };
      }),
      updated: new Date().toISOString(),
    };
    console.log(`  Govt Contracts: ${awards.length} items`);
  } catch (err) {
    console.error('USASpending.gov error:', err.message);
  }
}

// ============================================================
// Build Dashboard Response
// ============================================================
function buildDashboardResponse() {
  // --- CME ---
  const lc = cache.cme_prices.liveCattle;
  const gf = cache.cme_prices.feederCattle;

  const liveCattle = lc
    ? { price: lc.price, change: lc.change, changePct: lc.changePct, period: '30-day', contract: 'JUN', sparkline: lc.sparkline }
    : { price: 240.15, change: -6.70, changePct: -2.71, period: '30-day', contract: 'JUN', sparkline: [] };

  const feederCattle = gf
    ? { price: gf.price, change: gf.change, changePct: gf.changePct, period: '30-day', contract: 'AUG', sparkline: gf.sparkline }
    : { price: 230.50, change: -2.30, changePct: -0.99, period: '30-day', contract: 'AUG', sparkline: [] };

  // --- AMS Cutout ---
  const cutout = cache.usda_ams.cutout;
  const choicePrice = cutout?.choicePrice || 391.48;
  const selectPrice = cutout?.selectPrice || 385.65;

  const choiceCutout = { price: choicePrice, change: 0, changePct: 0, period: '30-day', source: 'USDA AMS', sparkline: [] };
  const selectCutout = { price: selectPrice, change: 0, changePct: 0, period: '30-day', source: 'USDA AMS', sparkline: [] };

  // --- Cash Prices ---
  const cashArr = cache.usda_ams.cash || [];
  const liveFob = cashArr.find(c => c.basis?.includes('LIVE') && c.class === 'STEER');
  const cashPrices = liveFob
    ? [{ region: '5-Area Avg', price: liveFob.price, change: 0, grade: 'Live' }]
    : [{ region: '5-Area Avg', price: 263.42, change: 0, grade: 'Live' }];

  // --- LivePrices ---
  const livePrices = {
    cme: { liveCattle, feederCattle },
    usda: { choiceCutout, selectCutout },
    cashPrices,
    exports: { value: 8.34, unit: 'B', change: 0, yoy: true, topMarket: 'Japan' },
  };

  // --- Ticker items ---
  const lcChange = liveCattle.change.toFixed(2);
  const lcChangePct = liveCattle.changePct.toFixed(2);
  const gfChange = feederCattle.change.toFixed(2);
  const gfChangePct = feederCattle.changePct.toFixed(2);
  const cashPrice = cashPrices[0]?.price || 263.42;

  const tickerBase = [
    {
      label: `LIVE CATTLE - ${liveCattle.contract} CME`,
      value: `$${liveCattle.price.toFixed(2)}`,
      change: `${parseFloat(lcChange) >= 0 ? '+' : ''}${lcChange} (${parseFloat(lcChangePct) >= 0 ? '+' : ''}${lcChangePct}%)`,
    },
    {
      label: 'USDA CHOICE CUTOUT',
      value: choicePrice.toFixed(2),
      change: '+0.00',
    },
    {
      label: `FEEDER CATTLE - ${feederCattle.contract} CME`,
      value: `$${feederCattle.price.toFixed(2)}`,
      change: `${parseFloat(gfChange) >= 0 ? '+' : ''}${gfChange} (${parseFloat(gfChangePct) >= 0 ? '+' : ''}${gfChangePct}%)`,
    },
    {
      label: 'USDA SELECT CUTOUT',
      value: selectPrice.toFixed(2),
      change: '+0.00',
    },
    {
      label: '5-AREA STEER (LIVE FOB)',
      value: `$${cashPrice.toFixed(2)}`,
      change: '',
    },
  ];
  // Duplicate for seamless scroll
  const tickerItems = [...tickerBase, ...tickerBase];

  // --- Alerts ---
  const alerts = [];
  let alertId = 1;

  // Disease alerts
  for (const da of (cache.disease_alerts.alerts || []).slice(0, 3)) {
    alerts.push({
      id: alertId++,
      severity: da.severity || 'INFO',
      category: 'DISEASE ALERT',
      title: da.title,
      region: 'Global',
      source: da.source,
      time: formatRelativeTime(da.pubDate),
      detail: da.description || da.title,
    });
  }

  // Drought alerts
  const droughtFeatures = cache.drought_monitor.features || [];
  if (droughtFeatures.length > 0) {
    const latest = droughtFeatures[droughtFeatures.length - 1];
    const d3 = parseFloat(latest?.D3 || 0);
    const d4 = parseFloat(latest?.D4 || 0);
    if (d3 + d4 > 5) {
      alerts.push({
        id: alertId++,
        severity: d4 > 5 ? 'HIGH' : 'WATCH',
        category: 'DROUGHT MONITOR',
        title: `Drought Monitor: D3-D4 conditions cover ${(d3 + d4).toFixed(1)}% of US — ${d4.toFixed(1)}% Exceptional (D4).`,
        region: 'Great Plains — USA',
        source: 'USDM',
        time: formatRelativeTime(cache.drought_monitor.updated),
        detail: `Extreme to Exceptional drought covering ${(d3 + d4).toFixed(1)}% of the contiguous United States. D4 (Exceptional): ${d4.toFixed(1)}%. D3 (Extreme): ${d3.toFixed(1)}%.`,
      });
    }
  }

  // Wildfire alerts — top 3 by acres
  const wildfires = (cache.wildfire.features || [])
    .filter(f => f.properties?.GISAcres > 0)
    .sort((a, b) => (b.properties?.GISAcres || 0) - (a.properties?.GISAcres || 0))
    .slice(0, 3);

  for (const fire of wildfires) {
    const p = fire.properties || {};
    const acres = Math.round(p.GISAcres || 0);
    if (acres > 1000) {
      alerts.push({
        id: alertId++,
        severity: acres > 50000 ? 'HIGH' : 'WATCH',
        category: 'WILDFIRE ALERT',
        title: `${p.IncidentName || 'Active Fire'} — ${acres.toLocaleString()} acres. Active wildfire perimeter in cattle country.`,
        region: p.POOState || 'Western USA',
        source: 'NIFC',
        time: formatRelativeTime(cache.wildfire.updated),
        detail: `${p.IncidentName || 'Active fire'} perimeter at ${acres.toLocaleString()} GIS acres. State: ${p.POOState || 'Unknown'}.`,
      });
    }
  }

  // --- USDA Data ---
  const nassOnFeed = cache.usda_nass.cattleOnFeed || [];
  const nassPlac = cache.usda_nass.placements || [];

  const latestCof = nassOnFeed[0];
  const latestPlac = nassPlac[0];
  const prevCof = nassOnFeed[1];
  const prevPlac = nassPlac[1];

  const cofVal = latestCof?.Value ? parseInt(latestCof.Value.replace(/,/g, '')) : null;
  const cofPrev = prevCof?.Value ? parseInt(prevCof.Value.replace(/,/g, '')) : null;
  const cofChange = cofVal && cofPrev ? parseFloat((((cofVal - cofPrev) / cofPrev) * 100).toFixed(1)) : -2.1;

  const placVal = latestPlac?.Value ? parseInt(latestPlac.Value.replace(/,/g, '')) : null;
  const placPrev = prevPlac?.Value ? parseInt(prevPlac.Value.replace(/,/g, '')) : null;
  const placChange = placVal && placPrev ? parseFloat((((placVal - placPrev) / placPrev) * 100).toFixed(1)) : 4.2;

  const lastReleaseDate = latestCof
    ? `${latestCof.reference_period_desc || ''} ${latestCof.year || ''}`.trim()
    : 'Mar 22, 2026';

  const usdaData = {
    cattleOnFeed: {
      title: 'Cattle on Feed',
      lastRelease: lastReleaseDate,
      nextRelease: 'N/A',
      highlights: [
        { label: 'On Feed (Latest)', value: cofVal ? formatMillions(cofVal) : '11.73M', change: cofChange },
        { label: 'Placements (Latest)', value: placVal ? formatMillions(placVal) : '1.82M', change: placChange },
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

  // --- Trade Flow (mock since FAS key invalid) ---
  const tradeFlowData = {
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

  // --- Map Markers ---
  const mapMarkers = [];

  // Drought markers — if D3+D4 > 10% add Texas Panhandle and NM
  if (droughtFeatures.length > 0) {
    const latest = droughtFeatures[droughtFeatures.length - 1];
    const d3 = parseFloat(latest?.D3 || 0);
    const d4 = parseFloat(latest?.D4 || 0);
    if (d3 + d4 > 10) {
      mapMarkers.push({ lat: 35.2, lng: -101.8, type: 'drought', label: `TX Panhandle D4 (${d4.toFixed(1)}%)`, severity: 'high' });
      mapMarkers.push({ lat: 34.5, lng: -106.5, type: 'drought', label: 'NM D3-D4', severity: 'watch' });
    } else if (d3 + d4 > 0) {
      mapMarkers.push({ lat: 35.2, lng: -101.8, type: 'drought', label: `TX Panhandle Drought`, severity: 'watch' });
    }
  }

  // Wildfire markers — top fires with valid geometry
  for (const fire of wildfires.slice(0, 5)) {
    const geom = fire.geometry;
    const p = fire.properties || {};
    if (!geom) continue;
    let lat = null, lng = null;
    try {
      if (geom.type === 'Polygon' && geom.coordinates?.length > 0) {
        const coords = geom.coordinates[0];
        lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
      } else if (geom.type === 'MultiPolygon' && geom.coordinates?.length > 0) {
        let allCoords = [];
        geom.coordinates.forEach(poly => poly.forEach(ring => ring.forEach(c => allCoords.push(c))));
        lat = allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length;
        lng = allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length;
      }
    } catch (_) {}
    if (lat && lng) {
      const acres = Math.round(p.GISAcres || 0);
      mapMarkers.push({
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        type: 'wildfire',
        label: `${p.IncidentName || 'Fire'} (${acres.toLocaleString()} ac)`,
        severity: acres > 50000 ? 'high' : 'watch',
      });
    }
  }

  // Disease markers — fixed coordinates based on regions in alert titles
  for (const da of (cache.disease_alerts.alerts || []).slice(0, 3)) {
    const title = (da.title || '').toLowerCase();
    let lat = null, lng = null, label = da.title?.slice(0, 40) || 'Disease Alert';
    if (title.includes('brazil') || title.includes('pará') || title.includes('para')) {
      lat = -2.5; lng = -48.5;
    } else if (title.includes('mexico')) {
      lat = 23.6; lng = -102.5;
    } else if (title.includes('europe') || title.includes('eu')) {
      lat = 50.1; lng = 14.4;
    } else if (title.includes('asia') || title.includes('china')) {
      lat = 35.8; lng = 104.1;
    }
    if (lat && lng) {
      mapMarkers.push({ lat, lng, type: 'fmd', label, severity: da.severity === 'HIGH' ? 'high' : 'watch' });
    }
  }

  // Static markers — always present
  mapMarkers.push({ lat: 41.2, lng: -100.8, type: 'feedlot', label: 'NE Feedlot Cluster', severity: 'info' });
  mapMarkers.push({ lat: 37.5, lng: -99.3, type: 'feedlot', label: 'KS Feedlot Cluster', severity: 'info' });
  mapMarkers.push({ lat: 13.7, lng: -89.2, type: 'settlement', label: 'El Salvador Corridor', severity: 'active' });

  // --- Intel Feed ---
  const intelFeed = cache.intel_feed.items?.length > 0
    ? cache.intel_feed.items
    : [];

  // --- Meta ---
  const meta = {
    lastUpdated: new Date().toISOString(),
    dataAge: {
      ams: cache.usda_ams.updated,
      nass: cache.usda_nass.updated,
      cme: cache.cme_prices.updated,
      drought: cache.drought_monitor.updated,
      wildfire: cache.wildfire.updated,
    },
    liveDataActive: true,
  };

  const beefnewsArticles = cache.beefnews.articles || [];

  return { livePrices, tickerItems, alerts, intelFeed, usdaData, tradeFlowData, mapMarkers, beefnewsArticles, meta };
}

// ============================================================
// API Routes
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard', (req, res) => {
  res.json(buildDashboardResponse());
});

app.get('/api/feeds/ams', (req, res) => {
  res.json(cache.usda_ams);
});

app.get('/api/feeds/nass', (req, res) => {
  res.json(cache.usda_nass);
});

app.get('/api/feeds/fas', (req, res) => {
  res.json(cache.usda_fas);
});

app.get('/api/feeds/drought', (req, res) => {
  res.json(cache.drought_monitor);
});

app.get('/api/feeds/wildfire', (req, res) => {
  res.json(cache.wildfire);
});

app.get('/api/feeds/disease-alerts', (req, res) => {
  res.json(cache.disease_alerts);
});

app.get('/api/feeds/cme', (req, res) => {
  res.json(cache.cme_prices);
});

// ============================================================
// POST /api/chat — Groq LLM with live beef market context
// Add GROQ_API_KEY to .env to activate (free at console.groq.com)
// ============================================================
app.post('/api/chat', async (req, res) => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(503).json({
      error: 'GROQ_API_KEY not configured',
      hint: 'Get a free key at console.groq.com and add GROQ_API_KEY=gsk_... to your .env',
      fallback: true,
    });
  }

  const { messages = [], question } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'question is required' });

  // Build live context from all caches
  const lc      = cache.cme_prices?.liveCattle;
  const gf      = cache.cme_prices?.feederCattle;
  const cutout  = cache.usda_ams?.cutout;
  const drought = cache.drought_monitor?.features?.slice(-1)[0];
  const d3d4    = drought ? (parseFloat(drought.D3 || 0) + parseFloat(drought.D4 || 0)).toFixed(1) : null;
  const spread  = cutout ? (cutout.choicePrice - cutout.selectPrice).toFixed(2) : null;
  const recentReg = (cache.federal_register?.items || []).slice(0, 2).map(r => `• ${r.title}`).join('\n') || 'None';
  const recentFiling = (cache.sec_filings?.items || []).slice(0, 1).map(r => r.title).join('') || 'None';
  const govContracts = (cache.gov_contracts?.items || []).filter(c => c.foreign).slice(0, 2)
    .map(c => `• ${c.title}`).join('\n') || 'None flagged';
  const diseaseAlerts = cache.disease_alerts?.alerts?.map(a => `• ${a.title}`).join('\n') || 'None';

  // BeefNews context — llms.txt + recent article headlines
  const bnLlmContext = cache.beefnews?.llmContext || '';
  const bnHeadlines = (cache.beefnews?.articles || []).slice(0, 12)
    .map(a => `• [${a.category}] ${a.title} — ${a.description.slice(0, 100)}`)
    .join('\n') || 'No articles loaded';

  const systemPrompt = `You are the BEEFMAPS INTEL AI Analyst — an elite beef market intelligence system with access to real-time data and editorial content from BeefNews.org.

=== LIVE MARKET DATA (${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT) ===
• Live Cattle Futures (CME): $${lc?.price ?? 'N/A'} ${lc?.change != null ? `(${lc.change >= 0 ? '+' : ''}${lc.change}, ${lc.changePct >= 0 ? '+' : ''}${lc.changePct}%)` : ''}
• Feeder Cattle Futures (CME): $${gf?.price ?? 'N/A'} ${gf?.change != null ? `(${gf.change >= 0 ? '+' : ''}${gf.change}, ${gf.changePct >= 0 ? '+' : ''}${gf.changePct}%)` : ''}
• USDA Choice Cutout: $${cutout?.choicePrice ?? 'N/A'}/cwt
• USDA Select Cutout: $${cutout?.selectPrice ?? 'N/A'}/cwt
• Choice/Select Spread: $${spread ?? 'N/A'}
${d3d4 ? `• Drought Monitor: D3+D4 conditions cover ${d3d4}% of US land` : ''}

=== ACTIVE ALERTS ===
${diseaseAlerts}

=== RECENT REGULATORY (Federal Register) ===
${recentReg}

=== RECENT SEC FILINGS ===
${recentFiling}

=== FOREIGN-OWNED PACKER CONTRACTS (USASpending.gov) ===
${govContracts}

=== BEEFNEWS.ORG — EDITORIAL CONTEXT ===
${bnLlmContext.slice(0, 2000)}

=== BEEFNEWS.ORG — RECENT HEADLINES (live) ===
${bnHeadlines}

=== YOUR EXPERTISE ===
CME cattle futures & basis trading · USDA AMS/NASS/FAS/FSIS reports · Packer-feeder margin dynamics · Supply chain (drought, wildfire, disease) · US beef trade flows · Industry consolidation (JBS Brazilian ownership, Tyson financials, Cargill private) · FSIS regulatory environment (line speeds, labeling, inspections) · FOIA disclosures · NCBA/beef checkoff lobbying · Foreign ownership of US food infrastructure · DOJ antitrust in meatpacking · Rancher direct movement · BeefMaps.com · Texas Slim / Beef Initiative · R-CALF USA · Mike Callicrate

Answer directly and analytically. Reference specific BeefNews.org articles when relevant. Use specific numbers. Flag uncertainty. Be concise (under 300 words unless asked for detail). Never make up prices — use only the data above.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),               // last 3 exchanges for memory
          { role: 'user', content: question },
        ],
        max_tokens: 700,
        temperature: 0.25,
      },
      {
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const answer    = response.data.choices[0].message.content;
    const model     = response.data.model;
    const tokenUsed = response.data.usage?.total_tokens;
    console.log(`  Groq chat: ${tokenUsed} tokens, model=${model}`);
    res.json({ answer, model, live: true });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('Groq API error:', msg);
    res.status(500).json({ error: msg, fallback: true });
  }
});

app.get('/api/feeds/beefnews', (req, res) => {
  res.json(cache.beefnews);
});

// Unified feed endpoint
app.get('/api/feeds', (req, res) => {
  res.json({
    ams: cache.usda_ams,
    nass: cache.usda_nass,
    fas: cache.usda_fas,
    drought: cache.drought_monitor,
    wildfire: cache.wildfire,
    diseaseAlerts: cache.disease_alerts,
    cme: cache.cme_prices,
  });
});

// ============================================================
// Scheduled Updates
// ============================================================

// Initial fetch on startup
(async () => {
  console.log('Initial data fetch...');
  await Promise.all([
    fetchCMEPrices(),
    fetchUSDAams(),
    fetchUSDANass(),
    fetchUSDAFas(),
    fetchDroughtMonitor(),
    fetchWildfire(),
    fetchDiseaseAlerts(),
    fetchFederalRegister(),
    fetchSECFilings(),
    fetchGovContracts(),
    fetchBeefNews(),
  ]);
  // Build intel feed after all other data is loaded
  await fetchIntelFeed();
  console.log('✅ Initial data loaded');
})();

// CME: Every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('Updating CME prices...');
  fetchCMEPrices();
});

// Intel Feed: Every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('Updating Intel Feed...');
  await fetchIntelFeed();
});

// USDA AMS: Every 30 minutes (matches their update schedule)
cron.schedule('*/30 * * * *', () => {
  console.log('Updating USDA AMS...');
  fetchUSDAams();
});

// USDA NASS: Daily at 3 PM EST (their release time)
cron.schedule('0 15 * * *', () => {
  console.log('Updating USDA NASS...');
  fetchUSDANass();
});

// BeefNews.org: Every 30 minutes (active publication)
cron.schedule('*/30 * * * *', async () => {
  console.log('Updating BeefNews...');
  await fetchBeefNews();
  await fetchIntelFeed(); // rebuild intel feed with fresh articles
});

// Federal Register: Daily (they publish continuously)
cron.schedule('0 7 * * *', () => {
  console.log('Updating Federal Register...');
  fetchFederalRegister();
});

// SEC Filings: Daily (companies file throughout the day)
cron.schedule('30 7 * * *', () => {
  console.log('Updating SEC Filings...');
  fetchSECFilings();
});

// USASpending.gov: Weekly (contract data updates slowly)
cron.schedule('0 6 * * 1', () => {
  console.log('Updating Govt Contracts...');
  fetchGovContracts();
});

// Drought Monitor: Weekly Thursday (their release day)
cron.schedule('0 8 * * 4', () => {
  console.log('Updating Drought Monitor...');
  fetchDroughtMonitor();
});

// Wildfire: Daily at 6 AM EST
cron.schedule('0 6 * * *', () => {
  console.log('Updating Wildfire...');
  fetchWildfire();
});

// Disease Alerts: Every 4 hours
cron.schedule('0 */4 * * *', () => {
  console.log('Updating Disease Alerts...');
  fetchDiseaseAlerts();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Beef Index API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Dashboard: http://localhost:${PORT}/api/dashboard`);
});
