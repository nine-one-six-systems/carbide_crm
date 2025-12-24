import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type { BusinessRelationship } from '@/types/database';

import { relationshipService } from '../services/relationshipService';

export function useRelationshipMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: relationshipService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      toast({
        title: 'Success',
        description: 'Relationship created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create relationship',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<BusinessRelationship>) =>
      relationshipService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      queryClient.invalidateQueries({ queryKey: ['relationship', data.id] });
      toast({
        title: 'Success',
        description: 'Relationship updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update relationship',
        variant: 'destructive',
      });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, metadata }: { id: string; stage: string; metadata?: Record<string, unknown> }) =>
      relationshipService.updateStage(id, stage, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      toast({
        title: 'Success',
        description: 'Stage updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stage',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => relationshipService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      toast({
        title: 'Success',
        description: 'Relationship deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete relationship',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

