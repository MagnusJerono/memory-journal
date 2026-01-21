import { useState, useMemo } from 'react';
import { Entry } from '@/lib/types';
import { getAvailableYears, getEntryTitle, getMonthFromDate, formatShortDate, getYearFromDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Spinner, Book, Calendar, X } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface YearbookViewProps {
  entries: Entry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onBack: () => void;
}

type YearbookMode = 'single' | 'multi';

export function YearbookView({ entries, selectedYear, onYearChange, onBack }: YearbookViewProps) {
  const [includeLockedOnly, setIncludeLockedOnly] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<YearbookMode>('single');
  const [selectedYears, setSelectedYears] = useState<number[]>([selectedYear]);
  
  const allYears = getAvailableYears(entries);
  const yearsWithEntries = useMemo(() => {
    const yearSet = new Set<number>();
    entries.forEach(e => yearSet.add(getYearFromDate(e.date)));
    return allYears.filter(y => yearSet.has(y));
  }, [entries, allYears]);

  const handleModeChange = (newMode: YearbookMode) => {
    setMode(newMode);
    if (newMode === 'single') {
      setSelectedYears([selectedYear]);
    }
  };

  const handleAddYear = (year: number) => {
    if (!selectedYears.includes(year)) {
      setSelectedYears(prev => [...prev, year].sort((a, b) => b - a));
    }
  };

  const handleRemoveYear = (year: number) => {
    if (selectedYears.length > 1) {
      setSelectedYears(prev => prev.filter(y => y !== year));
    }
  };

  const handleSingleYearChange = (year: number) => {
    onYearChange(year);
    setSelectedYears([year]);
  };

  const activeYears = mode === 'single' ? [selectedYear] : selectedYears;

  const filteredEntries = useMemo(() => {
    const yearEntries = entries.filter(e => activeYears.includes(getYearFromDate(e.date)));
    const filtered = includeLockedOnly 
      ? yearEntries.filter(e => e.is_locked)
      : yearEntries;
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, activeYears, includeLockedOnly]);

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

  const entriesByYearAndMonth = useMemo(() => {
    const grouped: Record<number, Record<string, Entry[]>> = {};
    
    filteredEntries.forEach(entry => {
      const year = getYearFromDate(entry.date);
      const month = getMonthFromDate(entry.date);
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(entry);
    });

    return grouped;
  }, [filteredEntries]);

  const handleGeneratePDF = async () => {
    if (filteredEntries.length === 0) {
      toast.error('Keine Einträge vorhanden', {
        description: includeLockedOnly 
          ? 'Sperre zuerst einige Einträge oder deaktiviere "Nur gesperrte Einträge".'
          : 'Füge zuerst Einträge für diesen Zeitraum hinzu.'
      });
      return;
    }

    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const yearLabel = mode === 'single' 
      ? selectedYear.toString()
      : `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`;

    toast.success(`Yearbook ${yearLabel} Vorschau bereit!`, {
      description: 'Volle PDF-Generierung kommt bald.'
    });

    setIsGenerating(false);
  };

  const getYearbookTitle = () => {
    if (mode === 'single') {
      return `Yearbook ${selectedYear}`;
    }
    const sortedYears = [...selectedYears].sort((a, b) => a - b);
    if (sortedYears.length === 2) {
      return `Journal ${sortedYears[0]} & ${sortedYears[1]}`;
    }
    return `Journal ${sortedYears[0]} – ${sortedYears[sortedYears.length - 1]}`;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2" />
            Zurück
          </Button>
          <h1 className="text-lg font-serif font-medium">Yearbook</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Book className="w-8 h-8 text-primary" weight="duotone" />
          </div>
          <h2 className="text-3xl font-serif font-semibold mb-2">{getYearbookTitle()}</h2>
          <p className="text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'Erinnerung' : 'Erinnerungen'} enthalten
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Modus</label>
                <p className="text-sm text-muted-foreground">Einzelnes Jahr oder mehrere Jahre kombinieren</p>
              </div>
              <Select value={mode} onValueChange={(v) => handleModeChange(v as YearbookMode)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Einzelnes Jahr</SelectItem>
                  <SelectItem value="multi">Mehrere Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'single' ? (
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Jahr</label>
                  <p className="text-sm text-muted-foreground">Wähle das Jahr für dein Yearbook</p>
                </div>
                <Select value={selectedYear.toString()} onValueChange={(v) => handleSingleYearChange(parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {allYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="font-medium">Jahre auswählen</label>
                    <p className="text-sm text-muted-foreground">Kombiniere mehrere Jahre zu einem Journal</p>
                  </div>
                  <Select value="" onValueChange={(v) => handleAddYear(parseInt(v))}>
                    <SelectTrigger className="w-40">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Jahr hinzufügen</span>
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {yearsWithEntries.length > 0 ? (
                        <>
                          <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                            Jahre mit Einträgen
                          </div>
                          {yearsWithEntries.map(year => (
                            <SelectItem 
                              key={year} 
                              value={year.toString()}
                              disabled={selectedYears.includes(year)}
                            >
                              {year}
                              {selectedYears.includes(year) && ' ✓'}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                          Keine Einträge vorhanden
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedYears.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {[...selectedYears].sort((a, b) => b - a).map(year => (
                      <Badge 
                        key={year} 
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 text-sm font-medium gap-1"
                      >
                        {year}
                        {selectedYears.length > 1 && (
                          <button
                            onClick={() => handleRemoveYear(year)}
                            className="ml-1 p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Nur gesperrte Einträge</label>
                <p className="text-sm text-muted-foreground">Nur finalisierte Erinnerungen einschließen</p>
              </div>
              <Switch 
                checked={includeLockedOnly}
                onCheckedChange={setIncludeLockedOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Theme</label>
                <p className="text-sm text-muted-foreground">Visueller Stil deines Yearbooks</p>
              </div>
              <Select defaultValue="classic">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Klassisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {filteredEntries.length > 0 && (
          <>
            <h3 className="font-serif text-xl font-medium mb-4">Vorschau</h3>

            {(stats.topThemes.length > 0 || stats.topPlaces.length > 0) && (
              <Card className="p-6 mb-6 bg-secondary/50">
                <h4 className="font-serif font-medium mb-4">
                  {mode === 'single' ? 'Dieses Jahr im Überblick' : 'Diese Jahre im Überblick'}
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {stats.topThemes.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top Themen</p>
                      <ul className="space-y-1">
                        {stats.topThemes.map(theme => (
                          <li key={theme} className="text-sm">{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stats.topPlaces.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top Orte</p>
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

            <div className="space-y-10">
              {Object.entries(entriesByYearAndMonth)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, months]) => (
                  <div key={year}>
                    {mode === 'multi' && (
                      <h4 className="font-serif font-semibold text-2xl mb-6 text-primary border-b border-border pb-2">
                        {year}
                      </h4>
                    )}
                    <div className="space-y-8">
                      {Object.entries(months).map(([month, monthEntries]) => (
                        <div key={`${year}-${month}`}>
                          <h5 className="font-serif font-medium text-lg mb-3 text-muted-foreground">{month}</h5>
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
                                      {mode === 'multi' && (
                                        <span className="text-xs text-muted-foreground">· {getYearFromDate(entry.date)}</span>
                                      )}
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
                  </div>
                ))}
            </div>
          </>
        )}

        {filteredEntries.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">
              {includeLockedOnly 
                ? 'Keine gesperrten Einträge für diesen Zeitraum.'
                : 'Keine Einträge für diesen Zeitraum.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {includeLockedOnly 
                ? 'Sperre Einträge die du einschließen möchtest, oder deaktiviere "Nur gesperrte Einträge".'
                : 'Erstelle zuerst einige Erinnerungen!'}
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
                Wird generiert...
              </>
            ) : (
              <>
                <Download className="mr-2" weight="bold" />
                PDF generieren
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
