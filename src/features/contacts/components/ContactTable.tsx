import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Contact } from '@/types/database';
import { useContactActivities } from '../hooks/useContactActivities';

interface ContactTableProps {
  contacts: Contact[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function ContactTable({
  contacts,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
}: ContactTableProps) {
  const allSelected = contacts.length > 0 && contacts.every((c) => selectedIds.has(c.id));
  const someSelected = contacts.some((c) => selectedIds.has(c.id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelect && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <ContactTableRow
              key={contact.id}
              contact={contact}
              selected={selectedIds.has(contact.id)}
              onSelect={onSelect ? (selected) => onSelect(contact.id, selected) : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ContactTableRow({
  contact,
  selected,
  onSelect,
}: {
  contact: Contact;
  selected: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  const { data: activities } = useContactActivities(contact.id, 1);
  const lastActivity = activities && activities.length > 0 ? activities[0] : null;

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();
  const primaryEmail = contact.emails?.find((e) => e.is_primary);
  const primaryPhone = contact.phones?.find((p) => p.is_primary);

  const lastActivityText = lastActivity
    ? formatDistanceToNow(new Date(lastActivity.occurred_at), { addSuffix: true })
    : 'No activity';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      {onSelect && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}
      <TableCell>
        <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={contact.avatar_url || undefined} alt={fullName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            {contact.job_title && (
              <div className="text-sm text-muted-foreground">{contact.job_title}</div>
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell>
        {primaryPhone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{primaryPhone.value}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {primaryEmail ? (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{primaryEmail.value}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{lastActivityText}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {new Date(contact.created_at).toLocaleDateString()}
        </span>
      </TableCell>
    </TableRow>
  );
}

