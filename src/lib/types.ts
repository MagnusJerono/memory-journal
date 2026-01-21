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
  icon: 'person' | 'heart' | 'star' | 'house' | 'airplane' | 'briefcase' | 'graduation' | 'baby' | 'ring' | 'custom';
  created_at: string;
  updated_at: string;
}

export const CHAPTER_ICONS = [
  { value: 'person', label: 'Person', emoji: '👤' },
  { value: 'heart', label: 'Love', emoji: '❤️' },
  { value: 'star', label: 'Special', emoji: '⭐' },
  { value: 'house', label: 'Home', emoji: '🏠' },
  { value: 'airplane', label: 'Travel', emoji: '✈️' },
  { value: 'briefcase', label: 'Work', emoji: '💼' },
  { value: 'graduation', label: 'Education', emoji: '🎓' },
  { value: 'baby', label: 'Family', emoji: '👶' },
  { value: 'ring', label: 'Milestone', emoji: '💍' },
  { value: 'custom', label: 'Custom', emoji: '📁' },
] as const;

export const CHAPTER_COLORS = [
  { value: 'rose', label: 'Rose', color: 'oklch(0.65 0.2 350)' },
  { value: 'amber', label: 'Amber', color: 'oklch(0.75 0.18 75)' },
  { value: 'emerald', label: 'Emerald', color: 'oklch(0.65 0.17 160)' },
  { value: 'sky', label: 'Sky', color: 'oklch(0.65 0.15 230)' },
  { value: 'violet', label: 'Violet', color: 'oklch(0.60 0.2 280)' },
  { value: 'slate', label: 'Slate', color: 'oklch(0.55 0.03 250)' },
] as const;

export interface Entry {
  id: string;
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
  chapter_ids: string[];
  photos: Photo[];
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  entry_id: string;
  storage_url: string;
  created_at: string;
}

export interface Yearbook {
  id: string;
  year: number;
  include_locked_only: boolean;
  theme: string;
  pdf_url: string | null;
  created_at: string;
}

export type YearbookTheme = 'classic' | 'modern' | 'vintage' | 'minimal' | 'romantic';

export const YEARBOOK_THEMES: { value: YearbookTheme; label: string; description: string; preview: { bg: string; accent: string; text: string } }[] = [
  { 
    value: 'classic', 
    label: 'Klassisch', 
    description: 'Zeitlos elegant',
    preview: { bg: 'oklch(0.98 0.005 60)', accent: 'oklch(0.35 0.05 50)', text: 'oklch(0.25 0.02 50)' }
  },
  { 
    value: 'modern', 
    label: 'Modern', 
    description: 'Klar und minimalistisch',
    preview: { bg: 'oklch(1 0 0)', accent: 'oklch(0.45 0.15 260)', text: 'oklch(0.15 0 0)' }
  },
  { 
    value: 'vintage', 
    label: 'Vintage', 
    description: 'Nostalgisch warm',
    preview: { bg: 'oklch(0.95 0.03 80)', accent: 'oklch(0.55 0.12 45)', text: 'oklch(0.30 0.04 60)' }
  },
  { 
    value: 'minimal', 
    label: 'Minimal', 
    description: 'Schlicht und elegant',
    preview: { bg: 'oklch(0.99 0 0)', accent: 'oklch(0.5 0 0)', text: 'oklch(0.2 0 0)' }
  },
  { 
    value: 'romantic', 
    label: 'Romantisch', 
    description: 'Weich und verträumt',
    preview: { bg: 'oklch(0.97 0.02 350)', accent: 'oklch(0.65 0.15 350)', text: 'oklch(0.35 0.05 350)' }
  },
];

export interface AIGenerationResult {
  title: string;
  highlights: string[];
  story: string;
  tags: {
    people: string[];
    places: string[];
    moods: string[];
    themes: string[];
  };
  location_suggestions: LocationSuggestion[];
  missing_info_questions: string[];
  uncertain_claims: string[];
}

export type View = 'timeline' | 'new' | 'entry' | 'yearbook';

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
