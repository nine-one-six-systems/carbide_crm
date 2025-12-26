import { useState } from 'react';

import { LayoutGrid, Table as TableIcon, Users } from 'lucide-react';

import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactSearchParams } from '@/types/api';

import { useContacts } from '../hooks/useContacts';

import { ContactCard } from './ContactCard';
import { ContactTable } from './ContactTable';

type ViewMode = 'cards' | 'table';

interface ContactListProps {
  searchParams: ContactSearchParams;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function ContactListContent({
  searchParams,
  viewMode: controlledViewMode,
  onViewModeChange,
}: ContactListProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('table');
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;

  const { data, isLoading, error } = useContacts(searchParams);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
        </div>
        {viewMode === 'cards' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Skeleton className="h-64" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={Users}
        title="Error loading contacts"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No contacts found"
        description="Get started by creating your first contact"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={viewMode === 'cards' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('cards')}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Cards
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          <TableIcon className="h-4 w-4 mr-2" />
          Table
        </Button>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <ContactTable contacts={data.data} />
      )}
    </div>
  );
}

export function ContactList(props: ContactListProps) {
  return (
    <QueryErrorBoundary>
      <ContactListContent {...props} />
    </QueryErrorBoundary>
  );
}

