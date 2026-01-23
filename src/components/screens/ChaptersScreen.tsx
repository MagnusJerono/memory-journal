import { useState } from 'react';
import { Chapter, Entry, AppView, CHAPTER_ICONS, CHAPTER_COLORS, ChapterIcon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Books, CaretRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';

interface ChaptersScreenProps {
  chapters: Chapter[];
  entries: Entry[];
  onNavigate: (view: AppView) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  isDarkMode: boolean;
}

export function ChaptersScreen({
  chapters,
  entries,
  onNavigate,
  onSaveChapter,
  onDeleteChapter,
  isDarkMode
}: ChaptersScreenProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<ChapterIcon>('star');
  const [selectedColor, setSelectedColor] = useState('violet');

  const sortedChapters = [...chapters]
    .filter(c => !c.is_archived)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return a.order - b.order;
    });

  const getEntryCount = (chapterId: string) => 
    entries.filter(e => e.chapter_id === chapterId && !e.is_draft).length;

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedIcon('star');
    setSelectedColor('violet');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const colorObj = CHAPTER_COLORS.find(c => c.value === selectedColor);
    const chapter: Chapter = {
      id: uuid(),
      name: name.trim(),
      description: description.trim() || null,
      color: colorObj?.color || 'oklch(0.60 0.2 280)',
      icon: selectedIcon,
      is_pinned: false,
      is_archived: false,
      order: chapters.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSaveChapter(chapter);
    setIsDialogOpen(false);
    resetForm();
  };

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Chapters</h1>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-1.5" weight="bold" size={16} />
            New Chapter
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {sortedChapters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <Books weight="duotone" className="w-12 h-12 text-primary/60" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Organize your memories
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              Chapters help you group memories by theme — Travel, Family, Dreams, or anything meaningful to you.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} size="lg">
              <Plus className="mr-2" weight="bold" />
              Create First Chapter
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedChapters.map((chapter, index) => (
              <motion.button
                key={chapter.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate({ type: 'chapter-detail', chapterId: chapter.id })}
                className="w-full p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-border/50 hover:bg-card/90 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${chapter.color}20` }}
                  >
                    {getIconEmoji(chapter.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {chapter.name}
                      </h3>
                      {chapter.is_pinned && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getEntryCount(chapter.id)} {getEntryCount(chapter.id) === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                  <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Travel, Family, Work..."
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Description (optional)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this chapter about?"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {CHAPTER_ICONS.map((icon) => (
                  <button
                    key={icon.value}
                    onClick={() => setSelectedIcon(icon.value)}
                    className={`p-2.5 rounded-lg text-lg transition-all ${
                      selectedIcon === icon.value
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {CHAPTER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
