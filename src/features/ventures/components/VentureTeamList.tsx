import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, MoreHorizontal, UserMinus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentureTeam, useRemoveTeamMember } from '../hooks/useVentureTeam';
import { AddTeamMemberModal } from './AddTeamMemberModal';

interface VentureTeamListProps {
  ventureId: string;
}

export function VentureTeamList({ ventureId }: VentureTeamListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: team, isLoading } = useVentureTeam(ventureId);
  const removeTeamMember = useRemoveTeamMember(ventureId);

  const getInitials = (member: any) => {
    if (member.user) {
      return member.user.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U';
    }
    if (member.contact) {
      return `${member.contact.first_name?.[0] || ''}${member.contact.last_name?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const getName = (member: any) => {
    if (member.user) return member.user.full_name || member.user.email;
    if (member.contact) return `${member.contact.first_name} ${member.contact.last_name}`;
    return 'Unknown';
  };

  const getAvatarUrl = (member: any) => {
    return member.user?.avatar_url || member.contact?.avatar_url;
  };

  const getProfileLink = (member: any) => {
    if (member.contact_id) return `/contacts/${member.contact_id}`;
    return null;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Team
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Team ({team?.length || 0})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {team?.map((member) => {
          const profileLink = getProfileLink(member);
          const content = (
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(member)} />
                  <AvatarFallback className="text-xs">{getInitials(member)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{getName(member)}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => removeTeamMember.mutate(member.id)}
                    className="text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove from Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );

          return profileLink ? (
            <Link key={member.id} to={profileLink}>
              {content}
            </Link>
          ) : (
            <div key={member.id}>{content}</div>
          );
        })}

        {(!team || team.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">No team members yet</p>
        )}
      </div>

      <AddTeamMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        ventureId={ventureId}
      />
    </div>
  );
}

