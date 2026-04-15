import { useLocalStorage } from './use-local-storage';
import { Entry, Chapter, Book } from '@/lib/types';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

// Starter content
const createStarterChapters = (): Chapter[] => {
  const now = new Date().toISOString();
  return [
    {
      id: uuid(),
      name: 'Growing Up',
      description: 'Childhood and family memories',
      color: 'oklch(0.75 0.18 75)', // amber
      icon: 'house',
      is_pinned: false,
      is_archived: false,
      order: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: 'Adventures',
      description: 'Travel and experiences',
      color: 'oklch(0.65 0.17 160)', // emerald
      icon: 'airplane',
      is_pinned: false,
      is_archived: false,
      order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid(),
      name: 'People I Love',
      description: 'Relationships and connections',
      color: 'oklch(0.65 0.2 350)', // rose
      icon: 'heart',
      is_pinned: false,
      is_archived: false,
      order: 2,
      created_at: now,
      updated_at: now,
    },
  ];
};

export function useJournalData() {
  const [entries, setEntries] = useLocalStorage<Entry[]>('tightly-entries', []);
  const [chapters, setChapters] = useLocalStorage<Chapter[]>('tightly-chapters', []);
  const [books, setBooks] = useLocalStorage<Book[]>('tightly-books', []);
  const [hasSeeded, setHasSeeded] = useLocalStorage<boolean>('tightly-has-seeded-content', false);

  // Seed starter chapters on first load only. No sample entry.
  useEffect(() => {
    if (!hasSeeded && (!chapters || chapters.length === 0)) {
      setChapters(createStarterChapters());
      setHasSeeded(true);
    }
  }, [hasSeeded, setHasSeeded, setChapters, chapters]);

  const entryList = (entries || []).map(e => ({
    ...e,
    is_starred: e.is_starred ?? false,
    is_draft: e.is_draft ?? false,
    chapter_id: e.chapter_id ?? null,
    prompt_used: e.prompt_used ?? null,
  }));
  
  const chapterList = (chapters || []).map(c => ({
    ...c,
    is_pinned: c.is_pinned ?? false,
    is_archived: c.is_archived ?? false,
    order: c.order ?? 0,
  }));

  const bookList = books || [];

  const handleSaveEntry = (entry: Entry) => {
    try {
      setEntries((current) => {
        const list = current || [];
        const existing = list.findIndex(e => e.id === entry.id);
        if (existing >= 0) {
          const updated = [...list];
          updated[existing] = { ...entry, updated_at: new Date().toISOString() };
          return updated;
        }
        return [...list, entry];
      });
    } catch (error) {
      toast.error('Failed to save memory entry. Please try again.');
      throw error;
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    try {
      setEntries((current) => (current || []).filter(e => e.id !== entryId));
    } catch (error) {
      toast.error('Failed to delete memory entry. Please try again.');
      throw error;
    }
  };

  const handleToggleStar = (entryId: string) => {
    setEntries((current) => {
      const list = current || [];
      return list.map(e => 
        e.id === entryId 
          ? { ...e, is_starred: !e.is_starred, updated_at: new Date().toISOString() }
          : e
      );
    });
  };

  const handleSaveChapter = (chapter: Chapter) => {
    try {
      setChapters((current) => {
        const list = current || [];
        const existing = list.findIndex(c => c.id === chapter.id);
        if (existing >= 0) {
          const updated = [...list];
          updated[existing] = { ...chapter, updated_at: new Date().toISOString() };
          return updated;
        }
        return [...list, { ...chapter, order: list.length }];
      });
    } catch (error) {
      toast.error('Failed to save chapter. Please try again.');
      throw error;
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    try {
      setChapters((current) => (current || []).filter(c => c.id !== chapterId));
      setEntries((current) => {
        const list = current || [];
        return list.map(e => e.chapter_id === chapterId ? { ...e, chapter_id: null } : e);
      });
    } catch (error) {
      toast.error('Failed to delete chapter. Please try again.');
      throw error;
    }
  };

  const handleReorderChapters = (startIndex: number, endIndex: number) => {
    setChapters((current) => {
      const list = [...(current || [])];
      const [moved] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, moved);
      return list.map((c, idx) => ({ ...c, order: idx }));
    });
  };

  const handleAssignChapter = (entryId: string, chapterId: string | null) => {
    try {
      setEntries((current) => {
        const list = current || [];
        return list.map(e => 
          e.id === entryId 
            ? { ...e, chapter_id: chapterId, updated_at: new Date().toISOString() }
            : e
        );
      });
    } catch (error) {
      toast.error('Failed to assign chapter. Please try again.');
      throw error;
    }
  };

  const handleSaveBook = (book: Book) => {
    setBooks((current) => {
      const list = current || [];
      const existing = list.findIndex(b => b.id === book.id);
      if (existing >= 0) {
        const updated = [...list];
        updated[existing] = { ...book, updated_at: new Date().toISOString() };
        return updated;
      }
      return [...list, book];
    });
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((current) => (current || []).filter(b => b.id !== bookId));
  };

  return {
    entries: entryList,
    chapters: chapterList,
    books: bookList,
    saveEntry: handleSaveEntry,
    deleteEntry: handleDeleteEntry,
    toggleStar: handleToggleStar,
    saveChapter: handleSaveChapter,
    deleteChapter: handleDeleteChapter,
    reorderChapters: handleReorderChapters,
    assignChapter: handleAssignChapter,
    saveBook: handleSaveBook,
    deleteBook: handleDeleteBook,
  };
}
