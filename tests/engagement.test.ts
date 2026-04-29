import { describe, expect, it } from 'vitest';
import {
  calculateWritingStreak,
  getOnThisDayEntries,
  getSmartEngagementAction,
} from '../src/lib/engagement';
import { Chapter, Entry } from '../src/lib/types';

const now = new Date('2026-04-29T12:00:00');

function entry(overrides: Partial<Entry>): Entry {
  return {
    id: overrides.id ?? 'entry-1',
    date: overrides.date ?? '2026-04-29',
    title_user: overrides.title_user ?? null,
    title_ai: overrides.title_ai ?? 'Memory',
    transcript: overrides.transcript ?? null,
    story_ai: overrides.story_ai ?? null,
    highlights_ai: null,
    tags_ai: null,
    location_suggestions: null,
    manual_locations: null,
    missing_info_questions: null,
    uncertain_claims: null,
    is_locked: false,
    is_starred: false,
    is_draft: overrides.is_draft ?? false,
    chapter_id: overrides.chapter_id ?? null,
    photos: [],
    prompt_used: null,
    created_at: overrides.created_at ?? `${overrides.date ?? '2026-04-29'}T10:00:00Z`,
    updated_at: overrides.updated_at ?? `${overrides.date ?? '2026-04-29'}T10:00:00Z`,
  };
}

function chapter(overrides: Partial<Chapter>): Chapter {
  return {
    id: overrides.id ?? 'chapter-1',
    name: overrides.name ?? 'Family',
    description: null,
    color: 'rose',
    icon: 'heart',
    is_pinned: false,
    is_archived: overrides.is_archived ?? false,
    order: 0,
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  };
}

describe('engagement helpers', () => {
  it('prioritizes unfinished drafts', () => {
    const action = getSmartEngagementAction({
      entries: [entry({ id: 'draft-1', is_draft: true, title_user: 'Half-written trip' })],
      chapters: [],
      now,
    });

    expect(action.kind).toBe('continue-draft');
    expect(action.targetView).toEqual({ type: 'entry-edit', entryId: 'draft-1' });
    expect(action.reminderEligible).toBe(false);
  });

  it('finds memories from the same month and day in previous years', () => {
    const matches = getOnThisDayEntries(
      [
        entry({ id: 'old', date: '2024-04-29' }),
        entry({ id: 'today', date: '2026-04-29' }),
        entry({ id: 'other-day', date: '2025-04-28' }),
      ],
      now,
    );

    expect(matches.map((match) => match.id)).toEqual(['old']);
  });

  it('suggests restarting after an inactivity gap', () => {
    const action = getSmartEngagementAction({
      entries: [entry({ id: 'older', date: '2026-04-20' })],
      chapters: [],
      now,
    });

    expect(action.kind).toBe('restart-streak');
    expect(action.reminderEligible).toBe(true);
  });

  it('suggests filling empty chapters after activity exists', () => {
    const action = getSmartEngagementAction({
      entries: [entry({ id: 'recent', date: '2026-04-29', chapter_id: 'used' })],
      chapters: [chapter({ id: 'empty', name: 'Travel' })],
      now,
    });

    expect(action.kind).toBe('empty-chapter');
    expect(action.title).toContain('Travel');
  });

  it('calculates consecutive day streaks from today', () => {
    expect(
      calculateWritingStreak(
        [
          entry({ id: 'today', date: '2026-04-29' }),
          entry({ id: 'yesterday', date: '2026-04-28' }),
          entry({ id: 'two-days', date: '2026-04-27' }),
        ],
        now,
      ),
    ).toBe(3);
  });

  it('keeps the streak alive when the latest entry was yesterday', () => {
    expect(
      calculateWritingStreak(
        [
          entry({ id: 'yesterday', date: '2026-04-28' }),
          entry({ id: 'two-days', date: '2026-04-27' }),
        ],
        now,
      ),
    ).toBe(2);
  });
});
