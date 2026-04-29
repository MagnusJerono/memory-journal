import { AppView, Chapter, DEFAULT_PROMPTS, Entry } from './types';
import { getDraftEntry, getEntryTitle } from './entries';

const DAY_MS = 86_400_000;
const INACTIVITY_REMINDER_DAYS = 3;

export type EngagementActionKind =
  | 'continue-draft'
  | 'on-this-day'
  | 'restart-streak'
  | 'empty-chapter'
  | 'first-memory'
  | 'daily-prompt';

export interface EngagementAction {
  id: string;
  kind: EngagementActionKind;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  targetView: AppView;
  reminderEligible: boolean;
}

interface EngagementContext {
  entries: Entry[];
  chapters: Chapter[];
  now?: Date;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseEntryDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getNonDraftEntries(entries: Entry[]): Entry[] {
  return entries.filter((entry) => !entry.is_draft);
}

function getDaysSinceLatestEntry(entries: Entry[], now: Date): number | null {
  const latestEntryTime = getNonDraftEntries(entries)
    .map((entry) => startOfLocalDay(parseEntryDate(entry.date)).getTime())
    .sort((a, b) => b - a)[0];

  if (!latestEntryTime) {
    return null;
  }

  return Math.max(0, Math.floor((startOfLocalDay(now).getTime() - latestEntryTime) / DAY_MS));
}

export function getOnThisDayEntries(entries: Entry[], now = new Date()): Entry[] {
  const month = now.getMonth();
  const day = now.getDate();
  const year = now.getFullYear();

  return getNonDraftEntries(entries)
    .filter((entry) => {
      const entryDate = parseEntryDate(entry.date);
      return entryDate.getMonth() === month && entryDate.getDate() === day && entryDate.getFullYear() !== year;
    })
    .sort((a, b) => parseEntryDate(b.date).getTime() - parseEntryDate(a.date).getTime());
}

export function calculateWritingStreak(entries: Entry[], now = new Date()): number {
  const datesWithEntries = [
    ...new Set(
      getNonDraftEntries(entries).map((entry) =>
        startOfLocalDay(parseEntryDate(entry.date)).toISOString(),
      ),
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (datesWithEntries.length === 0) {
    return 0;
  }

  const today = startOfLocalDay(now).toISOString();
  const yesterday = new Date(startOfLocalDay(now).getTime() - DAY_MS).toISOString();

  if (datesWithEntries[0] !== today && datesWithEntries[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  let expected = datesWithEntries[0] === today
    ? startOfLocalDay(now).getTime()
    : new Date(yesterday).getTime();

  for (const date of datesWithEntries) {
    if (new Date(date).getTime() !== expected) {
      break;
    }
    streak += 1;
    expected -= DAY_MS;
  }

  return streak;
}

export function getSmartEngagementAction({
  entries,
  chapters,
  now = new Date(),
}: EngagementContext): EngagementAction {
  const draft = getDraftEntry(entries);
  if (draft) {
    return {
      id: `draft-${draft.id}`,
      kind: 'continue-draft',
      eyebrow: 'Smart nudge',
      title: 'Pick up where you left off',
      description: `${getEntryTitle(draft)} is already started. A few more details can turn it into a saved memory.`,
      ctaLabel: 'Continue writing',
      targetView: { type: 'entry-edit', entryId: draft.id },
      reminderEligible: false,
    };
  }

  const onThisDayEntries = getOnThisDayEntries(entries, now);
  if (onThisDayEntries.length > 0) {
    const entry = onThisDayEntries[0];
    const yearsAgo = now.getFullYear() - parseEntryDate(entry.date).getFullYear();
    return {
      id: `on-this-day-${entry.id}`,
      kind: 'on-this-day',
      eyebrow: 'Worth revisiting',
      title: 'A memory from this day',
      description: `${getEntryTitle(entry)} happened ${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago. Revisit it while the date is meaningful.`,
      ctaLabel: 'Open memory',
      targetView: { type: 'entry-read', entryId: entry.id },
      reminderEligible: true,
    };
  }

  const savedEntries = getNonDraftEntries(entries);
  const daysSinceLatest = getDaysSinceLatestEntry(entries, now);
  if (daysSinceLatest !== null && daysSinceLatest >= INACTIVITY_REMINDER_DAYS) {
    return {
      id: `restart-streak-${startOfLocalDay(now).toISOString()}`,
      kind: 'restart-streak',
      eyebrow: 'Gentle reminder',
      title: 'Capture one small moment',
      description: `It has been ${daysSinceLatest} days since your last memory. Start with one detail from today.`,
      ctaLabel: 'Write today',
      targetView: {
        type: 'prompts-new',
        momentPrompt: `It has been ${daysSinceLatest} days since I last wrote. What is one small moment from today or this week that I do not want to forget?`,
      },
      reminderEligible: true,
    };
  }

  const emptyChapter = chapters.find(
    (chapter) => !chapter.is_archived && !savedEntries.some((entry) => entry.chapter_id === chapter.id),
  );
  if (savedEntries.length > 0 && emptyChapter) {
    return {
      id: `empty-chapter-${emptyChapter.id}`,
      kind: 'empty-chapter',
      eyebrow: 'Build your library',
      title: `Add a memory to ${emptyChapter.name}`,
      description: 'This chapter is ready for its first story. A guided prompt can help you fill it in.',
      ctaLabel: 'Start a memory',
      targetView: {
        type: 'prompts-new',
        momentPrompt: `Write a memory that belongs in my "${emptyChapter.name}" chapter. What happened, who was there, and why does it matter?`,
      },
      reminderEligible: false,
    };
  }

  const dailyPrompt = DEFAULT_PROMPTS[Math.floor(now.getTime() / DAY_MS) % DEFAULT_PROMPTS.length];
  if (savedEntries.length === 0) {
    return {
      id: 'first-memory',
      kind: 'first-memory',
      eyebrow: 'Start simple',
      title: 'Save your first memory',
      description: 'Begin with a moment that feels easy to tell. You can polish it with AI after the rough notes are down.',
      ctaLabel: 'Create first memory',
      targetView: { type: 'prompts-new' },
      reminderEligible: true,
    };
  }

  return {
    id: `daily-prompt-${dailyPrompt.id}`,
    kind: 'daily-prompt',
    eyebrow: "Today's idea",
    title: dailyPrompt.text,
    description: 'A quick guided prompt keeps your journal moving without needing to choose what to write about.',
    ctaLabel: 'Use this prompt',
    targetView: { type: 'prompts-new', promptId: dailyPrompt.id },
    reminderEligible: false,
  };
}
