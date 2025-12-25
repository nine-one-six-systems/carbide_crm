import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { DashboardActivity } from '../types/leadershipDashboard.types';

interface RecentActivityCardProps {
  activities: DashboardActivity[];
  maxItems?: number;
}

/**
 * Format date to relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

/**
 * Card displaying recent activity across all pipelines
 */
export function RecentActivityCard({
  activities,
  maxItems = 5,
}: RecentActivityCardProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.slice(0, maxItems).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="font-medium">{activity.entityName}</span>
                <span className="text-xs text-muted-foreground">
                  {activity.type.replace(/_/g, ' ')} · {activity.userName}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.occurredAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

