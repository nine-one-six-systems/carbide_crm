import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Activity, ActivityType } from '@/types/database';

import { ActivityItem } from './ActivityItem';

type ActivityFilter = 'all' | 'calls' | 'emails' | 'texts' | 'meetings' | 'notes' | 'system';

const filterConfig: Record<ActivityFilter, { label: string; types: ActivityType[] }> = {
  all: { label: 'All', types: [] },
  calls: {
    label: 'Calls',
    types: ['call_inbound', 'call_outbound'],
  },
  emails: {
    label: 'Emails',
    types: ['email_inbound', 'email_outbound'],
  },
  texts: {
    label: 'Texts',
    types: ['text_inbound', 'text_outbound'],
  },
  meetings: {
    label: 'Meetings',
    types: ['meeting_in_person', 'meeting_virtual'],
  },
  notes: {
    label: 'Notes',
    types: ['note'],
  },
  system: {
    label: 'System',
    types: [
      'stage_change',
      'relationship_created',
      'cadence_applied',
      'cadence_cleared',
      'cadence_paused',
      'cadence_resumed',
      'task_completed',
      'task_triaged',
      'task_dismissed',
    ],
  },
};

interface ActivityFeedProps {
  activities: Activity[];
  showFilters?: boolean;
}

export function ActivityFeed({ activities, showFilters = true }: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    const allowedTypes = filterConfig[filter].types;
    return activities.filter((a) => allowedTypes.includes(a.type));
  }, [activities, filter]);

  const filterCounts = useMemo(() => {
    const counts: Record<ActivityFilter, number> = {
      all: activities.length,
      calls: 0,
      emails: 0,
      texts: 0,
      meetings: 0,
      notes: 0,
      system: 0,
    };

    activities.forEach((activity) => {
      Object.entries(filterConfig).forEach(([key, config]) => {
        if (key !== 'all' && config.types.includes(activity.type)) {
          counts[key as ActivityFilter]++;
        }
      });
    });

    return counts;
  }, [activities]);

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No activities yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ActivityFilter)}>
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {(Object.keys(filterConfig) as ActivityFilter[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1 text-sm"
              >
                {filterConfig[key].label}
                {filterCounts[key] > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 min-w-5 px-1 text-xs"
                  >
                    {filterCounts[key]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {filteredActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No {filterConfig[filter].label.toLowerCase()} activities
        </p>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

