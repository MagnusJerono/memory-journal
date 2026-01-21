import { useState } from 'react';
import { Entry, ThemeMode, Chapter } from '@/lib/types';
import { filterEntriesByYear, getAvailableYears, getEntryTitle, formatShortDate, searchEntries } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Book, Camera, Star, MagnifyingGlass, X, MapPin, Tag, Images, Heart, FolderSimple } from '@phosphor-icons/react';
import { BrandHeader } from '@/components/BrandHeader';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ChaptersPanel } from './ChaptersPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  entries: Entry[];
  chapters: Chapter[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onViewYearbook: () => void;
  onToggleStar?: (entryId: string) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAssignChapter: (entryId: string, chapterId: string) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isNightTime: boolean;
}

export function Timeline({
  entries,
  chapters,
  selectedYear,
  onYearChange,
  onSelectEntry,
  onNewEntry,
  onViewYearbook,
  onToggleStar,
  onSaveChapter,
  onDeleteChapter,
  onAssignChapter,
  themeMode,
  onThemeModeChange,
  isDarkMode,
  isNightTime
}: TimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const years = getAvailableYears(entries);
  const yearFiltered = filterEntriesByYear(entries, selectedYear);
  let filteredEntries = searchQuery ? searchEntries(yearFiltered, searchQuery) : yearFiltered;
  
  if (showFavoritesOnly) {
    filteredEntries = filteredEntries.filter(e => e.is_starred);
  }
  
  if (selectedChapterId) {
    filteredEntries = filteredEntries.filter(e => (e.chapter_ids || []).includes(selectedChapterId));
  }
  
  const entryCountByChapter: Record<string, number> = {};
  chapters.forEach(ch => {
    entryCountByChapter[ch.id] = yearFiltered.filter(e => (e.chapter_ids || []).includes(ch.id)).length;
  });
  
  const starredEntries = filteredEntries.filter(e => e.is_starred);
  const otherEntries = filteredEntries.filter(e => !e.is_starred);
  const sortedEntries = [...starredEntries, ...otherEntries];
  
  const lockedCount = filteredEntries.filter(e => e.is_locked).length;
  const starredCount = yearFiltered.filter(e => e.is_starred).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-card/70 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <BrandHeader />
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                {showSearch ? <X weight="bold" /> : <MagnifyingGlass weight="bold" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onViewYearbook} className="hidden sm:flex border-border/50 bg-secondary/30 hover:bg-secondary/60">
                <Book className="mr-2" weight="duotone" />
                Yearbook
              </Button>
              <Button size="sm" onClick={onNewEntry} className="shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90">
                <Plus className="mr-2" weight="bold" />
                <span className="hidden sm:inline">New Memory</span>
                <span className="sm:hidden">New</span>
              </Button>
              <SettingsPanel 
                themeMode={themeMode}
                onThemeModeChange={onThemeModeChange}
                isDarkMode={isDarkMode}
                isNightTime={isNightTime}
              />
            </div>
          </div>
          
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-1">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" weight="bold" />
                    <Input
                      placeholder="Search memories by keywords, places, people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-input/60 border-border/40 focus:border-primary/50"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X weight="bold" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ChaptersPanel
          chapters={chapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          onSaveChapter={onSaveChapter}
          onDeleteChapter={onDeleteChapter}
          entryCountByChapter={entryCountByChapter}
        />

        {starredCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full p-4 rounded-2xl border transition-all duration-300 ${
                showFavoritesOnly 
                  ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border-amber-400/40 shadow-lg shadow-amber-500/10' 
                  : 'bg-card/60 backdrop-blur-sm border-border/40 hover:border-amber-400/30 hover:bg-amber-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${showFavoritesOnly ? 'bg-amber-400/30' : 'bg-amber-400/15'}`}>
                    <Heart weight={showFavoritesOnly ? 'fill' : 'duotone'} className={`w-5 h-5 ${showFavoritesOnly ? 'text-amber-500' : 'text-amber-400/80'}`} />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${showFavoritesOnly ? 'text-amber-600 dark:text-amber-300' : 'text-foreground'}`}>
                      Precious Memories
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {starredCount} {starredCount === 1 ? 'moment' : 'moments'} you want to hold tight
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    showFavoritesOnly 
                      ? 'bg-amber-400/30 text-amber-600 dark:text-amber-300' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {showFavoritesOnly ? 'Showing favorites' : 'View all'}
                  </span>
                  <Star weight="fill" className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </button>
          </motion.div>
        )}

        <div className="mb-8 flex items-center justify-between gap-4">
          <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
            <SelectTrigger className="w-36 bg-card/60 backdrop-blur-sm border-border/40 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64 bg-popover border-border/50">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {searchQuery && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                {filteredEntries.length} results
              </span>
            )}
            {!searchQuery && filteredEntries.length > 0 && (
              <>
                <span className="font-medium">{filteredEntries.length} {filteredEntries.length === 1 ? 'memory' : 'memories'}</span>
                {starredCount > 0 && !showFavoritesOnly && (
                  <span className="flex items-center gap-1">
                    <Star weight="fill" className="text-amber-400" size={14} />
                    {starredCount}
                  </span>
                )}
                {lockedCount > 0 && (
                  <span className="opacity-70">· {lockedCount} locked</span>
                )}
              </>
            )}
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          searchQuery ? (
            <NoResultsState query={searchQuery} onClear={() => setSearchQuery('')} />
          ) : showFavoritesOnly ? (
            <NoFavoritesState onShowAll={() => setShowFavoritesOnly(false)} />
          ) : (
            <EmptyState onNewEntry={onNewEntry} year={selectedYear} />
          )
        ) : (
          <div className="grid gap-5">
            {sortedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <EntryCard 
                  entry={entry} 
                  onClick={() => onSelectEntry(entry.id)}
                  onToggleStar={onToggleStar ? () => onToggleStar(entry.id) : undefined}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EntryCard({ entry, onClick, onToggleStar }: { entry: Entry; onClick: () => void; onToggleStar?: () => void }) {
  const coverPhoto = entry.photos[0];
  const secondPhoto = entry.photos[1];
  const thirdPhoto = entry.photos[2];
  const photoCount = entry.photos.length;
  const title = getEntryTitle(entry);
  const firstHighlight = entry.highlights_ai?.[0];
  const location = entry.tags_ai?.places?.[0] || entry.manual_locations?.[0];
  const mood = entry.tags_ai?.moods?.[0];

  return (
    <motion.div 
      className={`group cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 bg-card/80 backdrop-blur-xl border border-border/30 hover:border-border/60 hover:bg-card/90 ${entry.is_starred ? 'ring-2 ring-amber-400/40 ring-offset-2 ring-offset-transparent' : ''}`}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex flex-col sm:flex-row">
        {photoCount > 0 ? (
          <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0 overflow-hidden sm:m-3 sm:rounded-xl">
            {photoCount === 1 && (
              <div className="relative h-44 sm:h-36 w-full overflow-hidden sm:rounded-xl">
                <img 
                  src={coverPhoto.storage_url} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sm:rounded-xl"
                />
              </div>
            )}
            
            {photoCount === 2 && (
              <div className="grid grid-cols-2 h-44 sm:h-36 gap-1 sm:rounded-xl overflow-hidden">
                <img 
                  src={coverPhoto.storage_url} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sm:rounded-l-xl"
                />
                <img 
                  src={secondPhoto!.storage_url} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sm:rounded-r-xl"
                />
              </div>
            )}
            
            {photoCount >= 3 && (
              <div className="grid grid-cols-3 h-44 sm:h-36 gap-1 sm:rounded-xl overflow-hidden">
                <div className="col-span-2 row-span-1 relative overflow-hidden sm:rounded-l-xl">
                  <img 
                    src={coverPhoto.storage_url} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden sm:rounded-r-xl">
                  <div className="h-1/2 overflow-hidden sm:rounded-tr-xl">
                    <img 
                      src={secondPhoto!.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative h-1/2 overflow-hidden sm:rounded-br-xl">
                    <img 
                      src={thirdPhoto!.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {photoCount > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white font-semibold text-sm">+{photoCount - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {photoCount > 1 && (
              <div className="absolute bottom-2 left-2 sm:bottom-2 sm:left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                <Images weight="fill" className="w-3 h-3 text-white/90" />
                <span className="text-white/90 text-xs font-medium">{photoCount}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full sm:w-48 md:w-56 h-32 sm:h-auto flex-shrink-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_oklch(0.75_0.12_280_/_0.2)_0%,_transparent_60%)]" />
            <Camera className="w-12 h-12 text-muted-foreground/30" weight="duotone" />
          </div>
        )}
        
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0 relative">
          {onToggleStar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-all duration-300 z-10"
              aria-label={entry.is_starred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star 
                weight={entry.is_starred ? 'fill' : 'regular'} 
                className={`w-5 h-5 transition-all duration-300 ${entry.is_starred ? 'text-amber-400 scale-110' : 'text-muted-foreground/40 hover:text-amber-300'}`}
              />
            </button>
          )}
          
          <div className="pr-10">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                {formatShortDate(entry.date)}
              </span>
              {entry.is_locked && (
                <span className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent font-bold rounded-full tracking-wider uppercase">
                  Locked
                </span>
              )}
            </div>
            
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-500 tracking-tight">
              {title}
            </h3>
          </div>
          
          <div className="mt-4 space-y-3">
            {firstHighlight && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {firstHighlight}
              </p>
            )}
            
            <div className="flex items-center gap-4 flex-wrap pt-1">
              {location && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                  <MapPin weight="fill" size={13} className="text-primary/70" />
                  <span className="truncate max-w-[140px]">{location}</span>
                </span>
              )}
              {mood && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                  <Tag weight="fill" size={13} className="text-accent/70" />
                  <span>{mood}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onNewEntry, year }: { onNewEntry: () => void; year: number }) {
  return (
    <motion.div 
      className="text-center py-20"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/20 flex items-center justify-center backdrop-blur-sm border border-border/30 shadow-2xl shadow-primary/20 rotate-3">
        <Camera className="w-16 h-16 text-primary/60" weight="duotone" />
      </div>
      <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-foreground tracking-tight">
        No memories in {year} yet
      </h2>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed text-base">
        Start capturing your moments. Add photos and a quick note, and let AI help you tell the story.
      </p>
      <Button onClick={onNewEntry} size="lg" className="shadow-2xl shadow-primary/30 font-semibold text-base px-8 py-6">
        <Plus className="mr-2" weight="bold" />
        Create your first memory
      </Button>
    </motion.div>
  );
}

function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <motion.div 
      className="text-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-secondary/50 flex items-center justify-center border border-border/30">
        <MagnifyingGlass className="w-12 h-12 text-muted-foreground/40" weight="duotone" />
      </div>
      <h2 className="font-serif text-2xl font-semibold mb-3 text-foreground tracking-tight">
        No memories found
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        No memories match "<span className="font-semibold text-foreground">{query}</span>". Try different keywords.
      </p>
      <Button variant="outline" onClick={onClear} className="border-border/50">
        Clear search
      </Button>
    </motion.div>
  );
}

function NoFavoritesState({ onShowAll }: { onShowAll: () => void }) {
  return (
    <motion.div 
      className="text-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-400/30">
        <Heart className="w-12 h-12 text-amber-400/50" weight="duotone" />
      </div>
      <h2 className="font-serif text-2xl font-semibold mb-3 text-foreground tracking-tight">
        No precious memories yet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Star your favorite memories to see them here. These are the moments worth holding tight.
      </p>
      <Button variant="outline" onClick={onShowAll} className="border-border/50">
        Show all memories
      </Button>
    </motion.div>
  );
}
