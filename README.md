# Memory Journal — _"Hold them tight"_

A personal, AI-assisted memory journal. Record memories in your own voice,
attach photos, and let a large language model turn raw notes into polished
stories — tagged, titled, and ready to print into a book.

Built with React 19, TypeScript, Vite, Supabase, and OpenAI. Deployed on
Vercel.

> **Heads-up:** this is a personal project. I publish the source so that
> anyone can audit it, but I do not invite commercial reuse. See
> [License](#-license) below.

---

## ✨ Features

- 🎙️ Speech-to-text in 12 languages
- ✨ AI story generation (7 tone presets; GPT-4o-mini by default)
- 📸 Photo attachments with drag-and-drop
- 🖼️ Photo-library "moments" — on-device clustering of recent photos into journaling prompts (iOS / Android / web)
- 📚 Chapters, timeline, full-text search
- 📖 Book/print builder with 5 themes
- 🌍 Location tagging (search + GPS)
- 🌙 Auto/light/dark theme
- 🌐 UI in 7 languages (en, de, es, fr, pt, zh, ja)

## 🛠️ Stack

| Layer    | Tech |
| -------- | ---- |
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind 4, Radix UI, Framer Motion |
| Backend  | Vercel serverless functions (`api/`) |
| Data     | Supabase (Postgres + Auth + Storage) with row-level security |
| AI       | OpenAI Chat Completions proxied through `api/llm/complete` |

## 🚀 Setup

```bash
git clone https://github.com/MagnusJerono/memory-journal.git
cd memory-journal
npm install
cp .env.example .env         # fill in secrets
npm run dev                  # http://localhost:5173
```

Requires Node 20+.

## 🌍 Environment Variables

See [`.env.example`](.env.example) for the full list. The minimum set for a
production deployment:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-side OpenAI key (never shipped to the browser). |
| `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` | Server-side key used to verify JWTs. **Must never be exposed to the browser.** |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Public client keys (safe to ship). |
| `REQUIRE_AUTH_FOR_LLM=true` | Reject unauthenticated AI requests. **Set this in production.** |
| `REQUIRE_AUTH_FOR_PREFERENCES=true` | Same for the preferences API. |
| `MONTHLY_OPENAI_BUDGET_USD` | Hard cap on OpenAI spend per calendar month. |
| `FREE_AI_LIMIT_10M`, `FREE_AI_LIMIT_DAY`, `PREMIUM_AI_LIMIT_10M`, `PREMIUM_AI_LIMIT_DAY` | Per-user rate limits. |

## 🚢 Deployment (Vercel)

1. Push to `main`; Vercel auto-builds from `vercel.json`.
2. Set the env vars above in **Project → Settings → Environment Variables**.
3. Install the **Vercel ↔ Supabase marketplace integration** if you want
   Supabase secrets auto-injected.
4. Run the migration in `supabase/migrations/` on your Supabase project.

The `api/` directory is deployed as Vercel serverless functions. The
security headers in `vercel.json` (CSP, HSTS, COOP, referrer policy) ship
automatically — review them for your own deploy.

## 🔐 Security & Privacy

**Data model.** All user content (entries, photos, chapters, books,
preferences) is stored in Supabase. Every table has row-level security
scoped to `auth.uid()`; every storage object in the `journal-photos`
bucket is path-scoped to the uploading user. A user cannot read or modify
another user's data, even if they forge requests directly against the
Supabase API.

**Authentication.** Requests to `/api/*` endpoints must carry a valid
Supabase JWT in `Authorization: Bearer <token>`. The server verifies
tokens with Supabase's `/auth/v1/user` endpoint using the service-role
key. An unverified Bearer token is rejected in production — no fallback.

**AI abuse.** `POST /api/llm/complete` enforces per-user rate limits
(10/10 min, 50/day free; 60/10 min, 500/day premium) plus a global
monthly USD budget. Prompt size is capped. Request bodies over 8 KB are
rejected.

**Photo library access (native apps).** The "moments" feature requires
read access to the device photo library. iOS prompts via
`NSPhotoLibraryUsageDescription` and supports the iOS 14+ "limited"
selection mode; Android requests `READ_MEDIA_IMAGES` (API 33+) or
`READ_EXTERNAL_STORAGE` (API ≤32). Photo bytes never leave the device
unless the user explicitly imports a moment into an entry — the LLM
prompt is generated from metadata only (timestamp, approximate place,
photo count). The feature is opt-in via Settings → Data & Privacy →
Photo suggestions.

**Transport & browser posture.** `vercel.json` sets:

- `Strict-Transport-Security` (HSTS, 2-year max-age, preload)
- `Content-Security-Policy` (`default-src 'self'`, script allow-list,
  `connect-src` limited to `*.supabase.co` + `api.openai.com`,
  `frame-ancestors 'none'`)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera + cross-site cohorts; allowing
  microphone + geolocation to `self`

**Reporting vulnerabilities.** See [`SECURITY.md`](SECURITY.md).

**Dependencies.** `npm audit` is run in CI. Dependabot + CodeQL are
enabled via GitHub Advanced Security on the public repository.

## ✅ Production Checklist

- [ ] `OPENAI_API_KEY` set, `SUPABASE_SERVICE_ROLE_KEY` **never** prefixed with `VITE_` / `NEXT_PUBLIC_`
- [ ] `REQUIRE_AUTH_FOR_LLM=true` and `REQUIRE_AUTH_FOR_PREFERENCES=true`
- [ ] `MONTHLY_OPENAI_BUDGET_USD` set to your comfort limit
- [ ] Supabase migration applied; RLS confirmed on every table
- [ ] GitHub Advanced Security features enabled (Dependabot, secret scanning, CodeQL)
- [ ] `npm audit --omit=dev` has no high/critical issues
- [ ] Security headers verified at [securityheaders.com](https://securityheaders.com)

## 📁 Project Layout

```
api/                          Vercel serverless functions
├── _lib/auth.ts              JWT verification (Supabase-backed)
├── _lib/rate-limit.ts        Persistent rate limiter
├── _lib/usage-log.ts         Usage + cost tracking
├── auth/me.ts                GET current user
├── llm/complete.ts           OpenAI proxy
├── account/delete.ts         Hard-delete account + data
└── preferences.ts            GET/PUT user preferences
src/
├── components/               screens/, navigation/, ui/, entry/, timeline/
├── contexts/                 AuthContext, etc.
├── hooks/                    useJournalData, useLanguage, ...
└── lib/                      types, entries, auth-client, ai-client, ...
supabase/migrations/          Initial schema + RLS policies
```

## 📜 License

Copyright © 2026 Magnus Jerono.

Memory Journal is free software: you can redistribute it and/or modify it
under the terms of the **GNU Affero General Public License v3.0** as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but
**WITHOUT ANY WARRANTY**; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU AGPL
for more details.

You should have received a copy of the GNU AGPL along with this
program. If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.

**What AGPL-3.0 means in practice**

- You may use, modify, and self-host the software for free, including
  inside a company.
- If you run a modified version as a **network service** (e.g., host it
  for other people to use), you must publish your modifications under
  the same AGPL-3.0 license and offer the source code to your users.
- You must keep the copyright notice and license text intact.

If you want to use Memory Journal under different terms (e.g., in a
closed-source product), contact the author for a commercial license.
