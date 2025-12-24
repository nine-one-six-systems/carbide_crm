import { useQuery } from '@tanstack/react-query';

import type { BusinessRelationship } from '@/types/database';

import { relationshipService } from '../services/relationshipService';

export function useRelationship(id: string | undefined) {
  return useQuery<BusinessRelationship | null>({
    queryKey: ['relationship', id],
    queryFn: () => (id ? relationshipService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

