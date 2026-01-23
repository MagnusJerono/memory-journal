import { Entry, Chapter, AppView, ThemeMode } from '@/lib/types';
import { getRecentEntries, getDraftEntry, getEntryTitle, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { PencilSimple, Sparkle, Camera, Star, Gear, CaretRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BrandHeader, CloudHeader } from '@/components/BrandHeader';

interface HomeScreenProps {
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isNightTime: boolean;
}

export function HomeScreen({
  entries,
  chapters,
  onNavigate,
  themeMode,
  onThemeModeChange,
  isDarkMode,
  isNightTime
}: HomeScreenProps) {
  const draft = getDraftEntry(entries);
  const recentEntries = getRecentEntries(entries, 5);
  const hasEntries = entries.filter(e => !e.is_draft).length > 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10">
        <CloudHeader isDarkMode={isDarkMode} className="mx-auto max-w-3xl px-4 pt-3">
          <div className="flex items-center justify-between">
            <BrandHeader isDarkMode={isDarkMode} />
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={onThemeModeChange}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
        </CloudHeader>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {draft && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <PencilSimple weight="duotone" className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Continue writing</p>
                <h3 className="font-serif text-lg font-semibold text-foreground truncate">
                  {getEntryTitle(draft)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Draft · Last edited {formatTimeAgo(draft.updated_at)}
                </p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate({ type: 'entry-edit', entryId: draft.id })}
              className="w-full mt-4 shadow-md"
            >
              Continue Writing
            </Button>
          </motion.div>
        )}

        {!draft && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/30"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <Sparkle weight="duotone" className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Ready to capture a moment?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with a guided prompt to help you write.
                </p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate({ type: 'prompts' })}
              className="w-full mt-4 shadow-md"
            >
              <Sparkle className="mr-2" weight="bold" />
              Start with a Prompt
            </Button>
          </motion.div>
        )}

        {hasEntries && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">Recent Memories</h2>
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
              Your journal awaits
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Start capturing moments with guided prompts that help you write meaningful memories.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
