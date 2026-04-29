export interface LocationSuggestion {
  name: string;
  type: 'city' | 'neighborhood' | 'landmark' | 'venue' | 'country';
  confidence: 'high' | 'medium' | 'low';
  source: 'image' | 'transcript';
}

export interface Chapter {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: ChapterIcon;
  is_pinned: boolean;
  is_archived: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type ChapterIcon = 'person' | 'heart' | 'star' | 'house' | 'airplane' | 'briefcase' | 'graduation' | 'baby' | 'ring' | 'lightbulb' | 'moon' | 'custom';

export const CHAPTER_ICONS: { value: ChapterIcon; label: string; emoji: string }[] = [
  { value: 'person', label: 'Person', emoji: '👤' },
  { value: 'heart', label: 'Love', emoji: '❤️' },
  { value: 'star', label: 'Special', emoji: '⭐' },
  { value: 'house', label: 'Home', emoji: '🏠' },
  { value: 'airplane', label: 'Travel', emoji: '✈️' },
  { value: 'briefcase', label: 'Work', emoji: '💼' },
  { value: 'graduation', label: 'Education', emoji: '🎓' },
  { value: 'baby', label: 'Family', emoji: '👶' },
  { value: 'ring', label: 'Milestone', emoji: '💍' },
  { value: 'lightbulb', label: 'Ideas', emoji: '💡' },
  { value: 'moon', label: 'Dreams', emoji: '🌙' },
  { value: 'custom', label: 'Custom', emoji: '📁' },
];

export const CHAPTER_COLORS = [
  { value: 'rose', label: 'Rose', color: 'oklch(0.65 0.2 350)', isDark: false },
  { value: 'amber', label: 'Amber', color: 'oklch(0.75 0.18 75)', isDark: false },
  { value: 'emerald', label: 'Emerald', color: 'oklch(0.65 0.17 160)', isDark: false },
  { value: 'sky', label: 'Sky', color: 'oklch(0.65 0.15 230)', isDark: false },
  { value: 'violet', label: 'Violet', color: 'oklch(0.60 0.2 280)', isDark: true },
  { value: 'slate', label: 'Slate', color: 'oklch(0.55 0.03 250)', isDark: true },
];

export interface Entry {
  id: string;
  user_id?: string;
  date: string;
  title_user: string | null;
  title_ai: string | null;
  transcript: string | null;
  story_ai: string | null;
  highlights_ai: string[] | null;
  tags_ai: {
    people: string[];
    places: string[];
    moods: string[];
    themes: string[];
  } | null;
  location_suggestions: LocationSuggestion[] | null;
  manual_locations: string[] | null;
  missing_info_questions: string[] | null;
  uncertain_claims: string[] | null;
  is_locked: boolean;
  is_starred: boolean;
  is_draft: boolean;
  chapter_id: string | null;
  photos: Photo[];
  collaborators?: EntryCollaborator[];
  collaboration_role?: EntryAccessRole;
  prompt_used: string | null;
  created_at: string;
  updated_at: string;
}

export type EntryCollaboratorRole = 'editor' | 'viewer';
export type EntryCollaboratorStatus = 'pending' | 'accepted';
export type EntryAccessRole = 'owner' | EntryCollaboratorRole;

export interface EntryCollaborator {
  id: string;
  entry_id: string;
  owner_id: string;
  collaborator_user_id: string | null;
  invitee_email: string;
  role: EntryCollaboratorRole;
  status: EntryCollaboratorStatus;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  entry_id: string;
  // Canonical location inside the Supabase Storage bucket: "{user_id}/{entry_id}/{file}".
  storage_path: string;
  // Short-lived signed URL for <img src>. Populated by the data layer on read,
  // and by the uploader (object URL or signed URL) during create.
  storage_url: string;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  theme: BookTheme;
  entry_ids: string[];
  is_draft: boolean;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BookTheme = 'classic' | 'modern' | 'vintage' | 'minimal' | 'romantic';

export const BOOK_THEMES: { value: BookTheme; label: string; description: string; preview: { bg: string; accent: string; text: string } }[] = [
  { 
    value: 'classic', 
    label: 'Classic', 
    description: 'Timeless elegance',
    preview: { bg: 'oklch(0.98 0.005 60)', accent: 'oklch(0.35 0.05 50)', text: 'oklch(0.25 0.02 50)' }
  },
  { 
    value: 'modern', 
    label: 'Modern', 
    description: 'Clean and minimal',
    preview: { bg: 'oklch(1 0 0)', accent: 'oklch(0.45 0.15 260)', text: 'oklch(0.15 0 0)' }
  },
  { 
    value: 'vintage', 
    label: 'Vintage', 
    description: 'Nostalgic warmth',
    preview: { bg: 'oklch(0.95 0.03 80)', accent: 'oklch(0.55 0.12 45)', text: 'oklch(0.30 0.04 60)' }
  },
  { 
    value: 'minimal', 
    label: 'Minimal', 
    description: 'Simple and elegant',
    preview: { bg: 'oklch(0.99 0 0)', accent: 'oklch(0.5 0 0)', text: 'oklch(0.2 0 0)' }
  },
  { 
    value: 'romantic', 
    label: 'Romantic', 
    description: 'Soft and dreamy',
    preview: { bg: 'oklch(0.97 0.02 350)', accent: 'oklch(0.65 0.15 350)', text: 'oklch(0.35 0.05 350)' }
  },
];

export interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
}

export type PromptCategory = 'gratitude' | 'reflection' | 'memory' | 'creative' | 'goals' | 'relationships';

export const PROMPT_CATEGORIES: { value: PromptCategory; label: string; emoji: string }[] = [
  { value: 'gratitude', label: 'Small details', emoji: '🔎' },
  { value: 'reflection', label: 'Trips', emoji: '🧳' },
  { value: 'memory', label: 'Places', emoji: '📍' },
  { value: 'creative', label: 'Scenes', emoji: '🎞️' },
  { value: 'goals', label: 'First times', emoji: '✨' },
  { value: 'relationships', label: 'People', emoji: '👥' },
];

export const DEFAULT_PROMPTS: Prompt[] = [
  { id: '1', text: 'Write about a vacation morning you still remember clearly: where did you wake up, and what did the day sound like?', category: 'reflection' },
  { id: '2', text: 'Describe a place from a trip that you can still picture when you close your eyes.', category: 'memory' },
  { id: '3', text: 'Tell the story of a meal, snack, or drink from a trip that became part of the memory.', category: 'gratitude' },
  { id: '4', text: 'Write about someone you travelled with and a small moment between you that stayed with you.', category: 'relationships' },
  { id: '5', text: 'Remember a journey there or back: the train, car, airport, ferry, road, or waiting time.', category: 'reflection' },
  { id: '6', text: 'Describe a photo you wish you had taken on a vacation, and what was happening around it.', category: 'creative' },
  { id: '7', text: 'Write about the first time you arrived somewhere new on a trip.', category: 'goals' },
  { id: '8', text: 'Capture a tiny detail from a holiday place: a smell, a sound, a color, or the weather.', category: 'gratitude' },
  { id: '9', text: 'Tell the story of getting lost, taking a detour, or discovering something by accident while travelling.', category: 'reflection' },
  { id: '10', text: 'Describe a vacation tradition your family, friends, or partner always seemed to repeat.', category: 'relationships' },
  { id: '11', text: 'Write about the room, tent, apartment, or hotel where you stayed on a memorable trip.', category: 'memory' },
  { id: '12', text: 'Remember a beach, mountain, city street, lake, forest, or view that felt important at the time.', category: 'memory' },
  { id: '13', text: 'Tell the story behind a souvenir, ticket, postcard, shell, or object you kept from a trip.', category: 'creative' },
  { id: '14', text: 'Write about a vacation moment that felt like a first: first swim, first flight, first big city, or first time away.', category: 'goals' },
  { id: '15', text: 'Describe a childhood holiday memory as a scene: who was there, where were you, and what happened next?', category: 'memory' },
  { id: '16', text: 'Write about the last evening of a trip and what you did before leaving.', category: 'reflection' },
];

export type NavigationTab = 'home' | 'prompts' | 'library' | 'print';

export type AppView = 
  | { type: 'home' }
  | { type: 'prompts' }
  | { type: 'prompts-new'; promptId?: string; momentAssetIds?: string[]; momentTitle?: string; momentPrompt?: string; returnTo?: AppView }
  | { type: 'chapters' }
  | { type: 'chapter-detail'; chapterId: string }
  | { type: 'timeline' }
  | { type: 'library'; tab?: 'chapters' | 'timeline' }
  | { type: 'entry-read'; entryId: string; returnTo?: AppView }
  | { type: 'entry-edit'; entryId: string; returnTo?: AppView }
  | { type: 'search' }
  | { type: 'print' }
  | { type: 'print-builder'; bookId?: string; step: 1 | 2 | 3 | 4 };

export type StoryTone = 'natural' | 'poetic' | 'casual' | 'journalistic' | 'humorous' | 'nostalgic' | 'custom';

export const STORY_TONES: { value: StoryTone; label: string; description: string; flag: string }[] = [
  { value: 'natural', label: 'Natural', description: 'Authentic and conversational', flag: '💬' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, like texting a friend', flag: '😊' },
  { value: 'poetic', label: 'Poetic', description: 'Lyrical and evocative', flag: '✨' },
  { value: 'nostalgic', label: 'Nostalgic', description: 'Warm and reflective', flag: '🌅' },
  { value: 'journalistic', label: 'Journalistic', description: 'Clear and factual', flag: '📰' },
  { value: 'humorous', label: 'Humorous', description: 'Light-hearted and fun', flag: '😄' },
  { value: 'custom', label: 'Custom', description: 'Define your own style', flag: '🎨' },
];

export const STORY_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface UserSettings {
  themeMode: ThemeMode;
}
