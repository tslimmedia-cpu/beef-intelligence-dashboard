# BeefDeck — Vercel Deploy Instructions

Zero config. Takes about 3 minutes.

---

## What you need
- A free Vercel account: https://vercel.com/signup (sign up with GitHub, Google, or email)
- This folder (beefdeck-vercel)

---

## Option A — Deploy via Vercel CLI (fastest)

1. Install Vercel CLI (one time):
   ```
   npm install -g vercel
   ```

2. Open Terminal, navigate to this folder:
   ```
   cd /path/to/beefdeck-vercel
   ```

3. Run:
   ```
   vercel
   ```

4. Follow the prompts:
   - Log in / create account
   - "Set up and deploy?" → Y
   - "Which scope?" → your account
   - "Link to existing project?" → N
   - "Project name?" → beefdeck (or anything you want)
   - "In which directory is your code located?" → ./ (just press Enter)
   - "Want to override settings?" → N

5. Done. Vercel gives you a live URL like:
   https://beefdeck.vercel.app

---

## Option B — Deploy via Vercel Dashboard (no CLI)

1. Go to https://vercel.com/new
2. Click "Browse" or drag the beefdeck-vercel folder onto the upload area
3. Project name: beefdeck (or anything)
4. Framework preset: "Other"
5. Click "Deploy"
6. Done. Live in ~30 seconds.

---

## Custom domain (optional)

1. In Vercel dashboard → your project → Settings → Domains
2. Add your domain (e.g. beefdeck.beef.com)
3. Follow DNS instructions (add CNAME record at your registrar)

---

## Updating the dashboard

After first deploy, any future updates:

CLI:  cd beefdeck-vercel && vercel --prod
UI:   Drag updated folder to Vercel dashboard

---

## Files in this folder

- index.html     The full dashboard (mobile + desktop responsive)
- vercel.json    Routing + cache headers config

No build step. No Node modules. Vercel serves index.html directly.

---

## Next: wiring in live data

When you're ready to connect real APIs, the upgrade path is:

1. Add a /api/ folder with serverless functions (Vercel supports Node.js, Python)
2. Functions proxy to: CME/Barchart API, USDA AMS, NOAA drought monitor, ProMED RSS
3. Dashboard fetches from /api/prices, /api/alerts, etc.

This keeps your API keys server-side (never exposed in browser).
