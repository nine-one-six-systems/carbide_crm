import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type {
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
} from '@/types/api';
import type { Organization } from '@/types/database';

import { organizationService } from '../services/organizationService';

interface MutationCallbacks {
  onSuccess?: (data?: Organization) => void;
  onError?: (error: Error) => void;
}

export function useOrganizationMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: OrganizationCreatePayload) =>
      organizationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create organization',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: OrganizationUpdatePayload) =>
      organizationService.update(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] });
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete organization',
        variant: 'destructive',
      });
    },
  });

  // Wrapper functions that use callback pattern instead of promise-based
  const create = (payload: OrganizationCreatePayload, callbacks?: MutationCallbacks) => {
    createMutation.mutate(payload, {
      onSuccess: (data) => {
        callbacks?.onSuccess?.(data);
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const update = (payload: OrganizationUpdatePayload, callbacks?: MutationCallbacks) => {
    updateMutation.mutate(payload, {
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

