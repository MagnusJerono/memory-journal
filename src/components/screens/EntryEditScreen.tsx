import { useState, useRef, useEffect, useCallback } from 'react';
import { Entry, Photo, Chapter, StoryTone, STORY_TONES, STORY_LANGUAGES, DEFAULT_PROMPTS, CHAPTER_ICONS, CHAPTER_COLORS, ChapterIcon, AppView } from '@/lib/types';
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
  CircleNotch,
  Check,
  CaretDown,
  CaretUp,
  PencilSimple
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { cn, formatDuration } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from '@/components/entry/AudioWaveform';
import { useKV } from '@github/spark/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  onNavigate?: (view: AppView) => void;
  onSaveChapter?: (chapter: Chapter) => void;
}

export function EntryEditScreen({ 
  entry, 
  chapters, 
  promptId, 
  onSave, 
  onBack, 
  onDelete,
  onNavigate,
  onSaveChapter
}: EntryEditScreenProps) {
  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
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
  const [tags, setTags] = useState(entry?.tags_ai || { people: [], places: [], moods: [], themes: [] });
  const [missingInfoQuestions, setMissingInfoQuestions] = useState<string[]>(entry?.missing_info_questions || []);
  const [selectedHighlights, setSelectedHighlights] = useState<Set<number>>(
    new Set(entry?.highlights_ai?.map((_, idx) => idx) || [])
  );
  const [selectedTags, setSelectedTags] = useState({
    people: new Set<number>(entry?.tags_ai?.people?.map((_, idx) => idx) || []),
    places: new Set<number>(entry?.tags_ai?.places?.map((_, idx) => idx) || []),
    moods: new Set<number>(entry?.tags_ai?.moods?.map((_, idx) => idx) || []),
    themes: new Set<number>(entry?.tags_ai?.themes?.map((_, idx) => idx) || [])
  });
  const [newHighlight, setNewHighlight] = useState('');
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterIcon, setNewChapterIcon] = useState<ChapterIcon>('star');
  const [newChapterColor, setNewChapterColor] = useState('rose');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useKV<string>('tightly-speech-language', 'en-US');
  const [storyTone, setStoryTone] = useKV<StoryTone>('tightly-story-tone', 'natural');
  const [storyLanguage, setStoryLanguage] = useKV<string>('tightly-story-language', 'en');
  const [customTonePrompt, setCustomTonePrompt] = useKV<string>('tightly-custom-tone', '');
  const [personalVoiceSample] = useKV<string>('tightly-personal-voice-sample', '');
  const [isDragging, setIsDragging] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<GeocodingResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  
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
    audioLevel,
    recordingDuration
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

  // Auto-save draft every 30 seconds if content has changed
  useEffect(() => {
    // Skip auto-save for new entries with no content
    if (!transcript.trim() && !title.trim() && photos.length === 0) {
      return;
    }

    const autoSaveInterval = setInterval(() => {
      const entryId = entry?.id || uuid();
      const now = new Date().toISOString();
      
      const draftEntry: Entry = {
        id: entryId,
        date: formatDateISO(date),
        title_user: title.trim() || null,
        title_ai: entry?.title_ai || null,
        transcript: transcript.trim() || null,
        story_ai: story || null,
        highlights_ai: getSelectedHighlights().length > 0 ? getSelectedHighlights() : null,
        tags_ai: getSelectedTags(),
        location_suggestions: entry?.location_suggestions || null,
        manual_locations: manualLocations.length > 0 ? manualLocations : null,
        missing_info_questions: missingInfoQuestions.length > 0 ? missingInfoQuestions : null,
        uncertain_claims: entry?.uncertain_claims || null,
        is_locked: entry?.is_locked || false,
        is_starred: entry?.is_starred || false,
        is_draft: true, // Mark as draft for auto-save
        chapter_id: chapterId,
        photos: photos.map(p => ({ ...p, entry_id: entryId })),
        prompt_used: prompt?.text || entry?.prompt_used || null,
        created_at: entry?.created_at || now,
        updated_at: now
      };

      onSave(draftEntry);
      setLastAutoSaveTime(new Date());
      
      // Show "Saved ✓" indicator
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000);
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [transcript, title, photos, date, story, highlights, manualLocations, chapterId, entry, prompt, onSave]);

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

  // Helper functions to get selected items
  const getSelectedHighlights = (): string[] => {
    return highlights.filter((_, idx) => selectedHighlights.has(idx));
  };

  const getSelectedTags = () => {
    return {
      people: tags.people.filter((_, idx) => selectedTags.people.has(idx)),
      places: tags.places.filter((_, idx) => selectedTags.places.has(idx)),
      moods: tags.moods.filter((_, idx) => selectedTags.moods.has(idx)),
      themes: tags.themes.filter((_, idx) => selectedTags.themes.has(idx))
    };
  };

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
        storyLanguage || 'en',
        undefined,
        personalVoiceSample || undefined
      );

      setHighlights(aiResult.highlights);
      setStory(aiResult.story);
      setTags(aiResult.tags);
      setMissingInfoQuestions(aiResult.missing_info_questions || []);
      if (!title.trim()) setTitle(aiResult.title);
      
      // Initialize selected highlights and tags (all checked by default)
      setSelectedHighlights(new Set(aiResult.highlights.map((_, idx) => idx)));
      setSelectedTags({
        people: new Set(aiResult.tags.people.map((_, idx) => idx)),
        places: new Set(aiResult.tags.places.map((_, idx) => idx)),
        moods: new Set(aiResult.tags.moods.map((_, idx) => idx)),
        themes: new Set(aiResult.tags.themes.map((_, idx) => idx))
      });
      
      toast.success('Your memory came to life ✨');
    } catch {
      toast.error('Something went wrong — try again');
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
      highlights_ai: getSelectedHighlights().length > 0 ? getSelectedHighlights() : null,
      tags_ai: getSelectedTags(),
      location_suggestions: entry?.location_suggestions || null,
      manual_locations: manualLocations.length > 0 ? manualLocations : null,
      missing_info_questions: missingInfoQuestions.length > 0 ? missingInfoQuestions : null,
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

  const toggleHighlight = (index: number) => {
    setSelectedHighlights(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addCustomHighlight = () => {
    if (newHighlight.trim()) {
      const newIndex = highlights.length;
      setHighlights(prev => [...prev, newHighlight.trim()]);
      setSelectedHighlights(prev => new Set([...prev, newIndex]));
      setNewHighlight('');
    }
  };

  const toggleTag = (category: 'people' | 'places' | 'moods' | 'themes', index: number) => {
    setSelectedTags(prev => {
      const next = { ...prev };
      const categorySet = new Set(prev[category]);
      if (categorySet.has(index)) {
        categorySet.delete(index);
      } else {
        categorySet.add(index);
      }
      next[category] = categorySet;
      return next;
    });
  };

  const handleQuestionClick = (question: string) => {
    setTranscript(prev => prev + (prev ? '\n\n' : '') + question + '\n\n');
    // Remove the question from the list after it's been clicked
    setMissingInfoQuestions(prev => prev.filter(q => q !== question));
    textareaRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => textareaRef.current?.focus(), 300);
  };

  const handleCreateChapter = () => {
    if (!newChapterName.trim() || !onSaveChapter) return;
    
    const now = new Date().toISOString();
    const newChapter: Chapter = {
      id: uuid(),
      name: newChapterName.trim(),
      description: null,
      color: newChapterColor,
      icon: newChapterIcon,
      is_pinned: false,
      is_archived: false,
      order: chapters.length,
      created_at: now,
      updated_at: now
    };
    
    onSaveChapter(newChapter);
    setChapterId(newChapter.id);
    setIsCreatingChapter(false);
    setNewChapterName('');
    setNewChapterIcon('star');
    setNewChapterColor('rose');
    toast.success('Chapter created');
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
            {onNavigate && (
              <>
                <LogoHomeButton 
                  isDarkMode={isDarkMode} 
                  onClick={() => onNavigate({ type: 'home' })} 
                  size="sm"
                />
                <span className="text-border/50">|</span>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <CaretLeft className="w-5 h-5" weight="bold" />
            </Button>
            <h1 className="font-serif text-lg font-semibold text-foreground">
              {isNewEntry ? 'New Memory' : 'Edit Memory'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showSavedIndicator && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm text-muted-foreground flex items-center gap-1"
                >
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>Saved</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button 
              onClick={handleSave}
              disabled={!canSave}
              size="sm"
            >
              Save
            </Button>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">
              📷 {photos.length} of 10 photos
            </label>
            {photos.length < 10 && (
              <span className="text-xs text-muted-foreground">
                {10 - photos.length} remaining
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const fileCount = Array.from(e.target.files).length;
                processImageFiles(Array.from(e.target.files));
                if (fileCount > 0) {
                  toast.success(`Added ${fileCount} ${fileCount === 1 ? 'photo' : 'photos'} ✨`);
                }
              }
            }}
            className="hidden"
          />
          
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square group rounded-xl overflow-hidden"
                >
                  <img src={photo.storage_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex-1 border-2 border-dashed rounded-xl p-6 text-center transition-all",
                  isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                )}
              >
                <UploadSimple weight="duotone" className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragging ? "Drop photos here" : isMobile ? "Tap to select multiple photos" : "Drag & drop or click to add photos"}
                </p>
              </button>
            </div>
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
          
          <AnimatePresence>
            {isListening && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border-2 border-accent/30 shadow-lg relative overflow-hidden"
                style={{
                  boxShadow: '0 0 20px rgba(var(--color-accent-9), 0.15)',
                  animation: 'pulse-glow 2s ease-in-out infinite'
                }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 animate-pulse opacity-50" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-destructive rounded-full animate-pulse shadow-lg" 
                            style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }} />
                      <span className="text-sm font-semibold text-accent">Recording</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={toggleListening}
                      className="bg-destructive hover:bg-destructive/90 text-white shadow-lg h-9 px-4"
                      aria-label="Stop recording"
                    >
                      <Stop weight="fill" className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                  
                  <AudioWaveform 
                    audioLevel={audioLevel} 
                    isActive={isListening}
                    height={80}
                    isDarkMode={isDarkMode}
                    className="mb-3"
                  />
                  
                  {/* Show interim transcript in real-time */}
                  {interimTranscript && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-background/80 backdrop-blur-sm rounded-md border border-accent/20 mt-3"
                    >
                      <p className="text-xs text-muted-foreground mb-1">Live transcript:</p>
                      <p className="text-sm text-foreground/80 italic">{interimTranscript}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              <><CircleNotch className="mr-2 w-4 h-4 animate-spin" /> Weaving your memory...</>
            ) : hasGenerated ? (
              <><Sparkle className="mr-2 w-4 h-4" weight="fill" /> ✨ Try a fresh take</>
            ) : (
              <><Sparkle className="mr-2 w-4 h-4" weight="fill" /> ✨ Bring it to life</>
            )}
          </Button>
        </div>

        {hasGenerated && (
          <>
            {/* Story Section - Hero of post-generation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Your Story</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingStory(!isEditingStory)}
                  className="h-7 text-xs"
                >
                  <PencilSimple className="mr-1 w-3 h-3" /> 
                  {isEditingStory ? 'Done' : 'Edit'}
                </Button>
              </div>
              
              {isEditingStory ? (
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="min-h-[200px] resize-none font-serif text-base leading-relaxed"
                />
              ) : (
                <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg p-6 shadow-sm">
                  <p className="font-serif text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {story}
                  </p>
                </div>
              )}
            </div>

            {/* Follow-up Questions Section */}
            {missingInfoQuestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💭</span>
                  <label className="text-xs font-medium text-muted-foreground">Want to add more detail?</label>
                </div>
                <div className="space-y-2">
                  {missingInfoQuestions.map((question, questionIdx) => (
                    <button
                      key={questionIdx}
                      onClick={() => handleQuestionClick(question)}
                      className="w-full text-left p-3 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg transition-colors"
                    >
                      <p className="text-sm text-foreground/80">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights Selection */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Highlights</label>
              <div className="space-y-2">
                {highlights.map((highlight, highlightIdx) => (
                  <label 
                    key={highlightIdx} 
                    className="flex items-start gap-3 p-3 bg-card/30 rounded-lg border border-border/30 cursor-pointer hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={selectedHighlights.has(highlightIdx)}
                        onChange={() => toggleHighlight(highlightIdx)}
                        className="w-4 h-4 rounded border-border/50 text-accent focus:ring-accent focus:ring-offset-0"
                      />
                    </div>
                    <span className={cn(
                      "text-sm flex-1 transition-colors",
                      selectedHighlights.has(highlightIdx) ? "text-foreground" : "text-muted-foreground line-through"
                    )}>
                      {highlight}
                    </span>
                  </label>
                ))}
                
                <div className="flex gap-2">
                  <Input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomHighlight()}
                    placeholder="Add a custom highlight..."
                    className="flex-1 text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={addCustomHighlight}
                    disabled={!newHighlight.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags Collapsible Section */}
            <div className="space-y-2">
              <button
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30 hover:bg-card/40 transition-colors"
              >
                <span className="text-xs font-medium text-muted-foreground">Tags & Details</span>
                {isTagsExpanded ? (
                  <CaretUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <CaretDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {isTagsExpanded && (
                <div className="space-y-4 pt-2">
                  {tags.people.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">People</label>
                      <div className="space-y-1.5">
                        {tags.people.map((person, personIdx) => (
                          <label key={personIdx} className="flex items-center gap-2 p-2 rounded hover:bg-card/30 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.people.has(personIdx)}
                              onChange={() => toggleTag('people', personIdx)}
                              className="w-3.5 h-3.5 rounded border-border/50 text-accent"
                            />
                            <span className={cn("text-sm", selectedTags.people.has(personIdx) ? "text-foreground" : "text-muted-foreground line-through")}>{person}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.places.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Places</label>
                      <div className="space-y-1.5">
                        {tags.places.map((place, placeIdx) => (
                          <label key={placeIdx} className="flex items-center gap-2 p-2 rounded hover:bg-card/30 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.places.has(placeIdx)}
                              onChange={() => toggleTag('places', placeIdx)}
                              className="w-3.5 h-3.5 rounded border-border/50 text-accent"
                            />
                            <span className={cn("text-sm", selectedTags.places.has(placeIdx) ? "text-foreground" : "text-muted-foreground line-through")}>{place}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.moods.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Moods</label>
                      <div className="space-y-1.5">
                        {tags.moods.map((mood, moodIdx) => (
                          <label key={moodIdx} className="flex items-center gap-2 p-2 rounded hover:bg-card/30 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.moods.has(moodIdx)}
                              onChange={() => toggleTag('moods', moodIdx)}
                              className="w-3.5 h-3.5 rounded border-border/50 text-accent"
                            />
                            <span className={cn("text-sm", selectedTags.moods.has(moodIdx) ? "text-foreground" : "text-muted-foreground line-through")}>{mood}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.themes.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Themes</label>
                      <div className="space-y-1.5">
                        {tags.themes.map((theme, themeIdx) => (
                          <label key={themeIdx} className="flex items-center gap-2 p-2 rounded hover:bg-card/30 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.themes.has(themeIdx)}
                              onChange={() => toggleTag('themes', themeIdx)}
                              className="w-3.5 h-3.5 rounded border-border/50 text-accent"
                            />
                            <span className={cn("text-sm", selectedTags.themes.has(themeIdx) ? "text-foreground" : "text-muted-foreground line-through")}>{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Chapter</label>
          <Select 
            value={chapterId || 'none'} 
            onValueChange={(v) => {
              if (v === 'new-chapter') {
                setIsCreatingChapter(true);
              } else {
                setChapterId(v === 'none' ? null : v);
                setIsCreatingChapter(false);
              }
            }}
          >
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
              <SelectItem value="new-chapter">
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chapter</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {isCreatingChapter && onSaveChapter && (
            <div className="mt-4 p-4 bg-card/30 rounded-lg border border-border/30 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Chapter Name</label>
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="e.g., College Days, Summer 2023..."
                  className="text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
                <Select value={newChapterIcon} onValueChange={(v) => setNewChapterIcon(v as ChapterIcon)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAPTER_ICONS.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.emoji} {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHAPTER_COLORS.map(col => (
                    <button
                      key={col.value}
                      onClick={() => setNewChapterColor(col.value)}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all text-xs font-medium",
                        newChapterColor === col.value 
                          ? "border-foreground/30 shadow-sm" 
                          : "border-transparent hover:border-foreground/10"
                      )}
                      style={{ backgroundColor: col.color }}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsCreatingChapter(false);
                    setNewChapterName('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCreateChapter}
                  disabled={!newChapterName.trim()}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          )}
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
