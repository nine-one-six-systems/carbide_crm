import { Workflow } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

import { useAppliedCadences } from '../hooks/useAppliedCadences';

import { ActiveCadenceCard } from './ActiveCadenceCard';


interface ContactCadencesProps {
  contactId: string;
}

export function ContactCadences({ contactId }: ContactCadencesProps) {
  const { data: appliedCadences, isLoading } = useAppliedCadences(contactId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!appliedCadences || appliedCadences.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title="No active cadences"
        description="Apply a cadence to start automated task sequences"
        className="py-4"
      />
    );
  }

  const activeCadences = appliedCadences.filter(
    (c) => c.status === 'active' || c.status === 'paused'
  );

  if (activeCadences.length === 0) {
    return (
      <EmptyState
        icon={Workflow}
        title="No active cadences"
        description="Apply a cadence to start automated task sequences"
        className="py-4"
      />
    );
  }

  return (
    <div className="space-y-2">
      {activeCadences.map((cadence) => (
        <ActiveCadenceCard key={cadence.id} appliedCadence={cadence} />
      ))}
    </div>
  );
}

