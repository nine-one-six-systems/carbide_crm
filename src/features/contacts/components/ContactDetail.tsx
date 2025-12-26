import { QueryErrorBoundary } from '@/components/error/ErrorBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityFeed } from '@/features/activities/components/ActivityFeed';
import { useContactNavigation } from '@/hooks/useContactNavigation';

import { useContact, useContactActivities } from '../hooks';
import { ContactInfoSidebar } from './ContactInfoSidebar';
import { ContactRightSidebar } from './ContactRightSidebar';

interface ContactDetailProps {
  contactId: string;
}

function ContactDetailContent({ contactId }: ContactDetailProps) {
  const { data: contact, isLoading, error } = useContact(contactId);
  const { data: activities } = useContactActivities(contactId);
  const { currentIndex, totalContacts } = useContactNavigation();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 border-r bg-white">
            <div className="p-4 space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          </aside>
          <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <Skeleton className="h-full" />
          </main>
          <aside className="w-72 border-l bg-white">
            <div className="p-4 space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <EmptyState
        title="Contact not found"
        description="The contact you're looking for doesn't exist or has been deleted"
      />
    );
  }

  const lastActivity = activities && activities.length > 0 ? activities[0].occurred_at : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Fixed width 320px (w-80) */}
        <aside className="w-80 border-r bg-white flex-shrink-0">
          <ContactInfoSidebar 
            contact={contact}
            contactIndex={currentIndex}
            totalContacts={totalContacts}
            lastActivityTime={lastActivity}
          />
        </aside>

        {/* Center - Flexible width */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {activities && activities.length > 0 ? (
            <ActivityFeed activities={activities} contactId={contact.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                title="No activity"
                description="Activity will appear here as you interact with this contact"
              />
            </div>
          )}
        </main>

        {/* Right Sidebar - Fixed width 288px (w-72) */}
        <aside className="w-72 border-l bg-white flex-shrink-0">
          <ContactRightSidebar contact={contact} />
        </aside>
      </div>
    </div>
  );
}

export function ContactDetail(props: ContactDetailProps) {
  return (
    <QueryErrorBoundary>
      <ContactDetailContent {...props} />
    </QueryErrorBoundary>
  );
}

