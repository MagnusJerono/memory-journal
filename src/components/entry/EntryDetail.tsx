import { useState, useRef, useEffect, useCallback } from 'react';
import { Entry, Photo, StoryTone, STORY_TONES, LocationSuggestion } from '@/lib/types';
import { formatDate, getEntryTitle, generateAIContent, QuestionAnswer } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, Lock, LockOpen, Sparkle, Trash, Plus, X, 
  Spinner, Warning, Calendar as CalendarIcon, PenNib, Microphone, Stop, UploadSimple,
  Eye, PencilSimple, Star
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { useKV } from '@github/spark/hooks';
import { BrandHeaderCompact } from '@/components/BrandHeader';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from './AudioWaveform';
import { RefinementPanel } from './RefinementPanel';
import { LocationPanel } from './LocationPanel';
import { EntryReadView } from './EntryReadView';
import { cn } from '@/lib/utils';

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

interface EntryDetailProps {
  entry: Entry;
  onSave: (entry: Entry) => void;
  onDelete: () => void;
  onBack: () => void;
}

export function EntryDetail({ entry, onSave, onDelete, onBack }: EntryDetailProps) {
  const [localEntry, setLocalEntry] = useState<Entry>(entry);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [storyTone, setStoryTone] = useKV<StoryTone>('ziel-story-tone', 'natural');
  const [speechLanguage, setSpeechLanguage] = useKV<string>('ziel-speech-language', 'en-US');
  const [isDragging, setIsDragging] = useState(false);
  const [confirmedLocations, setConfirmedLocations] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'read'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      toast.error('Speech recognition error', { description: speechError });
    }
  }, [speechError]);

  useEffect(() => {
    if (speechTranscript) {
      updateEntry({ 
        transcript: (localEntry.transcript || '') + 
          ((localEntry.transcript && !localEntry.transcript.endsWith(' ')) ? ' ' : '') + 
          speechTranscript 
      });
      resetSpeechTranscript();
    }
  }, [speechTranscript]);

  useEffect(() => {
    if (textareaRef.current && isListening) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [localEntry.transcript, interimTranscript, isListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const updateEntry = (updates: Partial<Entry>) => {
    const updated = { ...localEntry, ...updates, updated_at: new Date().toISOString() };
    setLocalEntry(updated);
    onSave(updated);
  };

  const toggleLock = () => {
    updateEntry({ is_locked: !localEntry.is_locked });
    toast.success(localEntry.is_locked ? 'Entry unlocked' : 'Entry locked');
  };

  const toggleStar = () => {
    updateEntry({ is_starred: !localEntry.is_starred });
    toast.success(localEntry.is_starred ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleRegenerate = async (refinementAnswers?: QuestionAnswer[]) => {
    if (localEntry.is_locked) {
      toast.error('Entry is locked', {
        description: 'Unlock to regenerate the story.'
      });
      return;
    }

    if (!localEntry.transcript || localEntry.transcript.length < 40) {
      toast.error('Transcript too short', {
        description: 'Add more details before regenerating.'
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const aiResult = await generateAIContent(
        localEntry, 
        storyTone || 'natural',
        undefined,
        undefined,
        refinementAnswers
      );
      updateEntry({
        title_ai: aiResult.title,
        highlights_ai: aiResult.highlights,
        story_ai: aiResult.story,
        tags_ai: aiResult.tags,
        location_suggestions: aiResult.location_suggestions,
        missing_info_questions: aiResult.missing_info_questions,
        uncertain_claims: aiResult.uncertain_claims
      });
      toast.success(refinementAnswers ? 'Story improved with your answers' : 'Story regenerated');
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRefinementSubmit = (answers: QuestionAnswer[]) => {
    handleRegenerate(answers);
  };

  const handleAddManualLocation = (location: string) => {
    const currentLocations = localEntry.manual_locations || [];
    if (!currentLocations.includes(location)) {
      updateEntry({ manual_locations: [...currentLocations, location] });
      toast.success(`Added "${location}" to your locations`);
    }
  };

  const handleRemoveManualLocation = (location: string) => {
    const currentLocations = localEntry.manual_locations || [];
    updateEntry({ manual_locations: currentLocations.filter(l => l !== location) });
    setConfirmedLocations(prev => prev.filter(l => l !== location));
  };

  const handleConfirmSuggestion = (suggestion: LocationSuggestion) => {
    if (!confirmedLocations.includes(suggestion.name)) {
      setConfirmedLocations(prev => [...prev, suggestion.name]);
      const currentLocations = localEntry.manual_locations || [];
      if (!currentLocations.includes(suggestion.name)) {
        updateEntry({ manual_locations: [...currentLocations, suggestion.name] });
      }
      toast.success(`Confirmed "${suggestion.name}"`);
    }
  };

  const handleDismissSuggestion = (_suggestionName: string) => {
  };

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    const highlights = [...(localEntry.highlights_ai || []), newHighlight.trim()];
    updateEntry({ highlights_ai: highlights });
    setNewHighlight('');
  };

  const removeHighlight = (index: number) => {
    const highlights = (localEntry.highlights_ai || []).filter((_, i) => i !== index);
    updateEntry({ highlights_ai: highlights });
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
    const maxPhotos = 10 - localEntry.photos.length;
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
          entry_id: localEntry.id,
          storage_url: url,
          created_at: new Date().toISOString()
        });
        if (newPhotos.length === filesToProcess.length) {
          updateEntry({ photos: [...localEntry.photos, ...newPhotos] });
          toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [localEntry.photos, localEntry.id]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localEntry.photos.length < 10 && !localEntry.is_locked) {
      setIsDragging(true);
    }
  }, [localEntry.photos.length, localEntry.is_locked]);

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
    
    if (localEntry.is_locked) {
      toast.error('Entry is locked', { description: 'Unlock to add photos.' });
      return;
    }

    if (localEntry.photos.length >= 10) {
      toast.error('Maximum photos reached', { description: 'You can add up to 10 photos.' });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    processImageFiles(files);
  }, [localEntry.photos.length, localEntry.is_locked, processImageFiles]);

  const removePhoto = (id: string) => {
    updateEntry({ photos: localEntry.photos.filter(p => p.id !== id) });
  };

  const title = getEntryTitle(localEntry);
  const tags = localEntry.tags_ai;
  const hasGeneratedContent = !!(localEntry.story_ai || localEntry.highlights_ai?.length);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-card/70 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-secondary/50">
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <BrandHeaderCompact />
          </div>
          <div className="flex items-center gap-4">
            {hasGeneratedContent && (
              <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
                <Button
                  variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all",
                    viewMode === 'edit' ? 'shadow-sm' : 'hover:bg-transparent'
                  )}
                >
                  <PencilSimple weight="duotone" className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'read' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('read')}
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all",
                    viewMode === 'read' ? 'shadow-sm' : 'hover:bg-transparent'
                  )}
                >
                  <Eye weight="duotone" className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleStar}
                className="h-8 w-8"
                aria-label={localEntry.is_starred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star 
                  weight={localEntry.is_starred ? 'fill' : 'regular'} 
                  className={`w-5 h-5 transition-colors ${localEntry.is_starred ? 'text-amber-500' : 'text-muted-foreground'}`}
                />
              </Button>
              {localEntry.is_locked ? (
                <Lock className="text-accent" weight="fill" />
              ) : (
                <LockOpen className="text-muted-foreground" />
              )}
              <Switch
                checked={localEntry.is_locked}
                onCheckedChange={toggleLock}
              />
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'read' && hasGeneratedContent ? (
        <main className="max-w-3xl mx-auto px-4 py-8">
          <EntryReadView entry={localEntry} />
        </main>
      ) : (
        <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <CalendarIcon weight="duotone" />
          {formatDate(localEntry.date)}
        </div>

        {localEntry.photos.length > 0 && (
          <div className="mb-8">
            <PhotoGallery 
              photos={localEntry.photos} 
              onRemove={removePhoto}
              canEdit={!localEntry.is_locked}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {!localEntry.is_locked && (
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "mb-6 transition-all duration-200 rounded-xl",
              isDragging && "ring-2 ring-accent ring-offset-2"
            )}
          >
            {localEntry.photos.length < 10 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                  isDragging 
                    ? "border-accent bg-accent/10" 
                    : "border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full transition-colors",
                    isDragging ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                  )}>
                    <UploadSimple weight="duotone" className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-medium text-sm",
                      isDragging ? "text-accent" : "text-foreground"
                    )}>
                      {isDragging ? "Drop photos here" : "Add photos"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse ({localEntry.photos.length}/10)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Title
            </label>
            <Input
              id="detail-title"
              value={localEntry.title_user || localEntry.title_ai || ''}
              onChange={(e) => updateEntry({ title_user: e.target.value || null })}
              placeholder="Give this memory a title..."
              className="text-2xl font-serif font-medium border-0 px-0 focus-visible:ring-0"
              disabled={localEntry.is_locked}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your notes
              </label>
              {speechSupported && !localEntry.is_locked && (
                <div className="flex items-center gap-2">
                  {!isListening && (
                    <Select 
                      value={speechLanguage || 'en-US'} 
                      onValueChange={(value) => setSpeechLanguage(value)}
                    >
                      <SelectTrigger className="h-7 text-xs w-[130px]">
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
                  )}
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    size="sm"
                    onClick={toggleListening}
                    className={cn(
                      "h-7 text-xs transition-all gap-1.5",
                      isListening && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    )}
                  >
                    {isListening ? (
                      <>
                        <Stop weight="fill" className="h-3.5 w-3.5" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Microphone weight="duotone" className="h-3.5 w-3.5" />
                        Add by voice
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="detail-transcript"
                value={(localEntry.transcript || '') + (isListening && interimTranscript ? ((localEntry.transcript && !localEntry.transcript.endsWith(' ')) ? ' ' : '') + interimTranscript : '')}
                onChange={(e) => {
                  if (!isListening) {
                    updateEntry({ transcript: e.target.value || null });
                  }
                }}
                readOnly={isListening}
                placeholder="What happened?"
                className={cn(
                  "min-h-[120px] border-0 px-0 focus-visible:ring-0 resize-none",
                  isListening && "bg-accent/5 border border-accent/20 px-3 rounded-lg"
                )}
                disabled={localEntry.is_locked}
              />
            </div>
            
            {isListening && (
              <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-accent">Recording — speak to add more details</span>
                </div>
                <AudioWaveform audioLevel={audioLevel} isActive={isListening} />
              </div>
            )}
          </div>

          {localEntry.highlights_ai && localEntry.highlights_ai.length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                Highlights
              </label>
              <HighlightsList 
                highlights={localEntry.highlights_ai}
                onUpdateHighlight={(index, value) => {
                  const highlights = [...(localEntry.highlights_ai || [])];
                  highlights[index] = value;
                  updateEntry({ highlights_ai: highlights });
                }}
                onRemoveHighlight={removeHighlight}
                isLocked={localEntry.is_locked}
              />
              {!localEntry.is_locked && (
                <div className="flex gap-2 mt-3">
                  <Input
                    id="new-highlight"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Add a highlight..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addHighlight()}
                  />
                  <Button variant="outline" size="icon" onClick={addHighlight}>
                    <Plus />
                  </Button>
                </div>
              )}
            </div>
          )}

          {localEntry.story_ai && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                The Story
              </label>
              <Textarea
                id="detail-story"
                value={localEntry.story_ai}
                onChange={(e) => updateEntry({ story_ai: e.target.value })}
                className="min-h-[200px] border-0 px-0 focus-visible:ring-0 resize-none leading-relaxed"
                disabled={localEntry.is_locked}
              />
            </div>
          )}

          {tags && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.people.map(tag => (
                  <Badge key={tag} variant="secondary">👤 {tag}</Badge>
                ))}
                {tags.places.map(tag => (
                  <Badge key={tag} variant="secondary">📍 {tag}</Badge>
                ))}
                {tags.moods.map(tag => (
                  <Badge key={tag} variant="secondary">💭 {tag}</Badge>
                ))}
                {tags.themes.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <LocationPanel
            suggestions={localEntry.location_suggestions}
            manualLocations={localEntry.manual_locations}
            confirmedLocations={confirmedLocations}
            onAddManualLocation={handleAddManualLocation}
            onRemoveManualLocation={handleRemoveManualLocation}
            onConfirmSuggestion={handleConfirmSuggestion}
            onDismissSuggestion={handleDismissSuggestion}
            isLocked={localEntry.is_locked}
          />

          {hasGeneratedContent && !localEntry.is_locked && (
            <RefinementPanel
              questions={localEntry.missing_info_questions || []}
              speechLanguage={speechLanguage || 'en-US'}
              onSpeechLanguageChange={(lang) => setSpeechLanguage(lang)}
              onSubmitAnswers={handleRefinementSubmit}
              isRegenerating={isRegenerating}
              isLocked={localEntry.is_locked}
              transcript={localEntry.transcript}
            />
          )}

          {localEntry.uncertain_claims && localEntry.uncertain_claims.length > 0 && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Warning className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-2">Things I'm not sure about</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {localEntry.uncertain_claims.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      )}

      {viewMode === 'edit' && (
        <footer className="fixed bottom-0 left-0 right-0 bg-card/70 backdrop-blur-2xl border-t border-border/30">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash className="mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete "{title}" and all its photos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex items-center gap-2">
              {!localEntry.is_locked && (
                <Select 
                  value={storyTone || 'natural'} 
                  onValueChange={(value) => setStoryTone(value as StoryTone)}
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <PenNib weight="duotone" className="h-4 w-4 mr-1" />
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_TONES.map((tone) => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <span className="flex items-center gap-2">
                          <span>{tone.flag}</span>
                          <span>{tone.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={() => handleRegenerate()}
                disabled={localEntry.is_locked || isRegenerating}
                variant={localEntry.is_locked ? "outline" : "default"}
              >
                {isRegenerating ? (
                  <>
                    <Spinner className="mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkle className="mr-2" weight="fill" />
                    {localEntry.is_locked ? 'Unlock to regenerate' : 'Regenerate'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function PhotoGallery({ 
  photos, 
  onRemove, 
  canEdit 
}: { 
  photos: Photo[]; 
  onRemove: (id: string) => void;
  canEdit: boolean;
}) {
  if (photos.length === 1) {
    return (
      <div className="relative group rounded-xl overflow-hidden">
        <img 
          src={photos[0].storage_url} 
          alt="" 
          className="w-full max-h-[500px] object-cover"
        />
        {canEdit && (
          <button
            onClick={() => onRemove(photos[0].id)}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
        {photos.map(photo => (
          <div key={photo.id} className="relative group aspect-[4/3]">
            <img 
              src={photo.storage_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
            {canEdit && (
              <button
                onClick={() => onRemove(photo.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
      {photos.map((photo, index) => (
        <div 
          key={photo.id} 
          className={`relative group ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
        >
          <img 
            src={photo.storage_url} 
            alt="" 
            className={`w-full h-full object-cover ${index === 0 ? 'aspect-square' : 'aspect-square'}`}
          />
          {canEdit && (
            <button
              onClick={() => onRemove(photo.id)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function HighlightsList({
  highlights,
  onUpdateHighlight,
  onRemoveHighlight,
  isLocked
}: {
  highlights: string[];
  onUpdateHighlight: (index: number, value: string) => void;
  onRemoveHighlight: (index: number) => void;
  isLocked: boolean;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (index: number, currentValue: string) => {
    if (isLocked) return;
    setEditingIndex(index);
    setEditValue(currentValue);
  };

  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      onUpdateHighlight(editingIndex, editValue.trim());
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <ul className="space-y-2">
      {highlights.map((highlight, index) => (
        <li key={index} className="flex items-start gap-2 group">
          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0" />
          {editingIndex === index ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={saveEdit}
                className="flex-1 h-8 text-sm"
                maxLength={140}
              />
            </div>
          ) : (
            <>
              <span 
                onClick={() => startEditing(index, highlight)}
                className={cn(
                  "flex-1 text-foreground",
                  !isLocked && "cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
                )}
                title={isLocked ? undefined : "Click to edit"}
              >
                {highlight}
              </span>
              {!isLocked && (
                <button
                  onClick={() => onRemoveHighlight(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
