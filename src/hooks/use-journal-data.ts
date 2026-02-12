import { useKV } from '@github/spark/hooks';
import { Entry, Chapter, Book } from '@/lib/types';

export function useJournalData() {
  const [entries, setEntries] = useKV<Entry[]>('tightly-entries', []);
  const [chapters, setChapters] = useKV<Chapter[]>('tightly-chapters', []);
  const [books, setBooks] = useKV<Book[]>('tightly-books', []);

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
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries((current) => (current || []).filter(e => e.id !== entryId));
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
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters((current) => (current || []).filter(c => c.id !== chapterId));
    setEntries((current) => {
      const list = current || [];
      return list.map(e => e.chapter_id === chapterId ? { ...e, chapter_id: null } : e);
    });
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
    setEntries((current) => {
      const list = current || [];
      return list.map(e => 
        e.id === entryId 
          ? { ...e, chapter_id: chapterId, updated_at: new Date().toISOString() }
          : e
      );
    });
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
