import { describe, expect, it } from 'vitest';
import { canEditEntry, canManageEntryCollaborators, canManageEntryPhotos, isEntryOwner } from '../src/lib/entries';
import { Entry } from '../src/lib/types';

function entryFor(role: Entry['collaboration_role'], ownerId = 'owner-user'): Entry {
  const now = '2026-04-29T10:00:00.000Z';
  return {
    id: 'entry-1',
    user_id: ownerId,
    date: '2026-04-29',
    title_user: 'A shared day',
    title_ai: null,
    transcript: 'We wrote this memory together.',
    story_ai: null,
    highlights_ai: null,
    tags_ai: null,
    location_suggestions: null,
    manual_locations: null,
    missing_info_questions: null,
    uncertain_claims: null,
    is_locked: false,
    is_starred: false,
    is_draft: false,
    chapter_id: null,
    photos: [],
    collaborators: [],
    collaboration_role: role,
    prompt_used: null,
    created_at: now,
    updated_at: now,
  };
}

describe('entry collaboration permissions', () => {
  it('lets the owner edit, manage collaborators, and manage photos', () => {
    const entry = entryFor('owner');

    expect(isEntryOwner(entry, 'owner-user')).toBe(true);
    expect(canEditEntry(entry, 'owner-user')).toBe(true);
    expect(canManageEntryCollaborators(entry, 'owner-user')).toBe(true);
    expect(canManageEntryPhotos(entry, 'owner-user')).toBe(true);
  });

  it('lets editor collaborators edit without managing collaborators or photos', () => {
    const entry = entryFor('editor');

    expect(isEntryOwner(entry, 'collaborator-user')).toBe(false);
    expect(canEditEntry(entry, 'collaborator-user')).toBe(true);
    expect(canManageEntryCollaborators(entry, 'collaborator-user')).toBe(false);
    expect(canManageEntryPhotos(entry, 'collaborator-user')).toBe(false);
  });

  it('keeps viewer collaborators read-only', () => {
    const entry = entryFor('viewer');

    expect(canEditEntry(entry, 'viewer-user')).toBe(false);
    expect(canManageEntryCollaborators(entry, 'viewer-user')).toBe(false);
    expect(canManageEntryPhotos(entry, 'viewer-user')).toBe(false);
  });
});
