import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useArchiveVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.archiveVenture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}

export function useDeleteVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.deleteVenture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}

