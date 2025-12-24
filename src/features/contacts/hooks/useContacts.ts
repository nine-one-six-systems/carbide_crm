import { useQuery } from '@tanstack/react-query';

import type { ContactSearchParams, PaginatedResponse } from '@/types/api';
import type { Contact } from '@/types/database';

import { contactService } from '../services/contactService';

export function useContacts(params: ContactSearchParams) {
  return useQuery<PaginatedResponse<Contact>>({
    queryKey: ['contacts', params],
    queryFn: () => contactService.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

