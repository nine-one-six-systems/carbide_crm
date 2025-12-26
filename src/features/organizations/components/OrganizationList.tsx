import { Building2 } from 'lucide-react';

import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { OrganizationSearchParams } from '@/types/api';

import { useOrganizations } from '../hooks/useOrganizations';

import { OrganizationCard } from './OrganizationCard';



interface OrganizationListProps {
  searchParams: OrganizationSearchParams;
}

function OrganizationListContent({ searchParams }: OrganizationListProps) {
  const { data, isLoading, error } = useOrganizations(searchParams);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((organization) => (
        <OrganizationCard key={organization.id} organization={organization} />
      ))}
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

