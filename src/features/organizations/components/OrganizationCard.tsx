import { Building2, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Organization } from '@/types/database';

interface OrganizationCardProps {
  organization: Organization;
  className?: string;
}

export function OrganizationCard({
  organization,
  className,
}: OrganizationCardProps) {
  const primaryAddress = organization.addresses?.[0];

  return (
    <Link to={`/organizations/${organization.id}`} className={cn('block', className)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{organization.name}</h3>
              {organization.type && (
                <p className="text-sm text-muted-foreground capitalize">
                  {organization.type.replace('_', ' ')}
                </p>
              )}
              {organization.industry && (
                <p className="text-sm text-muted-foreground truncate">
                  {organization.industry}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {organization.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="truncate">{organization.website}</span>
                  </div>
                )}
                {primaryAddress && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {[primaryAddress.city, primaryAddress.state]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
              {organization.tags && organization.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {organization.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {organization.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{organization.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

