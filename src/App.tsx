import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppView, NavigationTab } from './lib/types';
import { DreamyBackground } from './components/DreamyBackground';
import { BottomNav } from './components/navigation/BottomNav';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useIsMobile } from './hooks/use-mobile';
import { LanguageProvider } from './hooks/use-language.tsx';
import { useJournalData } from './hooks/use-journal-data';
import { canEditEntry } from './lib/entries';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { setNativeStatusBarTheme } from './lib/capacitor';

import { HomeScreen } from './components/screens/HomeScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthScreen } from './components/screens/AuthScreen';
import { OnboardingTour, useOnboardingCompleted } from './components/onboarding/OnboardingTour';

// Lazy-load heavier screens that are not needed on the initial render.
const PromptsScreen = lazy(() =>
  import('./components/screens/PromptsScreen').then((m) => ({ default: m.PromptsScreen })),
);
const ChapterDetailScreen = lazy(() =>
  import('./components/screens/ChapterDetailScreen').then((m) => ({ default: m.ChapterDetailScreen })),
);
const LibraryScreen = lazy(() =>
  import('./components/screens/LibraryScreen').then((m) => ({ default: m.LibraryScreen })),
);
const SearchScreen = lazy(() =>
  import('./components/screens/SearchScreen').then((m) => ({ default: m.SearchScreen })),
);
const PrintScreen = lazy(() =>
  import('./components/screens/PrintScreen').then((m) => ({ default: m.PrintScreen })),
);
const EntryReadScreen = lazy(() =>
  import('./components/screens/EntryReadScreen').then((m) => ({ default: m.EntryReadScreen })),
);
const EntryEditScreen = lazy(() =>
  import('./components/screens/EntryEditScreen').then((m) => ({ default: m.EntryEditScreen })),
);

function AppContent() {
  const { session, user, loading: authLoading, isPasswordRecovery } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>({ type: 'home' });
  const { isDarkMode, isNightTime, themeMode, setThemeMode } = useTheme();
  const isMobile = useIsMobile();
  const [onboardingCompleted] = useOnboardingCompleted();
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
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    saveBook,
    deleteBook,
  } = useJournalData();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    void setNativeStatusBarTheme(isDarkMode);
  }, [isDarkMode]);

  const navigate = useCallback((view: AppView) => {
    setCurrentView(view);
  }, []);

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
        return `prompts-new-${view.promptId || (view.momentAssetIds ? `moment-${view.momentAssetIds.join('|').slice(0, 64)}` : 'default')}`;
      case 'print-builder':
        return `print-builder-${view.bookId || 'new'}-${view.step}`;
      case 'library':
        return `library-${view.tab || 'chapters'}`;
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
      case 'timeline':
      case 'library':
        return 'library';
      case 'search':
        return 'home';
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
      case 'library':
        navigate({ type: 'library' });
        break;
      case 'print':
        navigate({ type: 'print' });
        break;
    }
  };

  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const hasEntries = entries.some((e) => !e.is_draft);
  const showOnboarding =
    !!session &&
    !isPasswordRecovery &&
    !onboardingCompleted &&
    !hasEntries &&
    currentView.type === 'home';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new memory
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate({ type: 'prompts-new' });
        return;
      }

      // Ctrl/Cmd + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate({ type: 'search' });
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
  }, [navigate]);

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
            momentAssetIds={currentView.momentAssetIds}
            momentTitle={currentView.momentTitle}
            momentPrompt={currentView.momentPrompt}
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

      case 'library':
      case 'chapters':
      case 'timeline': {
        const libraryTab: 'chapters' | 'timeline' =
          currentView.type === 'timeline'
            ? 'timeline'
            : currentView.type === 'library'
              ? currentView.tab || 'chapters'
              : 'chapters';
        return (
          <LibraryScreen
            chapters={chapters}
            entries={entries}
            defaultTab={libraryTab}
            onNavigate={navigate}
            onSaveChapter={saveChapter}
            onDeleteChapter={deleteChapter}
          />
        );
      }

      case 'chapter-detail': {
        const chapter = chapters.find(c => c.id === currentView.chapterId);
        if (!chapter) {
          navigate({ type: 'library' });
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
      }

      case 'entry-read': {
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
            currentUserId={user?.id}
            currentUserEmail={user?.email}
            onToggleStar={() => toggleStar(readEntry.id)}
            onDelete={() => {
              deleteEntry(readEntry.id);
              navigate({ type: 'home' });
            }}
            onAssignChapter={(chapterId) => assignChapter(readEntry.id, chapterId)}
            onInviteCollaborator={(email, role) => inviteCollaborator(readEntry.id, email, role)}
            onUpdateCollaboratorRole={updateCollaboratorRole}
            onRemoveCollaborator={removeCollaborator}
            chapters={chapters}
          />
        );
      }

      case 'entry-edit': {
        const editEntry = entries.find(e => e.id === currentView.entryId);
        if (!editEntry) {
          navigate({ type: 'home' });
          return null;
        }
        if (!canEditEntry(editEntry, user?.id)) {
          navigate({ type: 'entry-read', entryId: editEntry.id });
          return null;
        }
        return (
          <EntryEditScreen
            entry={editEntry}
            chapters={chapters}
            currentUserId={user?.id}
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
      }

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

  // When Supabase is configured, require authentication before showing the app.
  if (supabase) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      );
    }
    if (!session || isPasswordRecovery) {
      return <AuthScreen />;
    }
  }

  return (
    <div className="min-h-screen relative">
      <DreamyBackground isDarkMode={isDarkMode} />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar
          currentTab={getCurrentTab()}
          onTabChange={handleTabChange}
          onSettingsClick={() => setSettingsPanelOpen(true)}
          onSearchClick={() => navigate({ type: 'search' })}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Main Content with Page Transitions */}
      <div className={`relative z-10 ${!isMobile ? 'ml-64' : ''} ${showBottomNav && isMobile ? 'pb-20' : ''}`}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
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
        </Suspense>
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
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        isDarkMode={isDarkMode}
        isNightTime={isNightTime}
        open={settingsPanelOpen}
        onOpenChange={setSettingsPanelOpen}
      />

      <Toaster position="bottom-center" />
      {showOnboarding && (
        <OnboardingTour onStartWriting={() => navigate({ type: 'prompts-new' })} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default App;
