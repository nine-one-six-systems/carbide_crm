import { Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PrimaryRelationshipGroup } from '@/types/database';

import { useGroupMembers } from '../hooks/useInterpersonalRelationships';

interface PrimaryRelationshipGroupProps {
  group: PrimaryRelationshipGroup;
  contactId: string;
  onRemove?: (groupId: string) => void;
}

export function PrimaryRelationshipGroup({
  group,
  contactId,
  onRemove,
}: PrimaryRelationshipGroupProps) {
  const { data: members, isLoading } = useGroupMembers(group.id);

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  const otherMembers = members?.filter((m) => m.contact_id !== contactId) || [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <CardTitle className="text-sm font-medium truncate">
              {group.name || 'Household'}
            </CardTitle>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onRemove(group.id)}
              aria-label="Remove from group"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1.5">
          {otherMembers.map((member) => {
            const contact = (member as any).contact;
            if (!contact) return null;

            const fullName = `${contact.first_name} ${contact.last_name}`;
            const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

            return (
              <Link
                key={member.id}
                to={`/contacts/${contact.id}`}
                className="flex items-center gap-2 rounded-lg border p-1.5 hover:bg-muted transition-colors"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={contact.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {member.role}
                    </Badge>
                    {!member.is_adult && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Child
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {otherMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">No other members</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

