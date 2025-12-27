import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import type { VentureFilters } from '../types/venture.types';

export const ventureKeys = {
  all: ['ventures'] as const,
  lists: () => [...ventureKeys.all, 'list'] as const,
  list: (filters?: VentureFilters) => [...ventureKeys.lists(), filters] as const,
  details: () => [...ventureKeys.all, 'detail'] as const,
  detail: (slug: string) => [...ventureKeys.details(), slug] as const,
  stats: (slug: string) => [...ventureKeys.detail(slug), 'stats'] as const,
  pipeline: (slug: string) => [...ventureKeys.detail(slug), 'pipeline'] as const,
  organizations: (id: string) => [...ventureKeys.all, 'organizations', id] as const,
  team: (id: string) => [...ventureKeys.all, 'team', id] as const,
  activity: (slug: string) => [...ventureKeys.detail(slug), 'activity'] as const,
  active: () => [...ventureKeys.all, 'active'] as const,
};

export function useVentures(filters?: VentureFilters) {
  return useQuery({
    queryKey: ventureKeys.list(filters),
    queryFn: () => ventureService.getVentures(filters),
  });
}

export function useActiveVentures() {
  return useQuery({
    queryKey: ventureKeys.active(),
    queryFn: () => ventureService.getActiveVentures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

