# Ziel - Memory Journaling App

A photo + text journaling app where users input photos and text/voice transcripts, and AI generates titles, highlights, stories, and tags. Users can browse, edit, lock entries, and export a Yearbook PDF.

**Experience Qualities**:
1. **Intimate** - The app feels like a personal, private space for capturing memories without judgment
2. **Effortless** - Minimal friction between capturing a moment and having a beautifully written story
3. **Trustworthy** - AI never invents facts; it only organizes and articulates what users provide

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple views (Timeline, New Entry, Entry Detail, Yearbook) with CRUD operations, AI generation, and PDF export

## Essential Features

### 1. Entry Creation
- **Functionality**: Create memory entries with date, optional title, transcript text, and photos
- **Purpose**: Capture raw moments before AI enhancement
- **Trigger**: "New Entry" button from Timeline
- **Progression**: Click New Entry → Select date → Add title (optional) → Write/paste transcript → Upload photos → Click Generate → View AI-enhanced entry
- **Success criteria**: Entry saved with photos, transcript stored, ready for AI generation

### 2. AI Story Generation
- **Functionality**: Generate title, highlights (5-8), story (200-500 words), and tags from transcript
- **Purpose**: Transform raw notes into polished memory narratives
- **Trigger**: "Generate" button on new/existing unlocked entries
- **Progression**: Click Generate → AI processes transcript → Returns structured content with questions/uncertainties → Content auto-saved to entry
- **Success criteria**: Valid JSON output with all required fields, no invented facts, questions for missing info

### 3. Timeline Browsing
- **Functionality**: View all entries for a selected year as cards with cover photo, title, date, first highlight
- **Purpose**: Quick overview and navigation of memories
- **Trigger**: App landing page or year selection
- **Progression**: Load timeline → See entry cards → Click card → View full entry
- **Success criteria**: Entries display correctly sorted by date descending

### 4. Entry Editing & Locking
- **Functionality**: Edit title, transcript, highlights, story; lock to prevent overwrites
- **Purpose**: User control over finalized memories
- **Trigger**: Edit fields directly on Entry Detail page; toggle lock
- **Progression**: Click field → Edit inline → Auto-save → Toggle lock to finalize
- **Success criteria**: Changes persist, locked entries block regeneration

### 5. Yearbook PDF Export
- **Functionality**: Generate PDF yearbook with cover, theme stats, monthly sections, entries
- **Purpose**: Physical/shareable artifact of the year's memories
- **Trigger**: "Generate" button on Yearbook page
- **Progression**: Select year → Choose options → Click Generate → Download PDF
- **Success criteria**: Clean PDF with all locked entries, proper layout

## Edge Case Handling

- **No transcript provided**: Block generation with helpful message "Please add a transcript first"
- **Transcript too short (<40 chars)**: Block with "Tell us a bit more - at least a few sentences help create a better story"
- **No photos**: Allow entry creation (text-first is valid)
- **Locked entry regeneration**: Disable button, show "Unlock to regenerate"
- **Empty year**: Show friendly empty state with prompt to create first entry
- **AI validation failure**: Retry once, then show error with option to try again

## Design Direction

Warm, minimal, and personal. The design should feel like a high-quality paper journal digitized - clean typography, generous whitespace, subtle textures. Photography-forward with text as supporting narrative. Muted, earthy tones that don't compete with user photos.

## Color Selection

- **Primary Color**: `oklch(0.45 0.12 250)` - Deep slate blue for actions and focus states, communicates trust and stability
- **Secondary Colors**: `oklch(0.92 0.02 80)` - Warm cream for backgrounds, feels like quality paper
- **Accent Color**: `oklch(0.65 0.15 45)` - Warm amber for highlights and CTAs, evokes nostalgia and warmth
- **Foreground/Background Pairings**:
  - Background (Cream `oklch(0.96 0.02 80)`): Foreground (Dark `oklch(0.25 0.02 250)`) - Ratio 8.5:1 ✓
  - Card (White `oklch(0.99 0 0)`): Foreground (Dark `oklch(0.25 0.02 250)`) - Ratio 12:1 ✓
  - Primary (Slate `oklch(0.45 0.12 250)`): White text (`oklch(0.99 0 0)`) - Ratio 5.2:1 ✓
  - Accent (Amber `oklch(0.65 0.15 45)`): Dark text (`oklch(0.25 0.02 250)`) - Ratio 4.8:1 ✓

## Font Selection

Typography should feel editorial and timeless - like a beautifully typeset memoir. Using **Newsreader** for headings (serif with personality) and **Source Sans 3** for body text (highly readable, warm humanist sans).

- **Typographic Hierarchy**:
  - H1 (Page titles): Newsreader Semibold/32px/tight letter spacing
  - H2 (Section titles): Newsreader Medium/24px/normal
  - H3 (Card titles): Newsreader Medium/18px/normal
  - Body: Source Sans 3 Regular/16px/1.6 line height
  - Caption: Source Sans 3 Regular/14px/muted color
  - Label: Source Sans 3 Medium/12px/uppercase/wide letter spacing

## Animations

Subtle and purposeful - gentle fades for content loading, smooth transitions between pages, and a satisfying "lock" animation when finalizing entries. Photo galleries use soft scale-up on hover. Avoid anything flashy that distracts from the intimate journaling experience.

## Component Selection

- **Components**:
  - Card: Entry cards on timeline with hover elevation
  - Button: Primary (slate), Secondary (outlined), Ghost (for inline actions)
  - Input/Textarea: Borderless style for inline editing feel
  - Dialog: For photo lightbox and confirmations
  - Select: Year dropdown, theme selection
  - Switch: Lock toggle
  - Badge: Tags display
  - Tabs: Entry detail sections (if needed)
  - Separator: Between entry sections
  - ScrollArea: Photo gallery horizontal scroll
  
- **Customizations**:
  - PhotoGrid: Custom masonry-style layout for 1-10 photos
  - HighlightsList: Editable bullet list with add/remove
  - MissingInfoPanel: Collapsible panel for AI questions
  
- **States**:
  - Buttons: Default → Hover (slight lift) → Active (pressed) → Disabled (muted)
  - Inputs: Default → Focus (accent ring) → Filled → Error (red ring)
  - Lock toggle: Unlocked (muted) → Locked (amber glow)
  
- **Icon Selection**: Phosphor icons - Camera, PencilSimple, Lock, LockOpen, Calendar, MagnifyingGlass, Plus, Download, Sparkle (for AI), Warning
  
- **Spacing**: 4px base, cards use p-6, sections gap-8, inline elements gap-2
  
- **Mobile**: Stack photo grid vertically, full-width cards, bottom-fixed action buttons
