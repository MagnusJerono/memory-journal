import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, View } from './lib/types';
import { Timeline } from './components/timeline/Timeline';
import { NewEntry } from './components/entry/NewEntry';
import { EntryDetail } from './components/entry/EntryDetail';
import { YearbookView } from './components/yearbook/YearbookView';
import { DreamyBackground } from './components/DreamyBackground';
import { Toaster } from '@/components/ui/sonner';
import { useNightMode } from './hooks/use-night-mode';

function App() {
  const [entries, setEntries] = useKV<Entry[]>('ziel-entries', []);
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
      return [...list, { ...entry, is_starred: entry.is_starred ?? false }];
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

  const entryList = (entries || []).map(e => ({
    ...e,
    is_starred: e.is_starred ?? false
  }));
  const selectedEntry = selectedEntryId 
    ? entryList.find(e => e.id === selectedEntryId) || null
    : null;

  return (
    <div className="min-h-screen relative">
      <DreamyBackground isDarkMode={isDarkMode} />
      {currentView === 'timeline' && (
        <Timeline
          entries={entryList}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onSelectEntry={(id) => handleNavigate('entry', id)}
          onNewEntry={() => handleNavigate('new')}
          onViewYearbook={() => handleNavigate('yearbook')}
          onToggleStar={handleToggleStar}
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
          onSave={handleSaveEntry}
          onDelete={() => handleDeleteEntry(selectedEntry.id)}
          onBack={() => handleNavigate('timeline')}
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
