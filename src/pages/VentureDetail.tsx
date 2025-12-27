import { useParams } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityFeed } from '@/features/activities/components/ActivityFeed';

import { useVenture } from '@/features/ventures/hooks/useVenture';
import { useVentureActivity } from '@/features/ventures/hooks/useVentureActivity';
import { VentureHeader } from '@/features/ventures/components/VentureHeader';
import { VentureInfoSidebar } from '@/features/ventures/components/VentureInfoSidebar';
import { VentureRightSidebar } from '@/features/ventures/components/VentureRightSidebar';

export function VentureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: venture, isLoading: ventureLoading } = useVenture(slug);
  const { data: activities, isLoading: activitiesLoading } = useVentureActivity(slug);

  if (ventureLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="flex flex-1">
          <div className="w-72 border-r p-4">
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full" />
          </div>
          <div className="w-80 border-l p-4">
            <Skeleton className="h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Venture not found</h2>
          <p className="text-muted-foreground">
            The venture you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <VentureHeader venture={venture} />

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Info */}
        <div className="w-72 border-r bg-background">
          <VentureInfoSidebar venture={venture} />
        </div>

        {/* Center - Activity Feed */}
        <div className="flex-1 bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Activity</h2>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <ActivityFeed activities={activities} contactId={''} showHeader={false} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No activity yet for this venture
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Pipeline Summary */}
        <div className="w-80 border-l bg-background">
          <VentureRightSidebar venture={venture} />
        </div>
      </div>
    </div>
  );
}

export default VentureDetail;

