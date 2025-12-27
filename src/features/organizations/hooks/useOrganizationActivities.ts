import { useQuery } from '@tanstack/react-query';

import type { Activity } from '@/types/database';

import { activityService } from '@/features/activities/services/activityService';

export function useOrganizationActivities(organizationId: string | undefined, limit = 50) {
  return useQuery<Activity[]>({
    queryKey: ['organization-activities', organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];
      const result = await activityService.search({
        organizationId,
        page: 1,
        pageSize: limit,
        sortBy: 'occurred_at',
        sortOrder: 'desc',
      });
      return result.data;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

