import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MoreHorizontal, Unlink, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentureOrganizations, useUnlinkOrganization } from '../hooks/useVentureOrganizations';
import { VENTURE_ORG_RELATIONSHIP_OPTIONS } from '../types/venture.types';
import { LinkOrganizationModal } from './LinkOrganizationModal';

interface VentureOrganizationsProps {
  ventureId: string;
}

export function VentureOrganizations({ ventureId }: VentureOrganizationsProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { data: organizations, isLoading } = useVentureOrganizations(ventureId);
  const unlinkOrganization = useUnlinkOrganization(ventureId);

  const getRelationshipLabel = (type: string) => {
    return VENTURE_ORG_RELATIONSHIP_OPTIONS.find((o) => o.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organizations
        </h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
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
          <Building2 className="h-4 w-4" />
          Organizations ({organizations?.length || 0})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowLinkModal(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {organizations?.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
          >
            <Link
              to={`/organizations/${link.organization_id}`}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{link.organization?.name}</p>
                  {link.is_primary && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getRelationshipLabel(link.relationship_type)}
                </Badge>
              </div>
            </Link>

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
                  onClick={() => unlinkOrganization.mutate(link.id)}
                  className="text-destructive"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Unlink Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {(!organizations || organizations.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No organizations linked yet
          </p>
        )}
      </div>

      <LinkOrganizationModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        ventureId={ventureId}
      />
    </div>
  );
}

