import { useState, useRef, useEffect, useCallback } from 'react';
import { Entry, Photo, StoryTone, STORY_TONES, STORY_LANGUAGES } from '@/lib/types';
import { createEmptyEntry, generateAIContent, formatDate } from '@/lib/entries';
import { searchLocations, getCurrentLocation, GeocodingResult } from '@/lib/geocoding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarBlank, Sparkle, X, Spinner, Microphone, Stop, Globe, PenNib, Translate, UploadSimple, MapPin, MagnifyingGlass, Crosshair, Buildings, Flag, MapTrifold, Storefront, GlobeHemisphereWest, House } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from './AudioWaveform';
import { useKV } from '@github/spark/hooks';
import { BrandHeaderCompact } from '@/components/BrandHeader';
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

interface NewEntryProps {
  onSave: (entry: Entry) => void;
  onBack: () => void;
}

export function NewEntry({ onSave, onBack }: NewEntryProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [manualLocations, setManualLocations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useKV<string>('ziel-speech-language', 'en-US');
  const [storyTone, setStoryTone] = useKV<StoryTone>('ziel-story-tone', 'natural');
  const [storyLanguage, setStoryLanguage] = useKV<string>('ziel-story-language', 'en');
  const [customTonePrompt, setCustomTonePrompt] = useKV<string>('ziel-custom-tone', '');
  const [isDragging, setIsDragging] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<GeocodingResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (speechError) {
      toast.error('Speech recognition error', {
        description: speechError
      });
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

  useEffect(() => {
    if (textareaRef.current && isListening) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript, isListening]);

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
    } catch (error) {
      console.error('Location search failed:', error);
      setLocationResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (locationSearchTimeoutRef.current) {
      clearTimeout(locationSearchTimeoutRef.current);
    }

    if (locationQuery.trim().length >= 2) {
      locationSearchTimeoutRef.current = setTimeout(() => {
        handleLocationSearch(locationQuery);
      }, 300);
    } else {
      setLocationResults([]);
      setShowLocationDropdown(false);
    }

    return () => {
      if (locationSearchTimeoutRef.current) {
        clearTimeout(locationSearchTimeoutRef.current);
      }
    };
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
      toast.success(`Added "${result.name}"`);
    }
    setLocationQuery('');
    setLocationResults([]);
    setShowLocationDropdown(false);
  };

  const handleAddLocation = () => {
    if (locationQuery.trim() && !manualLocations.includes(locationQuery.trim())) {
      setManualLocations(prev => [...prev, locationQuery.trim()]);
      setLocationQuery('');
      setLocationResults([]);
      setShowLocationDropdown(false);
    }
  };

  const handleRemoveLocation = (location: string) => {
    setManualLocations(prev => prev.filter(l => l !== location));
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (locationResults.length > 0) {
        handleSelectLocation(locationResults[0]);
      } else {
        handleAddLocation();
      }
    }
    if (e.key === 'Escape') {
      setShowLocationDropdown(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location && !manualLocations.includes(location.displayName)) {
        setManualLocations(prev => [...prev, location.displayName]);
        toast.success(`Added your current location: ${location.name}`);
      } else if (location) {
        toast.info('Location already added');
      } else {
        toast.error('Could not determine location', {
          description: 'Please check your browser permissions'
        });
      }
    } catch {
      toast.error('Location access denied', {
        description: 'Enable location access in your browser settings'
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processImageFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImageFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('No valid images', { description: 'Please drop image files only.' });
      return;
    }

    const newPhotos: Photo[] = [];
    const maxPhotos = 10 - photos.length;
    const filesToProcess = imageFiles.slice(0, maxPhotos);

    if (filesToProcess.length < imageFiles.length) {
      toast.info(`Only ${maxPhotos} more photos allowed`, { description: 'Max 10 photos per memory.' });
    }

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
          toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [photos.length]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (photos.length < 10) {
      setIsDragging(true);
    }
  }, [photos.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (photos.length >= 10) {
      toast.error('Maximum photos reached', { description: 'You can add up to 10 photos.' });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  }, [photos.length, processImageFiles]);

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerate = async () => {
    if (!transcript || transcript.trim().length < 40) {
      toast.error('Please add more to your transcript', {
        description: 'At least a few sentences help create a better story.'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const entry = createEmptyEntry(formatDateISO(date));
      entry.title_user = title.trim() || null;
      entry.transcript = transcript.trim();
      entry.photos = photos.map(p => ({ ...p, entry_id: entry.id }));
      entry.manual_locations = manualLocations.length > 0 ? manualLocations : null;

      const currentTone = storyTone || 'natural';
      const aiResult = await generateAIContent(
        entry, 
        currentTone,
        currentTone === 'custom' ? (customTonePrompt || undefined) : undefined,
        storyLanguage || 'en'
      );

      entry.title_ai = aiResult.title;
      entry.highlights_ai = aiResult.highlights;
      entry.story_ai = aiResult.story;
      entry.tags_ai = aiResult.tags;
      entry.location_suggestions = aiResult.location_suggestions;
      entry.missing_info_questions = aiResult.missing_info_questions;
      entry.uncertain_claims = aiResult.uncertain_claims;

      onSave(entry);
      toast.success('Memory created', {
        description: 'Your story has been generated.'
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate story', {
        description: 'Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = transcript.trim().length >= 40;
  const displayedTranscript = transcript + (isListening && interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-card/70 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-secondary/50">
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <BrandHeaderCompact />
          </div>
          <span className="text-sm font-semibold text-muted-foreground tracking-wide">New Memory</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              When was this?
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarBlank className="mr-2" weight="duotone" />
                  {formatDate(formatDateISO(date))}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) setDate(d);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Title (optional)
            </label>
            <Input
              id="entry-title"
              placeholder="Give this memory a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-serif"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              What happened?
            </label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="entry-transcript"
                placeholder="What happened? Where were you, with whom, and what made it memorable?"
                value={displayedTranscript}
                onChange={(e) => {
                  if (!isListening) {
                    setTranscript(e.target.value);
                  }
                }}
                readOnly={isListening}
                className={cn(
                  "min-h-[200px] text-base leading-relaxed resize-none pr-14",
                  isListening && "bg-accent/10 border-accent"
                )}
              />
              {speechSupported && (
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  className={cn(
                    "absolute right-2 top-2 transition-all",
                    isListening && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  )}
                >
                  {isListening ? (
                    <Stop weight="fill" className="h-5 w-5" />
                  ) : (
                    <Microphone weight="duotone" className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
            
            {isListening && (
              <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-accent">Recording...</span>
                </div>
                <AudioWaveform audioLevel={audioLevel} isActive={isListening} />
              </div>
            )}

            {speechSupported && !isListening && (
              <div className="mt-3 flex items-center gap-2">
                <Globe weight="duotone" className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={speechLanguage || 'en-US'} 
                  onValueChange={(value) => setSpeechLanguage(value)}
                >
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEECH_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-xs">
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">for voice input</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {transcript.length < 40 
                  ? `${40 - transcript.length} more characters needed`
                  : `${transcript.length} characters`
                }
              </p>
            </div>
          </div>

          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "transition-all duration-200 rounded-xl",
              isDragging && "ring-2 ring-accent ring-offset-2 bg-accent/5"
            )}
          >
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Photos ({photos.length}/10)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square group rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={photo.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 10 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  isDragging 
                    ? "border-accent bg-accent/10" 
                    : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-full transition-colors",
                    isDragging ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  )}>
                    <UploadSimple weight="duotone" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      isDragging ? "text-accent" : "text-foreground"
                    )}>
                      {isDragging ? "Drop photos here" : "Drag & drop photos"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Location (optional)
            </label>
            
            {manualLocations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {manualLocations.map((loc) => (
                  <Badge 
                    key={loc} 
                    variant="secondary" 
                    className="gap-1.5 py-1.5 px-3"
                  >
                    <MapPin weight="duotone" className="w-3.5 h-3.5" />
                    {loc}
                    <button
                      onClick={() => handleRemoveLocation(loc)}
                      className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isSearchingLocation ? (
                    <Spinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <MagnifyingGlass className="w-4 h-4" />
                  )}
                </div>
                <Input
                  ref={locationInputRef}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={handleLocationKeyDown}
                  onFocus={() => {
                    if (locationResults.length > 0) setShowLocationDropdown(true);
                  }}
                  placeholder="Search cities, landmarks, places..."
                  className="pl-10 pr-3"
                />
                
                <AnimatePresence>
                  {showLocationDropdown && locationResults.length > 0 && (
                    <motion.div
                      ref={locationDropdownRef}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="max-h-[280px] overflow-y-auto">
                        {locationResults.map((result, idx) => (
                          <button
                            key={`${result.displayName}-${idx}`}
                            onClick={() => handleSelectLocation(result)}
                            className={cn(
                              "w-full px-3 py-2.5 flex items-start gap-3 text-left transition-colors",
                              "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
                              idx > 0 && "border-t border-border/50"
                            )}
                          >
                            <div className="p-1.5 rounded-md bg-muted text-muted-foreground shrink-0 mt-0.5">
                              {GEOCODING_TYPE_ICONS[result.type]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{result.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.displayName}
                              </p>
                            </div>
                            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0 h-5 capitalize">
                              {result.type}
                            </Badge>
                          </button>
                        ))}
                      </div>
                      <div className="px-3 py-2 bg-muted/50 border-t border-border">
                        <p className="text-[10px] text-muted-foreground">
                          Powered by OpenStreetMap
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                size="icon"
                variant="outline"
                title="Use current location"
              >
                {isGettingLocation ? (
                  <Spinner className="w-5 h-5 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Add locations to help the AI write a more specific story
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Story Language
              </label>
              <div className="flex items-center gap-2">
                <Translate weight="duotone" className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={storyLanguage || 'en'} 
                  onValueChange={(value) => setStoryLanguage(value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                Story Tone
              </label>
              <div className="flex items-center gap-2">
                <PenNib weight="duotone" className="h-4 w-4 text-muted-foreground" />
                <Select 
                  value={storyTone || 'natural'} 
                  onValueChange={(value) => setStoryTone(value as StoryTone)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_TONES.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <span className="flex items-center gap-2">
                          <span>{tone.flag}</span>
                          <span className="font-medium">{tone.label}</span>
                          <span className="text-muted-foreground text-xs">— {tone.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {storyTone === 'custom' && (
              <div className="pl-6">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Describe your writing style
                </label>
                <Textarea
                  id="custom-tone-prompt"
                  placeholder="e.g., Write like a laid-back storyteller, use German idioms, or mimic Ernest Hemingway's style..."
                  value={customTonePrompt || ''}
                  onChange={(e) => setCustomTonePrompt(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about the voice, style, or characteristics you want.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button 
              className={cn(
                "w-full",
                canGenerate && "bg-accent hover:bg-accent/90 text-accent-foreground"
              )}
              disabled={!canGenerate || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 animate-spin" />
                  Generating your story...
                </>
              ) : (
                <>
                  <Sparkle className="mr-2" weight="fill" />
                  Generate Story
                </>
              )}
            </Button>
            {!canGenerate && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Add a bit more to your transcript to generate
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
