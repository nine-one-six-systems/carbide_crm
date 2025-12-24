import { useQuery } from '@tanstack/react-query';

import type { OrganizationSearchParams, PaginatedResponse } from '@/types/api';
import type { Organization } from '@/types/database';

import { organizationService } from '../services/organizationService';

export function useOrganizations(params: OrganizationSearchParams) {
  return useQuery<PaginatedResponse<Organization>>({
    queryKey: ['organizations', params],
    queryFn: () => organizationService.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

