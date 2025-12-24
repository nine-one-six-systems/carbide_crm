import { useQuery } from '@tanstack/react-query';

import type { RelationshipSearchParams, PaginatedResponse } from '@/types/api';
import type { BusinessRelationship } from '@/types/database';

import { relationshipService } from '../services/relationshipService';

export function useRelationships(params: RelationshipSearchParams) {
  return useQuery<PaginatedResponse<BusinessRelationship>>({
    queryKey: ['relationships', params],
    queryFn: () => relationshipService.search(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRelationshipsByStages(type: string, stages: string[]) {
  return useQuery<Record<string, BusinessRelationship[]>>({
    queryKey: ['relationships-by-stages', type, stages],
    queryFn: () => relationshipService.getByStages(type, stages),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

