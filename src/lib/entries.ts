import { Entry, AIGenerationResult, StoryTone, STORY_LANGUAGES } from './types';
import { v4 as uuid } from 'uuid';

const TONE_INSTRUCTIONS: Record<Exclude<StoryTone, 'custom'>, string> = {
  natural: `Write in a natural, authentic voice. Use conversational language that feels genuine and unforced, like someone sharing a meaningful memory with a close friend.`,
  casual: `Write in a relaxed, casual tone. Use informal language, contractions, and a friendly vibe - like texting a good friend about your day. Keep it light and approachable.`,
  poetic: `Write with lyrical, evocative language. Use vivid imagery, metaphors, and sensory details to paint the scene beautifully. Let the words flow with rhythm and emotion.`,
  nostalgic: `Write with a warm, reflective tone. Capture the bittersweet feeling of looking back at cherished moments. Use gentle pacing and sentimental touches without being overly sappy.`,
  journalistic: `Write in a clear, factual style. Present the events objectively and chronologically, focusing on the who, what, where, when, and why. Keep it informative and well-structured.`,
  humorous: `Write with a light-hearted, witty tone. Find the funny moments, use playful language, and don't take things too seriously. Add charm and humor while respecting the memory.`
};

interface GenerationOptions {
  tone: StoryTone;
  customTonePrompt?: string;
  outputLanguage?: string;
}

function getLanguageName(code: string): string {
  const lang = STORY_LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : 'English';
}

function buildSystemPrompt(options: GenerationOptions): string {
  const { tone, customTonePrompt, outputLanguage } = options;
  
  let toneInstructions: string;
  if (tone === 'custom' && customTonePrompt) {
    toneInstructions = `Write following these custom style instructions from the user: "${customTonePrompt}"`;
  } else if (tone !== 'custom') {
    toneInstructions = TONE_INSTRUCTIONS[tone];
  } else {
    toneInstructions = TONE_INSTRUCTIONS.natural;
  }

  const languageInstruction = outputLanguage && outputLanguage !== 'en'
    ? `\n\nIMPORTANT: Write the entire output (title, highlights, story, tags) in ${getLanguageName(outputLanguage)}. The JSON keys must remain in English, but all values/content must be in ${getLanguageName(outputLanguage)}.`
    : '';

  return `You are a memory journaling writing assistant.

${toneInstructions}

Do not invent facts. Use ONLY the user-provided transcript and optional user title.

If key details are missing, add clarifying questions in missing_info_questions.

If a statement is uncertain or implied, list it in uncertain_claims.

Output MUST be valid JSON that matches the schema. No markdown.

Required JSON structure:
{
  "title": "string (max 80 chars)",
  "highlights": ["array of 5-8 strings, each max 140 chars"],
  "story": "string (200-500 words)",
  "tags": {
    "people": ["0-8 strings"],
    "places": ["0-8 strings"],
    "moods": ["0-8 strings"],
    "themes": ["0-8 strings"]
  },
  "missing_info_questions": ["0-3 strings"],
  "uncertain_claims": ["0-5 strings"]
}

Additional style constraints:
- modern, concise, not cringe
- no therapy language
- no invented names/places${languageInstruction}`;
}

export async function generateAIContent(
  entry: Entry, 
  tone: StoryTone = 'natural',
  customTonePrompt?: string,
  outputLanguage?: string
): Promise<AIGenerationResult> {
  const userContent = JSON.stringify({
    date: entry.date,
    user_title: entry.title_user || '',
    transcript: entry.transcript || ''
  });

  const systemPrompt = buildSystemPrompt({ tone, customTonePrompt, outputLanguage });
  const fullPrompt = `${systemPrompt}

User input:
${userContent}`;

  const response = await window.spark.llm(fullPrompt, 'gpt-4o', true);
  const result = JSON.parse(response) as AIGenerationResult;
  
  return validateAIResult(result);
}

function validateAIResult(result: AIGenerationResult): AIGenerationResult {
  if (!result.title || typeof result.title !== 'string') {
    result.title = 'Untitled Memory';
  }
  if (result.title.length > 80) {
    result.title = result.title.substring(0, 80);
  }

  if (!Array.isArray(result.highlights)) {
    result.highlights = [];
  }
  result.highlights = result.highlights
    .filter(h => typeof h === 'string')
    .slice(0, 8)
    .map(h => h.length > 140 ? h.substring(0, 140) : h);
  
  if (result.highlights.length < 5) {
    while (result.highlights.length < 5) {
      result.highlights.push('A moment worth remembering');
    }
  }

  if (!result.story || typeof result.story !== 'string') {
    result.story = 'This memory is waiting to be told. Add more details to your transcript to generate a fuller story.';
  }

  if (!result.tags || typeof result.tags !== 'object') {
    result.tags = { people: [], places: [], moods: [], themes: [] };
  }
  
  ['people', 'places', 'moods', 'themes'].forEach(key => {
    const k = key as keyof typeof result.tags;
    if (!Array.isArray(result.tags[k])) {
      result.tags[k] = [];
    }
    result.tags[k] = result.tags[k].filter(t => typeof t === 'string').slice(0, 8);
  });

  if (!Array.isArray(result.missing_info_questions)) {
    result.missing_info_questions = [];
  }
  result.missing_info_questions = result.missing_info_questions
    .filter(q => typeof q === 'string')
    .slice(0, 3);

  if (!Array.isArray(result.uncertain_claims)) {
    result.uncertain_claims = [];
  }
  result.uncertain_claims = result.uncertain_claims
    .filter(c => typeof c === 'string')
    .slice(0, 5);

  return result;
}

export function createEmptyEntry(date: string): Entry {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    date,
    title_user: null,
    title_ai: null,
    transcript: null,
    story_ai: null,
    highlights_ai: null,
    tags_ai: null,
    missing_info_questions: null,
    uncertain_claims: null,
    is_locked: false,
    photos: [],
    created_at: now,
    updated_at: now
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getYearFromDate(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getFullYear();
}

export function getMonthFromDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getAvailableYears(entries: Entry[]): number[] {
  const years = new Set(entries.map(e => getYearFromDate(e.date)));
  const currentYear = new Date().getFullYear();
  years.add(currentYear);
  return Array.from(years).sort((a, b) => b - a);
}

export function filterEntriesByYear(entries: Entry[], year: number): Entry[] {
  return entries
    .filter(e => getYearFromDate(e.date) === year)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEntryTitle(entry: Entry): string {
  return entry.title_user || entry.title_ai || 'Untitled Memory';
}
