# Deployment checklist

Architecture: **one** Next.js deployment serves the portfolio (`/`) and the API
(`/api/...`). No separate static host is needed — and none is recommended,
because the owner session uses an httpOnly `SameSite=Strict` cookie that only
works on a single origin.

## 1. Supabase (free tier)

1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql`.
   - creates `public.certificates`
   - enables RLS and revokes `anon` / `authenticated` access
   - creates the **private** `certificates` bucket (25 MB, pdf/jpg/png/webp)
3. Project Settings → API:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` secret → `SUPABASE_SECRET_KEY` (server only)

## 2. Local verification

```bash
cd idris-portfolio-backend
npm install
cp .env.example .env.local      # fill in the four values
npm run hash-password           # copy the OWNER_PASSWORD_HASH line (escape `$` as `\$`)
npm run build
npm start
```

Expected:

- `http://localhost:3000/` renders the portfolio
- `/api/test-supabase` → `{"success":true,...}`
- `/api/session` → `{"success":true,"authenticated":false}`
- `/api/upload/certificates/admin` → `401` without a session

## 3. Vercel (free Hobby plan)

1. Push `idris-portfolio-backend` to a GitHub repository.
2. Vercel → Add New Project → import that repository.
   - Framework preset: **Next.js**
   - Root directory: repository root
   - Build command: `npm run build` (default)
   - Install command: `npm install`
3. Project → Settings → Environment Variables (Production + Preview):

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_SECRET_KEY` | service_role key |
   | `AUTH_SECRET` | random string, 32+ chars (`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`) |
   | `OWNER_PASSWORD_HASH` | bcrypt hash, **raw** (no `\$` escaping) — or `OWNER_PASSWORD_HASH_B64` |

4. Deploy. Then:
   - open `/` → portfolio loads
   - `/api/test-supabase` → success
   - Owner Access → log in → upload a certificate → publish → it appears publicly

## 4. Notes

- `public/portfolio.html` is generated from `../index.html` by
  `scripts/sync-frontend.mjs` (`predev` / `prebuild`). If you edit `index.html`,
  rebuild before deploying, or run `npm run sync:frontend` and commit the result.
- `AUTH_SECRET` must stay stable between deployments; changing it invalidates
  all owner sessions (users simply log in again).
- Cookies are `Secure` in production, so the site must be served over HTTPS
  (Vercel does this automatically). `http://localhost` still works in dev.
- Free-tier limits to keep in mind: Vercel Hobby is for non-commercial personal
  projects; Supabase free projects pause after a week of inactivity.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Login always returns "Invalid login credentials" | `OWNER_PASSWORD_HASH` was corrupted by `$` expansion in `.env.local`. Escape `$` as `\$`, or use `OWNER_PASSWORD_HASH_B64`. |
| `/api/*` returns "Supabase environment variables are missing" | `SUPABASE_URL` / `SUPABASE_SECRET_KEY` not set in the host. |
| Upload fails with "File upload failed" | Bucket `certificates` missing or not private — rerun `supabase/schema.sql`. |
| Certificates list is empty but rows exist | Rows are `draft`; publish them from the owner dashboard. |
| Session does not persist after refresh | Cookie blocked: open the site over HTTPS and on the same origin as the API. |
| `/` returns 404 after deploy | `public/portfolio.html` was not committed; run `npm run sync:frontend` and redeploy. |
