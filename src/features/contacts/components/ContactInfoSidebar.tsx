import { useState } from 'react';

import {
  AtSign,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
  Pencil,
  Star,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatPhoneNumber } from '@/lib/formatters';
import type { Contact } from '@/types/database';

import { AddContactToOrgDialog } from '@/features/organizations/components/AddContactToOrgDialog';
import { ContactOrganizationList } from '@/features/organizations/components/ContactOrganizationList';
import { useContactOrgLinks } from '@/features/organizations/hooks/useContactOrgLinks';
import { AddSecondaryRelationshipDialog } from '@/features/relationships/components/AddSecondaryRelationshipDialog';
import { PrimaryRelationshipGroup } from '@/features/relationships/components/PrimaryRelationshipGroup';
import { SecondaryRelationshipsList } from '@/features/relationships/components/SecondaryRelationshipsList';
import { usePrimaryGroups, useSecondaryRelationships } from '@/features/relationships/hooks/useInterpersonalRelationships';
import { ApplyCadenceDialog } from '@/features/cadences/components/ApplyCadenceDialog';
import { useContactMutations } from '../hooks/useContactMutations';
import { AddPhoneDialog } from './AddPhoneDialog';
import { AddEmailDialog } from './AddEmailDialog';
import { AddAddressDialog } from './AddAddressDialog';
import { EditPhoneDialog } from './EditPhoneDialog';
import { EditEmailDialog } from './EditEmailDialog';
import { EditAddressDialog } from './EditAddressDialog';
import { ContactForm } from './ContactForm';

interface ContactInfoSidebarProps {
  contact: Contact;
  contactIndex?: number;
  totalContacts?: number;
  lastActivityTime?: string | null;
}

export function ContactInfoSidebar({ 
  contact, 
  contactIndex, 
  totalContacts, 
  lastActivityTime 
}: ContactInfoSidebarProps) {
  const navigate = useNavigate();
  const { data: primaryGroups } = usePrimaryGroups(contact.id);
  const { data: secondaryRelationships } = useSecondaryRelationships(contact.id);
  const { data: orgLinks } = useContactOrgLinks(contact.id);
  const [relationshipsOpen, setRelationshipsOpen] = useState(true);
  const [organizationsOpen, setOrganizationsOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  
  // Calculate counts for badges
  const relationshipCount = (primaryGroups?.length || 0) + (secondaryRelationships?.length || 0);
  const organizationCount = orgLinks?.length || 0;
  const [deletePhoneIndex, setDeletePhoneIndex] = useState<number | null>(null);
  const [deleteEmailIndex, setDeleteEmailIndex] = useState<number | null>(null);
  const [deleteAddressIndex, setDeleteAddressIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { update, delete: deleteContact } = useContactMutations();

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

  const formatLastCommunication = (time: string | null | undefined) => {
    if (!time) return 'No communication yet';
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = () => {
    deleteContact(contact.id, {
      onSuccess: () => {
        navigate('/contacts');
      },
    });
    setDeleteDialogOpen(false);
  };

  const primaryEmail = contact.emails?.find((e) => e.is_primary);
  const primaryPhone = contact.phones?.find((p) => p.is_primary);
  const primaryAddress = contact.addresses?.[0];

  const social = contact.custom_attributes?.social || {};
  const hasSocial = Object.keys(social).length > 0;

  const handleDeletePhone = () => {
    if (deletePhoneIndex === null) return;
    
    const updatedPhones = contact.phones?.filter((_, idx) => idx !== deletePhoneIndex) || [];
    
    // If deleting primary and there are remaining phones, set first as primary
    const deletedPhone = contact.phones?.[deletePhoneIndex];
    if (deletedPhone?.is_primary && updatedPhones.length > 0) {
      updatedPhones[0].is_primary = true;
    }

    update(
      {
        id: contact.id,
        phones: updatedPhones,
      },
      {
        onSuccess: () => {
          setDeletePhoneIndex(null);
        },
      }
    );
  };

  const handleDeleteEmail = () => {
    if (deleteEmailIndex === null) return;
    
    const updatedEmails = contact.emails?.filter((_, idx) => idx !== deleteEmailIndex) || [];
    
    // If deleting primary and there are remaining emails, set first as primary
    const deletedEmail = contact.emails?.[deleteEmailIndex];
    if (deletedEmail?.is_primary && updatedEmails.length > 0) {
      updatedEmails[0].is_primary = true;
    }

    update(
      {
        id: contact.id,
        emails: updatedEmails,
      },
      {
        onSuccess: () => {
          setDeleteEmailIndex(null);
        },
      }
    );
  };

  const handleDeleteAddress = () => {
    if (deleteAddressIndex === null) return;
    
    const updatedAddresses = contact.addresses?.filter((_, idx) => idx !== deleteAddressIndex) || [];

    update(
      {
        id: contact.id,
        addresses: updatedAddresses,
      },
      {
        onSuccess: () => {
          setDeleteAddressIndex(null);
        },
      }
    );
  };

  return (
    <>
      <div className="h-full w-full min-w-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-6 space-y-4 w-full box-border">
          {/* Contact Header */}
          <div className="flex items-start gap-4 pb-4 border-b min-w-0">
            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-emerald-500/20 shrink-0">
              <AvatarImage src={contact.avatar_url || undefined} alt={fullName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 min-w-0">
                <h1 className="text-lg font-semibold truncate flex-1 min-w-0">{fullName}</h1>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <Star className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>
                    <ApplyCadenceDialog
                      contactId={contact.id}
                      trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Apply Cadence</DropdownMenuItem>}
                    />
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={() => setDeleteDialogOpen(true)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1">
                {lastActivityTime && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatLastCommunication(lastActivityTime)}</span>
                  </div>
                )}
                {contactIndex !== undefined && totalContacts !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    Person {contactIndex + 1} of {totalContacts}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Contact Methods */}
        <div className="space-y-3">
          {/* Phones */}
          <div className="space-y-1.5">
            {contact.phones && contact.phones.length > 0 && (
              <>
                {contact.phones.map((phone, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 min-w-0 ${
                      phone.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
                    }`}
                  >
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{formatPhoneNumber(phone.value)}</div>
                      {phone.label && (
                        <div className="text-xs text-muted-foreground mt-0.5">({phone.label})</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {idx === contact.phones.length - 1 && (
                        <AddPhoneDialog
                          contactId={contact.id}
                          existingPhones={contact.phones || []}
                          iconOnly={true}
                          circular={true}
                        />
                      )}
                      <EditPhoneDialog
                        contactId={contact.id}
                        phoneIndex={idx}
                        existingPhones={contact.phones || []}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            {(!contact.phones || contact.phones.length === 0) && (
              <AddPhoneDialog
                contactId={contact.id}
                existingPhones={contact.phones || []}
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 -mx-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-sm">Add phone</span>
                  </Button>
                }
              />
            )}
          </div>

          {/* Emails */}
          <div className="space-y-1.5">
            {contact.emails && contact.emails.length > 0 && (
              <>
                {contact.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 min-w-0 ${
                      email.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
                    }`}
                  >
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{email.value}</div>
                      {email.label && (
                        <div className="text-xs text-muted-foreground mt-0.5">({email.label})</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {idx === contact.emails.length - 1 && (
                        <AddEmailDialog
                          contactId={contact.id}
                          existingEmails={contact.emails || []}
                          iconOnly={true}
                          circular={true}
                        />
                      )}
                      <EditEmailDialog
                        contactId={contact.id}
                        emailIndex={idx}
                        existingEmails={contact.emails || []}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            {(!contact.emails || contact.emails.length === 0) && (
              <AddEmailDialog
                contactId={contact.id}
                existingEmails={contact.emails || []}
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 -mx-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-sm">Add email</span>
                  </Button>
                }
              />
            )}
          </div>

          {/* Addresses */}
          <div className="space-y-1.5">
            {contact.addresses && contact.addresses.length > 0 && (
              <>
                {contact.addresses.map((address, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 min-w-0 text-sm"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {address.street1 && <div className="truncate">{address.street1}</div>}
                      {address.street2 && <div className="truncate">{address.street2}</div>}
                      {(address.city || address.state || address.postal_code) && (
                        <div className="truncate">
                          {address.city && `${address.city}, `}
                          {address.state} {address.postal_code}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {idx === contact.addresses.length - 1 && (
                        <AddAddressDialog
                          contactId={contact.id}
                          existingAddresses={contact.addresses || []}
                          iconOnly={true}
                          circular={true}
                        />
                      )}
                      <EditAddressDialog
                        contactId={contact.id}
                        addressIndex={idx}
                        existingAddresses={contact.addresses || []}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            {(!contact.addresses || contact.addresses.length === 0) && (
              <AddAddressDialog
                contactId={contact.id}
                existingAddresses={contact.addresses || []}
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 -mx-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-sm">Add address</span>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialogs */}
        <ConfirmDialog
          open={deletePhoneIndex !== null}
          onOpenChange={(open) => !open && setDeletePhoneIndex(null)}
          title="Delete Phone Number"
          description="Are you sure you want to delete this phone number? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeletePhone}
        />
        <ConfirmDialog
          open={deleteEmailIndex !== null}
          onOpenChange={(open) => !open && setDeleteEmailIndex(null)}
          title="Delete Email Address"
          description="Are you sure you want to delete this email address? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteEmail}
        />
        <ConfirmDialog
          open={deleteAddressIndex !== null}
          onOpenChange={(open) => !open && setDeleteAddressIndex(null)}
          title="Delete Address"
          description="Are you sure you want to delete this address? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteAddress}
        />

        <Separator className="my-4" />

        {/* Relationships */}
        <Collapsible open={relationshipsOpen} onOpenChange={setRelationshipsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm truncate">Relationships</span>
              {relationshipCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                  {relationshipCount}
                </Badge>
              )}
            </div>
            {relationshipsOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {primaryGroups && primaryGroups.length > 0 && (
              <div className="space-y-1.5">
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
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600 mt-2">
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
                  Add relationship
                </Button>
              }
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-4" />

        {/* Organizations */}
        <Collapsible open={organizationsOpen} onOpenChange={setOrganizationsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm truncate">Organizations</span>
              {organizationCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                  {organizationCount}
                </Badge>
              )}
            </div>
            {organizationsOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <ContactOrganizationList contactId={contact.id} />
            <AddContactToOrgDialog
              contactId={contact.id}
              trigger={
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600 mt-2">
                  <Plus className="h-4 w-4 mr-2 shrink-0" />
                  Add to organization
                </Button>
              }
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-4" />

        {/* Details */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm truncate">Details</span>
            </div>
            {detailsOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
              <p className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</p>
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1.5">Tags</p>
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
            <Separator className="my-4" />
            <Collapsible open={backgroundOpen} onOpenChange={setBackgroundOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">Background</span>
                </div>
                {backgroundOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {contact.description}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Social Profile */}
        {hasSocial && (
          <>
            <Separator className="my-4" />
            <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">Social Profile</span>
                </div>
                {socialOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:underline min-w-0"
                  >
                    <AtSign className="h-4 w-4 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:underline min-w-0"
                  >
                    <AtSign className="h-4 w-4 shrink-0" />
                    <span className="truncate">Twitter</span>
                  </a>
                )}
                <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600 mt-2">
                  Search {contact.first_name} {contact.last_name}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        <Separator className="my-4" />

        {/* Delete Contact */}
        <DeleteContactButton contact={contact} />
      </div>
        </ScrollArea>
      </div>

    {/* Edit Dialog */}
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          contact={contact}
          onSuccess={() => setEditDialogOpen(false)}
          onCancel={() => setEditDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation */}
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

