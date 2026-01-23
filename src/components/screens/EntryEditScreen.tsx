import { useState, useRef, useEffect, useCallback } from 'react';
import { Entry, Photo, Chapter, StoryTone, STORY_TONES, STORY_LANGUAGES, DEFAULT_PROMPTS, CHAPTER_ICONS, ChapterIcon } from '@/lib/types';
import { createEmptyEntry, generateAIContent, formatDate, getEntryTitle } from '@/lib/entries';
import { searchLocations, getCurrentLocation, GeocodingResult } from '@/lib/geocoding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CaretLeft,
  CalendarBlank, 
  Sparkle, 
  X, 
  Microphone, 
  Stop, 
  Globe, 
  PenNib, 
  Translate, 
  UploadSimple, 
  MapPin, 
  MagnifyingGlass, 
  Crosshair, 
  Buildings, 
  Flag, 
  MapTrifold, 
  Storefront, 
  GlobeHemisphereWest, 
  House,
  Trash,
  Plus,
  ArrowsClockwise,
  CircleNotch
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from '@/components/entry/AudioWaveform';
import { useKV } from '@github/spark/hooks';
import { motion, AnimatePresence } from 'framer-motion';

const GEOCODING_TYPE_ICONS: Record<GeocodingResult['type'], React.ReactNode> = {
  city: <Buildings weight="duotone" className="w-4 h-4" />,
  neighborhood: <MapTrifold weight="duotone" className="w-4 h-4" />,
  landmark: <MapPin weight="duotone" className="w-4 h-4" />,
  venue: <Storefront weight="duotone" className="w-4 h-4" />,
  country: <Flag weight="duotone" className="w-4 h-4" />,
  region: <GlobeHemisphereWest weight="duotone" className="w-4 h-4" />,
  address: <House weight="duotone" className="w-4 h-4" />,
};

const SPEECH_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
];

interface EntryEditScreenProps {
  entry: Entry | null;
  chapters: Chapter[];
  promptId?: string;
  onSave: (entry: Entry) => void;
  onBack: () => void;
  onDelete?: () => void;
  isDarkMode: boolean;
}

export function EntryEditScreen({ 
  entry, 
  chapters, 
  promptId, 
  onSave, 
  onBack, 
  onDelete,
  isDarkMode 
}: EntryEditScreenProps) {
  const isNewEntry = !entry;
  const prompt = promptId ? DEFAULT_PROMPTS.find(p => p.id === promptId) : null;

  const [date, setDate] = useState<Date>(entry ? new Date(entry.date + 'T00:00:00') : new Date());
  const [title, setTitle] = useState(entry?.title_user || '');
  const [transcript, setTranscript] = useState(entry?.transcript || '');
  const [photos, setPhotos] = useState<Photo[]>(entry?.photos || []);
  const [manualLocations, setManualLocations] = useState<string[]>(entry?.manual_locations || []);
  const [highlights, setHighlights] = useState<string[]>(entry?.highlights_ai || []);
  const [story, setStory] = useState(entry?.story_ai || '');
  const [chapterId, setChapterId] = useState<string | null>(entry?.chapter_id || null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useKV<string>('tightly-speech-language', 'en-US');
  const [storyTone, setStoryTone] = useKV<StoryTone>('tightly-story-tone', 'natural');
  const [storyLanguage, setStoryLanguage] = useKV<string>('tightly-story-language', 'en');
  const [customTonePrompt, setCustomTonePrompt] = useKV<string>('tightly-custom-tone', '');
  const [isDragging, setIsDragging] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<GeocodingResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isListening,
    isSupported: speechSupported,
    transcript: speechTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript: resetSpeechTranscript,
    error: speechError,
    audioLevel
  } = useSpeechToText(speechLanguage || 'en-US');

  const hasGenerated = !!story || highlights.length > 0;

  useEffect(() => {
    if (speechError) {
      toast.error('Speech recognition error', { description: speechError });
    }
  }, [speechError]);

  useEffect(() => {
    if (speechTranscript) {
      setTranscript(prev => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + separator + speechTranscript;
      });
      resetSpeechTranscript();
    }
  }, [speechTranscript, resetSpeechTranscript]);

  const handleLocationSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setLocationResults([]);
      setShowLocationDropdown(false);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const results = await searchLocations(query);
      setLocationResults(results);
      setShowLocationDropdown(results.length > 0);
    } catch {
      setLocationResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (locationSearchTimeoutRef.current) clearTimeout(locationSearchTimeoutRef.current);
    if (locationQuery.trim().length >= 2) {
      locationSearchTimeoutRef.current = setTimeout(() => handleLocationSearch(locationQuery), 300);
    } else {
      setLocationResults([]);
      setShowLocationDropdown(false);
    }
    return () => { if (locationSearchTimeoutRef.current) clearTimeout(locationSearchTimeoutRef.current); };
  }, [locationQuery, handleLocationSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current && 
        !locationDropdownRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (result: GeocodingResult) => {
    if (!manualLocations.includes(result.displayName)) {
      setManualLocations(prev => [...prev, result.displayName]);
    }
    setLocationQuery('');
    setLocationResults([]);
    setShowLocationDropdown(false);
  };

  const handleGetCurrentLocation = async () => {
    if (isGettingLocation) return;
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location && !manualLocations.includes(location.displayName)) {
        setManualLocations(prev => [...prev, location.displayName]);
        toast.success(`Added: ${location.name}`);
      }
    } catch {
      toast.error('Location access denied');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const processImageFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    const newPhotos: Photo[] = [];
    const maxPhotos = 10 - photos.length;
    const filesToProcess = imageFiles.slice(0, maxPhotos);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        newPhotos.push({
          id: uuid(),
          entry_id: '',
          storage_url: url,
          created_at: new Date().toISOString()
        });
        if (newPhotos.length === filesToProcess.length) {
          setPhotos(prev => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [photos.length]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (photos.length < 10) setIsDragging(true);
  }, [photos.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (photos.length >= 10) return;
    processImageFiles(Array.from(e.dataTransfer.files));
  }, [photos.length, processImageFiles]);

  const handleGenerate = async () => {
    if (!transcript || transcript.trim().length < 40) {
      toast.error('Please add more to your story', {
        description: 'At least a few sentences help create a better story.'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const tempEntry = entry ? { ...entry } : createEmptyEntry(formatDateISO(date), prompt?.text);
      tempEntry.title_user = title.trim() || null;
      tempEntry.transcript = transcript.trim();
      tempEntry.photos = photos.map(p => ({ ...p, entry_id: tempEntry.id }));
      tempEntry.manual_locations = manualLocations.length > 0 ? manualLocations : null;

      const currentTone = storyTone || 'natural';
      const aiResult = await generateAIContent(
        tempEntry, 
        currentTone,
        currentTone === 'custom' ? (customTonePrompt || undefined) : undefined,
        storyLanguage || 'en'
      );

      setHighlights(aiResult.highlights);
      setStory(aiResult.story);
      if (!title.trim()) setTitle(aiResult.title);
      
      toast.success('Story generated');
    } catch {
      toast.error('Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const entryId = entry?.id || uuid();
    const now = new Date().toISOString();
    
    const savedEntry: Entry = {
      id: entryId,
      date: formatDateISO(date),
      title_user: title.trim() || null,
      title_ai: entry?.title_ai || (title.trim() ? null : title.trim() || 'Untitled Memory'),
      transcript: transcript.trim() || null,
      story_ai: story || null,
      highlights_ai: highlights.length > 0 ? highlights : null,
      tags_ai: entry?.tags_ai || null,
      location_suggestions: entry?.location_suggestions || null,
      manual_locations: manualLocations.length > 0 ? manualLocations : null,
      missing_info_questions: entry?.missing_info_questions || null,
      uncertain_claims: entry?.uncertain_claims || null,
      is_locked: entry?.is_locked || false,
      is_starred: entry?.is_starred || false,
      is_draft: false,
      chapter_id: chapterId,
      photos: photos.map(p => ({ ...p, entry_id: entryId })),
      prompt_used: prompt?.text || entry?.prompt_used || null,
      created_at: entry?.created_at || now,
      updated_at: now
    };

    onSave(savedEntry);
    toast.success(isNewEntry ? 'Memory saved' : 'Changes saved');
  };

  const handleAddHighlight = () => {
    setHighlights(prev => [...prev, '']);
  };

  const handleUpdateHighlight = (index: number, value: string) => {
    setHighlights(prev => prev.map((h, i) => i === index ? value : h));
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== index));
  };

  const canSave = (transcript.trim().length >= 40 && hasGenerated) || !isNewEntry;
  const displayedTranscript = transcript + (isListening && interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '');

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <CaretLeft className="w-5 h-5" weight="bold" />
            </Button>
            <h1 className="font-serif text-lg font-semibold text-foreground">
              {isNewEntry ? 'New Memory' : 'Edit Memory'}
            </h1>
          </div>
          <Button 
            onClick={handleSave}
            disabled={!canSave}
            size="sm"
          >
            Save
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {prompt ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <p className="text-sm text-muted-foreground mb-1">Writing prompt</p>
            <p className="font-serif text-lg text-foreground">"{prompt.text}"</p>
          </motion.div>
        ) : isNewEntry && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-accent/10 border border-accent/20"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Sparkle weight="duotone" className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Custom Memory</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Describe what happened, where you were, and what made it special.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarBlank className="mr-2 w-4 h-4" weight="duotone" />
                {formatDate(formatDateISO(date))}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { if (d) setDate(d); setCalendarOpen(false); }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this memory a name..."
            className="text-lg font-serif"
          />
        </div>

        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn("transition-all", isDragging && "ring-2 ring-primary ring-offset-2")}
        >
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Photos ({photos.length}/10)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && processImageFiles(Array.from(e.target.files))}
            className="hidden"
          />
          
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative aspect-square group rounded-xl overflow-hidden">
                  <img src={photo.storage_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-xl p-6 text-center transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
              )}
            >
              <UploadSimple weight="duotone" className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragging ? "Drop photos here" : "Drag & drop or click to add"}
              </p>
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Your Story</label>
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={displayedTranscript}
              onChange={(e) => !isListening && setTranscript(e.target.value)}
              readOnly={isListening}
              placeholder={prompt?.text || "What happened? Where were you, with whom, and what made it memorable?"}
              className={cn("min-h-[160px] pr-14 resize-none", isListening && "bg-accent/10 border-accent")}
            />
            {speechSupported && (
              <Button
                type="button"
                variant={isListening ? "default" : "outline"}
                size="icon"
                onClick={toggleListening}
                className={cn("absolute right-2 top-2", isListening && "bg-destructive hover:bg-destructive/90")}
              >
                {isListening ? <Stop weight="fill" className="h-5 w-5" /> : <Microphone weight="duotone" className="h-5 w-5" />}
              </Button>
            )}
          </div>
          
          {isListening && (
            <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-xs font-medium text-accent">Recording...</span>
              </div>
              <AudioWaveform audioLevel={audioLevel} isActive={isListening} />
            </div>
          )}

          {speechSupported && !isListening && (
            <div className="mt-2 flex items-center gap-2">
              <Globe weight="duotone" className="h-4 w-4 text-muted-foreground" />
              <Select value={speechLanguage || 'en-US'} onValueChange={setSpeechLanguage}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEECH_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-xs">
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            {transcript.length < 40 ? `${40 - transcript.length} more characters needed` : `${transcript.length} characters`}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
          {manualLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {manualLocations.map((loc) => (
                <Badge key={loc} variant="secondary" className="gap-1 py-1 px-2">
                  <MapPin weight="duotone" className="w-3 h-3" />
                  {loc}
                  <button onClick={() => setManualLocations(prev => prev.filter(l => l !== loc))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={locationInputRef}
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onFocus={() => locationResults.length > 0 && setShowLocationDropdown(true)}
                placeholder="Search locations..."
                className="pl-10"
              />
              <AnimatePresence>
                {showLocationDropdown && locationResults.length > 0 && (
                  <motion.div
                    ref={locationDropdownRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="max-h-[200px] overflow-y-auto">
                      {locationResults.map((result, idx) => (
                        <button
                          key={`${result.displayName}-${idx}`}
                          onClick={() => handleSelectLocation(result)}
                          className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-accent/10 text-sm"
                        >
                          {GEOCODING_TYPE_ICONS[result.type]}
                          <span className="truncate">{result.displayName}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button onClick={handleGetCurrentLocation} disabled={isGettingLocation} size="icon" variant="outline">
              {isGettingLocation ? <CircleNotch className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Story Language</label>
            <div className="flex items-center gap-2">
              <Translate weight="duotone" className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={storyLanguage || 'en'} onValueChange={setStoryLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORY_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Story Tone</label>
            <div className="flex items-center gap-2">
              <PenNib weight="duotone" className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={storyTone || 'natural'} onValueChange={(v) => setStoryTone(v as StoryTone)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORY_TONES.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.flag} {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {storyTone === 'custom' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Style</label>
            <Textarea
              value={customTonePrompt || ''}
              onChange={(e) => setCustomTonePrompt(e.target.value)}
              placeholder="Describe your writing style..."
              className="min-h-[80px] resize-none"
            />
          </div>
        )}

        <div className="pt-4 border-t border-border/30">
          <Button
            onClick={handleGenerate}
            disabled={transcript.trim().length < 40 || isGenerating}
            variant={hasGenerated ? "outline" : "default"}
            className="w-full"
          >
            {isGenerating ? (
              <><CircleNotch className="mr-2 w-4 h-4 animate-spin" /> Generating...</>
            ) : hasGenerated ? (
              <><ArrowsClockwise className="mr-2 w-4 h-4" /> Regenerate Story</>
            ) : (
              <><Sparkle className="mr-2 w-4 h-4" weight="fill" /> Generate Story</>
            )}
          </Button>
        </div>

        {hasGenerated && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Highlights</label>
                <Button variant="ghost" size="sm" onClick={handleAddHighlight} className="h-7 text-xs">
                  <Plus className="mr-1 w-3 h-3" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {highlights.map((highlight, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => handleUpdateHighlight(idx, e.target.value)}
                      placeholder="A memorable moment..."
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveHighlight(idx)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Generated Story</label>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Chapter</label>
          <Select value={chapterId || 'none'} onValueChange={(v) => setChapterId(v === 'none' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No chapter</SelectItem>
              {chapters.filter(c => !c.is_archived).map(ch => (
                <SelectItem key={ch.id} value={ch.id}>
                  {getIconEmoji(ch.icon)} {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isNewEntry && onDelete && (
          <div className="pt-6 border-t border-border/30">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(true)} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash className="mr-2 w-4 h-4" />
              Delete Entry
            </Button>
          </div>
        )}
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { onDelete?.(); setIsDeleteDialogOpen(false); }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
