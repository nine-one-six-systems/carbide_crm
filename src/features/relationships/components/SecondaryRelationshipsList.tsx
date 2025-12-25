import { useState } from 'react';

import { User, X } from 'lucide-react';
import { Link } from 'react-router-dom';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { useSecondaryRelationships } from '../hooks/useInterpersonalRelationships';
import { useInterpersonalMutations } from '../hooks/useInterpersonalRelationships';
import { EditSecondaryRelationshipDialog } from './EditSecondaryRelationshipDialog';

interface SecondaryRelationshipsListProps {
  contactId: string;
}

const relationshipTypeLabels: Record<string, string> = {
  parent_child: 'Parent/Child',
  sibling: 'Sibling',
  colleague: 'Colleague',
  former_colleague: 'Former Colleague',
  manager_reports_to: 'Manager/Reports To',
  mentor_mentee: 'Mentor/Mentee',
  referral_source: 'Referral Source',
  business_partner: 'Business Partner',
  friend: 'Friend',
  other: 'Other',
};

export function SecondaryRelationshipsList({
  contactId,
}: SecondaryRelationshipsListProps) {
  const { data: relationships, isLoading } = useSecondaryRelationships(contactId);
  const { deleteSecondary } = useInterpersonalMutations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (!relationships || relationships.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No relationships</p>
    );
  }

  const handleDelete = async (id: string) => {
    await deleteSecondary(id);
    setDeleteDialogOpen(null);
  };

  return (
    <div className="space-y-2">
      {relationships.map((rel) => {
        const relatedContact = (rel as any).related_contact;
        if (!relatedContact) return null;

        const fullName = `${relatedContact.first_name} ${relatedContact.last_name}`;
        const initials = `${relatedContact.first_name[0]}${relatedContact.last_name[0]}`.toUpperCase();

        return (
          <div key={rel.id}>
            <div className="group flex items-center justify-between rounded-lg border p-2 gap-2">
              <Link
                to={`/contacts/${relatedContact.id}`}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={relatedContact.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {relationshipTypeLabels[rel.relationship_type] || rel.relationship_type}
                  </Badge>
                </div>
              </Link>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditSecondaryRelationshipDialog relationship={rel} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setDeleteDialogOpen(rel.id)}
                  aria-label="Remove relationship"
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <ConfirmDialog
              open={deleteDialogOpen === rel.id}
              onOpenChange={(open) => setDeleteDialogOpen(open ? rel.id : null)}
              title="Remove Relationship"
              description={`Are you sure you want to remove the relationship with ${fullName}?`}
              confirmLabel="Remove"
              variant="destructive"
              onConfirm={() => handleDelete(rel.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

