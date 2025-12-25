import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import type { ContactSearchParams, PaginatedResponse } from '@/types/api';
import type { Contact } from '@/types/database';

import { contactService } from '../services/contactService';

export function useContacts(params: ContactSearchParams) {
  const { initialized, user } = useAuth();
  
  const queryResult = useQuery<PaginatedResponse<Contact>>({
    queryKey: ['contacts', params],
    queryFn: () => {
      // Use searchWithTasks if task/cadence filters are present
      if (params.hasPendingCadenceTasks || params.hasActiveCadences) {
        return contactService.searchWithTasks(params);
      }
      return contactService.search(params);
    },
    enabled: initialized && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return queryResult;
}
