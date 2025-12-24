import { User, Building2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { BusinessRelationship } from '@/types/database';

interface RelationshipCardProps {
  relationship: BusinessRelationship;
  className?: string;
}

export function RelationshipCard({
  relationship,
  className,
}: RelationshipCardProps) {
  const entity = relationship.contact || relationship.organization;
  const entityName = relationship.contact
    ? `${relationship.contact.first_name} ${relationship.contact.last_name}`
    : relationship.organization?.name || 'Unknown';

  const entityAvatar = relationship.contact?.avatar_url || relationship.organization?.logo_url;
  const entityInitials = relationship.contact
    ? `${relationship.contact.first_name[0]}${relationship.contact.last_name[0]}`
    : relationship.organization?.name.substring(0, 2).toUpperCase() || '??';

  return (
    <Link
      to={`/pipelines/${relationship.id}`}
      className={cn('block', className)}
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={entityAvatar || undefined} />
              <AvatarFallback>{entityInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {relationship.contact ? (
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <h3 className="font-semibold truncate">{entityName}</h3>
              </div>
              <p className="text-sm text-muted-foreground capitalize mt-1">
                {relationship.type.replace(/_/g, ' ')}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{relationship.stage}</Badge>
                {relationship.ventures && relationship.ventures.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {relationship.ventures.length} venture
                      {relationship.ventures.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

