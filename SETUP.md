# Setup Guide — Extractor de Ofertas

## Step 1 — Supabase (5 min)

1. Go to your Supabase project → SQL Editor
2. Paste the contents of `SUPABASE_SCHEMA.sql` and click Run
3. Go to Settings → API → copy your **Project URL** and **anon public** key

## Step 2 — Google Cloud Service Account (10 min)

1. Go to console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google Sheets API**: APIs & Services → Enable APIs → search "Google Sheets API" → Enable
4. Create credentials: APIs & Services → Credentials → Create Credentials → Service Account
   - Name: `ofertas-tesis`
   - Click Create → Done
5. Click the service account → Keys tab → Add Key → JSON → Download the file
6. Open the JSON file — you need `client_email` and `private_key`
7. Open your Google Sheet → Share → paste the `client_email` → give Editor access

## Step 3 — Anthropic API Key (2 min)

1. Go to console.anthropic.com → API Keys → Create Key → copy it

## Step 4 — GitHub Repo (3 min)

```bash
cd ofertas-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tutorenglishlm/ofertas-tesis.git
git push -u origin main
```

## Step 5 — Vercel Deploy (5 min)

1. Go to vercel.com → New Project → Import from GitHub → select `ofertas-tesis`
2. Framework: Next.js (auto-detected)
3. Before deploying, add these Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wongbsmmcspsmtwszkwg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key from Supabase |
| `ANTHROPIC_API_KEY` | your Anthropic key |
| `GOOGLE_SHEET_ID` | `1Dom2JIon3KDdm6IECQnM8XC81T52-IowLwid5Zcd01E` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | client_email from JSON file |
| `GOOGLE_PRIVATE_KEY` | private_key from JSON file (paste entire string including -----BEGIN...) |
| `NEXT_PUBLIC_APP_URL` | your Vercel URL (e.g. https://ofertas-tesis.vercel.app) |

4. Click Deploy — live in ~2 minutes

## How it works

- Paste job posting text → click EXTRAER → AI fills all fields
- Review fields (color-coded by confidence) → click GUARDAR + SYNC SHEETS
- Record saves to Supabase AND appends a row to your Google Sheet instantly
- If sync fails, click SYNC MANUAL in the log panel to retry
