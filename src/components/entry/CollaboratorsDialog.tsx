import { useState } from 'react';
import { Users, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Entry, EntryCollaborator, EntryCollaboratorRole } from '@/lib/types';
import { getEntryTitle } from '@/lib/entries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CollaboratorsDialogProps {
  entry: Entry;
  open: boolean;
  currentUserEmail?: string | null;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: EntryCollaboratorRole) => void;
  onUpdateRole: (collaboratorId: string, role: EntryCollaboratorRole) => void;
  onRemove: (collaboratorId: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getCollaboratorLabel(collaborator: EntryCollaborator): string {
  return collaborator.status === 'pending'
    ? 'Pending'
    : collaborator.role === 'editor'
      ? 'Can edit'
      : 'Can view';
}

export function CollaboratorsDialog({
  entry,
  open,
  currentUserEmail,
  onOpenChange,
  onInvite,
  onUpdateRole,
  onRemove,
}: CollaboratorsDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<EntryCollaboratorRole>('editor');
  const collaborators = entry.collaborators ?? [];
  const ownerEmail = currentUserEmail && entry.collaboration_role === 'owner'
    ? currentUserEmail
    : 'Memory owner';

  const handleInvite = () => {
    const normalized = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) {
      toast.error('Enter a valid email address.');
      return;
    }

    if (currentUserEmail && normalized === normalizeEmail(currentUserEmail)) {
      toast.error('You already own this memory.');
      return;
    }

    if (collaborators.some(c => normalizeEmail(c.invitee_email) === normalized)) {
      toast.error('This person is already invited.');
      return;
    }

    onInvite(normalized, role);
    setEmail('');
    setRole('editor');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users weight="duotone" className="w-5 h-5 text-primary" />
            Collaborate on this memory
          </DialogTitle>
          <DialogDescription>
            Invite someone to remember and write “{getEntryTitle(entry)}” together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {entry.collaboration_role === 'owner' && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1"
                />
                <Select value={role} onValueChange={(value) => setRole(value as EntryCollaboratorRole)}>
                  <SelectTrigger className="sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Can edit</SelectItem>
                    <SelectItem value="viewer">Can view</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite}>Send invite</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                They will need to sign in with this email.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <CollaboratorRow
              email={ownerEmail}
              label="Owner"
              badgeVariant="default"
            />

            {collaborators.map((collaborator) => (
              <CollaboratorRow
                key={collaborator.id}
                email={collaborator.invitee_email}
                label={getCollaboratorLabel(collaborator)}
                badgeVariant={collaborator.status === 'pending' ? 'outline' : 'secondary'}
                role={collaborator.role}
                canManage={entry.collaboration_role === 'owner'}
                onRoleChange={(nextRole) => onUpdateRole(collaborator.id, nextRole)}
                onRemove={() => onRemove(collaborator.id)}
              />
            ))}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Editors can update the title, notes, story, tags, date, and chapter. Only the owner can delete the memory,
            manage collaborators, or manage photos for now.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollaboratorRow({
  email,
  label,
  badgeVariant,
  role,
  canManage = false,
  onRoleChange,
  onRemove,
}: {
  email: string;
  label: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  role?: EntryCollaboratorRole;
  canManage?: boolean;
  onRoleChange?: (role: EntryCollaboratorRole) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-xs font-semibold">
          {initials(email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{email}</p>
        <Badge variant={badgeVariant} className="mt-1">
          {label}
        </Badge>
      </div>
      {canManage && role && onRoleChange && (
        <Select value={role} onValueChange={(value) => onRoleChange(value as EntryCollaboratorRole)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Can edit</SelectItem>
            <SelectItem value="viewer">Can view</SelectItem>
          </SelectContent>
        </Select>
      )}
      {canManage && onRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${email}`}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
