import { Mail, Phone } from 'lucide-react';
import { Plus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityFeed } from '@/features/activities/components/ActivityFeed';
import { ApplyCadenceDialog } from '@/features/cadences/components/ApplyCadenceDialog';
import { ContactCadences } from '@/features/cadences/components/ContactCadences';
import { AddContactToOrgDialog } from '@/features/organizations/components/AddContactToOrgDialog';
import { ContactOrganizationList } from '@/features/organizations/components/ContactOrganizationList';
import { AddSecondaryRelationshipDialog } from '@/features/relationships/components/AddSecondaryRelationshipDialog';
import { PrimaryRelationshipGroup } from '@/features/relationships/components/PrimaryRelationshipGroup';
import { SecondaryRelationshipsList } from '@/features/relationships/components/SecondaryRelationshipsList';
import { usePrimaryGroups } from '@/features/relationships/hooks/useInterpersonalRelationships';

import { useContact, useContactActivities } from '../hooks';
import { CustomAttributesCard } from './CustomAttributesCard';

interface ContactDetailProps {
  contactId: string;
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const { data: contact, isLoading, error } = useContact(contactId);
  const { data: activities } = useContactActivities(contactId);
  const { data: primaryGroups } = usePrimaryGroups(contactId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !contact) {
    return (
      <EmptyState
        title="Contact not found"
        description="The contact you're looking for doesn't exist or has been deleted"
      />
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();
  const primaryEmail = contact.emails?.find((e) => e.is_primary);
  const primaryPhone = contact.phones?.find((p) => p.is_primary);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Sidebar - Contact Info */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={contact.avatar_url || undefined} alt={fullName} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{fullName}</CardTitle>
                {contact.job_title && (
                  <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {primaryEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{primaryEmail.value}</span>
              </div>
            )}
            {primaryPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{primaryPhone.value}</span>
              </div>
            )}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {contact.description && (
              <div>
                <p className="text-sm text-muted-foreground">{contact.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Center - Activity Feed */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <ActivityFeed activities={activities} />
            ) : (
              <EmptyState
                title="No activity"
                description="Activity will appear here as you interact with this contact"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Organizations, Cadences, etc. */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Organizations</CardTitle>
              <AddContactToOrgDialog
                contactId={contact.id}
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <ContactOrganizationList contactId={contact.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Cadences</CardTitle>
              <ApplyCadenceDialog
                contactId={contact.id}
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <ContactCadences contactId={contact.id} />
          </CardContent>
        </Card>

        {primaryGroups && primaryGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Households</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {primaryGroups.map((group) => (
                <PrimaryRelationshipGroup
                  key={group.id}
                  group={group}
                  contactId={contact.id}
                />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Relationships</CardTitle>
              <AddSecondaryRelationshipDialog
                contactId={contact.id}
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <SecondaryRelationshipsList contactId={contact.id} />
          </CardContent>
        </Card>

        {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
          <CustomAttributesCard customAttributes={contact.custom_attributes} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">
                {new Date(contact.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">
                {new Date(contact.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

