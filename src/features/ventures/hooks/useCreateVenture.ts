import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { VentureFormValues } from '../types/venture.types';

export function useCreateVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VentureFormValues) => ventureService.createVenture(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}

