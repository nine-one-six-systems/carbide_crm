import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import type { CadenceTemplate, CadenceStep, AppliedCadence } from '@/types/database';

import { cadenceService } from '../services/cadenceService';

export function useCadenceTemplateMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: cadenceService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadence-templates'] });
      toast({
        title: 'Success',
        description: 'Cadence template created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create cadence template',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CadenceTemplate>) =>
      cadenceService.updateTemplate(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cadence-templates'] });
      queryClient.invalidateQueries({ queryKey: ['cadence-template', data.id] });
      toast({
        title: 'Success',
        description: 'Cadence template updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cadence template',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cadenceService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadence-templates'] });
      toast({
        title: 'Success',
        description: 'Cadence template deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete cadence template',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCadenceStepMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: cadenceService.createStep,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cadence-template', data.cadence_id] });
      toast({
        title: 'Success',
        description: 'Cadence step created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create cadence step',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CadenceStep>) =>
      cadenceService.updateStep(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadence-template'] });
      toast({
        title: 'Success',
        description: 'Cadence step updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cadence step',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cadenceService.deleteStep(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadence-template'] });
      toast({
        title: 'Success',
        description: 'Cadence step deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete cadence step',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useAppliedCadenceMutations() {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: cadenceService.applyCadence,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applied-cadences', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Cadence applied successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply cadence',
        variant: 'destructive',
      });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => cadenceService.pauseCadence(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applied-cadences', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Cadence paused successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to pause cadence',
        variant: 'destructive',
      });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => cadenceService.resumeCadence(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applied-cadences', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Cadence resumed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resume cadence',
        variant: 'destructive',
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cadenceService.clearCadence(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applied-cadences', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Cadence cleared successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cadence',
        variant: 'destructive',
      });
    },
  });

  return {
    apply: applyMutation.mutateAsync,
    pause: pauseMutation.mutateAsync,
    resume: resumeMutation.mutateAsync,
    clear: clearMutation.mutateAsync,
    isApplying: applyMutation.isPending,
    isPausing: pauseMutation.isPending,
    isResuming: resumeMutation.isPending,
    isClearing: clearMutation.isPending,
  };
}

