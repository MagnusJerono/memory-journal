import { useState, useRef, useEffect } from 'react';
import { Entry, Photo, StoryTone, STORY_TONES, STORY_LANGUAGES } from '@/lib/types';
import { createEmptyEntry, generateAIContent, formatDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarBlank, Images, Sparkle, X, Spinner, Microphone, Stop, Globe, PenNib, Translate } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from './AudioWaveform';
import { useKV } from '@github/spark/hooks';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useKV<string>('ziel-speech-language', 'en-US');
  const [storyTone, setStoryTone] = useKV<StoryTone>('ziel-story-tone', 'natural');
  const [storyLanguage, setStoryLanguage] = useKV<string>('ziel-story-language', 'en');
  const [customTonePrompt, setCustomTonePrompt] = useKV<string>('ziel-custom-tone', '');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    const newPhotos: Photo[] = [];
    const maxPhotos = 10 - photos.length;

    Array.from(files).slice(0, maxPhotos).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        newPhotos.push({
          id: uuid(),
          entry_id: '',
          storage_url: url,
          created_at: new Date().toISOString()
        });
        if (newPhotos.length === Math.min(files.length, maxPhotos)) {
          setPhotos(prev => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-serif font-medium">New Memory</h1>
          <div className="w-20" />
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

          <div>
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
              <div className="grid grid-cols-4 gap-2 mb-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square group">
                    <img 
                      src={photo.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 10 && (
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Images className="mr-2" weight="duotone" />
                Add photos
              </Button>
            )}
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
