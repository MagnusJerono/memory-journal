import { useState } from 'react';
import { Entry, Chapter, AppView, CHAPTER_ICONS, ChapterIcon, EntryCollaboratorRole } from '@/lib/types';
import { getEntryTitle, formatDate, canEditEntry, canManageEntryCollaborators } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CaretLeft, 
  PencilSimple, 
  DotsThreeVertical,
  Star,
  ShareNetwork,
  Trash,
  FolderSimple,
  MapPin,
  Tag,
  Users
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { CollaboratorsDialog } from '@/components/entry/CollaboratorsDialog';

interface EntryReadScreenProps {
  entry: Entry;
  chapter: Chapter | null;
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onAssignChapter: (chapterId: string | null) => void;
  currentUserId?: string;
  currentUserEmail?: string | null;
  onInviteCollaborator: (email: string, role: EntryCollaboratorRole) => void;
  onUpdateCollaboratorRole: (collaboratorId: string, role: EntryCollaboratorRole) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
}

export function EntryReadScreen({
  entry,
  chapter,
  chapters,
  onNavigate,
  onToggleStar,
  onDelete,
  onAssignChapter,
  currentUserId,
  currentUserEmail,
  onInviteCollaborator,
  onUpdateCollaboratorRole,
  onRemoveCollaborator
}: EntryReadScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCollaboratorsDialogOpen, setIsCollaboratorsDialogOpen] = useState(false);

  const title = getEntryTitle(entry);
  const location = entry.tags_ai?.places?.[0] || entry.manual_locations?.[0];
  const editable = canEditEntry(entry, currentUserId);
  const canManageCollaborators = canManageEntryCollaborators(entry, currentUserId);
  const collaborators = entry.collaborators ?? [];
  const isShared = collaborators.length > 0 || (!!entry.collaboration_role && entry.collaboration_role !== 'owner');

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: entry.story_ai || entry.highlights_ai?.[0] || '',
        });
      } catch {
        toast.info('Share cancelled');
      }
    } else {
      toast.info('Sharing not supported on this device');
    }
  };

  const handleDelete = () => {
    onDelete();
    toast.success('Entry deleted');
  };

  const goBack = () => {
    if (entry.chapter_id) {
      onNavigate({ type: 'chapter-detail', chapterId: entry.chapter_id });
    } else {
      onNavigate({ type: 'home' });
    }
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
            <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 h-8 w-8">
              <CaretLeft weight="bold" className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-1">
            {editable ? (
              <Button 
                onClick={() => onNavigate({ type: 'entry-edit', entryId: entry.id })}
                size="sm"
              >
                <PencilSimple className="mr-1.5 w-4 h-4" weight="bold" />
                Edit
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                View only
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <DotsThreeVertical weight="bold" className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {editable && (
                  <>
                    <DropdownMenuItem onClick={onToggleStar}>
                      <Star className="mr-2 w-4 h-4" weight={entry.is_starred ? 'fill' : 'regular'} />
                      {entry.is_starred ? 'Remove star' : 'Star'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
                      <FolderSimple className="mr-2 w-4 h-4" />
                      Move to chapter
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => setIsCollaboratorsDialogOpen(true)}>
                  <Users className="mr-2 w-4 h-4" />
                  {canManageCollaborators ? 'Invite collaborators' : 'View collaborators'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <ShareNetwork className="mr-2 w-4 h-4" />
                  Share text
                </DropdownMenuItem>
                {canManageCollaborators && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden sm:block md:hidden">
              <NavigationMenu 
                onNavigate={onNavigate} 
                currentTab="home" 
                isDarkMode={isDarkMode} 
              />
            </div>
            <div className="md:hidden">
              <SettingsPanel
                themeMode={themeMode}
                onThemeModeChange={setThemeMode}
                isDarkMode={isDarkMode}
                isNightTime={isNightTime}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {entry.photos.length > 0 && (
          <div className="px-4 pt-4">
            {entry.photos.length === 1 ? (
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={entry.photos[0].storage_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : entry.photos.length === 2 ? (
              <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
                {entry.photos.slice(0, 2).map(photo => (
                  <div key={photo.id} className="aspect-square">
                    <img 
                      src={photo.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                <div className="col-span-2 row-span-2 aspect-square">
                  <img 
                    src={entry.photos[0].storage_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {entry.photos.slice(1, 3).map((photo, idx) => (
                  <div key={photo.id} className="aspect-square relative">
                    <img 
                      src={photo.storage_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                    {idx === 1 && entry.photos.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white font-semibold">+{entry.photos.length - 3}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-sm font-medium text-primary">
                {formatDate(entry.date)}
              </span>
              {chapter && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  {getIconEmoji(chapter.icon)} {chapter.name}
                </span>
              )}
              {isShared && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users weight="duotone" className="w-4 h-4" />
                  {entry.collaboration_role === 'owner'
                    ? `Shared with ${collaborators.length}`
                    : entry.collaboration_role === 'editor'
                      ? 'Can edit'
                      : 'View only'}
                </span>
              )}
              {entry.is_starred && (
                <Star weight="fill" className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground leading-tight">
              {title}
            </h1>
          </motion.div>

          {entry.highlights_ai && entry.highlights_ai.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star weight="duotone" className="w-5 h-5 text-amber-500" />
                Highlights
              </h2>
              <ul className="space-y-2">
                {entry.highlights_ai.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary mt-1.5">•</span>
                    <span className="text-foreground/90">{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {entry.story_ai && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="font-serif text-lg font-semibold text-foreground mb-3">The Story</h2>
              <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
                {entry.story_ai.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </motion.section>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 pt-4 border-t border-border/30"
          >
            {location && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <MapPin weight="fill" className="w-4 h-4 text-primary/70" />
                {location}
              </span>
            )}
            {entry.tags_ai?.moods?.slice(0, 3).map(mood => (
              <span key={mood} className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Tag weight="fill" className="w-4 h-4 text-accent/70" />
                {mood}
              </span>
            ))}
          </motion.div>
        </div>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this memory?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            This action cannot be undone. The memory and all its photos will be permanently deleted.
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

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Move to chapter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={entry.chapter_id || 'none'} 
              onValueChange={(v) => {
                onAssignChapter(v === 'none' ? null : v);
                setIsMoveDialogOpen(false);
                toast.success('Moved to chapter');
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
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      <CollaboratorsDialog
        entry={entry}
        open={isCollaboratorsDialogOpen}
        currentUserEmail={currentUserEmail}
        onOpenChange={setIsCollaboratorsDialogOpen}
        onInvite={onInviteCollaborator}
        onUpdateRole={onUpdateCollaboratorRole}
        onRemove={onRemoveCollaborator}
      />
    </div>
  );
}
