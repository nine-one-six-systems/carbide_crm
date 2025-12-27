import { useState } from 'react';

import { Building2, LayoutGrid, Table as TableIcon } from 'lucide-react';

import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { OrganizationSearchParams } from '@/types/api';

import { useOrganizations } from '../hooks/useOrganizations';

import { OrganizationCard } from './OrganizationCard';
import { OrganizationTable } from './OrganizationTable';

type ViewMode = 'cards' | 'table';

interface OrganizationListProps {
  searchParams: OrganizationSearchParams;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function OrganizationListContent({
  searchParams,
  viewMode: controlledViewMode,
  onViewModeChange,
}: OrganizationListProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('table');
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;

  const { data, isLoading, error } = useOrganizations(searchParams);

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
        icon={Building2}
        title="Error loading organizations"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No organizations found"
        description="Get started by creating your first organization"
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
          {data.data.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      ) : (
        <OrganizationTable organizations={data.data} />
      )}
    </div>
  );
}

export function OrganizationList(props: OrganizationListProps) {
  return (
    <QueryErrorBoundary>
      <OrganizationListContent {...props} />
    </QueryErrorBoundary>
  );
}

