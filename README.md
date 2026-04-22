# Memory Journal — "Hold them tight"

An AI-powered personal memory journal built with React 19, TypeScript, and Vite. Users can record memories via text or speech-to-text, attach photos, and have AI transform their notes into polished stories with highlights, tags, and location suggestions.

## ✨ Key Features

- 🎙️ **Speech-to-text in 12 languages** — Record memories using your voice with support for English (US/UK), German, Spanish, French, Italian, Portuguese, Dutch, Polish, Japanese, Korean, and Chinese
- ✨ **AI story generation with 7 tone options** — Transform your notes into polished stories with natural, casual, poetic, nostalgic, journalistic, humorous, or custom tones
- 📸 **Photo attachments** — Add up to 10 photos per entry with intuitive drag-and-drop support
- 📚 **Chapters for organizing memories** — Organize your journal with customizable chapters featuring icons, colors, and pin/archive capabilities
- ⏰ **Timeline view** — Chronological view of all memories organized by year and month for easy browsing through time
- 🔍 **Full-text search** — Quickly find any memory across all your entries
- 📖 **Book/print builder** — Create beautiful printed memories with 5 themes: classic, modern, vintage, minimal, and romantic
- 🌍 **Location tagging** — Add location context via search or GPS coordinates
- 🌙 **Smart theming** — Auto/light/dark theme with automatic night-time detection
- 🖥️ **Responsive design** — Desktop sidebar and mobile bottom navigation for seamless experience across devices
- 🌐 **Internationalized UI** — Use the app in 7 languages: EN, DE, ES, FR, PT, ZH, JA
- 💾 **Auto-save drafts** — Never lose your work with automatic draft saving
- 🔥 **Writing streak tracking** — Stay motivated with visual streak tracking
- 📝 **Journaling prompts** — Get inspired with prompts across 6 categories

## 🛠️ Tech Stack

- **React 19** — Latest React with modern features
- **TypeScript 5** — Full type safety throughout the application
- **Vite 7** — Fast build tooling and development server
- **Tailwind CSS 4** — Utility-first CSS framework for styling
- **Radix UI** — Accessible component primitives
- **Framer Motion** — Smooth animations and transitions
- **Phosphor Icons** — Beautiful icon library
- **OpenAI** — AI-powered story generation (`gpt-4o-mini` by default)
- **GitHub Spark** — Uses `@github/spark/hooks` for data persistence (optional)

## 📋 Prerequisites

- **Node.js 20+** (see `engines` field in `package.json`)
- **npm** (or yarn/pnpm)
- An **OpenAI API key** for AI features

## 🚀 Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/MagnusJerono/memory-journal.git
cd memory-journal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables section below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🧑‍💻 Local Development

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + production build
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## 📦 Building for Production

```bash
npm run build
```

This runs `tsc -b && vite build`. The output goes to `dist/`.

## 🌍 Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key for AI story generation |
| `SUPABASE_URL` *or* `NEXT_PUBLIC_SUPABASE_URL` | When using Supabase auth | Supabase project URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` *or* `SUPABASE_SECRET_KEY` | When using Supabase auth | Server-side key for JWT validation |
| `VITE_SUPABASE_URL` *or* `NEXT_PUBLIC_SUPABASE_URL` | When using Supabase auth | Supabase URL (exposed to browser) |
| `VITE_SUPABASE_ANON_KEY` *or* `NEXT_PUBLIC_SUPABASE_ANON_KEY` | When using Supabase auth | Supabase anon key (exposed to browser) |
| `FREE_AI_LIMIT_10M` | No | Free-tier max requests per 10 min (default: 10) |
| `FREE_AI_LIMIT_DAY` | No | Free-tier max requests per day (default: 50) |
| `PREMIUM_AI_LIMIT_10M` | No | Premium max requests per 10 min (default: 60) |
| `PREMIUM_AI_LIMIT_DAY` | No | Premium max requests per day (default: 500) |
| `PREMIUM_USER_IDS` | No | Comma-separated user IDs with premium limits |
| `MAX_LLM_PROMPT_CHARS` | No | Max prompt size in characters (default: 12000) |
| `REQUIRE_AUTH_FOR_LLM` | No | Reject unauthenticated AI requests (`true`/`false`) |
| `REQUIRE_AUTH_FOR_PREFERENCES` | No | Reject unauthenticated preference requests |
| `VITE_LLM_API_ENDPOINT` | No | Override AI endpoint URL (default: `/api/llm/complete`) |
| `VITE_AUTH_USER_ENDPOINT` | No | Override auth endpoint URL (default: `/api/auth/me`) |
| `VITE_PREFERENCES_API_ENDPOINT` | No | Override preferences endpoint URL |

## 🚢 Deployment Guide (Vercel)

1. **Push to GitHub** — Vercel auto-deploys on push to `main`.
2. **Connect your repo** in the [Vercel dashboard](https://vercel.com/new).
3. **Set environment variables** in *Project → Settings → Environment Variables*:
   - `OPENAI_API_KEY` — required for AI features
   - Supabase: either install the **Vercel ↔ Supabase marketplace integration** (auto-injects `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, etc.) *or* set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` manually. The app reads either naming convention.
   - Rate-limit variables as needed
4. **Deploy** — Vercel uses `vercel.json` for build config (`tsc -b && vite build`).

The `api/` directory is automatically deployed as Vercel Serverless Functions.

## 📁 Project Structure

```
├── api/                          # Vercel serverless functions
│   ├── _lib/
│   │   ├── auth.ts              # Shared JWT / identity auth helper
│   │   ├── rate-limit.ts        # Per-user rate limiting (free/premium tiers)
│   │   └── usage-log.ts         # Usage tracking and cost estimation
│   ├── auth/
│   │   └── me.ts                # GET /api/auth/me — current user identity
│   ├── llm/
│   │   └── complete.ts          # POST /api/llm/complete — OpenAI proxy
│   └── preferences.ts           # GET/PUT /api/preferences — user preferences
└── src/
    ├── components/
    │   ├── screens/             # Main app screens
    │   ├── entry/               # Entry-related components
    │   ├── navigation/          # Navigation components
    │   ├── timeline/            # Timeline components
    │   └── ui/                  # Radix UI / shadcn primitives
    ├── contexts/                # React context providers
    ├── hooks/                   # Custom React hooks
    └── lib/                     # Core utilities and logic
        ├── types.ts             # TypeScript type definitions
        ├── entries.ts           # Entry logic and AI generation
        ├── auth-client.ts       # Client-side auth helper
        ├── ai-client.ts         # OpenAI API client with Spark fallback
        ├── preferences-client.ts# Preferences API client
        ├── generate-book-pdf.tsx# PDF/print generation (XSS-safe)
        └── utils.ts             # Shared utilities
```

## 🔐 Security Notes

### Authentication
- All API endpoints support **Authorization: Bearer \<token\>** and fall back to the `x-user-id` header (used by the GitHub Spark runtime).
- When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, Bearer tokens are verified against Supabase's auth API — invalid JWTs are rejected with a 401.
- Set `REQUIRE_AUTH_FOR_LLM=true` and `REQUIRE_AUTH_FOR_PREFERENCES=true` to reject any request that cannot be identified.

### Rate Limiting
- `POST /api/llm/complete` enforces per-user rate limits to prevent OpenAI cost abuse.
- Free tier defaults: **10 requests / 10 min**, **50 requests / day**.
- Premium tier defaults: **60 requests / 10 min**, **500 requests / day**.
- Exceeded limits return `429` with a `Retry-After` header.

### XSS Protection
- All user-controlled content (book titles, chapter names, entry text, locations) is HTML-escaped before being written into the PDF generation window.

## ✅ Production Deployment Checklist

- [ ] `OPENAI_API_KEY` set in Vercel environment variables
- [ ] `REQUIRE_AUTH_FOR_LLM=true` once Supabase auth is wired up
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` configured for JWT validation
- [ ] Review rate limits (`FREE_AI_LIMIT_*`, `PREMIUM_AI_LIMIT_*`) for your usage tier
- [ ] Confirm `PREMIUM_USER_IDS` is set for any users who need higher quotas
- [ ] Ensure `.env` is not committed (it is in `.gitignore`)
- [ ] Verify `vercel.json` build command matches `package.json` build script

## 🔌 API Reference

### `POST /api/llm/complete`
Proxies a prompt to OpenAI with rate limiting.

**Headers:**
- `Authorization: Bearer <token>` or `x-user-id: <userId>` — user identity
- `x-user-tier: premium` — opt-in to premium rate limits
- `Content-Type: application/json`

**Body:**
```json
{ "prompt": "string", "model": "gpt-4o-mini", "jsonMode": false }
```

**Response:**
```json
{ "text": "...", "usage": { "estimatedCostUsd": 0.0001 } }
```

### `GET /api/auth/me`
Returns the authenticated user identity from request headers.

### `GET /PUT /api/preferences`
Retrieves or updates per-user preferences and personal writing voice sample.

## 📄 License

See [LICENSE](LICENSE) for details.

