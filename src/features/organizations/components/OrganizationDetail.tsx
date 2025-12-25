import { Building2, Globe, MapPin, Link2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

import { useOrganization } from '../hooks';
import { LinkContactDialog } from './LinkContactDialog';
import { OrgCustomAttributesCard } from './OrgCustomAttributesCard';
import { OrganizationContactList } from './OrganizationContactList';

interface OrganizationDetailProps {
  organizationId: string;
}

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const { data: organization, isLoading, error } = useOrganization(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="The organization you're looking for doesn't exist or has been deleted"
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Sidebar - Organization Info */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle>{organization.name}</CardTitle>
                {organization.type && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {organization.type.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {organization.website}
                </a>
              </div>
            )}
            {organization.industry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-sm">{organization.industry}</p>
              </div>
            )}
            {organization.addresses && organization.addresses.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                {organization.addresses.map((addr, idx) => (
                  <div key={idx} className="mt-1 flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      {addr.street1 && <p>{addr.street1}</p>}
                      {addr.street2 && <p>{addr.street2}</p>}
                      <p>
                        {[addr.city, addr.state, addr.postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {addr.country && <p>{addr.country}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {organization.tags && organization.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {organization.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {organization.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground">{organization.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Center - Contacts */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <LinkContactDialog
                organizationId={organization.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <Link2 className="mr-2 h-4 w-4" />
                    Link Contact
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <OrganizationContactList organizationId={organization.id} />
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Details */}
      <div className="lg:col-span-1 space-y-4">
        {organization.custom_attributes && Object.keys(organization.custom_attributes).length > 0 && (
          <OrgCustomAttributesCard customAttributes={organization.custom_attributes} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">
                {new Date(organization.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">
                {new Date(organization.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

