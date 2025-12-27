import { Link } from 'react-router-dom';
import { Building2, Users, GitBranch } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { VentureWithStats } from '../types/venture.types';
import { VENTURE_STATUS_COLORS } from '../types/venture.types';

interface VentureCardProps {
  venture: VentureWithStats;
}

export function VentureCard({ venture }: VentureCardProps) {
  return (
    <Link to={`/ventures/${venture.slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {venture.logo_url ? (
                <img
                  src={venture.logo_url}
                  alt={`${venture.name} logo`}
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                  style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                >
                  {venture.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{venture.name}</h3>
                {venture.website && (
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {venture.website.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn('shrink-0', VENTURE_STATUS_COLORS[venture.status])}
            >
              {venture.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {venture.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {venture.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              <span>{venture.relationship_count} Relationships</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{venture.organization_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{venture.team_member_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

