import { useQuery } from '@tanstack/react-query';

import type { Activity } from '@/types/database';

import { contactService } from '../services/contactService';

export function useContactActivities(contactId: string | undefined, limit = 50) {
  return useQuery<Activity[]>({
    queryKey: ['contact-activities', contactId, limit],
    queryFn: () =>
      contactId ? contactService.getActivities(contactId, limit) : Promise.resolve([]),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

