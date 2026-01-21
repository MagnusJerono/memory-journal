import { useState, useRef } from 'react';
import { Entry, Photo, StoryTone, STORY_TONES } from '@/lib/types';
import { formatDate, getEntryTitle, generateAIContent } from '@/lib/entries';
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
  Spinner, Warning, Images, Calendar as CalendarIcon, PenNib 
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { useKV } from '@github/spark/hooks';
import { BrandHeaderCompact } from '@/components/BrandHeader';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateEntry = (updates: Partial<Entry>) => {
    const updated = { ...localEntry, ...updates, updated_at: new Date().toISOString() };
    setLocalEntry(updated);
    onSave(updated);
  };

  const toggleLock = () => {
    updateEntry({ is_locked: !localEntry.is_locked });
    toast.success(localEntry.is_locked ? 'Entry unlocked' : 'Entry locked');
  };

  const handleRegenerate = async () => {
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
      const aiResult = await generateAIContent(localEntry, storyTone || 'natural');
      updateEntry({
        title_ai: aiResult.title,
        highlights_ai: aiResult.highlights,
        story_ai: aiResult.story,
        tags_ai: aiResult.tags,
        missing_info_questions: aiResult.missing_info_questions,
        uncertain_claims: aiResult.uncertain_claims
      });
      toast.success('Story regenerated');
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
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

    const newPhotos: Photo[] = [];
    const maxPhotos = 10 - localEntry.photos.length;

    Array.from(files).slice(0, maxPhotos).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        newPhotos.push({
          id: uuid(),
          entry_id: localEntry.id,
          storage_url: url,
          created_at: new Date().toISOString()
        });
        if (newPhotos.length === Math.min(files.length, maxPhotos)) {
          updateEntry({ photos: [...localEntry.photos, ...newPhotos] });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    updateEntry({ photos: localEntry.photos.filter(p => p.id !== id) });
  };

  const title = getEntryTitle(localEntry);
  const tags = localEntry.tags_ai;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2" />
              Back
            </Button>
            <BrandHeaderCompact />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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

        {localEntry.photos.length < 10 && !localEntry.is_locked && (
          <Button
            variant="outline"
            size="sm"
            className="mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Images className="mr-2" weight="duotone" />
            Add photos
          </Button>
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
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
              Your notes
            </label>
            <Textarea
              id="detail-transcript"
              value={localEntry.transcript || ''}
              onChange={(e) => updateEntry({ transcript: e.target.value || null })}
              placeholder="What happened?"
              className="min-h-[120px] border-0 px-0 focus-visible:ring-0 resize-none"
              disabled={localEntry.is_locked}
            />
          </div>

          {localEntry.highlights_ai && localEntry.highlights_ai.length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3 block">
                Highlights
              </label>
              <ul className="space-y-2">
                {localEntry.highlights_ai.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="flex-1 text-foreground">{highlight}</span>
                    {!localEntry.is_locked && (
                      <button
                        onClick={() => removeHighlight(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
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

          {localEntry.missing_info_questions && localEntry.missing_info_questions.length > 0 && (
            <Card className="p-4 bg-accent/10 border-accent/20">
              <div className="flex items-start gap-3">
                <Warning className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" weight="fill" />
                <div>
                  <h4 className="font-medium text-sm mb-2">Quick questions to make this story better</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {localEntry.missing_info_questions.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
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

      <footer className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border shadow-lg">
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
              onClick={handleRegenerate}
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
