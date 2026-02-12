import { useKV } from '@github/spark/hooks';
import { Entry, Chapter, Book } from '@/lib/types';
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';

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

const createSampleEntry = (adventuresChapterId: string): Entry => {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    date: '2024-06-15',
    title_user: 'A Perfect Day in Barcelona',
    title_ai: 'A Perfect Day in Barcelona',
    transcript: 'I spent the most incredible day wandering through Barcelona. Started with fresh pastries at a tiny café in the Gothic Quarter, then got lost in the narrow medieval streets. The architecture was breathtaking – everywhere I looked there was something beautiful. I visited the Sagrada Familia and just stood there in awe for what felt like hours. The light coming through the stained glass was magical. Later, I walked along La Rambla, watched street performers, and ended up at the beach for sunset. The Mediterranean was so calm and golden. I sat on the sand, ate some paella from a beachside restaurant, and just felt completely present. It was one of those rare days where everything felt perfect.',
    story_ai: 'Barcelona revealed itself slowly that June day, like a friend sharing secrets. The morning began in a hidden café tucked into the Gothic Quarter\'s labyrinth, where flaky croissants and strong coffee fueled the adventure ahead. Those ancient stone streets seemed to whisper stories with every turn, each corner revealing another architectural marvel.\n\nThe Sagrada Familia stopped me in my tracks. Standing beneath Gaudí\'s towering vision, watching kaleidoscope light pour through stained glass, time became irrelevant. The space felt sacred, not in a religious sense, but in the way certain moments demand your full attention.\n\nAs afternoon melted into evening, La Rambla\'s energy pulled me toward the sea. Street performers painted the air with music and laughter. Then, finally, the beach – where the Mediterranean stretched endlessly golden under the setting sun. With sandy feet and a plate of paella, I discovered what it means to be completely, wonderfully present.',
    highlights_ai: [
      'Fresh pastries and coffee in a hidden Gothic Quarter café',
      'Getting lost in medieval streets filled with stunning architecture',
      'Standing in awe at the Sagrada Familia, mesmerized by the stained glass light',
      'Walking La Rambla and watching talented street performers',
      'Sunset on the beach with paella, feeling completely present',
    ],
    tags_ai: {
      people: [],
      places: ['Barcelona', 'Gothic Quarter', 'Sagrada Familia', 'La Rambla', 'Mediterranean'],
      moods: ['awe', 'peaceful', 'present', 'joyful'],
      themes: ['travel', 'discovery', 'beauty', 'mindfulness'],
    },
    location_suggestions: null,
    manual_locations: null,
    missing_info_questions: null,
    uncertain_claims: null,
    is_locked: false,
    is_starred: true,
    is_draft: false,
    chapter_id: adventuresChapterId,
    photos: [],
    prompt_used: null,
    created_at: now,
    updated_at: now,
  };
};

export function useJournalData() {
  const [entries, setEntries] = useKV<Entry[]>('tightly-entries', []);
  const [chapters, setChapters] = useKV<Chapter[]>('tightly-chapters', []);
  const [books, setBooks] = useKV<Book[]>('tightly-books', []);

  // Seed initial content on first load
  useEffect(() => {
    if ((!entries || entries.length === 0) && (!chapters || chapters.length === 0)) {
      const starterChapters = createStarterChapters();
      const adventuresChapter = starterChapters.find(c => c.name === 'Adventures');
      if (adventuresChapter) {
        const sampleEntry = createSampleEntry(adventuresChapter.id);
        setChapters(starterChapters);
        setEntries([sampleEntry]);
      }
    }
  }, []);

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
