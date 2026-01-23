# Memory Journal Redesign — Product Requirements Document

A calm, ordered journaling app for capturing and organizing life's memories through guided prompts and AI-enhanced storytelling.

**Experience Qualities**:
1. **Calm** — Every screen should feel restful with generous whitespace, muted animations, and a single clear purpose
2. **Ordered** — Clear hierarchy: Library → Chapter → Entry; users always know where they are and how to go back
3. **Intuitive** — The primary action on each screen is obvious; secondary actions are discoverable but not competing

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple views (5 navigation destinations) but each view has a singular purpose
- State is simple: entries belong to chapters, chapters live in a library

---

## Information Architecture

### Core Model: Library → Chapter → Entry

```
Library (Chapters screen)
├── Chapter: "Travel" (memory type)
│   ├── Entry: "Barcelona Weekend"
│   ├── Entry: "Tokyo Cherry Blossoms"
│   └── Entry: "Iceland Road Trip"
├── Chapter: "Family"
│   ├── Entry: "Mom's Birthday 2024"
│   └── Entry: "Christmas Morning"
└── Chapter: "Dreams"
    └── Entry: "The Flying Dream"
```

### Navigation Structure (5 Destinations)

| Tab | Purpose | Primary CTA |
|-----|---------|-------------|
| **Home** | Quick access to recent entries + continue writing | "Continue" on draft / "New Prompt" if empty |
| **Prompts** | Guided creation flow + prompt library | "Start Writing" on selected prompt |
| **Chapters** | Library of memory types (browse organization) | "New Chapter" |
| **Search** | Global search across all content | Search input (auto-focused) |
| **Print** | Create physical books from entries | "Create Book" |

---

## User Flows

### Flow 1: New Prompt → Saved Entry

```
Prompts tab → Browse/select prompt → "Start Writing"
→ New Entry screen (Edit mode):
   - Prompt displayed at top
   - Date picker
   - Photo upload area
   - Voice/text input for transcript
   - "Generate Story" button
→ AI generates title, highlights, story
→ Review generated content (still Edit mode)
→ Select chapter assignment
→ "Save Entry" → Entry saved
→ Navigate to Entry Read View
```

### Flow 2: Browse Chapters → Open Entry

```
Chapters tab → See all chapters (Library view)
→ Tap chapter → Chapter Detail (list of entries)
→ Tap entry → Entry Read View
   - Clean reading experience
   - Single "Edit" button in header
   - Overflow menu: Share, Delete, Move to chapter
```

### Flow 3: Create Printed Book

```
Print tab → "Create Book" or select existing draft
→ Step 1: Select entries
   - Filter by chapter, date range, favorites
   - Multi-select with checkboxes
   - Preview count: "12 entries selected"
→ Step 2: Configure book
   - Title, subtitle
   - Cover style (theme selection)
   - Layout options
→ Step 3: Preview
   - Scrollable book preview
   - Reorder entries if needed
→ Step 4: Checkout/Export
   - Export PDF (free)
   - Order print (placeholder for future)
```

---

## Navigation Specification

### Mobile (Bottom Navigation Bar)

```
┌─────────────────────────────────────────────────┐
│  [Home]  [Prompts]  [Chapters]  [Search]  [Print] │
│    🏠       ✨         📚         🔍        📖    │
└─────────────────────────────────────────────────┘
```

- 5 equal-width tabs
- Active tab: filled icon + primary color label
- Inactive: outlined icon + muted label
- No text labels on very small screens (icon only)

### Desktop (Sidebar Navigation)

```
┌──────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                  │
│ │ tightly │  ← Brand header                                  │
│ │ Hold    │                                                  │
│ │ them    │                                                  │
│ │ tight   │                                                  │
│ ├─────────┤                                                  │
│ │ 🏠 Home    │                                               │
│ │ ✨ Prompts │  ← Active state highlighted                   │
│ │ 📚 Chapters│                                               │
│ │ 🔍 Search  │                                               │
│ │ 📖 Print   │                                               │
│ ├─────────┤                                                  │
│ │ ⚙️ Settings│  ← Bottom of sidebar                          │
│ └─────────┘                                                  │
└──────────────────────────────────────────────────────────────┘
```

### Header/Toolbar Rules

| Screen | Header Content | Right Actions |
|--------|---------------|---------------|
| Home | "Home" title | Settings icon |
| Prompts | "Prompts" title | — |
| Chapters (Library) | "Chapters" title | "New Chapter" button |
| Chapter Detail | Chapter name + back arrow | Overflow menu (⋮) |
| Entry Read | Entry title + back arrow | "Edit" button |
| Entry Edit | "Edit Entry" + back arrow | "Save" button |
| Search | Search input (full width) | Cancel button |
| Print | "Print" title | — |

---

## Screen-by-Screen Layout Specifications

### 1. Home Screen

**Purpose**: Quick access point showing recent activity and encouraging continued writing.

**Layout**:
```
┌────────────────────────────────────────┐
│ [Header: "Home"              ⚙️]       │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 💭 Continue Writing?             │   │
│ │                                  │   │
│ │ "Barcelona Weekend" - Draft      │   │
│ │ Last edited 2 hours ago          │   │
│ │                                  │   │
│ │ [Continue Writing] ← PRIMARY CTA │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Recent Memories                        │
│ ─────────────────                      │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Tokyo Cherry Blossoms         │   │
│ │ April 5, 2024 · Travel           │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Mom's Birthday                │   │
│ │ March 28, 2024 · Family          │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ ✨ Start with a prompt           │   │
│ │                                  │   │
│ │ [Browse Prompts] ← SECONDARY     │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: "Continue Writing" (if draft exists) OR "Start with a Prompt"
**Secondary Actions**: Recent entry cards (tap to view), Settings icon

---

### 2. Prompts Screen

**Purpose**: Guided entry creation through curated prompts.

**Layout (Prompt Library)**:
```
┌────────────────────────────────────────┐
│ [Header: "Prompts"]                    │
├────────────────────────────────────────┤
│                                        │
│ Today's Prompt                         │
│ ┌──────────────────────────────────┐   │
│ │ ✨ "What made you smile today?"  │   │
│ │                                  │   │
│ │ [Start Writing] ← PRIMARY CTA    │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Categories                             │
│ ─────────                              │
│ [Gratitude] [Reflection] [Memory]      │
│ [Creative] [Goals] [Relationships]     │
│                                        │
│ All Prompts                            │
│ ─────────                              │
│ ┌──────────────────────────────────┐   │
│ │ "Describe a place that feels..." │   │
│ │ 🏷️ Memory                        │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ "What would you tell your..."    │   │
│ │ 🏷️ Reflection                    │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Layout (New Entry — Edit Mode)**:
```
┌────────────────────────────────────────┐
│ [← Back] "New Entry"        [Save]     │
├────────────────────────────────────────┤
│                                        │
│ 💭 "What made you smile today?"        │
│ ───────────────────────────────        │
│                                        │
│ Date                                   │
│ ┌──────────────────────────────────┐   │
│ │ April 12, 2024              📅   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Photos                                 │
│ ┌──────────────────────────────────┐   │
│ │  ┌────┐ ┌────┐ ┌────┐           │   │
│ │  │ 📷 │ │ 📷 │ │ +  │           │   │
│ │  └────┘ └────┘ └────┘           │   │
│ │  Drag & drop or tap to add       │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Your Story                             │
│ ┌──────────────────────────────────┐   │
│ │ [🎤] What happened?              │   │
│ │                                  │   │
│ │ Tap mic to speak or type here... │   │
│ │                                  │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ [✨ Generate Story] ← PRIMARY    │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Chapter                                │
│ ┌──────────────────────────────────┐   │
│ │ Select chapter...            ▼   │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: "Start Writing" (library) → "Generate Story" (edit) → "Save"

---

### 3. Chapters Screen (Library)

**Purpose**: Browse and manage all chapters (memory categories).

**Layout**:
```
┌────────────────────────────────────────┐
│ [Header: "Chapters"]    [+ New Chapter]│
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ ✈️ Travel                        │   │
│ │ 12 entries                       │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 👨‍👩‍👧 Family                        │   │
│ │ 8 entries                        │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 💭 Dreams                        │   │
│ │ 3 entries                        │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 💡 Ideas                         │   │
│ │ 15 entries                       │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Pinned chapters appear first           │
│ Long-press to reorder                  │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: "New Chapter" button in header
**Chapter Card Actions**: Tap to open, long-press for context menu (Rename, Pin, Archive, Delete)

---

### 4. Chapter Detail (Entries List)

**Purpose**: Browse all entries within a specific chapter.

**Layout**:
```
┌────────────────────────────────────────┐
│ [← Back] "Travel"               [⋮]   │
├────────────────────────────────────────┤
│                                        │
│ ✈️ Travel                              │
│ 12 memories                            │
│ ─────────────────                      │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Barcelona Weekend             │   │
│ │ April 10, 2024                   │   │
│ │ ⭐                               │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Tokyo Cherry Blossoms         │   │
│ │ April 5, 2024                    │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Iceland Road Trip             │   │
│ │ March 15, 2024                   │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: None (browse mode — tap entry to view)
**Overflow Menu (⋮)**: Edit Chapter, Pin Chapter, Archive Chapter, Delete Chapter

---

### 5. Entry Read View

**Purpose**: Clean, distraction-free reading of a completed entry.

**Layout**:
```
┌────────────────────────────────────────┐
│ [← Back] "Barcelona Weekend"   [Edit]  │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │                                  │   │
│ │         [Photo Gallery]          │   │
│ │                                  │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Barcelona Weekend                      │
│ ═══════════════════                    │
│ April 10, 2024 · Travel                │
│                                        │
│ ⭐ Highlights                          │
│ • Walked through the Gothic Quarter    │
│ • Tried the best tapas at La Boqueria  │
│ • Watched sunset at Park Güell         │
│                                        │
│ The Story                              │
│ ─────────                              │
│ The morning light filtered through     │
│ the narrow streets of the Gothic       │
│ Quarter, casting long shadows...       │
│                                        │
│ 📍 Barcelona, Spain                    │
│ 🏷️ adventure, architecture, food       │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: "Edit" button in header
**Secondary Actions**: Overflow menu (⋮): Star/Unstar, Move to Chapter, Share, Delete

---

### 6. Entry Edit View

**Purpose**: Modify an existing entry.

**Layout**:
```
┌────────────────────────────────────────┐
│ [Cancel] "Edit Entry"          [Save]  │
├────────────────────────────────────────┤
│                                        │
│ Title                                  │
│ ┌──────────────────────────────────┐   │
│ │ Barcelona Weekend                │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Date                                   │
│ ┌──────────────────────────────────┐   │
│ │ April 10, 2024              📅   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Photos                                 │
│ ┌──────────────────────────────────┐   │
│ │ [Photo grid with delete option]  │   │
│ │ [+ Add more]                     │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Transcript                             │
│ ┌──────────────────────────────────┐   │
│ │ [🎤] Edit your original notes... │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Highlights (editable)                  │
│ ┌──────────────────────────────────┐   │
│ │ • Walked through Gothic Quarter  │   │
│ │ • Tried tapas at La Boqueria     │   │
│ │ [+ Add highlight]                │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Story                                  │
│ ┌──────────────────────────────────┐   │
│ │ The morning light filtered...    │   │
│ │                                  │   │
│ │ [✨ Regenerate] (if unlocked)    │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Chapter                                │
│ ┌──────────────────────────────────┐   │
│ │ Travel                       ▼   │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ───────────────────────────────────    │
│ [🗑️ Delete Entry] (destructive)       │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: "Save" button in header
**Destructive Action**: Delete Entry at bottom (requires confirmation)

---

### 7. Search Screen

**Purpose**: Find entries across all chapters.

**Layout**:
```
┌────────────────────────────────────────┐
│ ┌──────────────────────────────────┐   │
│ │ 🔍 Search memories...    [Cancel]│   │
│ └──────────────────────────────────┘   │
├────────────────────────────────────────┤
│                                        │
│ Recent Searches                        │
│ [Barcelona] [Family dinner] [2023]     │
│                                        │
│ ─────────────────────────────────      │
│                                        │
│ Results for "Barcelona"                │
│ 3 entries found                        │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Barcelona Weekend             │   │
│ │ April 10, 2024 · Travel          │   │
│ │ "...Gothic Quarter..."           │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📷 Spain Trip Planning           │   │
│ │ March 1, 2024 · Ideas            │   │
│ │ "...Barcelona itinerary..."      │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Primary CTA**: Search input (auto-focused on tab selection)
**No results state**: Illustration + "No memories match your search"

---

### 8. Print / Physical Books Screen

**Purpose**: Turn entries into printed books.

**Layout (Book List)**:
```
┌────────────────────────────────────────┐
│ [Header: "Print"]                      │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📖 Create a Book                 │   │
│ │                                  │   │
│ │ Turn your memories into a        │   │
│ │ beautiful printed journal.       │   │
│ │                                  │   │
│ │ [Create Book] ← PRIMARY CTA      │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Your Books                             │
│ ─────────                              │
│ ┌──────────────────────────────────┐   │
│ │ 📕 2024 Travel Adventures        │   │
│ │ 12 entries · Classic theme       │   │
│ │ [Download PDF] [Order Print]     │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📘 Family Memories               │   │
│ │ Draft · 8 entries selected       │   │
│ │ [Continue Editing]               │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Layout (Book Builder — Step 1: Select Entries)**:
```
┌────────────────────────────────────────┐
│ [← Back] "Select Entries"      [Next]  │
├────────────────────────────────────────┤
│                                        │
│ Filter by:                             │
│ [All] [Travel ✓] [Family] [⭐ Starred] │
│                                        │
│ Date range:                            │
│ [Jan 2024] — [Dec 2024]                │
│                                        │
│ ─────────────────────────────────      │
│ 12 entries selected                    │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ [✓] Barcelona Weekend            │   │
│ │     April 10, 2024               │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ [✓] Tokyo Cherry Blossoms        │   │
│ │     April 5, 2024                │   │
│ └──────────────────────────────────┘   │
│ ┌──────────────────────────────────┐   │
│ │ [ ] Iceland Road Trip            │   │
│ │     March 15, 2024               │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

**Layout (Book Builder — Step 2: Configure)**:
```
┌────────────────────────────────────────┐
│ [← Back] "Configure Book"      [Next]  │
├────────────────────────────────────────┤
│                                        │
│ Book Title                             │
│ ┌──────────────────────────────────┐   │
│ │ 2024 Travel Adventures           │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Subtitle (optional)                    │
│ ┌──────────────────────────────────┐   │
│ │ A year of exploration            │   │
│ └──────────────────────────────────┘   │
│                                        │
│ Theme                                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│ │Clas│ │Mod │ │Vint│ │Mini│ │Roma│    │
│ │ ✓  │ │    │ │    │ │    │ │    │    │
│ └────┘ └────┘ └────┘ └────┘ └────┘    │
│                                        │
│ Include                                │
│ [✓] Photos                             │
│ [✓] Highlights                         │
│ [✓] Full story                         │
│ [ ] Tags and locations                 │
│                                        │
└────────────────────────────────────────┘
```

**Layout (Book Builder — Step 3: Preview)**:
```
┌────────────────────────────────────────┐
│ [← Back] "Preview"           [Export]  │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │                                  │   │
│ │     [Book Preview Mockup]        │   │
│ │                                  │   │
│ │     ┌──────────────────┐         │   │
│ │     │ 2024 Travel      │         │   │
│ │     │ Adventures       │         │   │
│ │     │                  │         │   │
│ │     │ A year of        │         │   │
│ │     │ exploration      │         │   │
│ │     └──────────────────┘         │   │
│ │                                  │   │
│ └──────────────────────────────────┘   │
│                                        │
│ 12 entries · 48 pages                  │
│                                        │
│ Entry Order (drag to reorder)          │
│ 1. Barcelona Weekend                   │
│ 2. Tokyo Cherry Blossoms               │
│ 3. Iceland Road Trip                   │
│ ...                                    │
│                                        │
└────────────────────────────────────────┘
```

**Layout (Book Builder — Step 4: Export)**:
```
┌────────────────────────────────────────┐
│ [← Back] "Export"                      │
├────────────────────────────────────────┤
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📥 Download PDF                  │   │
│ │ Free · Ready instantly           │   │
│ │                                  │   │
│ │ [Download] ← PRIMARY CTA         │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ┌──────────────────────────────────┐   │
│ │ 📖 Order Printed Book            │   │
│ │ From $29.99 · Ships in 5-7 days  │   │
│ │                                  │   │
│ │ [Coming Soon]                    │   │
│ └──────────────────────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

---

## Button Hierarchy Map

### Placement Rules

| Type | Style | Placement | Example |
|------|-------|-----------|---------|
| **Primary** | Filled, prominent color, shadow | Bottom of content area OR header right | "Save", "Generate Story", "Create Book" |
| **Secondary** | Outlined or ghost | Below primary OR as cards | "Browse Prompts", "Download PDF" |
| **Tertiary** | Text-only or icon | Inline with content | "Cancel", "Add highlight" |
| **Overflow** | Icon button (⋮) | Header right, consistent position | Edit, Delete, Share actions |
| **Destructive** | Red text, bottom of form | Always at bottom, separated | "Delete Entry" |

### Per-Screen Button Map

| Screen | Primary | Secondary | Overflow |
|--------|---------|-----------|----------|
| Home | "Continue Writing" / "Start with a Prompt" | Recent entry cards | Settings (⚙️) |
| Prompts (Library) | "Start Writing" on prompt | Category chips | — |
| Prompts (Edit) | "Save" | "Generate Story" | — |
| Chapters (Library) | "New Chapter" | Chapter cards | — |
| Chapter Detail | — (browse mode) | Entry cards | Edit, Pin, Archive, Delete |
| Entry Read | "Edit" | — | Star, Move, Share, Delete |
| Entry Edit | "Save" | "Regenerate", "Add highlight" | — |
| Search | — (search input) | Result cards | Cancel |
| Print (List) | "Create Book" | Book cards | — |
| Print (Builder) | "Next" / "Export" | Filter chips, entry checkboxes | — |

---

## Chapter Management UX

### Actions & Locations

| Action | Trigger | Location |
|--------|---------|----------|
| **Create** | "New Chapter" button | Chapters screen header |
| **Rename** | Overflow menu → "Edit Chapter" | Chapter Detail header |
| **Reorder** | Long-press + drag | Chapters list (Library) |
| **Pin** | Overflow menu → "Pin" | Chapter Detail header (pinned show first) |
| **Archive** | Overflow menu → "Archive" | Chapter Detail header (hidden from main list) |
| **Delete** | Overflow menu → "Delete" | Chapter Detail header (requires confirmation) |

### Chapter Creation Modal

```
┌──────────────────────────────────┐
│ New Chapter                      │
├──────────────────────────────────┤
│                                  │
│ Name                             │
│ ┌────────────────────────────┐   │
│ │ Travel                     │   │
│ └────────────────────────────┘   │
│                                  │
│ Icon                             │
│ [✈️] [👨‍👩‍👧] [💭] [💡] [⭐] [🏠]   │
│                                  │
│ Color                            │
│ [🔵] [🟢] [🟡] [🟠] [🔴] [🟣]    │
│                                  │
│ ────────────────────────────     │
│ [Cancel]              [Create]   │
│                                  │
└──────────────────────────────────┘
```

---

## Empty States & Microcopy

### No Chapters (Chapters Screen)
```
┌──────────────────────────────────┐
│                                  │
│         [📚 Illustration]        │
│                                  │
│     Organize your memories       │
│                                  │
│   Chapters help you group        │
│   memories by theme — Travel,    │
│   Family, Dreams, or anything    │
│   meaningful to you.             │
│                                  │
│     [Create First Chapter]       │
│                                  │
└──────────────────────────────────┘
```

### No Entries (Chapter Detail)
```
┌──────────────────────────────────┐
│                                  │
│         [📝 Illustration]        │
│                                  │
│     This chapter is empty        │
│                                  │
│   Start capturing memories       │
│   and assign them here.          │
│                                  │
│       [Write a Memory]           │
│                                  │
└──────────────────────────────────┘
```

### No Search Results
```
┌──────────────────────────────────┐
│                                  │
│         [🔍 Illustration]        │
│                                  │
│     No memories found            │
│                                  │
│   Try different keywords or      │
│   check your spelling.           │
│                                  │
│        [Clear Search]            │
│                                  │
└──────────────────────────────────┘
```

### Print — Nothing Selected
```
┌──────────────────────────────────┐
│                                  │
│         [📖 Illustration]        │
│                                  │
│     Select memories to include   │
│                                  │
│   Choose at least one memory     │
│   to create your book.           │
│                                  │
└──────────────────────────────────┘
```

### Home — No Entries Yet
```
┌──────────────────────────────────┐
│                                  │
│         [✨ Illustration]        │
│                                  │
│     Your journal awaits          │
│                                  │
│   Start capturing moments        │
│   with guided prompts.           │
│                                  │
│     [Start with a Prompt]        │
│                                  │
└──────────────────────────────────┘
```

---

## Minimal Design System

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Related elements |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Standard gap |
| `space-6` | 24px | Section separation |
| `space-8` | 32px | Major section breaks |
| `space-12` | 48px | Page-level spacing |

### Typography Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 (Page title) | Cormorant Garamond | 28px | 600 | 1.2 |
| H2 (Section title) | Cormorant Garamond | 22px | 600 | 1.3 |
| H3 (Card title) | Cormorant Garamond | 18px | 500 | 1.3 |
| Body | DM Sans | 15px | 400 | 1.6 |
| Body small | DM Sans | 13px | 400 | 1.5 |
| Label | DM Sans | 12px | 500 | 1.4 |
| Caption | DM Sans | 11px | 400 | 1.4 |

### Component Rules

**Cards**
- Border radius: `radius-lg` (14px)
- Padding: `space-4` (16px)
- Background: `card` with 80% opacity
- Border: 1px `border` at 30% opacity
- Shadow: subtle, 2px blur on hover

**Chips/Tags**
- Border radius: `radius-full`
- Padding: `space-1` horizontal, `space-2` vertical
- Font: Body small, medium weight
- Background: `secondary` at 60% opacity

**Lists**
- Gap between items: `space-3` (12px)
- Dividers: optional, use `border` at 20% opacity

**Inputs**
- Height: 44px minimum (touch-friendly)
- Border radius: `radius-md` (14px)
- Padding: `space-3` horizontal
- Border: 1px `input`
- Focus: 2px ring `ring`

**Buttons**
- Primary: filled `primary`, white text, `radius-md`, shadow
- Secondary: outlined `border`, `foreground` text
- Ghost: no background, hover `secondary/50`
- Minimum touch target: 44×44px

### Do/Don't Guidelines

**DO:**
- ✅ Use one primary CTA per screen
- ✅ Group related actions in overflow menu
- ✅ Use consistent icon placement (left of label)
- ✅ Provide generous padding and whitespace
- ✅ Use semantic color (success = green, warning = amber, error = red)
- ✅ Animate state changes (opacity, scale) subtly
- ✅ Show loading states for async actions

**DON'T:**
- ❌ Place multiple prominent buttons competing for attention
- ❌ Mix browse and edit modes on same screen
- ❌ Use more than 3 action buttons visible at once
- ❌ Rely on color alone to convey meaning
- ❌ Use animations longer than 300ms
- ❌ Hide critical actions in menus (Edit should be visible)
- ❌ Use modal dialogs for primary flows

---

## Chaos Audit Checklist

Apply to any screen to ensure order:

### Visual Hierarchy
- [ ] Is there exactly ONE primary CTA?
- [ ] Are secondary actions visually subordinate (outlined/ghost)?
- [ ] Is there adequate whitespace between sections?
- [ ] Does the eye naturally flow from top to bottom?

### Action Clarity
- [ ] Can a user complete the main task without confusion?
- [ ] Are destructive actions separated and require confirmation?
- [ ] Are overflow menus used for 3+ secondary actions?
- [ ] Is the back/exit path obvious?

### Mode Separation
- [ ] Is this clearly Browse, Read, OR Edit mode (not mixed)?
- [ ] Are edit controls hidden in read mode?
- [ ] Is content non-interactive in read mode?

### Consistency
- [ ] Do buttons match the hierarchy map?
- [ ] Are icons from the same family (Phosphor)?
- [ ] Is spacing from the defined scale?
- [ ] Is typography from the defined scale?

### Mobile-First
- [ ] Are touch targets at least 44×44px?
- [ ] Is the most important content above the fold?
- [ ] Does the bottom nav have 5 clear destinations?
- [ ] Are forms easy to complete one-handed?

---

## Design Direction

The design should evoke feelings of:
- **Serenity** — Like a quiet morning with a journal and coffee
- **Nostalgia** — Warm, like flipping through a photo album
- **Clarity** — Everything has its place; nothing feels cluttered

## Color Selection

- **Primary Color**: `oklch(0.55 0.18 280)` — Soft violet that feels calm and creative
- **Secondary Colors**: 
  - Muted lavender `oklch(0.94 0.02 250)` for backgrounds
  - Soft slate for text hierarchy
- **Accent Color**: `oklch(0.60 0.20 330)` — Warm rose for starred/important items
- **Foreground/Background Pairings**:
  - Background (white-ish) + Foreground (dark slate): Ratio 14:1 ✓
  - Card (frosted lavender) + Card Foreground (dark): Ratio 12:1 ✓
  - Primary (violet) + Primary Foreground (white): Ratio 7:1 ✓
  - Accent (rose) + Accent Foreground (white): Ratio 5.2:1 ✓

## Font Selection

Typography should feel literary yet approachable — like a beautifully designed book.

- **Cormorant Garamond** for headings: elegant, editorial, timeless
- **DM Sans** for body: clean, readable, modern

## Animations

Animations should be felt, not seen — subtle transitions that guide without distracting.

- Page transitions: 250ms fade + slight slide
- Card hover: 200ms scale(1.01) + shadow increase
- Button press: 100ms scale(0.97)
- Loading states: gentle pulse, not spinning

## Component Selection

- **Cards**: shadcn Card with custom backdrop blur
- **Dialogs**: shadcn Dialog for confirmations and chapter creation
- **Inputs**: shadcn Input with custom focus states
- **Buttons**: shadcn Button with custom shadows
- **Tabs**: Custom bottom nav (mobile) / sidebar (desktop)
- **Select**: shadcn Select for dropdowns
- **Checkbox**: shadcn Checkbox for multi-select in Print flow

**Customizations needed**:
- BottomNav component (5 tabs, icons + labels)
- SidebarNav component (desktop)
- EmptyState component (illustration + text + CTA)
- BookPreview component (mockup renderer)

**Icon Selection** (Phosphor):
- Home: House
- Prompts: Sparkle
- Chapters: Books
- Search: MagnifyingGlass
- Print: Book
- Edit: PencilSimple
- Delete: Trash
- Overflow: DotsThreeVertical
- Star: Star
- Back: CaretLeft

**Mobile Adaptations**:
- Bottom nav always visible (except in full-screen edit)
- Cards stack vertically
- Photo grids become 2-column on mobile
- Sidebar becomes bottom sheet on mobile for settings
