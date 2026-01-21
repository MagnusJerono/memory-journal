import { useState } from 'react';
import { Chapter, CHAPTER_ICONS, CHAPTER_COLORS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Pencil, Trash } from '@phosphor-icons/react';
import { v4 as uuid } from 'uuid';
import { motion } from 'framer-motion';

interface ChaptersPanelProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  entryCountByChapter: Record<string, number>;
}

export function ChaptersPanel({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onSaveChapter,
  onDeleteChapter,
  entryCountByChapter
}: ChaptersPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<Chapter['icon']>('star');
  const [selectedColor, setSelectedColor] = useState('violet');

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedIcon('star');
    setSelectedColor('violet');
    setEditingChapter(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const colorObj = CHAPTER_COLORS.find(c => c.value === selectedColor);
    const chapter: Chapter = {
      id: editingChapter?.id || uuid(),
      name: name.trim(),
      description: description.trim() || null,
      color: colorObj?.color || 'oklch(0.60 0.2 280)',
      icon: selectedIcon,
      created_at: editingChapter?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSaveChapter(chapter);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setName(chapter.name);
    setDescription(chapter.description || '');
    setSelectedIcon(chapter.icon);
    const colorMatch = CHAPTER_COLORS.find(c => c.color === chapter.color);
    setSelectedColor(colorMatch?.value || 'violet');
    setIsDialogOpen(true);
  };

  const getIconEmoji = (icon: Chapter['icon']) => {
    return CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelectChapter(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !selectedChapterId
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card/60 text-muted-foreground hover:bg-card/80 border border-border/40'
          }`}
        >
          All Memories
        </button>
        
        {chapters.map((chapter) => (
          <motion.button
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`group relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              selectedChapterId === chapter.id
                ? 'text-white shadow-md'
                : 'bg-card/60 hover:bg-card/80 border border-border/40'
            }`}
            style={{
              backgroundColor: selectedChapterId === chapter.id ? chapter.color : undefined
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{getIconEmoji(chapter.icon)}</span>
            <span>{chapter.name}</span>
            {entryCountByChapter[chapter.id] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedChapterId === chapter.id ? 'bg-white/20' : 'bg-muted'
              }`}>
                {entryCountByChapter[chapter.id]}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(chapter); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-opacity"
            >
              <Pencil size={12} />
            </button>
          </motion.button>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-shrink-0 border-dashed">
              <Plus className="mr-1" size={14} />
              Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingChapter ? 'Edit Chapter' : 'New Chapter'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Family, Travel, Work..."
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
                      className={`p-2 rounded-lg text-lg transition-all ${
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
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color.value ? 'ring-2 ring-offset-2 ring-foreground' : ''
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                {editingChapter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { onDeleteChapter(editingChapter.id); setIsDialogOpen(false); resetForm(); }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="mr-1" size={14} />
                    Delete
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
