import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVenture(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.detail(slug!),
    queryFn: () => ventureService.getVentureBySlug(slug!),
    enabled: !!slug,
  });
}

