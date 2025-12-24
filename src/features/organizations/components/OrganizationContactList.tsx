import { useState } from 'react';

import { User, Briefcase, X } from 'lucide-react';
import { Link } from 'react-router-dom';


import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactOrganizationLink } from '@/types/database';

import { useOrganizationContacts, useContactOrgLinkMutations } from '../hooks/useContactOrgLinks';

interface OrganizationContactListProps {
  organizationId: string;
}

export function OrganizationContactList({ organizationId }: OrganizationContactListProps) {
  const { data: links, isLoading } = useOrganizationContacts(organizationId);
  const { delete: deleteLink } = useContactOrgLinkMutations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No contacts linked</p>
    );
  }

  const handleDelete = async (linkId: string, contactId: string) => {
    await deleteLink({ id: linkId, contactId, organizationId });
    setDeleteDialogOpen(null);
  };

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const contact = (link as any).contact;
        if (!contact) return null;

        const fullName = `${contact.first_name} ${contact.last_name}`;

        return (
          <div
            key={link.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/contacts/${contact.id}`}
                  className="font-medium hover:underline truncate block"
                >
                  {fullName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  {link.role_title && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {link.role_title}
                    </span>
                  )}
                  {link.is_primary && (
                    <Badge variant="secondary" className="text-xs">
                      Primary
                    </Badge>
                  )}
                  {!link.is_current && (
                    <Badge variant="outline" className="text-xs">
                      Past
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setDeleteDialogOpen(link.id)}
              aria-label="Remove contact link"
            >
              <X className="h-4 w-4" />
            </Button>
            <ConfirmDialog
              open={deleteDialogOpen === link.id}
              onOpenChange={(open) => setDeleteDialogOpen(open ? link.id : null)}
              title="Remove Contact Link"
              description={`Are you sure you want to remove ${fullName} from this organization?`}
              confirmLabel="Remove"
              variant="destructive"
              onConfirm={() => handleDelete(link.id, contact.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

