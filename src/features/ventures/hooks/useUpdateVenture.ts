import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { VentureFormValues } from '../types/venture.types';

export function useUpdateVenture(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<VentureFormValues> }) =>
      ventureService.updateVenture(id, values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
      // If slug changed, also invalidate new slug
      if (data.slug !== slug) {
        queryClient.invalidateQueries({ queryKey: ventureKeys.detail(data.slug) });
      }
    },
  });
}

