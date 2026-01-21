import { useState, useMemo } from 'react';
import { Entry } from '@/lib/types';
import { filterEntriesByYear, getAvailableYears, getEntryTitle, getMonthFromDate, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Spinner, Book } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface YearbookViewProps {
  entries: Entry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onBack: () => void;
}

export function YearbookView({ entries, selectedYear, onYearChange, onBack }: YearbookViewProps) {
  const [includeLockedOnly, setIncludeLockedOnly] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const years = getAvailableYears(entries);

  const yearEntries = filterEntriesByYear(entries, selectedYear);
  const filteredEntries = includeLockedOnly 
    ? yearEntries.filter(e => e.is_locked)
    : yearEntries;

  const stats = useMemo(() => {
    const themes: Record<string, number> = {};
    const places: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      entry.tags_ai?.themes.forEach(t => {
        themes[t] = (themes[t] || 0) + 1;
      });
      entry.tags_ai?.places.forEach(p => {
        places[p] = (places[p] || 0) + 1;
      });
    });

    const topThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const topPlaces = Object.entries(places)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    return { topThemes, topPlaces };
  }, [filteredEntries]);

  const entriesByMonth = useMemo(() => {
    const grouped: Record<string, Entry[]> = {};
    filteredEntries.forEach(entry => {
      const month = getMonthFromDate(entry.date);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  const handleGeneratePDF = async () => {
    if (filteredEntries.length === 0) {
      toast.error('No entries to include', {
        description: includeLockedOnly 
          ? 'Lock some entries first, or turn off "Locked entries only".'
          : 'Add some entries for this year first.'
      });
      return;
    }

    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Yearbook preview ready!', {
      description: 'Full PDF generation coming soon.'
    });

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-serif font-medium">Yearbook</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
            <Book className="w-8 h-8 text-accent" weight="duotone" />
          </div>
          <h2 className="text-3xl font-serif font-semibold mb-2">Yearbook {selectedYear}</h2>
          <p className="text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'memory' : 'memories'} to include
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Year</label>
                <p className="text-sm text-muted-foreground">Select the year for your yearbook</p>
              </div>
              <Select value={selectedYear.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Locked entries only</label>
                <p className="text-sm text-muted-foreground">Include only finalized memories</p>
              </div>
              <Switch 
                checked={includeLockedOnly}
                onCheckedChange={setIncludeLockedOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Theme</label>
                <p className="text-sm text-muted-foreground">Visual style of your yearbook</p>
              </div>
              <Select defaultValue="classic">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {filteredEntries.length > 0 && (
          <>
            <h3 className="font-serif text-xl font-medium mb-4">Preview</h3>

            {(stats.topThemes.length > 0 || stats.topPlaces.length > 0) && (
              <Card className="p-6 mb-6 bg-secondary/50">
                <h4 className="font-serif font-medium mb-4">This year in review</h4>
                <div className="grid grid-cols-2 gap-6">
                  {stats.topThemes.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top themes</p>
                      <ul className="space-y-1">
                        {stats.topThemes.map(theme => (
                          <li key={theme} className="text-sm">{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stats.topPlaces.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top places</p>
                      <ul className="space-y-1">
                        {stats.topPlaces.map(place => (
                          <li key={place} className="text-sm">{place}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="space-y-8">
              {Object.entries(entriesByMonth).map(([month, monthEntries]) => (
                <div key={month}>
                  <h4 className="font-serif font-medium text-lg mb-3 text-muted-foreground">{month}</h4>
                  <div className="space-y-3">
                    {monthEntries.map(entry => (
                      <Card key={entry.id} className="p-4">
                        <div className="flex items-start gap-4">
                          {entry.photos[0] && (
                            <img 
                              src={entry.photos[0].storage_url} 
                              alt="" 
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-muted-foreground">{formatShortDate(entry.date)}</span>
                            </div>
                            <h5 className="font-serif font-medium truncate">{getEntryTitle(entry)}</h5>
                            {entry.highlights_ai?.[0] && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {entry.highlights_ai[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredEntries.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">
              {includeLockedOnly 
                ? 'No locked entries for this year yet.'
                : 'No entries for this year yet.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {includeLockedOnly 
                ? 'Lock entries you want to include, or turn off "Locked entries only".'
                : 'Create some memories first!'}
            </p>
          </Card>
        )}

        <div className="mt-8 pt-8 border-t">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleGeneratePDF}
            disabled={filteredEntries.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2" weight="bold" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
