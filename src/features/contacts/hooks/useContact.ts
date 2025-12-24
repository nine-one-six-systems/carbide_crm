import { useQuery } from '@tanstack/react-query';

import type { Contact } from '@/types/database';

import { contactService } from '../services/contactService';

export function useContact(id: string | undefined) {
  return useQuery<Contact | null>({
    queryKey: ['contact', id],
    queryFn: () => (id ? contactService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

