import { useState } from 'react';
import { Chapter, Entry, AppView, CHAPTER_ICONS, CHAPTER_COLORS, ChapterIcon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Books, CaretRight, PushPin, Archive } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface ChaptersScreenProps {
  chapters: Chapter[];
  entries: Entry[];
  onNavigate: (view: AppView) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export function ChaptersScreen({
  chapters,
  entries,
  onNavigate,
  onSaveChapter,
  onDeleteChapter
}: ChaptersScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<ChapterIcon>('star');
  const [selectedColor, setSelectedColor] = useState('violet');

  const activeChapters = [...chapters]
    .filter(c => !c.is_archived)
    .sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return a.order - b.order;
    });

  const archivedChapters = chapters.filter(c => c.is_archived);

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
          <div className="flex items-center gap-4">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <span className="text-border/50">|</span>
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-foreground">{t.chapters.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-1.5" weight="bold" size={16} />
              {t.chapters.newChapter}
            </Button>
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeChapters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <Books weight="duotone" className="w-12 h-12 text-primary/60" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
              {t.chapters.noChapters}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              {t.chapters.noChaptersDesc}
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="w-full">
                <Plus className="mr-2" weight="bold" />
                {t.chapters.newChapter}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {activeChapters.map((chapter, index) => (
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
                          <PushPin weight="fill" className="w-3.5 h-3.5 text-primary/70" />
                        )}
                      </div>
                      {chapter.description && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {chapter.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getEntryCount(chapter.id)} {t.chapters.entries}
                      </p>
                    </div>
                    <CaretRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>

            {archivedChapters.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Archive weight="duotone" className="w-3.5 h-3.5" />
                  {t.chapters.archived} ({archivedChapters.length})
                </p>
                <div className="space-y-2">
                  {archivedChapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => onNavigate({ type: 'chapter-detail', chapterId: chapter.id })}
                      className="w-full p-3 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-all text-left opacity-60 hover:opacity-80"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: `${chapter.color}15` }}
                        >
                          {getIconEmoji(chapter.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-foreground truncate">{chapter.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {getEntryCount(chapter.id)} {t.home.memories}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t.chapters.newChapter}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{t.chapters.name}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Travel Adventures, Family, Work..."
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of memories will you keep here?"
                className="resize-none h-20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{t.chapters.icon}</label>
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
                    title={icon.label}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">{t.chapters.color}</label>
              <div className="flex flex-wrap gap-2">
                {CHAPTER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim()}>
                {t.chapters.newChapter}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
