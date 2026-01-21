import { useState } from 'react';
import { Entry } from '@/lib/types';
import { filterEntriesByYear, getAvailableYears, getEntryTitle, formatShortDate, searchEntries } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Book, Camera, Star, MagnifyingGlass, X, MapPin, Tag } from '@phosphor-icons/react';
import { BrandHeader } from '@/components/BrandHeader';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineProps {
  entries: Entry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onViewYearbook: () => void;
  onToggleStar?: (entryId: string) => void;
}

export function Timeline({
  entries,
  selectedYear,
  onYearChange,
  onSelectEntry,
  onNewEntry,
  onViewYearbook,
  onToggleStar
}: TimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const years = getAvailableYears(entries);
  const yearFiltered = filterEntriesByYear(entries, selectedYear);
  const filteredEntries = searchQuery ? searchEntries(yearFiltered, searchQuery) : yearFiltered;
  
  const starredEntries = filteredEntries.filter(e => e.is_starred);
  const otherEntries = filteredEntries.filter(e => !e.is_starred);
  const sortedEntries = [...starredEntries, ...otherEntries];
  
  const lockedCount = filteredEntries.filter(e => e.is_locked).length;
  const starredCount = filteredEntries.filter(e => e.is_starred).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <BrandHeader />
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showSearch ? <X weight="bold" /> : <MagnifyingGlass weight="bold" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onViewYearbook} className="hidden sm:flex">
                <Book className="mr-2" weight="duotone" />
                Yearbook
              </Button>
              <Button size="sm" onClick={onNewEntry} className="shadow-md shadow-primary/20">
                <Plus className="mr-2" weight="bold" />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">New</span>
              </Button>
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
                <div className="pt-3 pb-1">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" weight="bold" />
                    <Input
                      placeholder="Search memories by keywords, places, people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border/60"
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
            <SelectTrigger className="w-32 bg-card/60 backdrop-blur-sm border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {searchQuery && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {filteredEntries.length} results
              </span>
            )}
            {!searchQuery && filteredEntries.length > 0 && (
              <>
                <span>{filteredEntries.length} {filteredEntries.length === 1 ? 'memory' : 'memories'}</span>
                {starredCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Star weight="fill" className="text-amber-500" size={14} />
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
          ) : (
            <EmptyState onNewEntry={onNewEntry} year={selectedYear} />
          )
        ) : (
          <div className="grid gap-4">
            {sortedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
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
  const title = getEntryTitle(entry);
  const firstHighlight = entry.highlights_ai?.[0];
  const location = entry.tags_ai?.places?.[0] || entry.manual_locations?.[0];
  const mood = entry.tags_ai?.moods?.[0];

  return (
    <Card 
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1 bg-card/80 backdrop-blur-md border-border/40 ${entry.is_starred ? 'ring-2 ring-amber-400/50 ring-offset-2 ring-offset-transparent' : ''}`}
      onClick={onClick}
    >
      <div className="flex">
        {coverPhoto ? (
          <div className="w-28 sm:w-36 h-28 sm:h-36 flex-shrink-0 bg-muted/30 relative overflow-hidden">
            <img 
              src={coverPhoto.storage_url} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
          </div>
        ) : (
          <div className="w-28 sm:w-36 h-28 sm:h-36 flex-shrink-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 flex items-center justify-center relative">
            <Camera className="w-10 h-10 text-muted-foreground/30" weight="duotone" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_oklch(0.90_0.05_280_/_0.3)_0%,_transparent_60%)]" />
          </div>
        )}
        
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0 relative">
          {onToggleStar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar();
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors z-10"
              aria-label={entry.is_starred ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star 
                weight={entry.is_starred ? 'fill' : 'regular'} 
                className={`w-5 h-5 transition-colors ${entry.is_starred ? 'text-amber-500' : 'text-muted-foreground/50 hover:text-amber-400'}`}
              />
            </button>
          )}
          
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-semibold text-primary/80 tracking-wider uppercase">
                {formatShortDate(entry.date)}
              </span>
              {entry.is_locked && (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent/15 text-accent font-semibold rounded tracking-wide uppercase">
                  Locked
                </span>
              )}
            </div>
            
            <h3 className="font-serif font-semibold text-lg sm:text-xl text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
          </div>
          
          <div className="mt-auto pt-2 space-y-2">
            {firstHighlight && (
              <p className="text-sm text-muted-foreground/90 line-clamp-1 leading-relaxed">
                {firstHighlight}
              </p>
            )}
            
            <div className="flex items-center gap-3 flex-wrap">
              {location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <MapPin weight="fill" size={12} className="text-primary/60" />
                  <span className="truncate max-w-[120px]">{location}</span>
                </span>
              )}
              {mood && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Tag weight="fill" size={12} className="text-accent/60" />
                  <span>{mood}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onNewEntry, year }: { onNewEntry: () => void; year: number }) {
  return (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/15 to-primary/10 flex items-center justify-center backdrop-blur-sm border border-border/30 shadow-lg shadow-primary/10 rotate-3">
        <Camera className="w-14 h-14 text-primary/50" weight="duotone" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-3 text-foreground">
        No memories in {year} yet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed text-base">
        Start capturing your moments. Add photos and a quick note, and let AI help you tell the story.
      </p>
      <Button onClick={onNewEntry} size="lg" className="shadow-xl shadow-primary/25 font-medium">
        <Plus className="mr-2" weight="bold" />
        Create your first entry
      </Button>
    </motion.div>
  );
}

function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
        <MagnifyingGlass className="w-10 h-10 text-muted-foreground/40" weight="duotone" />
      </div>
      <h2 className="font-serif text-xl font-medium mb-2 text-foreground">
        No memories found
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        No memories match "<span className="font-medium text-foreground/80">{query}</span>". Try different keywords.
      </p>
      <Button variant="outline" onClick={onClear}>
        Clear search
      </Button>
    </motion.div>
  );
}
