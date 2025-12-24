import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/features/auth/context/AuthContext';

import { taskService } from '../services/taskService';

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createMutation = useMutation({
    mutationFn: taskService.createManualTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({
      taskId,
      taskSource,
      notes,
    }: {
      taskId: string;
      taskSource: 'cadence' | 'manual';
      notes: string;
    }) => taskService.completeTask(taskId, taskSource, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task completed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete task',
        variant: 'destructive',
      });
    },
  });

  const triageMutation = useMutation({
    mutationFn: ({
      taskId,
      taskSource,
    }: {
      taskId: string;
      taskSource: 'cadence' | 'manual';
    }) => taskService.triageTask(taskId, taskSource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task triaged',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to triage task',
        variant: 'destructive',
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: ({
      taskId,
      taskSource,
    }: {
      taskId: string;
      taskSource: 'cadence' | 'manual';
    }) => taskService.dismissTask(taskId, taskSource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task dismissed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to dismiss task',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteManualTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    complete: completeMutation.mutateAsync,
    triage: triageMutation.mutateAsync,
    dismiss: dismissMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isCompleting: completeMutation.isPending,
    isTriaging: triageMutation.isPending,
    isDismissing: dismissMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

