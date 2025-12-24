import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/AuthContext';
import { useTasksRealtime } from '@/hooks/useRealtimeSubscription';
import type { TaskSearchParams } from '@/types/api';
import type { UnifiedTask } from '@/types/database';

import { taskService } from '../services/taskService';

export function useTasks(params: TaskSearchParams = {}) {
  const { user } = useAuth();

  // Enable realtime updates for tasks
  useTasksRealtime(user?.id);

  return useQuery<UnifiedTask[]>({
    queryKey: ['tasks', user?.id, params],
    queryFn: () =>
      user ? taskService.getUserTasks(user.id, params) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

