import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVentureActivity(slug: string | undefined, limit = 20) {
  return useQuery({
    queryKey: [...ventureKeys.activity(slug!), limit],
    queryFn: () => ventureService.getVentureActivity(slug!, limit),
    enabled: !!slug,
  });
}

