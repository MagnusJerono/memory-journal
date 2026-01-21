import { useState, useMemo } from 'react';
import { Entry, YearbookTheme, YEARBOOK_THEMES } from '@/lib/types';
import { getAvailableYears, getEntryTitle, getMonthFromDate, formatShortDate, getYearFromDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Spinner, Book, Calendar, X, Heart } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface YearbookViewProps {
  entries: Entry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onBack: () => void;
}

type YearbookMode = 'single' | 'multi' | 'life';

export function YearbookView({ entries, selectedYear, onYearChange, onBack }: YearbookViewProps) {
  const [includeLockedOnly, setIncludeLockedOnly] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<YearbookMode>('single');
  const [selectedYears, setSelectedYears] = useState<number[]>([selectedYear]);
  const [selectedTheme, setSelectedTheme] = useState<YearbookTheme>('classic');
  
  const allYears = getAvailableYears(entries);
  const yearsWithEntries = useMemo(() => {
    const yearSet = new Set<number>();
    entries.forEach(e => yearSet.add(getYearFromDate(e.date)));
    return allYears.filter(y => yearSet.has(y)).sort((a, b) => b - a);
  }, [entries, allYears]);

  const handleModeChange = (newMode: YearbookMode) => {
    setMode(newMode);
    if (newMode === 'single') {
      setSelectedYears([selectedYear]);
    } else if (newMode === 'life') {
      setSelectedYears(yearsWithEntries);
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

  const activeYears = mode === 'single' ? [selectedYear] : mode === 'life' ? yearsWithEntries : selectedYears;

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
      : mode === 'life'
      ? 'Mein Leben'
      : `${Math.min(...selectedYears)}-${Math.max(...selectedYears)}`;

    toast.success(`${yearLabel} Vorschau bereit!`, {
      description: `Theme: ${YEARBOOK_THEMES.find(t => t.value === selectedTheme)?.label}. Volle PDF-Generierung kommt bald.`
    });

    setIsGenerating(false);
  };

  const getYearbookTitle = () => {
    if (mode === 'life') {
      return 'Mein Leben';
    }
    if (mode === 'single') {
      return `Yearbook ${selectedYear}`;
    }
    const sortedYears = [...selectedYears].sort((a, b) => a - b);
    if (sortedYears.length === 2) {
      return `Journal ${sortedYears[0]} & ${sortedYears[1]}`;
    }
    return `Journal ${sortedYears[0]} – ${sortedYears[sortedYears.length - 1]}`;
  };

  const currentTheme = YEARBOOK_THEMES.find(t => t.value === selectedTheme)!;

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
            {mode === 'life' ? (
              <Heart className="w-8 h-8 text-primary" weight="duotone" />
            ) : (
              <Book className="w-8 h-8 text-primary" weight="duotone" />
            )}
          </div>
          <h2 className="text-3xl font-serif font-semibold mb-2">{getYearbookTitle()}</h2>
          <p className="text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'Erinnerung' : 'Erinnerungen'} enthalten
            {mode === 'life' && yearsWithEntries.length > 0 && (
              <span className="block text-sm mt-1">
                {Math.min(...yearsWithEntries)} – {Math.max(...yearsWithEntries)}
              </span>
            )}
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Modus</label>
                <p className="text-sm text-muted-foreground">Wähle den Umfang deines Journals</p>
              </div>
              <Select value={mode} onValueChange={(v) => handleModeChange(v as YearbookMode)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Einzelnes Jahr</SelectItem>
                  <SelectItem value="multi">Mehrere Jahre</SelectItem>
                  <SelectItem value="life">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4" weight="fill" />
                      Mein Leben
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'life' && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" weight="duotone" />
                  <div>
                    <p className="font-medium text-sm">Alle deine Erinnerungen</p>
                    <p className="text-xs text-muted-foreground">
                      {yearsWithEntries.length} {yearsWithEntries.length === 1 ? 'Jahr' : 'Jahre'} mit Einträgen
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mode === 'single' && (
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
            )}

            {mode === 'multi' && (
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="font-medium">Theme</label>
                  <p className="text-sm text-muted-foreground">Visueller Stil deines Yearbooks</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {YEARBOOK_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`group relative p-3 rounded-xl border-2 transition-all ${
                      selectedTheme === theme.value 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-full aspect-[3/4] rounded-lg mb-2 overflow-hidden shadow-sm"
                      style={{ backgroundColor: theme.preview.bg }}
                    >
                      <div className="h-full flex flex-col p-2">
                        <div 
                          className="h-1.5 w-8 rounded-full mb-1"
                          style={{ backgroundColor: theme.preview.accent }}
                        />
                        <div 
                          className="h-1 w-6 rounded-full opacity-50"
                          style={{ backgroundColor: theme.preview.text }}
                        />
                        <div className="flex-1 flex items-center justify-center">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.preview.accent, opacity: 0.3 }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="h-0.5 w-full rounded-full opacity-30"
                            style={{ backgroundColor: theme.preview.text }}
                          />
                          <div 
                            className="h-0.5 w-3/4 rounded-full opacity-20"
                            style={{ backgroundColor: theme.preview.text }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center">{theme.label}</p>
                    <p className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {filteredEntries.length > 0 && (
          <>
            <h3 className="font-serif text-xl font-medium mb-4">Vorschau</h3>

            {(stats.topThemes.length > 0 || stats.topPlaces.length > 0) && (
              <Card 
                className="p-6 mb-6 border-2"
                style={{ 
                  backgroundColor: currentTheme.preview.bg,
                  borderColor: currentTheme.preview.accent + '40'
                }}
              >
                <h4 
                  className="font-serif font-medium mb-4"
                  style={{ color: currentTheme.preview.accent }}
                >
                  {mode === 'life' ? 'Dein Leben im Überblick' : mode === 'single' ? 'Dieses Jahr im Überblick' : 'Diese Jahre im Überblick'}
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {stats.topThemes.length > 0 && (
                    <div>
                      <p 
                        className="text-xs uppercase tracking-wide mb-2 opacity-70"
                        style={{ color: currentTheme.preview.text }}
                      >
                        Top Themen
                      </p>
                      <ul className="space-y-1">
                        {stats.topThemes.map(theme => (
                          <li 
                            key={theme} 
                            className="text-sm"
                            style={{ color: currentTheme.preview.text }}
                          >
                            {theme}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stats.topPlaces.length > 0 && (
                    <div>
                      <p 
                        className="text-xs uppercase tracking-wide mb-2 opacity-70"
                        style={{ color: currentTheme.preview.text }}
                      >
                        Top Orte
                      </p>
                      <ul className="space-y-1">
                        {stats.topPlaces.map(place => (
                          <li 
                            key={place} 
                            className="text-sm"
                            style={{ color: currentTheme.preview.text }}
                          >
                            {place}
                          </li>
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
                    {(mode === 'multi' || mode === 'life') && (
                      <h4 
                        className="font-serif font-semibold text-2xl mb-6 border-b pb-2"
                        style={{ 
                          color: currentTheme.preview.accent,
                          borderColor: currentTheme.preview.accent + '30'
                        }}
                      >
                        {year}
                      </h4>
                    )}
                    <div className="space-y-8">
                      {Object.entries(months).map(([month, monthEntries]) => (
                        <div key={`${year}-${month}`}>
                          <h5 className="font-serif font-medium text-lg mb-3 text-muted-foreground">{month}</h5>
                          <div className="space-y-3">
                            {monthEntries.map(entry => (
                              <Card 
                                key={entry.id} 
                                className="p-4"
                                style={{ backgroundColor: currentTheme.preview.bg }}
                              >
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
                                      <span 
                                        className="text-xs opacity-60"
                                        style={{ color: currentTheme.preview.text }}
                                      >
                                        {formatShortDate(entry.date)}
                                      </span>
                                      {(mode === 'multi' || mode === 'life') && (
                                        <span 
                                          className="text-xs opacity-60"
                                          style={{ color: currentTheme.preview.text }}
                                        >
                                          · {getYearFromDate(entry.date)}
                                        </span>
                                      )}
                                    </div>
                                    <h5 
                                      className="font-serif font-medium truncate"
                                      style={{ color: currentTheme.preview.text }}
                                    >
                                      {getEntryTitle(entry)}
                                    </h5>
                                    {entry.highlights_ai?.[0] && (
                                      <p 
                                        className="text-sm line-clamp-1 mt-1 opacity-70"
                                        style={{ color: currentTheme.preview.text }}
                                      >
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
