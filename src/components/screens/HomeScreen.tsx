import { Entry, Chapter, AppView, CHAPTER_ICONS, ChapterIcon } from '@/lib/types';
import { getRecentEntries, getDraftEntry, getEntryTitle, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { PencilSimple, Sparkle, Camera, Star, CaretRight, Books, NotePencil } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BrandHeader, CloudHeader } from '@/components/BrandHeader';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface HomeScreenProps {
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
}

export function HomeScreen({
  entries,
  chapters,
  onNavigate
}: HomeScreenProps) {
  const { t } = useLanguage();
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const [lastOTDToastDate, setLastOTDToastDate] = useLocalStorage<string>('tightly-last-otd-toast-date', '');
  
  const draft = getDraftEntry(entries);
  const recentEntries = getRecentEntries(entries, 5);
  const hasEntries = entries.filter(e => !e.is_draft).length > 0;
  const activeChapters = chapters.filter(c => !c.is_archived).slice(0, 4);

  // "On This Day" - Find entries from same date in previous years
  const getOnThisDayEntries = () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const thisYear = today.getFullYear();

    return entries.filter(entry => {
      if (entry.is_draft) return false;
      const entryDate = new Date(entry.date);
      const entryYear = entryDate.getFullYear();
      return (
        entryDate.getMonth() === todayMonth &&
        entryDate.getDate() === todayDay &&
        entryYear !== thisYear
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const onThisDayEntries = getOnThisDayEntries();

  // Show toast once per day if there are "On This Day" memories
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (onThisDayEntries.length > 0 && lastOTDToastDate !== today) {
      const firstEntry = onThisDayEntries[0];
      const entryDate = new Date(firstEntry.date);
      const yearsAgo = new Date().getFullYear() - entryDate.getFullYear();
      
      // Only show toast for memories from previous years
      if (yearsAgo > 0) {
        toast('You have a memory from this day!', {
          description: `From ${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`,
          action: {
            label: 'View',
            onClick: () => onNavigate({ type: 'entry-read', entryId: firstEntry.id }),
          },
        });
      }
      
      setLastOTDToastDate(today);
    }
  }, [onThisDayEntries, lastOTDToastDate, onNavigate, setLastOTDToastDate]);

  // Writing Streak - Calculate consecutive days with entries
  const calculateStreak = () => {
    const MILLISECONDS_PER_DAY = 86400000;
    const nonDraftEntries = entries.filter(e => !e.is_draft);
    if (nonDraftEntries.length === 0) return 0;

    // Get unique dates with entries
    const datesWithEntries = [...new Set(
      nonDraftEntries.map(e => new Date(e.date).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (datesWithEntries.length === 0) return 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - MILLISECONDS_PER_DAY).toDateString();

    // Check if there's an entry today or yesterday
    if (datesWithEntries[0] !== today && datesWithEntries[0] !== yesterday) {
      return 0; // Streak broken
    }

    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of datesWithEntries) {
      const expectedDate = new Date(currentDate).toDateString();
      if (dateStr === expectedDate) {
        streak++;
        currentDate = new Date(currentDate.getTime() - MILLISECONDS_PER_DAY); // Go back one day
      } else {
        break;
      }
    }

    return streak;
  };

  const writingStreak = calculateStreak();

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  const getEntryCountForChapter = (chapterId: string) => 
    entries.filter(e => e.chapter_id === chapterId && !e.is_draft).length;

  const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.time.justNow;
    if (diffMins < 60) return `${diffMins}${t.time.minutesAgo}`;
    if (diffHours < 24) return `${diffHours}${t.time.hoursAgo}`;
    if (diffDays < 7) return `${diffDays}${t.time.daysAgo}`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 w-full px-4 pt-3">
        <CloudHeader isDarkMode={isDarkMode} className="w-full max-w-5xl mx-auto">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <BrandHeader isDarkMode={isDarkMode} />
            <div className="flex items-center gap-2 md:hidden">
              <div className="hidden sm:block">
                <NavigationMenu
                  onNavigate={onNavigate}
                  currentTab="home"
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
          </div>
        </CloudHeader>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Unified hero: streak chip + primary + secondary action */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20"
        >
          {hasEntries && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              {writingStreak > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <span>🔥</span>
                  <span className="font-medium">
                    {writingStreak} {writingStreak === 1 ? 'day' : 'days'}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/30 text-muted-foreground">
                  <span>✨</span>
                  <span className="text-xs">Start a streak today</span>
                </span>
              )}
            </div>
          )}

          {draft ? (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/20 flex-shrink-0">
                  <PencilSimple weight="duotone" className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t.home.continueWriting}</p>
                  <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                    {getEntryTitle(draft)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.home.draft} · {t.home.lastEdited} {formatTimeAgo(draft.updated_at)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onNavigate({ type: 'entry-edit', entryId: draft.id })}
                  className="flex-1 shadow-md"
                >
                  {t.home.continueWriting}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate({ type: 'prompts' })}
                  className="flex-1"
                >
                  <Sparkle className="mr-2 w-4 h-4" weight="fill" />
                  {t.home.usePrompt}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-1">
                  {hasEntries ? t.home.newMemory : 'Welcome to Tightly ✨'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasEntries ? t.home.customMemoryDesc : "Your memories deserve more than to be forgotten. Let's capture your first one."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onNavigate({ type: 'prompts-new' })}
                  className="flex-1 shadow-md"
                >
                  <NotePencil className="mr-2 w-4 h-4" weight="duotone" />
                  {hasEntries ? t.home.customMemory : 'Create my first memory'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate({ type: 'prompts' })}
                  className="flex-1"
                >
                  <Sparkle className="mr-2 w-4 h-4" weight="fill" />
                  {t.home.usePrompt}
                </Button>
              </div>
            </>
          )}
        </motion.section>

        {activeChapters.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg font-semibold text-foreground">{t.home.chapters}</h2>
              <button 
                onClick={() => onNavigate({ type: 'chapters' })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t.home.viewAll}
                <CaretRight weight="bold" className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeChapters.map((chapter, index) => (
                <motion.button
                  key={chapter.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onNavigate({ type: 'chapter-detail', chapterId: chapter.id })}
                  className="p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 hover:border-border/50 hover:bg-card/80 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                      style={{ backgroundColor: `${chapter.color}15` }}
                    >
                      {getIconEmoji(chapter.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {chapter.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {getEntryCountForChapter(chapter.id)} {t.home.memories}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {chapters.length === 0 && (
              <motion.button
                onClick={() => onNavigate({ type: 'chapters' })}
                className="w-full p-4 rounded-xl bg-muted/30 border border-dashed border-border/50 hover:border-primary/30 transition-all text-center"
              >
                <Books weight="duotone" className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t.home.createChapters}</p>
              </motion.button>
            )}
          </motion.section>
        )}

        {/* On This Day - Enhanced prominent card */}
        {onThisDayEntries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🕰️</span>
              <h2 className="font-serif text-xl font-semibold text-foreground">On This Day</h2>
            </div>
            
            {onThisDayEntries.length === 1 ? (
              // Single memory - larger card
              <motion.button
                onClick={() => onNavigate({ type: 'entry-read', entryId: onThisDayEntries[0].id })}
                className="w-full p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-amber-500/50 hover:bg-card/90 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  {onThisDayEntries[0].photos[0] ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={onThisDayEntries[0].photos[0].storage_url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Camera weight="duotone" className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">
                      {new Date().getFullYear() - new Date(onThisDayEntries[0].date).getFullYear()} years ago
                    </p>
                    <h3 className="font-medium text-foreground text-base truncate group-hover:text-amber-600 transition-colors mb-1">
                      {getEntryTitle(onThisDayEntries[0])}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {onThisDayEntries[0].story_ai || onThisDayEntries[0].transcript}
                    </p>
                  </div>
                  <CaretRight weight="bold" className="w-6 h-6 text-muted-foreground/50 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </div>
              </motion.button>
            ) : (
              // Multiple memories - horizontal scroll
              <div className="overflow-x-auto -mx-6 px-6 pb-2">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                  {onThisDayEntries.map((entry, index) => {
                    const entryDate = new Date(entry.date);
                    const yearsAgo = new Date().getFullYear() - entryDate.getFullYear();
                    return (
                      <motion.button
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onNavigate({ type: 'entry-read', entryId: entry.id })}
                        className="w-72 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-amber-500/50 hover:bg-card/90 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          {entry.photos[0] ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={entry.photos[0].storage_url}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                              <Camera weight="duotone" className="w-6 h-6 text-amber-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                              {yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago
                            </p>
                            <h3 className="font-medium text-foreground text-sm truncate group-hover:text-amber-600 transition-colors">
                              {getEntryTitle(entry)}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {(entry.story_ai || entry.transcript)?.substring(0, 80)}
                              {((entry.story_ai || entry.transcript || '').length > 80) && '...'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {hasEntries && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">{t.home.recentMemories}</h2>
            </div>
            <div className="space-y-3">
              {recentEntries.map((entry, index) => (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                        {entry.chapter_id && chapters.find(c => c.id === entry.chapter_id) && (
                          <span> · {chapters.find(c => c.id === entry.chapter_id)?.name}</span>
                        )}
                      </p>
                    </div>
                    <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {!hasEntries && !draft && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <Sparkle weight="duotone" className="w-12 h-12 text-primary/60" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
              {t.home.journalAwaits}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {t.home.journalAwaitsDesc}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
