import { useState, useEffect, useRef } from 'react';
import { Entry, Chapter, AppView, CHAPTER_ICONS, ChapterIcon } from '@/lib/types';
import { searchEntries, getEntryTitle, formatShortDate } from '@/lib/entries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MagnifyingGlass, X, Camera, Star, CaretRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchScreenProps {
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
}

export function SearchScreen({
  entries,
  chapters,
  onNavigate
}: SearchScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const nonDraftEntries = entries.filter(e => !e.is_draft);
  const results = query.trim() ? searchEntries(nonDraftEntries, query) : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getChapterName = (chapterId: string | null) => {
    if (!chapterId) return null;
    return chapters.find(c => c.id === chapterId)?.name;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <div className="flex-1" />
            <div className="hidden sm:block">
              <NavigationMenu 
                onNavigate={onNavigate} 
                currentTab="search" 
                isDarkMode={isDarkMode} 
              />
            </div>
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" weight="bold" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="pl-10 pr-10 h-12 text-base bg-card/60 border-border/40"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X weight="bold" className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!query.trim() ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MagnifyingGlass weight="duotone" className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground">
                {t.search.placeholder}
              </p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MagnifyingGlass weight="duotone" className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                {t.search.noResults}
              </h2>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                {t.search.noResultsDesc}
              </p>
              <Button variant="outline" onClick={() => setQuery('')}>
                {t.common.close}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
              </p>
              <div className="space-y-3">
                {results.map((entry, index) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onNavigate({ type: 'entry-read', entryId: entry.id })}
                    className="w-full p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-border/50 hover:bg-card/90 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      {entry.photos[0] ? (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={entry.photos[0].storage_url}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Camera weight="duotone" className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {getEntryTitle(entry)}
                          </h3>
                          {entry.is_starred && (
                            <Star weight="fill" className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatShortDate(entry.date)}
                          {entry.chapter_id && getChapterName(entry.chapter_id) && (
                            <span> · {getChapterName(entry.chapter_id)}</span>
                          )}
                        </p>
                        {entry.highlights_ai?.[0] && (
                          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                            {entry.highlights_ai[0]}
                          </p>
                        )}
                      </div>
                      <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
