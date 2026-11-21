MY FIRST PORTFOLIO WEBSITE 
## 🌐 Live Website

🔗 [View Live Portfolio](https://mohamed-idris-futuristic-portfolio.onrender.com⁠)

- 🎓 I'm a First-Year ECE Student passionate about technology and software development.
- 💻 I enjoy building modern, responsive and creative websites.
- 🚀 Interested in Frontend Development and Full Stack Development.
- 🧠 Currently learning C Programming and Prompt Engineering.
- 🤖 I use AI-assisted development to learn faster, improve productivity and explore new ideas.
- 🔨 I enjoy turning ideas into real-world projects.
- 🎯 My goal is to continuously develop my skills and build a strong career in the software industry.

---

# Idris Portfolio — Next.js backend + certificate portal

One Next.js app serves both the public portfolio and the owner certificate API, so
every request is same-origin and the owner session cookie works without CORS.

```
frontend+backend/
├── index.html                  ← the portfolio (source of truth)
└── idris-portfolio-backend/    ← Next.js API + hosting
    ├── app/api/…               ← auth, session, certificate CRUD
    ├── lib/                    ← auth, Supabase, owner guard
    ├── public/portfolio.html   ← generated copy of ../index.html (served at /)
    ├── scripts/                ← frontend sync + password hash helpers
    └── supabase/schema.sql     ← table, RLS and storage bucket
```

`GET /` is rewritten to `public/portfolio.html`. `npm run dev` and `npm run build`
copy `../index.html` into `public/portfolio.html` first, so the portfolio stays the
single source of truth while still shipping inside the deployable folder.

## 1. Setup

```bash
cd idris-portfolio-backend
npm install
cp .env.example .env.local     # then fill in the four values
npm run hash-password          # paste the result into OWNER_PASSWORD_HASH
```

In `.env.local`, escape every `$` in the bcrypt hash as `\$` — Next.js expands
`$NAME` inside env files and would otherwise corrupt the hash:

```
OWNER_PASSWORD_HASH=\$2b\$12\$abcdefghij...
```

Alternatively use `OWNER_PASSWORD_HASH_B64` (base64 of the hash), which contains
no `$` and can never be mangled. On a hosting dashboard, paste the hash raw.

Run `supabase/schema.sql` once in the Supabase SQL editor. It creates the
`certificates` table, locks it down with RLS and creates the **private**
`certificates` storage bucket.

## 2. Develop

```bash
npm run dev     # http://localhost:3000
```

`npm run typecheck`, `npm run lint` and `npm run build` are available as well.

## 3. API

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/login` | public (passkey) |
| POST | `/api/logout` | public |
| GET | `/api/session` | public |
| GET | `/api/upload/certificates` | public — published only |
| GET | `/api/upload/certificates/admin` | owner — drafts included |
| POST | `/api/upload/certificates` | owner — multipart upload |
| PATCH | `/api/upload/certificates/:id` | owner — edit / publish / unpublish |
| DELETE | `/api/upload/certificates?id=…` | owner |
| GET | `/api/upload/certificates/:id/file` | public for published, owner for drafts |
| GET | `/api/test-supabase` | public health check |

Documents live in a private bucket and are served through 60-second signed URLs.
The service-role key never leaves the server.

## 4. Deploy (free tier: Vercel Hobby)

1. Push this folder (`idris-portfolio-backend`) to GitHub.
2. Vercel → **Add New Project** → import the repo. Framework preset: **Next.js**.
   Build command `npm run build`, output handled automatically.
3. Add the environment variables `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
   `AUTH_SECRET`, `OWNER_PASSWORD_HASH` (raw hash, no backslashes) for
   Production/Preview/Development.
4. Deploy, then check `https://<app>.vercel.app/api/test-supabase` returns
   `{"success":true}` and open `/` for the portfolio.

See `DEPLOYMENT.md` for the step-by-step checklist and troubleshooting.
