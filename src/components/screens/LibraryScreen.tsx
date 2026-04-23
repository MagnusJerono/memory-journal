import { useState } from 'react';
import { AppView, Entry, Chapter } from '@/lib/types';
import { ChaptersScreen } from './ChaptersScreen';
import { TimelineScreen } from './TimelineScreen';
import { useLanguage } from '@/hooks/use-language.tsx';
import { motion } from 'framer-motion';

type LibraryTab = 'chapters' | 'timeline';

interface LibraryScreenProps {
  chapters: Chapter[];
  entries: Entry[];
  defaultTab?: LibraryTab;
  onNavigate: (view: AppView) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (id: string) => void;
}

export function LibraryScreen({
  chapters,
  entries,
  defaultTab = 'chapters',
  onNavigate,
  onSaveChapter,
  onDeleteChapter,
}: LibraryScreenProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<LibraryTab>(defaultTab);

  return (
    <div className="relative">
      {/* Segmented control overlayed above the active screen */}
      <div className="sticky top-0 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto px-4 pt-3 pointer-events-auto flex justify-center">
          <div
            role="tablist"
            aria-label={t.nav.library}
            className="inline-flex items-center gap-1 p-1 rounded-full bg-card/80 backdrop-blur-xl border border-border/30 shadow-sm"
          >
            {(['chapters', 'timeline'] as const).map((key) => {
              const isActive = tab === key;
              return (
                <motion.button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(key)}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="library-tab-active"
                      className="absolute inset-0 rounded-full bg-primary/15 border border-primary/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{t.nav[key]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {tab === 'chapters' ? (
        <ChaptersScreen
          chapters={chapters}
          entries={entries}
          onNavigate={onNavigate}
          onSaveChapter={onSaveChapter}
          onDeleteChapter={onDeleteChapter}
        />
      ) : (
        <TimelineScreen
          entries={entries}
          chapters={chapters}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
