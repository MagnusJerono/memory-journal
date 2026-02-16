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
  prompt_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  entry_id: string;
  storage_url: string;
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
  { value: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { value: 'reflection', label: 'Reflection', emoji: '🪞' },
  { value: 'memory', label: 'Memory', emoji: '📸' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'goals', label: 'Goals', emoji: '🎯' },
  { value: 'relationships', label: 'Relationships', emoji: '💕' },
];

export const DEFAULT_PROMPTS: Prompt[] = [
  { id: '1', text: 'What made you smile today?', category: 'gratitude' },
  { id: '2', text: 'Describe a place that feels like home.', category: 'memory' },
  { id: '3', text: 'What would you tell your younger self?', category: 'reflection' },
  { id: '4', text: 'Write about a person who changed your life.', category: 'relationships' },
  { id: '5', text: 'What are you most proud of this week?', category: 'gratitude' },
  { id: '6', text: 'Describe your perfect day from start to finish.', category: 'creative' },
  { id: '7', text: 'What is a goal you are working towards?', category: 'goals' },
  { id: '8', text: 'Write about a moment that took your breath away.', category: 'memory' },
  { id: '9', text: 'What does success mean to you?', category: 'reflection' },
  { id: '10', text: 'Describe someone you admire and why.', category: 'relationships' },
  { id: '11', text: 'What are three things you are grateful for today?', category: 'gratitude' },
  { id: '12', text: 'Write about a challenge you overcame.', category: 'reflection' },
  { id: '13', text: 'Describe a dream you had recently.', category: 'creative' },
  { id: '14', text: 'What adventure would you like to have?', category: 'goals' },
  { id: '15', text: 'Write about a favorite childhood memory.', category: 'memory' },
  { id: '16', text: 'What makes you feel most alive?', category: 'reflection' },
];

export type NavigationTab = 'home' | 'prompts' | 'chapters' | 'timeline' | 'search' | 'print';

export type AppView = 
  | { type: 'home' }
  | { type: 'prompts' }
  | { type: 'prompts-new'; promptId?: string; returnTo?: AppView }
  | { type: 'chapters' }
  | { type: 'chapter-detail'; chapterId: string }
  | { type: 'timeline' }
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
