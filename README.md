# Tightly — "Hold them tight"

An AI-powered personal memory journal built as a TypeScript/React app on GitHub Spark. Users can record memories via text or speech-to-text, attach photos, and have AI transform their notes into polished stories with highlights, tags, and location suggestions.

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
- **TypeScript** — Full type safety throughout the application
- **Vite** — Fast build tooling and development server
- **Tailwind CSS** — Utility-first CSS framework for styling
- **Radix UI** — Accessible component primitives
- **Framer Motion** — Smooth animations and transitions
- **Phosphor Icons** — Beautiful icon library
- **GitHub Spark** — Uses `@github/spark/hooks` for data persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── screens/        # Main app screens
│   │   ├── HomeScreen.tsx           # Home timeline view
│   │   ├── EntryEditScreen.tsx      # Entry creation/editing (with unsaved changes guard)
│   │   ├── EntryReadScreen.tsx      # Entry reading view
│   │   ├── ChaptersScreen.tsx       # Chapter management
│   │   ├── ChapterDetailScreen.tsx  # Chapter detail view
│   │   ├── TimelineScreen.tsx       # Chronological timeline view
│   │   ├── SearchScreen.tsx         # Search interface
│   │   ├── PrintScreen.tsx          # Print/book builder
│   │   └── PromptsScreen.tsx        # Writing prompts
│   ├── entry/          # Entry-related components
│   │   ├── AudioWaveform.tsx        # Audio recording visualization (optimized)
│   │   ├── EntryReadView.tsx        # Entry display component
│   │   ├── LocationPanel.tsx        # Location picker
│   │   └── RefinementPanel.tsx      # AI refinement controls
│   ├── navigation/     # Navigation components
│   │   ├── BottomNav.tsx            # Mobile bottom navigation (6 tabs)
│   │   ├── DesktopSidebar.tsx       # Desktop sidebar navigation
│   │   └── NavigationMenu.tsx       # Hamburger navigation menu
│   ├── ui/             # Shared UI primitives
│   │   └── ...                      # Button, Dialog, Input, etc.
│   ├── timeline/       # Timeline display components
│   └── yearbook/       # Yearbook view components
├── hooks/              # Custom React hooks
│   ├── use-speech-to-text.ts       # Speech recognition
│   ├── use-language.tsx            # i18n support
│   ├── use-mobile.ts               # Responsive detection
│   ├── use-is-night.ts             # Night mode detection
│   └── use-journal-data.ts         # Journal data management
├── lib/                # Core utilities and logic
│   ├── types.ts                    # TypeScript definitions
│   ├── entries.ts                  # Entry logic and AI generation
│   ├── geocoding.ts                # Location services
│   ├── i18n.ts                     # Translation files (7 languages)
│   └── utils.ts                    # Helper utilities
└── contexts/           # React contexts
    └── ThemeContext.tsx            # Theme management
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### AI Outside Spark

AI calls now use an API-first client with Spark fallback:

- Frontend calls `POST /api/llm/complete` by default
- If that endpoint is unavailable and Spark exists, the app falls back to `window.spark.llm(...)`

To run AI outside Spark, configure:

```bash
OPENAI_API_KEY=your_key_here
# Optional override from frontend
VITE_LLM_API_ENDPOINT=/api/llm/complete

# Optional LLM guardrails (defaults shown)
FREE_AI_LIMIT_10M=10
FREE_AI_LIMIT_DAY=50
PREMIUM_AI_LIMIT_10M=60
PREMIUM_AI_LIMIT_DAY=500
MAX_LLM_PROMPT_CHARS=12000

# Optional premium identity mapping (comma-separated user IDs)
PREMIUM_USER_IDS=user_123,user_456

# Optional strict mode: reject LLM requests without x-user-id
REQUIRE_AUTH_FOR_LLM=false
```

Vercel endpoint implementation lives in `api/llm/complete.ts`.

Rate-limit behavior for `POST /api/llm/complete`:

- Identity source priority: `x-user-id` header, then request IP fallback
- Tier source: `x-user-tier: premium` header or `PREMIUM_USER_IDS`
- Response headers include remaining quotas:
    - `X-RateLimit-Tier`
    - `X-RateLimit-Remaining-10m`
    - `X-RateLimit-Remaining-Day`
- When limited, endpoint returns `429` with `Retry-After`

Auth user lookup also uses API-first with Spark fallback:

- Frontend resolves user via `GET /api/auth/me`
- If unavailable and Spark exists, falls back to `window.spark.user()`

Current placeholder endpoint is `api/auth/me.ts` and returns `{ user: null }` until wired to Supabase/Auth provider.

Settings preferences (notifications/email/auto-save and personal writing voice) now use API-first persistence with local fallback:

- Frontend uses `src/lib/preferences-client.ts`
- Endpoint: `GET/PUT /api/preferences`
- Fallback: browser `localStorage` if API is unavailable

Optional env override:

```bash
VITE_PREFERENCES_API_ENDPOINT=/api/preferences

# Optional strict mode: reject preferences calls without x-user-id
REQUIRE_AUTH_FOR_PREFERENCES=false
```

**Note:** Data persistence is still Spark-coupled via `@github/spark/hooks` and will be migrated in a later phase.

## 📄 License

⚠️ **No license file currently exists in this repository.** Please add an appropriate license to clarify usage rights and distribution terms.
