# Deploying the StockSense frontend (free, via Vercel)

Pairs with `stock-sense` deployed on Render. ~5 minutes start to
finish.

## 1. Make sure the backend is up first

Follow `stock-sense/DEPLOY.md` to land the backend on Render. Copy
its URL — you'll need it below. It'll look like
`https://stocksense-api.onrender.com`.

## 2. Import to Vercel

1. Sign in to https://vercel.com with GitHub.
2. **Add New → Project**.
3. Pick the `stock-sense-web` repository.
4. Framework preset is auto-detected as **Next.js** — accept the
   defaults. Build command (`pnpm build`), output directory
   (`.next`), and install command (`pnpm install`) are correct.

## 3. Environment variable

Before clicking Deploy, expand the **Environment Variables** section
and add:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://stocksense-api.onrender.com` (your actual Render URL) |

Set the scope to **Production** (and **Preview** if you want preview
deploys to also hit the prod backend; otherwise spin up a separate
preview backend).

Click **Deploy**. First build takes ~90 seconds.

## 4. Update the backend CORS list

Once Vercel gives you a URL (e.g. `https://stock-sense-web.vercel.app`):

1. Go back to Render → `stocksense-api` → Environment.
2. Add the Vercel URL to `BACKEND_CORS_ORIGINS` (comma-separated if
   you already have entries):
   ```
   https://stock-sense-web.vercel.app
   ```
3. Render auto-redeploys.

## 5. Verify

Visit your Vercel URL → log in with `joe@coffee.dev` / `joepass123`
(if you seeded the demo data on the backend). Walk through:

- Dashboard renders with KPI cards + chart + recent activity.
- Inventory page shows the 10 demo items.
- Ask StockSense returns a streamed natural-language answer.
- After 20 minutes of activity, the silent token refresh still
  works (no 401, no forced re-login). If this breaks, the
  `REFRESH_COOKIE_SECURE=true` flag on the backend isn't set —
  see the backend DEPLOY.md.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Failed to fetch` in the browser console | `NEXT_PUBLIC_API_URL` is wrong or backend is down | Open the URL directly + check `/api/health` |
| Login succeeds but next page request says 401 | CORS or refresh-cookie config | Confirm your Vercel URL is in `BACKEND_CORS_ORIGINS` and `REFRESH_COOKIE_SECURE=true` |
| First page load takes ~30s | Backend cold-started from Render free-tier sleep | Normal — subsequent requests are fast until next 15-min idle |
| Build fails with "Module not found: recharts" | pnpm install cached | Vercel → project → Settings → General → "Clear Build Cache and Redeploy" |

## What's NOT included here

- No custom domain — Vercel's `*.vercel.app` subdomain is enough for
  a portfolio deploy. Add a custom domain in Vercel → Settings →
  Domains when you're ready.
- No analytics or A/B testing.
- Auto-deploys on push to `main` are enabled by default — no
  manual config needed.
