import { useQuery } from '@tanstack/react-query';

import { cadenceService } from '@/features/cadences/services/cadenceService';

export function useCadenceTasks() {
  return useQuery({
    queryKey: ['cadence-tasks'],
    queryFn: () => cadenceService.getContactsWithActiveCadences(),
  });
}

