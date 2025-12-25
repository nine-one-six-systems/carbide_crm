import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import type { OrganizationSearchParams, PaginatedResponse } from '@/types/api';
import type { Organization } from '@/types/database';

import { organizationService } from '../services/organizationService';

export function useOrganizations(params: OrganizationSearchParams) {
  const { initialized, user } = useAuth();
  
  const queryResult = useQuery<PaginatedResponse<Organization>>({
    queryKey: ['organizations', params],
    queryFn: () => organizationService.search(params),
    enabled: initialized && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return queryResult;
}
