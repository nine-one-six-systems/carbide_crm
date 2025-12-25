import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import { taskService } from '@/features/tasks/services/taskService';

export function useProspectingTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['prospecting-tasks', user?.id],
    queryFn: () => taskService.getContactsWithPendingTasks(user?.id || undefined),
    enabled: !!user,
  });
}

