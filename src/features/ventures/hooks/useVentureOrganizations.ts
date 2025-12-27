import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { LinkOrganizationFormValues } from '../types/venture.types';

export function useVentureOrganizations(ventureId: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.organizations(ventureId!),
    queryFn: () => ventureService.getVentureOrganizations(ventureId!),
    enabled: !!ventureId,
  });
}

export function useLinkOrganization(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, userId }: { values: LinkOrganizationFormValues; userId: string }) =>
      ventureService.linkOrganization(ventureId, values, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.organizations(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

export function useUnlinkOrganization(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.unlinkOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.organizations(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

