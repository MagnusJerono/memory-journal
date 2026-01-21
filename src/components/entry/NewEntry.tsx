import { useState, useRef } from 'react';
import { Entry, Photo } from '@/lib/types';
import { createEmptyEntry, generateAIContent, formatDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarBlank, Images, Sparkle, X, Spinner } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const aiResult = await generateAIContent(entry);

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
            <Textarea
              id="entry-transcript"
              placeholder="What happened? Where were you, with whom, and what made it memorable?"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] text-base leading-relaxed resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {transcript.length < 40 
                ? `${40 - transcript.length} more characters needed`
                : `${transcript.length} characters`
              }
            </p>
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
