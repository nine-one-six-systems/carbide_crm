import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@/components/ui/use-toast';

import { activityService } from '../services/activityService';

export function useActivityMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: activityService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (data.contact_id) {
        queryClient.invalidateQueries({
          queryKey: ['contact-activities', data.contact_id],
        });
      }
      if (data.organization_id) {
        queryClient.invalidateQueries({
          queryKey: ['organization-activities', data.organization_id],
        });
      }
      toast({
        title: 'Success',
        description: 'Activity logged successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log activity',
        variant: 'destructive',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

