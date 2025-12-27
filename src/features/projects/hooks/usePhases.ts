import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type { CreatePhasePayload, Phase, UpdatePhasePayload } from '../types/project.types';

import { projectService } from '../services/projectService';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function usePhases(projectId: string | undefined) {
  return useQuery<Phase[]>({
    queryKey: ['phases', projectId],
    queryFn: () => (projectId ? projectService.getPhases(projectId) : Promise.resolve([])),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePhaseMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreatePhasePayload) => projectService.createPhase(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['phases', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Phase created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create phase',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdatePhasePayload) =>
      projectService.updatePhase(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['phases', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Phase updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update phase',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const phase = await projectService.getPhaseById(id);
      await projectService.deletePhase(id);
      return phase;
    },
    onSuccess: (phase) => {
      queryClient.invalidateQueries({ queryKey: ['phases', phase.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', phase.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Phase deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete phase',
        variant: 'destructive',
      });
    },
  });

  const create = (payload: CreatePhasePayload, callbacks?: MutationCallbacks) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const update = (
    id: string,
    payload: UpdatePhasePayload,
    callbacks?: MutationCallbacks
  ) => {
    updateMutation.mutate({ id, ...payload }, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const remove = (id: string, callbacks?: MutationCallbacks) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  return {
    create,
    update,
    delete: remove,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

