# Monaris Coming Soon

Standalone coming-soon landing page with waitlist. Ready for Vercel deployment.

## Deploy to Vercel

1. Import this repo: [github.com/Monaris-co/coming-soon](https://github.com/Monaris-co/coming-soon)
2. Vercel will auto-detect the Vite framework from `vercel.json`
3. Add environment variables in Vercel project settings (see below)
4. Deploy

## Supabase Setup

Run the waitlist migration in your Supabase project (SQL Editor or `supabase db push`):

```sql
-- See supabase/migrations/004_waitlist.sql
```

## Environment Variables (Vercel)

Add these in **Vercel → Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

## Build

```bash
npm run build
```

Output is in `dist/`.
