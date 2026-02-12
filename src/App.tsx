import { useState, useEffect } from 'react';
import { AppView, NavigationTab } from './lib/types';
import { DreamyBackground } from './components/DreamyBackground';
import { BottomNav } from './components/navigation/BottomNav';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useIsMobile } from './hooks/use-mobile';
import { LanguageProvider } from './hooks/use-language.tsx';
import { useJournalData } from './hooks/use-journal-data';

import { HomeScreen } from './components/screens/HomeScreen';
import { PromptsScreen } from './components/screens/PromptsScreen';
import { ChaptersScreen } from './components/screens/ChaptersScreen';
import { ChapterDetailScreen } from './components/screens/ChapterDetailScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { PrintScreen } from './components/screens/PrintScreen';
import { EntryReadScreen } from './components/screens/EntryReadScreen';
import { EntryEditScreen } from './components/screens/EntryEditScreen';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>({ type: 'home' });
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  const {
    entries,
    chapters,
    books,
    saveEntry,
    deleteEntry,
    toggleStar,
    saveChapter,
    deleteChapter,
    assignChapter,
    saveBook,
    deleteBook,
  } = useJournalData();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

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
            entries={entries}
            chapters={chapters}
            onNavigate={navigate}
          />
        );

      case 'prompts':
        return (
          <PromptsScreen
            onNavigate={navigate}
          />
        );

      case 'prompts-new':
        return (
          <EntryEditScreen
            entry={null}
            chapters={chapters}
            promptId={currentView.promptId}
            onSave={(entry) => {
              saveEntry(entry);
              navigate({ type: 'entry-read', entryId: entry.id });
            }}
            onBack={() => navigate({ type: 'home' })}
            onNavigate={navigate}
          />
        );

      case 'chapters':
        return (
          <ChaptersScreen
            chapters={chapters}
            entries={entries}
            onNavigate={navigate}
            onSaveChapter={saveChapter}
            onDeleteChapter={deleteChapter}
          />
        );

      case 'chapter-detail':
        const chapter = chapters.find(c => c.id === currentView.chapterId);
        if (!chapter) {
          navigate({ type: 'chapters' });
          return null;
        }
        return (
          <ChapterDetailScreen
            chapter={chapter}
            entries={entries.filter(e => e.chapter_id === currentView.chapterId)}
            onNavigate={navigate}
            onSaveChapter={saveChapter}
            onDeleteChapter={deleteChapter}
            onToggleStar={toggleStar}
          />
        );

      case 'entry-read':
        const readEntry = entries.find(e => e.id === currentView.entryId);
        if (!readEntry) {
          navigate({ type: 'home' });
          return null;
        }
        return (
          <EntryReadScreen
            entry={readEntry}
            chapter={chapters.find(c => c.id === readEntry.chapter_id) || null}
            onNavigate={navigate}
            onToggleStar={() => toggleStar(readEntry.id)}
            onDelete={() => {
              deleteEntry(readEntry.id);
              navigate({ type: 'home' });
            }}
            onAssignChapter={(chapterId) => assignChapter(readEntry.id, chapterId)}
            chapters={chapters}
          />
        );

      case 'entry-edit':
        const editEntry = entries.find(e => e.id === currentView.entryId);
        if (!editEntry) {
          navigate({ type: 'home' });
          return null;
        }
        return (
          <EntryEditScreen
            entry={editEntry}
            chapters={chapters}
            onSave={(entry) => {
              saveEntry(entry);
              navigate({ type: 'entry-read', entryId: entry.id });
            }}
            onBack={() => navigate({ type: 'entry-read', entryId: editEntry.id })}
            onNavigate={navigate}
            onDelete={() => {
              deleteEntry(editEntry.id);
              navigate({ type: 'home' });
            }}
          />
        );

      case 'search':
        return (
          <SearchScreen
            entries={entries}
            chapters={chapters}
            onNavigate={navigate}
          />
        );

      case 'print':
        return (
          <PrintScreen
            books={books}
            entries={entries}
            chapters={chapters}
            onNavigate={navigate}
            onSaveBook={saveBook}
            onDeleteBook={deleteBook}
          />
        );

      case 'print-builder':
        return (
          <PrintScreen
            books={books}
            entries={entries}
            chapters={chapters}
            onNavigate={navigate}
            onSaveBook={saveBook}
            onDeleteBook={deleteBook}
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
      
      {/* Desktop Sidebar */}
      {!isMobile && showBottomNav && (
        <DesktopSidebar
          currentTab={getCurrentTab()}
          onTabChange={handleTabChange}
        />
      )}
      
      {/* Main Content */}
      <div className={`relative z-10 ${showBottomNav && isMobile ? 'pb-20' : ''} ${!isMobile && showBottomNav ? 'ml-64' : ''}`}>
        {renderScreen()}
      </div>

      {/* Mobile Bottom Navigation */}
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

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
