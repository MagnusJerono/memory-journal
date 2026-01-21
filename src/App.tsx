import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Entry, View } from './lib/types';
import { Timeline } from './components/timeline/Timeline';
import { NewEntry } from './components/entry/NewEntry';
import { EntryDetail } from './components/entry/EntryDetail';
import { YearbookView } from './components/yearbook/YearbookView';
import { DreamyBackground } from './components/DreamyBackground';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [entries, setEntries] = useKV<Entry[]>('ziel-entries', []);
  const [currentView, setCurrentView] = useState<View>('timeline');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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
      return [...list, entry];
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries((current) => (current || []).filter(e => e.id !== entryId));
    setCurrentView('timeline');
    setSelectedEntryId(null);
  };

  const entryList = entries || [];
  const selectedEntry = selectedEntryId 
    ? entryList.find(e => e.id === selectedEntryId) || null
    : null;

  return (
    <div className="min-h-screen relative">
      <DreamyBackground />
      {currentView === 'timeline' && (
        <Timeline
          entries={entryList}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onSelectEntry={(id) => handleNavigate('entry', id)}
          onNewEntry={() => handleNavigate('new')}
          onViewYearbook={() => handleNavigate('yearbook')}
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
