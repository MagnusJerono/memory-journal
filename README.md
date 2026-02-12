# Tightly — "Hold them tight"

An AI-powered personal memory journal built as a TypeScript/React app on GitHub Spark. Users can record memories via text or speech-to-text, attach photos, and have AI transform their notes into polished stories with highlights, tags, and location suggestions.

## ✨ Key Features

- 🎙️ **Speech-to-text in 12 languages** — Record memories using your voice with support for English (US/UK), German, Spanish, French, Italian, Portuguese, Dutch, Polish, Japanese, Korean, and Chinese
- ✨ **AI story generation with 7 tone options** — Transform your notes into polished stories with natural, casual, poetic, nostalgic, journalistic, humorous, or custom tones
- 📸 **Photo attachments** — Add up to 10 photos per entry with intuitive drag-and-drop support
- 📚 **Chapters for organizing memories** — Organize your journal with customizable chapters featuring icons, colors, and pin/archive capabilities
- 🔍 **Full-text search** — Quickly find any memory across all your entries
- 📖 **Book/print builder** — Create beautiful printed memories with 5 themes: classic, modern, vintage, minimal, and romantic
- 🌍 **Location tagging** — Add location context via search or GPS coordinates
- 🌙 **Smart theming** — Auto/light/dark theme with automatic night-time detection
- 🌐 **Internationalized UI** — Use the app in 11 languages: EN, DE, ES, FR, IT, PT, NL, PL, JA, KO, ZH
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
│   │   ├── EntryEditScreen.tsx      # Entry creation/editing
│   │   ├── EntryReadScreen.tsx      # Entry reading view
│   │   ├── ChaptersScreen.tsx       # Chapter management
│   │   ├── SearchScreen.tsx         # Search interface
│   │   ├── PrintScreen.tsx          # Print/book builder
│   │   └── PromptsScreen.tsx        # Writing prompts
│   ├── entry/          # Entry-related components
│   │   ├── AudioWaveform.tsx        # Audio recording visualization
│   │   ├── EntryReadView.tsx        # Entry display component
│   │   ├── LocationPanel.tsx        # Location picker
│   │   └── RefinementPanel.tsx      # AI refinement controls
│   ├── navigation/     # Navigation components
│   │   ├── BottomNav.tsx            # Mobile bottom navigation
│   │   ├── DesktopSidebar.tsx       # Desktop sidebar (if used)
│   │   └── NavigationMenu.tsx       # Main navigation menu
│   ├── ui/             # Shared UI primitives
│   │   └── ...                      # Button, Dialog, Input, etc.
│   ├── timeline/       # Timeline display components
│   └── yearbook/       # Yearbook view components
├── hooks/              # Custom React hooks
│   ├── use-speech-to-text.ts       # Speech recognition
│   ├── use-language.ts             # i18n support
│   ├── use-is-mobile.ts            # Responsive detection
│   ├── use-is-night.ts             # Night mode detection
│   └── use-journal-data.ts         # Journal data management
├── lib/                # Core utilities and logic
│   ├── types.ts                    # TypeScript definitions
│   ├── entries.ts                  # Entry logic and AI generation
│   ├── geocoding.ts                # Location services
│   ├── i18n/                       # Translation files
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

**Note:** This application is designed for the GitHub Spark runtime and uses `@github/spark/hooks` for data persistence. Some features may require the GitHub Spark environment to function properly.

## 📄 License

⚠️ **No license file currently exists in this repository.** Please add an appropriate license to clarify usage rights and distribution terms.
