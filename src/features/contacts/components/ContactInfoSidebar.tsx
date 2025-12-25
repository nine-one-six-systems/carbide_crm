import { useState } from 'react';

import {
  AtSign,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Contact } from '@/types/database';

import { AddContactToOrgDialog } from '@/features/organizations/components/AddContactToOrgDialog';
import { ContactOrganizationList } from '@/features/organizations/components/ContactOrganizationList';
import { AddSecondaryRelationshipDialog } from '@/features/relationships/components/AddSecondaryRelationshipDialog';
import { PrimaryRelationshipGroup } from '@/features/relationships/components/PrimaryRelationshipGroup';
import { SecondaryRelationshipsList } from '@/features/relationships/components/SecondaryRelationshipsList';
import { usePrimaryGroups } from '@/features/relationships/hooks/useInterpersonalRelationships';
import { useContactMutations } from '../hooks/useContactMutations';

interface ContactInfoSidebarProps {
  contact: Contact;
}

export function ContactInfoSidebar({ contact }: ContactInfoSidebarProps) {
  const { data: primaryGroups } = usePrimaryGroups(contact.id);
  const [relationshipsOpen, setRelationshipsOpen] = useState(true);
  const [organizationsOpen, setOrganizationsOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  const primaryEmail = contact.emails?.find((e) => e.is_primary);
  const primaryPhone = contact.phones?.find((p) => p.is_primary);
  const primaryAddress = contact.addresses?.[0];

  const social = contact.custom_attributes?.social || {};
  const hasSocial = Object.keys(social).length > 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Primary Contact Methods */}
        <div className="space-y-3">
          {contact.phones && contact.phones.length > 0 && (
            <div className="space-y-2">
              {contact.phones.map((phone, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 ${
                    phone.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
                  }`}
                >
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{phone.value}</span>
                  {phone.label && (
                    <span className="text-xs text-muted-foreground">({phone.label})</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Add phone
          </Button>

          {contact.emails && contact.emails.length > 0 && (
            <div className="space-y-2">
              {contact.emails.map((email, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 ${
                    email.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
                  }`}
                >
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{email.value}</span>
                  {email.label && (
                    <span className="text-xs text-muted-foreground">({email.label})</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Add email
          </Button>

          {primaryAddress && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                {primaryAddress.street1 && <div>{primaryAddress.street1}</div>}
                {primaryAddress.street2 && <div>{primaryAddress.street2}</div>}
                {(primaryAddress.city || primaryAddress.state || primaryAddress.postal_code) && (
                  <div>
                    {primaryAddress.city && `${primaryAddress.city}, `}
                    {primaryAddress.state} {primaryAddress.postal_code}
                  </div>
                )}
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Add address
          </Button>
        </div>

        <Separator />

        {/* Relationships */}
        <Collapsible open={relationshipsOpen} onOpenChange={setRelationshipsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted rounded-md px-2 -mx-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Relationships</span>
            </div>
            {relationshipsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {primaryGroups && primaryGroups.length > 0 && (
              <div className="space-y-2">
                {primaryGroups.map((group) => (
                  <PrimaryRelationshipGroup
                    key={group.id}
                    group={group}
                    contactId={contact.id}
                  />
                ))}
              </div>
            )}
            <SecondaryRelationshipsList contactId={contact.id} />
            <AddSecondaryRelationshipDialog
              contactId={contact.id}
              trigger={
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add relationship
                </Button>
              }
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Organizations */}
        <Collapsible open={organizationsOpen} onOpenChange={setOrganizationsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted rounded-md px-2 -mx-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Organizations</span>
            </div>
            {organizationsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <ContactOrganizationList contactId={contact.id} />
            <AddContactToOrgDialog
              contactId={contact.id}
              trigger={
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600 mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to organization
                </Button>
              }
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Details */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted rounded-md px-2 -mx-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Details</span>
            </div>
            {detailsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</p>
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Background */}
        {contact.description && (
          <>
            <Separator />
            <Collapsible open={backgroundOpen} onOpenChange={setBackgroundOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted rounded-md px-2 -mx-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Background</span>
                </div>
                {backgroundOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.description}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Social Profile */}
        {hasSocial && (
          <>
            <Separator />
            <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted rounded-md px-2 -mx-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Social Profile</span>
                </div>
                {socialOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                  >
                    <AtSign className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                  >
                    <AtSign className="h-4 w-4" />
                    Twitter
                  </a>
                )}
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
                  Search {contact.first_name} {contact.last_name}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        <Separator />

        {/* Delete Contact */}
        <DeleteContactButton contact={contact} />
      </div>
    </ScrollArea>
  );
}

function DeleteContactButton({ contact }: { contact: Contact }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { delete: deleteContact } = useContactMutations();

  const handleDelete = () => {
    deleteContact(contact.id, {
      onSuccess: () => {
        navigate('/contacts');
      },
    });
    setDeleteDialogOpen(false);
  };

  const fullName = `${contact.first_name} ${contact.last_name}`;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive hover:text-destructive"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Contact
      </Button>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

