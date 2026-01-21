import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, View, Chapter } from './lib/types';
import { Timeline } from './components/timeline/Timeline';
import { NewEntry } from './components/entry/NewEntry';
import { EntryDetail } from './components/entry/EntryDetail';
import { YearbookView } from './components/yearbook/YearbookView';
import { DreamyBackground } from './components/DreamyBackground';
import { Toaster } from '@/components/ui/sonner';
import { useNightMode } from './hooks/use-night-mode';

function App() {
  const [entries, setEntries] = useKV<Entry[]>('ziel-entries', []);
  const [chapters, setChapters] = useKV<Chapter[]>('ziel-chapters', []);
  const [currentView, setCurrentView] = useState<View>('timeline');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useNightMode();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleNavigate = (view: View, entryId?: string) => {
    setCurrentView(view);
    if (entryId) {
      setSelectedEntryId(entryId);
    }
  };

  const handleSaveEntry = (entry: Entry) => {
    setEntries((current) => {
      const list = current || [];
      const existing = list.findIndex(e => e.id === entry.id);
      if (existing >= 0) {
        const updated = [...list];
        updated[existing] = { ...entry, updated_at: new Date().toISOString() };
        return updated;
      }
      return [...list, { ...entry, is_starred: entry.is_starred ?? false, chapter_ids: entry.chapter_ids ?? [] }];
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries((current) => (current || []).filter(e => e.id !== entryId));
    setCurrentView('timeline');
    setSelectedEntryId(null);
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
      return [...list, chapter];
    });
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters((current) => (current || []).filter(c => c.id !== chapterId));
    setEntries((current) => {
      const list = current || [];
      return list.map(e => ({
        ...e,
        chapter_ids: (e.chapter_ids || []).filter(id => id !== chapterId)
      }));
    });
  };

  const handleAssignChapter = (entryId: string, chapterId: string) => {
    setEntries((current) => {
      const list = current || [];
      return list.map(e => {
        if (e.id !== entryId) return e;
        const currentChapters = e.chapter_ids || [];
        if (currentChapters.includes(chapterId)) {
          return { ...e, chapter_ids: currentChapters.filter(id => id !== chapterId), updated_at: new Date().toISOString() };
        }
        return { ...e, chapter_ids: [...currentChapters, chapterId], updated_at: new Date().toISOString() };
      });
    });
  };

  const entryList = (entries || []).map(e => ({
    ...e,
    is_starred: e.is_starred ?? false,
    chapter_ids: e.chapter_ids ?? []
  }));
  const chapterList = chapters || [];
  const selectedEntry = selectedEntryId 
    ? entryList.find(e => e.id === selectedEntryId) || null
    : null;

  return (
    <div className="min-h-screen relative">
      <DreamyBackground isDarkMode={isDarkMode} />
      {currentView === 'timeline' && (
        <Timeline
          entries={entryList}
          chapters={chapterList}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onSelectEntry={(id) => handleNavigate('entry', id)}
          onNewEntry={() => handleNavigate('new')}
          onViewYearbook={() => handleNavigate('yearbook')}
          onToggleStar={handleToggleStar}
          onSaveChapter={handleSaveChapter}
          onDeleteChapter={handleDeleteChapter}
          onAssignChapter={handleAssignChapter}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          isDarkMode={isDarkMode}
          isNightTime={isNightTime}
        />
      )}

      {currentView === 'new' && (
        <NewEntry
          onSave={(entry) => {
            handleSaveEntry(entry);
            handleNavigate('entry', entry.id);
          }}
          onBack={() => handleNavigate('timeline')}
        />
      )}

      {currentView === 'entry' && selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          chapters={chapterList}
          onSave={handleSaveEntry}
          onDelete={() => handleDeleteEntry(selectedEntry.id)}
          onBack={() => handleNavigate('timeline')}
          onAssignChapter={handleAssignChapter}
        />
      )}

      {currentView === 'yearbook' && (
        <YearbookView
          entries={entryList}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onBack={() => handleNavigate('timeline')}
        />
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
