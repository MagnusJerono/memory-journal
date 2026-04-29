# Memory Journal — _"Hold them tight"_

A personal, AI-assisted memory journal. Capture memories in your own voice,
attach photos, invite trusted collaborators, and let a large language model
turn raw notes into polished stories — tagged, titled, and ready to export or
print into a book.

Built with React 19, TypeScript, Vite, Supabase, OpenAI, Capacitor, Stripe
plumbing, and optional Sentry monitoring. Deployed on Vercel.

> **Heads-up:** this is a personal project. I publish the source so that
> anyone can audit it, but I do not invite commercial reuse. See
> [License](#-license) below.

---

## ✨ Features

- 🎙️ Speech-to-text in 12 languages
- ✨ AI story generation (7 tone presets; GPT-4o-mini by default)
- 📸 Photo attachments with drag-and-drop
- 🖼️ Photo-library "moments" — on-device clustering of recent photos into journaling prompts (iOS / Android / web)
- 🤝 Entry-level collaboration with viewer/editor roles
- 📚 Library with chapters, timeline, starred entries, drafts, and full-text search
- 📖 Book/print builder with 5 themes and PDF export
- 🌍 Location tagging (search + GPS)
- 🌙 Auto/light/dark theme
- 🌐 UI in 7 languages (en, de, es, fr, pt, zh, ja)
- 🧾 Premium tier and print-order data model with Stripe webhook verification
- 💬 In-app feedback endpoint with service-role-only storage

## 🛠️ Stack

| Layer    | Tech |
| -------- | ---- |
| Frontend | React 19, TypeScript 5, Vite 7, Tailwind 4, Radix UI, Framer Motion, TanStack Query |
| Native   | Capacitor 8 for iOS/Android shells, photo library, geolocation, sharing, status/splash bars |
| Backend  | Vercel serverless functions (`api/`) |
| Data     | Supabase (Postgres + Auth + Storage) with row-level security |
| AI       | OpenAI Chat Completions proxied through `api/llm/complete` |
| Payments | Stripe webhook verification and billing/order schema |
| Print    | Browserless/Lulu xPress integration scaffolding for print-on-demand |
| Observability | Optional Sentry frontend error tracking |

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

See [`.env.example`](.env.example) for a starter template. The most important
variables for production deployment:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-side OpenAI key (never shipped to the browser). |
| `SUPABASE_URL` | Supabase project URL for serverless functions. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key used to verify JWTs and write privileged rows. **Must never be exposed to the browser.** |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Public client keys (safe to ship). |
| `REQUIRE_AUTH_FOR_LLM=true` | Reject unauthenticated AI requests. **Set this in production.** |
| `REQUIRE_AUTH_FOR_PREFERENCES=true` | Same for the preferences API. |
| `FREE_AI_LIMIT_10M`, `FREE_AI_LIMIT_DAY`, `PREMIUM_AI_LIMIT_10M`, `PREMIUM_AI_LIMIT_DAY` | Per-user rate limits. |
| `MAX_LLM_PROMPT_CHARS` | Maximum accepted prompt length before the API rejects a request. |
| `MONTHLY_OPENAI_BUDGET_USD` | Global monthly OpenAI spend cap; defaults to `20` if unset. |
| `VITE_SENTRY_DSN`, `VITE_SENTRY_ENV`, `VITE_APP_RELEASE` | Optional frontend error tracking. Request bodies are scrubbed before events leave the device. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Server-side Stripe keys for signed webhook handling. |
| `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_ANNUAL`, `VITE_STRIPE_PUBLISHABLE_KEY` | Premium subscription price IDs and browser-safe publishable key. |
| `BROWSERLESS_API_KEY`, `BROWSERLESS_BASE_URL` | Optional server-side PDF rendering configuration. |
| `LULU_ENV`, `LULU_CLIENT_KEY`, `LULU_CLIENT_SECRET`, `LULU_MARGIN_BPS` | Optional Lulu xPress print-on-demand configuration. |

## 🚢 Deployment (Vercel)

1. Push to `main`; Vercel auto-builds from `vercel.json`.
2. Set the env vars above in **Project → Settings → Environment Variables**.
3. Install the **Vercel ↔ Supabase marketplace integration** if you want
   Supabase secrets auto-injected.
4. Run every migration in `supabase/migrations/` on your Supabase project.
5. Configure Stripe to send signed events to `/api/stripe/webhook` before
   enabling premium subscriptions or paid print flows.

The `api/` directory is deployed as Vercel serverless functions. The
security headers in `vercel.json` (CSP, HSTS, COOP, referrer policy) ship
automatically — review them for your own deploy.

## 🧭 App Structure

Memory Journal uses a calm four-tab shell:

| Tab | Purpose |
| --- | --- |
| Home | Recent memories, drafts, starred entries, and quick creation |
| Prompts | Guided prompts and photo-library moments |
| Library | Chapters and timeline views |
| Print | Book drafts, theme selection, preview, and PDF export |

Search is available as a dedicated view and desktop shortcut (`⌘K` / `Ctrl+K`).
Settings include theme, language, privacy/account controls, feedback, and
native-friendly preferences.

## 🔌 API Routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Deployment health/config check. |
| `GET /api/auth/me` | Verify the current Supabase JWT and return the user. |
| `POST /api/llm/complete` | Auth-aware OpenAI proxy with rate limits and prompt-size validation. |
| `GET/PUT /api/preferences` | Server-backed user preferences. |
| `POST /api/feedback` | Store in-app feedback through the service-role key, or no-op locally without Supabase. |
| `POST /api/account/delete` | Delete the authenticated user's account data. |
| `POST /api/stripe/webhook` | Verify Stripe signatures and receive subscription/print-payment lifecycle events. |

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

**Collaboration.** Entry collaborators are stored in `entry_collaborators`.
Owners can invite by email, grant viewer/editor roles, change roles, and remove
collaborators. RLS allows collaborators to read shared entries and photos;
only owners and editors can update entry content, and only owners can delete
entries, manage collaborators, or manage photos.

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

**Monitoring.** If `VITE_SENTRY_DSN` is present at build time, Sentry captures
frontend errors with conservative sampling, no session replay, no default PII,
and scrubbed request bodies.

## ✅ Production Checklist

- [ ] `OPENAI_API_KEY` set, `SUPABASE_SERVICE_ROLE_KEY` **never** prefixed with `VITE_` / `NEXT_PUBLIC_`
- [ ] `REQUIRE_AUTH_FOR_LLM=true` and `REQUIRE_AUTH_FOR_PREFERENCES=true`
- [ ] Supabase migrations applied in order; RLS confirmed on every table and the `journal-photos` bucket
- [ ] Stripe webhook endpoint configured with `STRIPE_WEBHOOK_SECRET`
- [ ] Browserless/Lulu credentials set before enabling paid print fulfillment
- [ ] Optional Sentry DSN set only after privacy settings are reviewed
- [ ] GitHub Advanced Security features enabled (Dependabot, secret scanning, CodeQL)
- [ ] `npm audit --omit=dev` has no high/critical issues
- [ ] Security headers verified at [securityheaders.com](https://securityheaders.com)

## 📁 Project Layout

```
api/                          Vercel serverless functions
├── _lib/auth.ts              JWT verification (Supabase-backed)
├── _lib/rate-limit.ts        Persistent rate limiter
├── _lib/stripe.ts            Stripe secret + webhook signature helpers
├── _lib/pod/                 Print-on-demand provider adapters
├── _lib/usage-log.ts         Usage + cost tracking
├── health.ts                 Deployment health/config check
├── auth/me.ts                GET current user
├── llm/complete.ts           OpenAI proxy
├── account/delete.ts         Hard-delete account + data
├── feedback.ts               In-app feedback capture
├── preferences.ts            GET/PUT user preferences
└── stripe/webhook.ts         Stripe webhook receiver
src/
├── components/               screens/, navigation/, ui/, entry/, prompts/, timeline/
├── contexts/                 AuthContext, etc.
├── hooks/                    useJournalData, useLanguage, useMoments, ...
└── lib/                      types, entries, db, auth-client, ai-client, sentry, ...
supabase/migrations/          Schema, RLS, premium, orders, feedback, collaboration
android/ ios/                 Capacitor native projects
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
