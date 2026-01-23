import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, Chapter, Book, AppView, NavigationTab } from './lib/types';
import { DreamyBackground } from './components/DreamyBackground';
import { BottomNav } from './components/navigation/BottomNav';
import { Toaster } from '@/components/ui/sonner';
import { useNightMode } from './hooks/use-night-mode';
import { useIsMobile } from './hooks/use-mobile';

import { HomeScreen } from './components/screens/HomeScreen';
import { PromptsScreen } from './components/screens/PromptsScreen';
import { ChaptersScreen } from './components/screens/ChaptersScreen';
import { ChapterDetailScreen } from './components/screens/ChapterDetailScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { PrintScreen } from './components/screens/PrintScreen';
import { EntryReadScreen } from './components/screens/EntryReadScreen';
import { EntryEditScreen } from './components/screens/EntryEditScreen';

function App() {
  const [entries, setEntries] = useKV<Entry[]>('tightly-entries', []);
  const [chapters, setChapters] = useKV<Chapter[]>('tightly-chapters', []);
  const [books, setBooks] = useKV<Book[]>('tightly-books', []);
  const [currentView, setCurrentView] = useState<AppView>({ type: 'home' });
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useNightMode();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

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

  const navigate = (view: AppView) => {
    setCurrentView(view);
  };

  const getCurrentTab = (): NavigationTab => {
    switch (currentView.type) {
      case 'home':
        return 'home';
      case 'prompts':
      case 'prompts-new':
        return 'prompts';
      case 'chapters':
      case 'chapter-detail':
        return 'chapters';
      case 'search':
        return 'search';
      case 'print':
      case 'print-builder':
        return 'print';
      case 'entry-read':
      case 'entry-edit':
        return 'home';
      default:
        return 'home';
    }
  };

  const handleTabChange = (tab: NavigationTab) => {
    switch (tab) {
      case 'home':
        navigate({ type: 'home' });
        break;
      case 'prompts':
        navigate({ type: 'prompts' });
        break;
      case 'chapters':
        navigate({ type: 'chapters' });
        break;
      case 'search':
        navigate({ type: 'search' });
        break;
      case 'print':
        navigate({ type: 'print' });
        break;
    }
  };

  const renderScreen = () => {
    switch (currentView.type) {
      case 'home':
        return (
          <HomeScreen
            entries={entryList}
            chapters={chapterList}
            onNavigate={navigate}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
            isDarkMode={isDarkMode}
            isNightTime={isNightTime}
          />
        );

      case 'prompts':
        return (
          <PromptsScreen
            onNavigate={navigate}
            isDarkMode={isDarkMode}
          />
        );

      case 'prompts-new':
        return (
          <EntryEditScreen
            entry={null}
            chapters={chapterList}
            promptId={currentView.promptId}
            onSave={(entry) => {
              handleSaveEntry(entry);
              navigate({ type: 'entry-read', entryId: entry.id });
            }}
            onBack={() => navigate({ type: 'home' })}
            isDarkMode={isDarkMode}
          />
        );

      case 'chapters':
        return (
          <ChaptersScreen
            chapters={chapterList}
            entries={entryList}
            onNavigate={navigate}
            onSaveChapter={handleSaveChapter}
            onDeleteChapter={handleDeleteChapter}
            isDarkMode={isDarkMode}
          />
        );

      case 'chapter-detail':
        const chapter = chapterList.find(c => c.id === currentView.chapterId);
        if (!chapter) {
          navigate({ type: 'chapters' });
          return null;
        }
        return (
          <ChapterDetailScreen
            chapter={chapter}
            entries={entryList.filter(e => e.chapter_id === currentView.chapterId)}
            onNavigate={navigate}
            onSaveChapter={handleSaveChapter}
            onDeleteChapter={handleDeleteChapter}
            onToggleStar={handleToggleStar}
            isDarkMode={isDarkMode}
          />
        );

      case 'entry-read':
        const readEntry = entryList.find(e => e.id === currentView.entryId);
        if (!readEntry) {
          navigate({ type: 'home' });
          return null;
        }
        return (
          <EntryReadScreen
            entry={readEntry}
            chapter={chapterList.find(c => c.id === readEntry.chapter_id) || null}
            onNavigate={navigate}
            onToggleStar={() => handleToggleStar(readEntry.id)}
            onDelete={() => {
              handleDeleteEntry(readEntry.id);
              navigate({ type: 'home' });
            }}
            onAssignChapter={(chapterId) => handleAssignChapter(readEntry.id, chapterId)}
            chapters={chapterList}
            isDarkMode={isDarkMode}
          />
        );

      case 'entry-edit':
        const editEntry = entryList.find(e => e.id === currentView.entryId);
        if (!editEntry) {
          navigate({ type: 'home' });
          return null;
        }
        return (
          <EntryEditScreen
            entry={editEntry}
            chapters={chapterList}
            onSave={(entry) => {
              handleSaveEntry(entry);
              navigate({ type: 'entry-read', entryId: entry.id });
            }}
            onBack={() => navigate({ type: 'entry-read', entryId: editEntry.id })}
            onDelete={() => {
              handleDeleteEntry(editEntry.id);
              navigate({ type: 'home' });
            }}
            isDarkMode={isDarkMode}
          />
        );

      case 'search':
        return (
          <SearchScreen
            entries={entryList}
            chapters={chapterList}
            onNavigate={navigate}
            isDarkMode={isDarkMode}
          />
        );

      case 'print':
        return (
          <PrintScreen
            books={bookList}
            entries={entryList}
            chapters={chapterList}
            onNavigate={navigate}
            onSaveBook={handleSaveBook}
            onDeleteBook={handleDeleteBook}
            isDarkMode={isDarkMode}
          />
        );

      case 'print-builder':
        return (
          <PrintScreen
            books={bookList}
            entries={entryList}
            chapters={chapterList}
            onNavigate={navigate}
            onSaveBook={handleSaveBook}
            onDeleteBook={handleDeleteBook}
            isDarkMode={isDarkMode}
            builderMode={{
              bookId: currentView.bookId,
              step: currentView.step
            }}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav = !['entry-edit', 'prompts-new', 'print-builder'].includes(currentView.type);

  return (
    <div className="min-h-screen relative">
      <DreamyBackground isDarkMode={isDarkMode} />
      
      <div className={`relative z-10 ${showBottomNav && isMobile ? 'pb-20' : ''}`}>
        {renderScreen()}
      </div>

      {showBottomNav && isMobile && (
        <BottomNav
          currentTab={getCurrentTab()}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
        />
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
