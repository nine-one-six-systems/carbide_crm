import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { AddTeamMemberFormValues } from '../types/venture.types';

export function useVentureTeam(ventureId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: [...ventureKeys.team(ventureId!), includeInactive],
    queryFn: () => ventureService.getVentureTeam(ventureId!, includeInactive),
    enabled: !!ventureId,
  });
}

export function useAddTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, userId }: { values: AddTeamMemberFormValues; userId: string }) =>
      ventureService.addTeamMember(ventureId, values, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

export function useUpdateTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<{ role: string; is_active: boolean; end_date: string | null }> }) =>
      ventureService.updateTeamMember(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
    },
  });
}

export function useRemoveTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

