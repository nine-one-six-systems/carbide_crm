import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type {
  CreateProjectPayload,
  UpdateProjectPayload,
} from '../types/project.types';

import { projectService } from '../services/projectService';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(payload),
    onSuccess: (data) => {
      // Invalidate and refetch projects list to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateProjectPayload) =>
      projectService.update(id, payload),
    onSuccess: (data) => {
      // Invalidate and refetch projects list to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
      queryClient.invalidateQueries({ queryKey: ['phases', data.id] });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch projects list to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.refetchQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  const create = (payload: CreateProjectPayload, callbacks?: MutationCallbacks) => {
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
    payload: UpdateProjectPayload,
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

