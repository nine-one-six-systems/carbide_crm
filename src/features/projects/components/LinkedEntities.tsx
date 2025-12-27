import { Building2, Link2, Plus, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  ProjectContact,
  ProjectOrganization,
  ProjectRelationship,
} from '../types/project.types';

interface LinkedEntitiesProps {
  contacts: ProjectContact[];
  organizations: ProjectOrganization[];
  relationships: ProjectRelationship[];
  onLinkContact?: () => void;
  onLinkOrganization?: () => void;
  onLinkRelationship?: () => void;
  onUnlinkContact?: (contactId: string) => void;
  onUnlinkOrganization?: (organizationId: string) => void;
  onUnlinkRelationship?: (relationshipId: string) => void;
  disabled?: boolean;
}

export function LinkedEntities({
  contacts,
  organizations,
  relationships,
  onLinkContact,
  onLinkOrganization,
  onLinkRelationship,
  onUnlinkContact,
  onUnlinkOrganization,
  onUnlinkRelationship,
  disabled,
}: LinkedEntitiesProps) {
  return (
    <div className="space-y-6">
      {/* Organizations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Linked Organizations
          </h3>
          {onLinkOrganization && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLinkOrganization}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Link Org
            </Button>
          )}
        </div>
        {organizations.length === 0 ? (
          <p className="text-sm text-muted-foreground">(none)</p>
        ) : (
          <div className="space-y-2">
            {organizations.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <Link
                  to={`/organizations/${link.organizationId}`}
                  className="flex-1 hover:underline"
                >
                  <div className="font-medium">
                    {link.organization?.name || 'Unknown Organization'}
                  </div>
                  {link.role && (
                    <div className="text-xs text-muted-foreground">{link.role}</div>
                  )}
                </Link>
                {onUnlinkOrganization && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUnlinkOrganization(link.organizationId)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contacts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Linked Contacts
          </h3>
          {onLinkContact && (
            <Button variant="ghost" size="sm" onClick={onLinkContact} disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              Link Contact
            </Button>
          )}
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">(none)</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <Link
                  to={`/contacts/${link.contactId}`}
                  className="flex-1 hover:underline"
                >
                  <div className="font-medium">
                    {link.contact
                      ? `${link.contact.firstName} ${link.contact.lastName}`
                      : 'Unknown Contact'}
                  </div>
                  {link.role && (
                    <div className="text-xs text-muted-foreground">{link.role}</div>
                  )}
                </Link>
                {onUnlinkContact && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUnlinkContact(link.contactId)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relationships */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Linked Business Relationships
          </h3>
          {onLinkRelationship && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLinkRelationship}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Link Relationship
            </Button>
          )}
        </div>
        {relationships.length === 0 ? (
          <p className="text-sm text-muted-foreground">(none)</p>
        ) : (
          <div className="space-y-2">
            {relationships.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <div className="flex-1">
                  {link.relationship && (
                    <>
                      <div className="font-medium">{link.relationship.type}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {link.relationship.stage}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
                {onUnlinkRelationship && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUnlinkRelationship(link.relationshipId)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

