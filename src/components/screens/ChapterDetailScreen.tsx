import { useState } from 'react';
import { Chapter, Entry, AppView, CHAPTER_ICONS, CHAPTER_COLORS, ChapterIcon } from '@/lib/types';
import { getEntryTitle, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CaretLeft, DotsThreeVertical, PencilSimple, PushPin, Archive, Trash, Camera, Star, CaretRight, Sparkle, NotePencil } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface ChapterDetailScreenProps {
  chapter: Chapter;
  entries: Entry[];
  onNavigate: (view: AppView) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onToggleStar: (entryId: string) => void;
}

export function ChapterDetailScreen({
  chapter,
  entries,
  onNavigate,
  onSaveChapter,
  onDeleteChapter,
  onToggleStar
}: ChapterDetailScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const { t } = useLanguage();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(chapter.name);
  const [description, setDescription] = useState(chapter.description || '');
  const [selectedIcon, setSelectedIcon] = useState<ChapterIcon>(chapter.icon);
  const [selectedColor, setSelectedColor] = useState(
    CHAPTER_COLORS.find(c => c.color === chapter.color)?.value || 'violet'
  );

  const nonDraftEntries = entries.filter(e => !e.is_draft);
  const sortedEntries = [...nonDraftEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  const handleSaveEdit = () => {
    if (!name.trim()) return;
    const colorObj = CHAPTER_COLORS.find(c => c.value === selectedColor);
    onSaveChapter({
      ...chapter,
      name: name.trim(),
      description: description.trim() || null,
      icon: selectedIcon,
      color: colorObj?.color || chapter.color,
    });
    setIsEditDialogOpen(false);
    toast.success('Chapter updated');
  };

  const handleTogglePin = () => {
    onSaveChapter({ ...chapter, is_pinned: !chapter.is_pinned });
    toast.success(chapter.is_pinned ? 'Unpinned' : 'Pinned');
  };

  const handleArchive = () => {
    onSaveChapter({ ...chapter, is_archived: true });
    onNavigate({ type: 'chapters' });
    toast.success('Chapter archived');
  };

  const handleDelete = () => {
    onDeleteChapter(chapter.id);
    onNavigate({ type: 'chapters' });
    toast.success('Chapter deleted');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <span className="text-border/50">|</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate({ type: 'chapters' })}
              className="flex-shrink-0 h-8 w-8"
            >
              <CaretLeft weight="bold" className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">{getIconEmoji(chapter.icon)}</span>
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-foreground truncate">
                {chapter.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <DotsThreeVertical weight="bold" className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <PencilSimple className="mr-2 w-4 h-4" />
                  Edit Chapter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin}>
                  <PushPin className="mr-2 w-4 h-4" weight={chapter.is_pinned ? 'fill' : 'regular'} />
                  {chapter.is_pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 w-4 h-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedEntries.length} {sortedEntries.length === 1 ? 'memory' : 'memories'}
          </p>
        </div>

        {sortedEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-xl bg-muted/50 flex items-center justify-center">
              <NotePencil weight="duotone" className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              This chapter is empty
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              Start capturing memories and assign them here.
            </p>
            <Button onClick={() => onNavigate({ type: 'prompts' })}>
              <Sparkle className="mr-2" weight="bold" />
              Write a Memory
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry, index) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onNavigate({ type: 'entry-read', entryId: entry.id })}
                className="w-full p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-border/50 hover:bg-card/90 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  {entry.photos[0] ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={entry.photos[0].storage_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <Camera weight="duotone" className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {getEntryTitle(entry)}
                      </h3>
                      {entry.is_starred && (
                        <Star weight="fill" className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(entry.date)}
                    </p>
                  </div>
                  <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chapter name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
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
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!name.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Chapter?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            This will delete the chapter "{chapter.name}". Entries in this chapter will be moved to uncategorized.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
