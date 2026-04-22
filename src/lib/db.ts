import { supabase } from './supabase';
import { Entry, Chapter, Book, Photo, LocationSuggestion, ChapterIcon, BookTheme } from './types';
import { getSignedPhotoUrls, deletePhotos } from './photos';

/*
 * Mapping layer between our TypeScript domain types and Postgres rows.
 *
 * The DB stores entries.memory_date (date) and entry_photos as a separate
 * table; the client-side Entry type keeps photos inline and uses `date`
 * as its memory-date field. These helpers keep the shapes aligned.
 */

function assertSupabase() {
  if (!supabase) throw new Error('Supabase is not configured — check NEXT_PUBLIC_SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY');
  return supabase;
}

interface EntryRow {
  id: string;
  user_id: string;
  chapter_id: string | null;
  memory_date: string | null;
  title_user: string | null;
  title_ai: string | null;
  transcript: string | null;
  story_ai: string | null;
  highlights_ai: string[] | null;
  tags_ai: Entry['tags_ai'];
  location_suggestions: LocationSuggestion[] | null;
  manual_locations: string[] | null;
  missing_info_questions: string[] | null;
  uncertain_claims: string[] | null;
  is_locked: boolean;
  is_starred: boolean;
  is_draft: boolean;
  prompt_used: string | null;
  created_at: string;
  updated_at: string;
}

interface PhotoRow {
  id: string;
  entry_id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  position: number;
  created_at: string;
}

function rowToEntry(row: EntryRow, photos: Photo[]): Entry {
  return {
    id: row.id,
    date: row.memory_date ?? row.created_at.slice(0, 10),
    title_user: row.title_user,
    title_ai: row.title_ai,
    transcript: row.transcript,
    story_ai: row.story_ai,
    highlights_ai: row.highlights_ai,
    tags_ai: row.tags_ai,
    location_suggestions: row.location_suggestions,
    manual_locations: row.manual_locations,
    missing_info_questions: row.missing_info_questions,
    uncertain_claims: row.uncertain_claims,
    is_locked: row.is_locked,
    is_starred: row.is_starred,
    is_draft: row.is_draft,
    chapter_id: row.chapter_id,
    photos,
    prompt_used: row.prompt_used,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function entryToRow(userId: string, entry: Entry) {
  return {
    id: entry.id,
    user_id: userId,
    chapter_id: entry.chapter_id,
    memory_date: entry.date ? entry.date.slice(0, 10) : null,
    title_user: entry.title_user,
    title_ai: entry.title_ai,
    transcript: entry.transcript,
    story_ai: entry.story_ai,
    highlights_ai: entry.highlights_ai,
    tags_ai: entry.tags_ai,
    location_suggestions: entry.location_suggestions,
    manual_locations: entry.manual_locations,
    missing_info_questions: entry.missing_info_questions,
    uncertain_claims: entry.uncertain_claims,
    is_locked: entry.is_locked,
    is_starred: entry.is_starred,
    is_draft: entry.is_draft,
    prompt_used: entry.prompt_used,
  };
}

// ---------------------------------------------------------------------------
// Entries
// ---------------------------------------------------------------------------

export async function fetchEntries(userId: string): Promise<Entry[]> {
  const sb = assertSupabase();
  const [entriesRes, photosRes] = await Promise.all([
    sb.from('entries').select('*').eq('user_id', userId).order('memory_date', { ascending: false, nullsFirst: false }),
    sb.from('entry_photos').select('*').eq('user_id', userId).order('position', { ascending: true }),
  ]);
  if (entriesRes.error) throw entriesRes.error;
  if (photosRes.error) throw photosRes.error;

  const photoRows = (photosRes.data ?? []) as PhotoRow[];
  const signed = await getSignedPhotoUrls(photoRows.map(p => p.storage_path));

  const photosByEntry = new Map<string, Photo[]>();
  for (const row of photoRows) {
    const list = photosByEntry.get(row.entry_id) ?? [];
    list.push({
      id: row.id,
      entry_id: row.entry_id,
      storage_path: row.storage_path,
      storage_url: signed[row.storage_path] ?? '',
      width: row.width,
      height: row.height,
      bytes: row.bytes,
      created_at: row.created_at,
    });
    photosByEntry.set(row.entry_id, list);
  }

  return (entriesRes.data as EntryRow[]).map(row =>
    rowToEntry(row, photosByEntry.get(row.id) ?? [])
  );
}

export async function upsertEntry(userId: string, entry: Entry): Promise<Entry> {
  const sb = assertSupabase();
  const { error } = await sb.from('entries').upsert(entryToRow(userId, entry));
  if (error) throw error;

  // Sync entry_photos: delete rows no longer present, insert new ones.
  const incoming = entry.photos ?? [];
  const { data: existingRows, error: fetchErr } = await sb
    .from('entry_photos')
    .select('id, storage_path')
    .eq('entry_id', entry.id);
  if (fetchErr) throw fetchErr;

  const incomingIds = new Set(incoming.map(p => p.id));
  const toDelete = (existingRows ?? []).filter(r => !incomingIds.has(r.id));
  if (toDelete.length) {
    const { error: delErr } = await sb.from('entry_photos').delete().in('id', toDelete.map(r => r.id));
    if (delErr) throw delErr;
    await deletePhotos(toDelete.map(r => r.storage_path));
  }

  const existingIds = new Set((existingRows ?? []).map(r => r.id));
  const toInsert = incoming
    .filter(p => !existingIds.has(p.id))
    .map((p, idx) => ({
      id: p.id,
      entry_id: entry.id,
      user_id: userId,
      storage_path: p.storage_path,
      width: p.width ?? null,
      height: p.height ?? null,
      bytes: p.bytes ?? null,
      position: idx,
    }));
  if (toInsert.length) {
    const { error: insErr } = await sb.from('entry_photos').insert(toInsert);
    if (insErr) throw insErr;
  }

  // Update positions for existing rows (idempotent).
  for (let i = 0; i < incoming.length; i++) {
    const p = incoming[i];
    if (existingIds.has(p.id)) {
      await sb.from('entry_photos').update({ position: i }).eq('id', p.id);
    }
  }

  return entry;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const sb = assertSupabase();
  const { data: photos } = await sb.from('entry_photos').select('storage_path').eq('entry_id', entryId);
  const { error } = await sb.from('entries').delete().eq('id', entryId);
  if (error) throw error;
  if (photos?.length) await deletePhotos(photos.map(p => p.storage_path));
}

export async function setEntryStar(entryId: string, starred: boolean): Promise<void> {
  const sb = assertSupabase();
  const { error } = await sb.from('entries').update({ is_starred: starred }).eq('id', entryId);
  if (error) throw error;
}

export async function setEntryChapter(entryId: string, chapterId: string | null): Promise<void> {
  const sb = assertSupabase();
  const { error } = await sb.from('entries').update({ chapter_id: chapterId }).eq('id', entryId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

interface ChapterRow {
  id: string;
  user_id: string;
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

function rowToChapter(row: ChapterRow): Chapter {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    is_pinned: row.is_pinned,
    is_archived: row.is_archived,
    order: row.order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchChapters(userId: string): Promise<Chapter[]> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('chapters')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true });
  if (error) throw error;
  return (data as ChapterRow[]).map(rowToChapter);
}

export async function upsertChapter(userId: string, chapter: Chapter): Promise<Chapter> {
  const sb = assertSupabase();
  const { error } = await sb.from('chapters').upsert({
    id: chapter.id,
    user_id: userId,
    name: chapter.name,
    description: chapter.description,
    color: chapter.color,
    icon: chapter.icon,
    is_pinned: chapter.is_pinned,
    is_archived: chapter.is_archived,
    order: chapter.order,
  });
  if (error) throw error;
  return chapter;
}

export async function deleteChapter(chapterId: string): Promise<void> {
  const sb = assertSupabase();
  const { error } = await sb.from('chapters').delete().eq('id', chapterId);
  if (error) throw error;
}

export async function reorderChapters(updates: { id: string; order: number }[]): Promise<void> {
  const sb = assertSupabase();
  await Promise.all(
    updates.map(u => sb.from('chapters').update({ order: u.order }).eq('id', u.id))
  );
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

interface BookRow {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  theme: BookTheme;
  entry_ids: string[];
  is_draft: boolean;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    theme: row.theme,
    entry_ids: row.entry_ids,
    is_draft: row.is_draft,
    pdf_url: row.pdf_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchBooks(userId: string): Promise<Book[]> {
  const sb = assertSupabase();
  const { data, error } = await sb
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as BookRow[]).map(rowToBook);
}

export async function upsertBook(userId: string, book: Book): Promise<Book> {
  const sb = assertSupabase();
  const { error } = await sb.from('books').upsert({
    id: book.id,
    user_id: userId,
    title: book.title,
    subtitle: book.subtitle,
    theme: book.theme,
    entry_ids: book.entry_ids,
    is_draft: book.is_draft,
    pdf_url: book.pdf_url,
  });
  if (error) throw error;
  return book;
}

export async function deleteBook(bookId: string): Promise<void> {
  const sb = assertSupabase();
  const { error } = await sb.from('books').delete().eq('id', bookId);
  if (error) throw error;
}
