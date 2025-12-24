import { useQuery } from '@tanstack/react-query';

import { useActivitiesRealtime } from '@/hooks/useRealtimeSubscription';
import type { ActivitySearchParams, PaginatedResponse } from '@/types/api';
import type { Activity } from '@/types/database';

import { activityService } from '../services/activityService';

export function useActivities(params: ActivitySearchParams = {}) {
  // Enable realtime updates for activities
  useActivitiesRealtime(params.contactId);

  return useQuery<PaginatedResponse<Activity>>({
    queryKey: ['activities', params],
    queryFn: () => activityService.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

