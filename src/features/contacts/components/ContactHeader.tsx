import { useState } from 'react';

import { Clock, MoreVertical, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Contact } from '@/types/database';

import { ContactForm } from './ContactForm';
import { useContactMutations } from '../hooks/useContactMutations';
import { ApplyCadenceDialog } from '@/features/cadences/components/ApplyCadenceDialog';

interface ContactHeaderProps {
  contact: Contact;
  contactIndex?: number;
  totalContacts?: number;
  lastActivityTime?: string | null;
}

export function ContactHeader({
  contact,
  contactIndex,
  totalContacts,
  lastActivityTime,
}: ContactHeaderProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { delete: deleteContact } = useContactMutations();

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

  const formatLastCommunication = (time: string | null | undefined) => {
    if (!time) return 'No recent communication';
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    deleteContact(contact.id, {
      onSuccess: () => {
        navigate('/contacts');
      },
    });
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-emerald-500/20">
              <AvatarImage src={contact.avatar_url || undefined} alt={fullName} />
              <AvatarFallback className="text-base">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold truncate">{fullName}</h1>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {lastActivityTime && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last Communication {formatLastCommunication(lastActivityTime)}</span>
                  </div>
                )}
                {contactIndex !== undefined && totalContacts !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    Person {contactIndex + 1} of {totalContacts}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>
                <ApplyCadenceDialog
                  contactId={contact.id}
                  trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Apply Cadence</DropdownMenuItem>}
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            contact={contact}
            onSuccess={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

