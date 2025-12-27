import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVentureStats(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.stats(slug!),
    queryFn: () => ventureService.getVentureStats(slug!),
    enabled: !!slug,
  });
}

export function useVenturePipelineBreakdown(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.pipeline(slug!),
    queryFn: () => ventureService.getVenturePipelineBreakdown(slug!),
    enabled: !!slug,
  });
}

