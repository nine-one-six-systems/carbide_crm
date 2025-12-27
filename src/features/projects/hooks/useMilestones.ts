import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type {
  CreateMilestonePayload,
  Milestone,
  UpdateMilestonePayload,
} from '../types/project.types';

import { projectService } from '../services/projectService';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useMilestones(phaseId: string | undefined) {
  return useQuery<Milestone[]>({
    queryKey: ['milestones', phaseId],
    queryFn: () => (phaseId ? projectService.getMilestones(phaseId) : Promise.resolve([])),
    enabled: !!phaseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useMilestoneMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: CreateMilestonePayload) => {
      const milestone = await projectService.createMilestone(payload);
      const phase = await projectService.getPhaseById(payload.phaseId);
      return { milestone, projectId: phase.projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Milestone created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create milestone',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateMilestonePayload) => {
      const milestone = await projectService.updateMilestone(id, payload);
      const phase = await projectService.getPhaseById(milestone.phaseId);
      return { milestone, projectId: phase.projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Milestone updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update milestone',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const milestone = await projectService.getMilestoneById(id);
      const phase = await projectService.getPhaseById(milestone.phaseId);
      await projectService.deleteMilestone(id);
      return { projectId: phase.projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Milestone deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete milestone',
        variant: 'destructive',
      });
    },
  });

  const create = (payload: CreateMilestonePayload, callbacks?: MutationCallbacks) => {
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
    payload: UpdateMilestonePayload,
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

