import { Entry } from '@/lib/types';
import { filterEntriesByYear, getAvailableYears, getEntryTitle, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Book, Camera } from '@phosphor-icons/react';

interface TimelineProps {
  entries: Entry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onViewYearbook: () => void;
}

export function Timeline({
  entries,
  selectedYear,
  onYearChange,
  onSelectEntry,
  onNewEntry,
  onViewYearbook
}: TimelineProps) {
  const years = getAvailableYears(entries);
  const filteredEntries = filterEntriesByYear(entries, selectedYear);
  const lockedCount = filteredEntries.filter(e => e.is_locked).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold font-serif text-foreground">Ziel</h1>
            <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewYearbook}>
              <Book className="mr-2" weight="duotone" />
              Yearbook
            </Button>
            <Button size="sm" onClick={onNewEntry}>
              <Plus className="mr-2" weight="bold" />
              New Entry
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {filteredEntries.length === 0 ? (
          <EmptyState onNewEntry={onNewEntry} year={selectedYear} />
        ) : (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'memory' : 'memories'} in {selectedYear}
              {lockedCount > 0 && ` · ${lockedCount} locked`}
            </div>
            <div className="grid gap-4">
              {filteredEntries.map(entry => (
                <EntryCard key={entry.id} entry={entry} onClick={() => onSelectEntry(entry.id)} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  const coverPhoto = entry.photos[0];
  const title = getEntryTitle(entry);
  const firstHighlight = entry.highlights_ai?.[0];

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="flex">
        {coverPhoto ? (
          <div className="w-32 h-32 flex-shrink-0 bg-muted">
            <img 
              src={coverPhoto.storage_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-32 flex-shrink-0 bg-muted flex items-center justify-center">
            <Camera className="w-8 h-8 text-muted-foreground/50" weight="duotone" />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {formatShortDate(entry.date)}
              </span>
              {entry.is_locked && (
                <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent-foreground rounded">
                  Locked
                </span>
              )}
            </div>
            <h3 className="font-serif font-medium text-lg text-foreground truncate">
              {title}
            </h3>
          </div>
          {firstHighlight && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {firstHighlight}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onNewEntry, year }: { onNewEntry: () => void; year: number }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Camera className="w-10 h-10 text-muted-foreground" weight="duotone" />
      </div>
      <h2 className="font-serif text-xl font-medium mb-2">No memories in {year} yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Start capturing your moments. Add photos and a quick note, and let AI help you tell the story.
      </p>
      <Button onClick={onNewEntry}>
        <Plus className="mr-2" weight="bold" />
        Create your first entry
      </Button>
    </div>
  );
}
