import { Users } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactSearchParams } from '@/types/api';

import { useContacts } from '../hooks/useContacts';

import { ContactCard } from './ContactCard';



interface ContactListProps {
  searchParams: ContactSearchParams;
}

export function ContactList({ searchParams }: ContactListProps) {
  const { data, isLoading, error } = useContacts(searchParams);

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}

