import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Entry, Chapter, Book } from '@/lib/types';
import * as db from '@/lib/db';

/*
 * Central hook for journal data. Reads come from three parallel queries,
 * writes go through optimistic mutations. The public API mirrors the old
 * localStorage-backed hook so screens didn't need to change.
 */

const STALE_TIME = 30_000;

function now() {
  return new Date().toISOString();
}

export function useJournalData() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const enabled = Boolean(userId && supabase);

  const entriesKey = ['entries', userId] as const;
  const chaptersKey = ['chapters', userId] as const;
  const booksKey = ['books', userId] as const;

  const entriesQuery = useQuery({
    queryKey: entriesKey,
    queryFn: () => db.fetchEntries(userId!),
    enabled,
    staleTime: STALE_TIME,
  });

  const chaptersQuery = useQuery({
    queryKey: chaptersKey,
    queryFn: () => db.fetchChapters(userId!),
    enabled,
    staleTime: STALE_TIME,
  });

  const booksQuery = useQuery({
    queryKey: booksKey,
    queryFn: () => db.fetchBooks(userId!),
    enabled,
    staleTime: STALE_TIME,
  });

  // --- Entries ---

  const saveEntryMutation = useMutation({
    mutationFn: async (entry: Entry) => {
      if (!userId) throw new Error('Not signed in');
      const stamped: Entry = { ...entry, updated_at: now() };
      await db.upsertEntry(userId, stamped);
      return stamped;
    },
    onMutate: async (entry) => {
      await qc.cancelQueries({ queryKey: entriesKey });
      const prev = qc.getQueryData<Entry[]>(entriesKey) ?? [];
      const idx = prev.findIndex(e => e.id === entry.id);
      const next = idx >= 0
        ? prev.map(e => (e.id === entry.id ? { ...entry, updated_at: now() } : e))
        : [{ ...entry, updated_at: now() }, ...prev];
      qc.setQueryData(entriesKey, next);
      return { prev };
    },
    onError: (_err, _entry, ctx) => {
      if (ctx?.prev) qc.setQueryData(entriesKey, ctx.prev);
      toast.error('Failed to save memory entry. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: entriesKey }),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => db.deleteEntry(entryId),
    onMutate: async (entryId) => {
      await qc.cancelQueries({ queryKey: entriesKey });
      const prev = qc.getQueryData<Entry[]>(entriesKey) ?? [];
      qc.setQueryData(entriesKey, prev.filter(e => e.id !== entryId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(entriesKey, ctx.prev);
      toast.error('Failed to delete memory entry. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: entriesKey }),
  });

  const toggleStarMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const current = (qc.getQueryData<Entry[]>(entriesKey) ?? []).find(e => e.id === entryId);
      const next = !(current?.is_starred ?? false);
      await db.setEntryStar(entryId, next);
      return { entryId, next };
    },
    onMutate: async (entryId) => {
      await qc.cancelQueries({ queryKey: entriesKey });
      const prev = qc.getQueryData<Entry[]>(entriesKey) ?? [];
      qc.setQueryData(
        entriesKey,
        prev.map(e => (e.id === entryId ? { ...e, is_starred: !e.is_starred, updated_at: now() } : e))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(entriesKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: entriesKey }),
  });

  const assignChapterMutation = useMutation({
    mutationFn: ({ entryId, chapterId }: { entryId: string; chapterId: string | null }) =>
      db.setEntryChapter(entryId, chapterId),
    onMutate: async ({ entryId, chapterId }) => {
      await qc.cancelQueries({ queryKey: entriesKey });
      const prev = qc.getQueryData<Entry[]>(entriesKey) ?? [];
      qc.setQueryData(
        entriesKey,
        prev.map(e => (e.id === entryId ? { ...e, chapter_id: chapterId, updated_at: now() } : e))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(entriesKey, ctx.prev);
      toast.error('Failed to assign chapter. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: entriesKey }),
  });

  // --- Chapters ---

  const saveChapterMutation = useMutation({
    mutationFn: async (chapter: Chapter) => {
      if (!userId) throw new Error('Not signed in');
      const stamped = { ...chapter, updated_at: now() };
      await db.upsertChapter(userId, stamped);
      return stamped;
    },
    onMutate: async (chapter) => {
      await qc.cancelQueries({ queryKey: chaptersKey });
      const prev = qc.getQueryData<Chapter[]>(chaptersKey) ?? [];
      const exists = prev.some(c => c.id === chapter.id);
      const next = exists
        ? prev.map(c => (c.id === chapter.id ? { ...chapter, updated_at: now() } : c))
        : [...prev, { ...chapter, order: chapter.order ?? prev.length }];
      qc.setQueryData(chaptersKey, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(chaptersKey, ctx.prev);
      toast.error('Failed to save chapter. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chaptersKey }),
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => db.deleteChapter(chapterId),
    onMutate: async (chapterId) => {
      await qc.cancelQueries({ queryKey: chaptersKey });
      await qc.cancelQueries({ queryKey: entriesKey });
      const prevChapters = qc.getQueryData<Chapter[]>(chaptersKey) ?? [];
      const prevEntries = qc.getQueryData<Entry[]>(entriesKey) ?? [];
      qc.setQueryData(chaptersKey, prevChapters.filter(c => c.id !== chapterId));
      qc.setQueryData(
        entriesKey,
        prevEntries.map(e => (e.chapter_id === chapterId ? { ...e, chapter_id: null } : e))
      );
      return { prevChapters, prevEntries };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevChapters) qc.setQueryData(chaptersKey, ctx.prevChapters);
      if (ctx?.prevEntries) qc.setQueryData(entriesKey, ctx.prevEntries);
      toast.error('Failed to delete chapter. Please try again.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: chaptersKey });
      qc.invalidateQueries({ queryKey: entriesKey });
    },
  });

  const reorderChaptersMutation = useMutation({
    mutationFn: (updates: { id: string; order: number }[]) => db.reorderChapters(updates),
    onSettled: () => qc.invalidateQueries({ queryKey: chaptersKey }),
  });

  const reorderChapters = (startIndex: number, endIndex: number) => {
    const prev = qc.getQueryData<Chapter[]>(chaptersKey) ?? [];
    const list = [...prev];
    const [moved] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, moved);
    const reordered = list.map((c, idx) => ({ ...c, order: idx }));
    qc.setQueryData(chaptersKey, reordered);
    reorderChaptersMutation.mutate(reordered.map(c => ({ id: c.id, order: c.order })));
  };

  // --- Books ---

  const saveBookMutation = useMutation({
    mutationFn: async (book: Book) => {
      if (!userId) throw new Error('Not signed in');
      const stamped = { ...book, updated_at: now() };
      await db.upsertBook(userId, stamped);
      return stamped;
    },
    onMutate: async (book) => {
      await qc.cancelQueries({ queryKey: booksKey });
      const prev = qc.getQueryData<Book[]>(booksKey) ?? [];
      const exists = prev.some(b => b.id === book.id);
      const next = exists
        ? prev.map(b => (b.id === book.id ? { ...book, updated_at: now() } : b))
        : [{ ...book, updated_at: now() }, ...prev];
      qc.setQueryData(booksKey, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(booksKey, ctx.prev);
      toast.error('Failed to save book. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: booksKey }),
  });

  const deleteBookMutation = useMutation({
    mutationFn: (bookId: string) => db.deleteBook(bookId),
    onMutate: async (bookId) => {
      await qc.cancelQueries({ queryKey: booksKey });
      const prev = qc.getQueryData<Book[]>(booksKey) ?? [];
      qc.setQueryData(booksKey, prev.filter(b => b.id !== bookId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(booksKey, ctx.prev);
      toast.error('Failed to delete book. Please try again.');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: booksKey }),
  });

  return {
    entries: entriesQuery.data ?? [],
    chapters: chaptersQuery.data ?? [],
    books: booksQuery.data ?? [],
    isLoading: entriesQuery.isLoading || chaptersQuery.isLoading || booksQuery.isLoading,
    saveEntry: (entry: Entry) => saveEntryMutation.mutate(entry),
    deleteEntry: (entryId: string) => deleteEntryMutation.mutate(entryId),
    toggleStar: (entryId: string) => toggleStarMutation.mutate(entryId),
    saveChapter: (chapter: Chapter) => saveChapterMutation.mutate(chapter),
    deleteChapter: (chapterId: string) => deleteChapterMutation.mutate(chapterId),
    reorderChapters,
    assignChapter: (entryId: string, chapterId: string | null) =>
      assignChapterMutation.mutate({ entryId, chapterId }),
    saveBook: (book: Book) => saveBookMutation.mutate(book),
    deleteBook: (bookId: string) => deleteBookMutation.mutate(bookId),
  };
}
