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
  missing_info_questions: string[] | null;
  uncertain_claims: string[] | null;
  is_locked: boolean;
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
