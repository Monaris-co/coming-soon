# Monaris Coming Soon

Standalone coming-soon page for Monaris. Deploy to Vercel as a separate project.

## Deploy to Vercel

1. **From this repo:** In Vercel, create a new project and set **Root Directory** to `coming-soon`.

2. **As separate repo:** Copy the `coming-soon` folder to its own repo and deploy.

## Setup

```bash
cd coming-soon
npm install
```

## Env vars (Vercel)

Add these in your Vercel project settings:

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – your Supabase anon key

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`.
