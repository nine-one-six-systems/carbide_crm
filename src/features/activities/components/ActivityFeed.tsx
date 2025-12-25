import { useState, useMemo } from 'react';

import { Filter, FileText, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Activity, ActivityType } from '@/types/database';

import { ActivityItem } from './ActivityItem';
import { ActivityFeedHeader } from './ActivityFeedHeader';

type ActivityFilter = 'all' | 'notes' | 'files' | 'starred';

const filterConfig: Record<ActivityFilter, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: 'All', icon: FileText },
  notes: { label: 'Notes', icon: FileText },
  files: { label: 'Files', icon: FileText },
  starred: { label: 'Starred', icon: Star },
};

interface ActivityFeedProps {
  activities: Activity[];
  contactId: string;
  showHeader?: boolean;
}

export function ActivityFeed({ activities, contactId, showHeader = true }: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    if (filter === 'notes') {
      return activities.filter((a) => a.type === 'note');
    }
    if (filter === 'files') {
      // Files filter - placeholder for future file attachments
      return [];
    }
    if (filter === 'starred') {
      // Starred filter - placeholder for future starring feature
      return [];
    }
    return activities;
  }, [activities, filter]);

  const filterCounts = useMemo(() => {
    const notesCount = activities.filter((a) => a.type === 'note').length;
    return {
      all: activities.length,
      notes: notesCount,
      files: 0, // Placeholder
      starred: 0, // Placeholder
    };
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      {showHeader && <ActivityFeedHeader contactId={contactId} />}
      
      {/* Activity Filters */}
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {(Object.keys(filterConfig) as ActivityFilter[]).map((key) => {
            const Icon = filterConfig[key].icon;
            const count = filterCounts[key];
            const isActive = filter === key;
            
            return (
              <Button
                key={key}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-full px-3 h-7 text-sm ${
                  isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                }`}
                onClick={() => setFilter(key)}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {filterConfig[key].label}
                {count > 0 && (
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className="ml-1.5 h-4 min-w-4 px-1 text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" className="h-7">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          Filters
        </Button>
      </div>

      {/* Activity Timeline */}
      <ScrollArea className="flex-1">
        <div className="p-4">
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
      </ScrollArea>
    </div>
  );
}

