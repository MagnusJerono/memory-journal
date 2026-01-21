import { Entry, AIGenerationResult, StoryTone, STORY_LANGUAGES, LocationSuggestion } from './types';
import { v4 as uuid } from 'uuid';

const TONE_INSTRUCTIONS: Record<Exclude<StoryTone, 'custom'>, string> = {
  natural: `Write in a natural, authentic voice. Use conversational language that feels genuine and unforced, like someone sharing a meaningful memory with a close friend.`,
  casual: `Write in a relaxed, casual tone. Use informal language, contractions, and a friendly vibe - like texting a good friend about your day. Keep it light and approachable.`,
  poetic: `Write with lyrical, evocative language. Use vivid imagery, metaphors, and sensory details to paint the scene beautifully. Let the words flow with rhythm and emotion.`,
  nostalgic: `Write with a warm, reflective tone. Capture the bittersweet feeling of looking back at cherished moments. Use gentle pacing and sentimental touches without being overly sappy.`,
  journalistic: `Write in a clear, factual style. Present the events objectively and chronologically, focusing on the who, what, where, when, and why. Keep it informative and well-structured.`,
  humorous: `Write with a light-hearted, witty tone. Find the funny moments, use playful language, and don't take things too seriously. Add charm and humor while respecting the memory.`
};

export interface QuestionAnswer {
  question: string;
  answer: string;
}

interface GenerationOptions {
  tone: StoryTone;
  customTonePrompt?: string;
  outputLanguage?: string;
  refinementAnswers?: QuestionAnswer[];
  imageAnalysis?: ImageAnalysisResult | null;
  manualLocations?: string[];
}

export interface ImageAnalysisResult {
  locations: LocationSuggestion[];
  description: string;
}

function getLanguageName(code: string): string {
  const lang = STORY_LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : 'English';
}

export async function analyzeImagesForLocations(_photoUrls: string[]): Promise<ImageAnalysisResult> {
  if (_photoUrls.length === 0) {
    return { locations: [], description: '' };
  }

  const photoCount = String(_photoUrls.slice(0, 3).length);
  
  const promptText = `You are an expert at identifying locations from photos. Analyze the following ${photoCount} photo(s) and identify any recognizable:
- Cities or countries (from skylines, architecture, signs, landmarks)
- Specific neighborhoods or districts
- Famous landmarks (buildings, monuments, bridges, parks)
- Venues (restaurants, cafes, museums, hotels - look for names/signs)
- Street names or distinctive architectural styles that indicate a region

For each location you identify, provide:
- The exact name (use proper capitalized names like "Eiffel Tower" not "eiffel tower")
- The type (city, neighborhood, landmark, venue, country)
- Your confidence level (high if clearly visible/recognizable, medium if fairly certain, low if just a guess)

Be specific! Instead of just "Europe", identify "Paris, France" or "Montmartre neighborhood". 
Look for: street signs, building names, distinctive architecture, famous landmarks, language on signs, license plates, etc.

Return ONLY valid JSON in this exact format:
{
  "locations": [
    { "name": "Exact Location Name", "type": "city|neighborhood|landmark|venue|country", "confidence": "high|medium|low", "source": "image" }
  ],
  "description": "Brief description of what you see in the photos that helped identify these locations"
}

If you cannot identify any specific locations, return empty locations array but describe what you see.`;

  try {
    const response = await window.spark.llm(promptText, 'gpt-4o', true);
    const result = JSON.parse(response) as ImageAnalysisResult;
    
    if (!Array.isArray(result.locations)) {
      result.locations = [];
    }
    result.locations = result.locations.map(loc => ({
      ...loc,
      source: 'image' as const
    }));
    
    return result;
  } catch (error) {
    console.error('Image analysis failed:', error);
    return { locations: [], description: '' };
  }
}

function buildSystemPrompt(options: GenerationOptions): string {
  const { tone, customTonePrompt, outputLanguage, refinementAnswers, imageAnalysis, manualLocations } = options;
  
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

  const refinementSection = refinementAnswers && refinementAnswers.length > 0
    ? `\n\nThe user has provided additional details in response to clarifying questions. Use this information to enrich and improve the story:
${refinementAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Incorporate these answers naturally into the story. Update tags, highlights, and reduce or remove related missing_info_questions since they've been answered.`
    : '';

  let locationContext = '';
  if (imageAnalysis && imageAnalysis.locations.length > 0) {
    locationContext = `\n\nLOCATION HINTS FROM PHOTOS:
The user's photos appear to show these locations:
${imageAnalysis.locations.map(loc => `- ${loc.name} (${loc.type}, ${loc.confidence} confidence)`).join('\n')}
Photo description: ${imageAnalysis.description}

Use these location hints to enrich the story with specific place names. If the transcript mentions being somewhere but is vague, use these photo hints to add specificity.`;
  }

  if (manualLocations && manualLocations.length > 0) {
    locationContext += `\n\nUSER-CONFIRMED LOCATIONS:
The user has manually tagged these locations - treat them as confirmed facts:
${manualLocations.map(loc => `- ${loc}`).join('\n')}

Incorporate these locations naturally into the story and include them in the places tags.`;
  }

  return `You are a memory journaling writing assistant.

${toneInstructions}

Do not invent facts. Use ONLY the user-provided transcript and optional user title.
${locationContext}

LOCATION RECOGNITION (IMPORTANT):
- The transcript may come from voice input with potential speech-to-text errors for city/country names.
- Use context clues and common sense to identify and CORRECT misspelled or phonetically similar place names.
- Be SPECIFIC about locations - use exact neighborhood names, landmark names, street names when possible.
- Examples of specific location naming:
  * Instead of "a café in Paris" → "a café in the Marais district"
  * Instead of "a beach in Thailand" → "Railay Beach near Krabi"
  * Instead of "downtown" → "the Financial District" or "SoHo"
- Common speech-to-text patterns to watch for:
  * "Pair is" or "Paris" → Paris, France
  * "New work" or "new york" → New York
  * "Bark alona" or "barcelona" → Barcelona, Spain
  * "Moo nick" or "munich" → Munich, Germany
  * "Burn" or "bern" → Bern, Switzerland
  * "View in a" or "vienna" → Vienna, Austria
  * "Pray" or "Prague" → Prague, Czech Republic
  * "Toe key oh" or "tokyo" → Tokyo, Japan
  * "Sidney" → Sydney, Australia
  * "Deutschland", "Germany", "Allemagne" → Germany
- If you can reasonably infer the correct place name, use it in the story and tags.
- If a location is mentioned but unclear or ambiguous, add a clarifying question like "Which city did you visit?" or "Could you confirm the exact location?" to missing_info_questions.

LOCATION SUGGESTIONS:
Based on the transcript (and photo analysis if provided), generate location_suggestions with specific places that might help the user remember details. Include:
- Exact city and country names
- Specific neighborhoods (e.g., "Shibuya, Tokyo" not just "Tokyo")
- Landmarks that match the description
- Venues if identifiable

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
    "places": ["0-8 strings - use proper city/country names, neighborhoods, landmarks"],
    "moods": ["0-8 strings"],
    "themes": ["0-8 strings"]
  },
  "location_suggestions": [
    { "name": "Specific Location Name", "type": "city|neighborhood|landmark|venue|country", "confidence": "high|medium|low", "source": "transcript" }
  ],
  "missing_info_questions": ["0-3 strings - include location clarification if place names are unclear"],
  "uncertain_claims": ["0-5 strings"]
}

Additional style constraints:
- modern, concise, not cringe
- no therapy language
- no invented names/places (but DO correct obvious speech-to-text errors for real places)
- BE SPECIFIC with locations - use neighborhood names, landmark names, exact venue names when known${languageInstruction}${refinementSection}`;
}

export async function generateAIContent(
  entry: Entry, 
  tone: StoryTone = 'natural',
  customTonePrompt?: string,
  outputLanguage?: string,
  refinementAnswers?: QuestionAnswer[]
): Promise<AIGenerationResult> {
  let imageAnalysis: ImageAnalysisResult | null = null;
  
  if (entry.photos && entry.photos.length > 0) {
    const photoUrls = entry.photos.map(p => p.storage_url);
    imageAnalysis = await analyzeImagesForLocations(photoUrls);
  }

  const userContent = JSON.stringify({
    date: entry.date,
    user_title: entry.title_user || '',
    transcript: entry.transcript || ''
  });

  const systemPrompt = buildSystemPrompt({ 
    tone, 
    customTonePrompt, 
    outputLanguage, 
    refinementAnswers,
    imageAnalysis,
    manualLocations: entry.manual_locations || undefined
  });
  const fullPrompt = `${systemPrompt}

User input:
${userContent}`;

  const response = await window.spark.llm(fullPrompt, 'gpt-4o', true);
  const result = JSON.parse(response) as AIGenerationResult;
  
  if (imageAnalysis && imageAnalysis.locations.length > 0) {
    if (!result.location_suggestions) {
      result.location_suggestions = [];
    }
    const existingNames = new Set(result.location_suggestions.map(l => l.name.toLowerCase()));
    imageAnalysis.locations.forEach(loc => {
      if (!existingNames.has(loc.name.toLowerCase())) {
        result.location_suggestions.push(loc);
      }
    });
  }
  
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

  if (!Array.isArray(result.location_suggestions)) {
    result.location_suggestions = [];
  }
  result.location_suggestions = result.location_suggestions
    .filter(loc => loc && typeof loc.name === 'string')
    .slice(0, 10);

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
    location_suggestions: null,
    manual_locations: null,
    missing_info_questions: null,
    uncertain_claims: null,
    is_locked: false,
    is_starred: false,
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

export function getAvailableYears(_entries: Entry[]): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= currentYear - 100; year--) {
    years.push(year);
  }
  return years;
}

export function filterEntriesByYear(entries: Entry[], year: number): Entry[] {
  return entries
    .filter(e => getYearFromDate(e.date) === year)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function searchEntries(entries: Entry[], query: string): Entry[] {
  if (!query.trim()) return entries;
  
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  
  return entries.filter(entry => {
    const searchableText = [
      entry.title_user,
      entry.title_ai,
      entry.transcript,
      entry.story_ai,
      ...(entry.highlights_ai || []),
      ...(entry.tags_ai?.people || []),
      ...(entry.tags_ai?.places || []),
      ...(entry.tags_ai?.moods || []),
      ...(entry.tags_ai?.themes || []),
      ...(entry.manual_locations || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    
    return queryWords.every(word => searchableText.includes(word));
  });
}

export function getEntryTitle(entry: Entry): string {
  return entry.title_user || entry.title_ai || 'Untitled Memory';
}
