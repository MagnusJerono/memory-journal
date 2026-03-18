import { useState } from 'react';
import { Entry, Chapter, AppView } from '@/lib/types';
import { getEntryTitle } from '@/lib/entries';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Camera, CaretDown, CaretUp } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface TimelineScreenProps {
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
}

interface YearMonthGroup {
  year: number;
  months: MonthGroup[];
}

interface MonthGroup {
  monthIndex: number;
  entries: Entry[];
}

export function TimelineScreen({ entries, chapters, onNavigate }: TimelineScreenProps) {
  const { t, language } = useLanguage();
  const { isDarkMode } = useTheme();
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

  // Organize entries by year and month
  const timelineData = buildTimelineData(entries);
  const hasAnyEntries = timelineData.length > 0;

  function buildTimelineData(allEntries: Entry[]): YearMonthGroup[] {
    const publishedEntries = allEntries.filter(e => !e.is_draft);
    const yearMap = new Map<number, Map<number, Entry[]>>();

    publishedEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const yr = entryDate.getFullYear();
      const mo = entryDate.getMonth();

      if (!yearMap.has(yr)) {
        yearMap.set(yr, new Map());
      }
      const monthMap = yearMap.get(yr)!;
      if (!monthMap.has(mo)) {
        monthMap.set(mo, []);
      }
      monthMap.get(mo)!.push(entry);
    });

    const result: YearMonthGroup[] = [];
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

    sortedYears.forEach(yr => {
      const monthMap = yearMap.get(yr)!;
      const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => b - a);
      const monthGroups: MonthGroup[] = sortedMonths.map(mo => {
        const monthEntries = monthMap.get(mo)!;
        monthEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { monthIndex: mo, entries: monthEntries };
      });
      result.push({ year: yr, months: monthGroups });
    });

    return result;
  }

  function toggleYearExpansion(yr: number) {
    setCollapsedYears(prev => {
      const updated = new Set(prev);
      if (updated.has(yr)) {
        updated.delete(yr);
      } else {
        updated.add(yr);
      }
      return updated;
    });
  }

  function findChapterName(chapterId: string | null): string | null {
    if (!chapterId) return null;
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.name : null;
  }

  function getMonthLabel(monthIdx: number, year: number): string {
    const dt = new Date(year, monthIdx, 1);
    // Use the current app language for month formatting
    return dt.toLocaleDateString(language || 'en', { month: 'long' });
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoHomeButton onClick={() => onNavigate({ type: 'home' })} isDarkMode={isDarkMode} />
            <div className="h-6 w-px bg-border/30 hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight hidden sm:block">
              {t.timeline.title}
            </h1>
          </div>
          <SettingsPanel />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!hasAnyEntries ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera weight="duotone" className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold mb-2">
              {t.timeline.empty}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t.timeline.emptyDesc}
            </p>
          </motion.div>
        ) : (
          /* Timeline Groups */
          <div className="space-y-8">
            {timelineData.map((yearGroup, yIdx) => {
              const isYearCollapsed = collapsedYears.has(yearGroup.year);

              return (
                <motion.div
                  key={yearGroup.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: yIdx * 0.1 }}
                  className="space-y-4"
                >
                  {/* Year Heading with Toggle */}
                  <button
                    onClick={() => toggleYearExpansion(yearGroup.year)}
                    className="flex items-center gap-3 group w-full text-left"
                  >
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                      {yearGroup.year}
                    </h2>
                    <div className="flex-1 h-0.5 bg-border/50" />
                    {isYearCollapsed ? (
                      <CaretDown weight="bold" className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <CaretUp weight="bold" className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>

                  {/* Month Groups */}
                  <AnimatePresence>
                    {!isYearCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        {yearGroup.months.map((monthGroup, mIdx) => {
                          const monthLabel = getMonthLabel(monthGroup.monthIndex, yearGroup.year);
                          const entryCount = monthGroup.entries.length;

                          return (
                            <motion.div
                              key={`${yearGroup.year}-${monthGroup.monthIndex}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: mIdx * 0.05 }}
                              className="space-y-3"
                            >
                              {/* Month Heading */}
                              <div className="flex items-baseline gap-2">
                                <h3 className="text-xl sm:text-2xl font-serif font-semibold">
                                  {monthLabel}
                                </h3>
                                <span className="text-sm text-muted-foreground">
                                  ({entryCount} {t.timeline.memories})
                                </span>
                              </div>

                              {/* Entry Cards */}
                              <div className="space-y-2">
                                {monthGroup.entries.map((entry, eIdx) => {
                                  const entryDate = new Date(entry.date);
                                  const dayNumber = entryDate.getDate();
                                  const hasPhotos = entry.photos && entry.photos.length > 0;
                                  const chapterLabel = findChapterName(entry.chapter_id);

                                  return (
                                    <motion.button
                                      key={entry.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: eIdx * 0.03 }}
                                      onClick={() => onNavigate({ 
                                        type: 'entry-read', 
                                        entryId: entry.id,
                                        returnTo: { type: 'timeline' }
                                      })}
                                      className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all text-left group"
                                    >
                                      {/* Day Badge */}
                                      <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
                                        <span className="text-lg sm:text-xl font-bold text-primary">
                                          {dayNumber}
                                        </span>
                                      </div>

                                      {/* Entry Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          {hasPhotos && (
                                            <Camera weight="fill" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                          )}
                                          <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                                            {getEntryTitle(entry)}
                                          </h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          {chapterLabel && (
                                            <>
                                              <span className="truncate">{chapterLabel}</span>
                                              {entry.is_starred && <span>·</span>}
                                            </>
                                          )}
                                          {entry.is_starred && (
                                            <Star weight="fill" className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
