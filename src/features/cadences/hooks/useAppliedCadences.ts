import { useQuery } from '@tanstack/react-query';

import type { AppliedCadence } from '@/types/database';

import { cadenceService } from '../services/cadenceService';

export function useAppliedCadences(contactId: string | undefined) {
  return useQuery<AppliedCadence[]>({
    queryKey: ['applied-cadences', contactId],
    queryFn: () =>
      contactId
        ? cadenceService.getAppliedCadences(contactId)
        : Promise.resolve([]),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

