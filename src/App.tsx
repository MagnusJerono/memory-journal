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
import { motion, AnimatePresence } from 'framer-motion';

import { HomeScreen } from './components/screens/HomeScreen';
import { PromptsScreen } from './components/screens/PromptsScreen';
import { ChaptersScreen } from './components/screens/ChaptersScreen';
import { ChapterDetailScreen } from './components/screens/ChapterDetailScreen';
import { TimelineScreen } from './components/screens/TimelineScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { PrintScreen } from './components/screens/PrintScreen';
import { EntryReadScreen } from './components/screens/EntryReadScreen';
import { EntryEditScreen } from './components/screens/EntryEditScreen';
import { SettingsPanel } from './components/SettingsPanel';

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

  // Helper to generate unique keys for AnimatePresence
  const getViewKey = (view: AppView): string => {
    switch (view.type) {
      case 'entry-read':
        return `entry-read-${view.entryId}`;
      case 'entry-edit':
        return `entry-edit-${view.entryId}`;
      case 'chapter-detail':
        return `chapter-detail-${view.chapterId}`;
      case 'prompts-new':
        return `prompts-new-${view.promptId || 'default'}`;
      case 'print-builder':
        return `print-builder-${view.bookId || 'new'}-${view.step}`;
      default:
        return view.type;
    }
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
      case 'timeline':
        return 'timeline';
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
      case 'timeline':
        navigate({ type: 'timeline' });
        break;
      case 'search':
        navigate({ type: 'search' });
        break;
      case 'print':
        navigate({ type: 'print' });
        break;
    }
  };

  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new memory
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate({ type: 'prompts-new' });
        return;
      }
      
      // Escape to go home (but not when in input/textarea)
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA';
        
        if (!isTyping) {
          navigate({ type: 'home' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
              if (!entry.is_draft) {
                navigate({ type: 'entry-read', entryId: entry.id });
              }
            }}
            onBack={() => navigate(currentView.returnTo || { type: 'home' })}
            onNavigate={navigate}
            onSaveChapter={saveChapter}
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

      case 'timeline':
        return (
          <TimelineScreen
            entries={entries}
            chapters={chapters}
            onNavigate={navigate}
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
              if (!entry.is_draft) {
                navigate({ type: 'entry-read', entryId: entry.id, returnTo: currentView.returnTo });
              }
            }}
            onBack={() => navigate(currentView.returnTo || { type: 'home' })}
            onNavigate={navigate}
            onDelete={() => {
              deleteEntry(editEntry.id);
              navigate(currentView.returnTo || { type: 'home' });
            }}
            onSaveChapter={saveChapter}
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
      {!isMobile && (
        <DesktopSidebar
          currentTab={getCurrentTab()}
          onTabChange={handleTabChange}
          onSettingsClick={() => setSettingsPanelOpen(true)}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Main Content with Page Transitions */}
      <div className={`relative z-10 ${!isMobile ? 'ml-64' : ''} ${showBottomNav && isMobile ? 'pb-20' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={getViewKey(currentView)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && isMobile && (
        <BottomNav
          currentTab={getCurrentTab()}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Settings Panel Dialog */}
      <SettingsPanel 
        open={settingsPanelOpen}
        onOpenChange={setSettingsPanelOpen}
      />

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
