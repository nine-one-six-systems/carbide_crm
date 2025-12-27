import { formatDistanceToNow } from 'date-fns';
import { Building2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Organization } from '@/types/database';
import { useOrganizationActivities } from '../hooks/useOrganizationActivities';

interface OrganizationTableProps {
  organizations: Organization[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function OrganizationTable({
  organizations,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
}: OrganizationTableProps) {
  const allSelected = organizations.length > 0 && organizations.every((o) => selectedIds.has(o.id));
  const someSelected = organizations.some((o) => selectedIds.has(o.id));

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
            <TableHead>Type</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization) => (
            <OrganizationTableRow
              key={organization.id}
              organization={organization}
              selected={selectedIds.has(organization.id)}
              onSelect={onSelect ? (selected) => onSelect(organization.id, selected) : undefined}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function OrganizationTableRow({
  organization,
  selected,
  onSelect,
}: {
  organization: Organization;
  selected: boolean;
  onSelect?: (selected: boolean) => void;
}) {
  const { data: activities } = useOrganizationActivities(organization.id, 1);
  const lastActivity = activities && activities.length > 0 ? activities[0] : null;

  const lastActivityText = lastActivity
    ? formatDistanceToNow(new Date(lastActivity.occurred_at), { addSuffix: true })
    : 'No activity';

  const typeDisplay = organization.type
    ? organization.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : '—';

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
        <Link to={`/organizations/${organization.id}`} className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{organization.name}</div>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <span className="text-sm">{typeDisplay}</span>
      </TableCell>
      <TableCell>
        {organization.industry ? (
          <span className="text-sm">{organization.industry}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {organization.website ? (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {organization.website}
            </a>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {organization.tags && organization.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
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
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{lastActivityText}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {new Date(organization.created_at).toLocaleDateString()}
        </span>
      </TableCell>
    </TableRow>
  );
}

