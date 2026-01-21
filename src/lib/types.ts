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
