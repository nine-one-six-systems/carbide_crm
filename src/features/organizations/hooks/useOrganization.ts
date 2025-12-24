import { useQuery } from '@tanstack/react-query';

import type { Organization } from '@/types/database';

import { organizationService } from '../services/organizationService';

export function useOrganization(id: string | undefined) {
  return useQuery<Organization | null>({
    queryKey: ['organization', id],
    queryFn: () => (id ? organizationService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

