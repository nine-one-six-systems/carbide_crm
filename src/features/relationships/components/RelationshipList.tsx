import { Handshake } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { RelationshipSearchParams } from '@/types/api';

import { useRelationships } from '../hooks/useRelationships';

import { RelationshipCard } from './RelationshipCard';



interface RelationshipListProps {
  searchParams: RelationshipSearchParams;
}

export function RelationshipList({ searchParams }: RelationshipListProps) {
  const { data, isLoading, error } = useRelationships(searchParams);

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
        icon={Handshake}
        title="Error loading relationships"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title="No relationships found"
        description="Get started by creating your first business relationship"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((relationship) => (
        <RelationshipCard key={relationship.id} relationship={relationship} />
      ))}
    </div>
  );
}

