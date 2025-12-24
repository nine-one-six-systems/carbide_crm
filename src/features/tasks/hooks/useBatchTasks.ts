import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UnifiedTask } from '@/types/database';

import { taskService } from '../services/taskService';

interface BulkCompleteParams {
  tasks: Array<{ taskId: string; taskSource: 'cadence' | 'manual' }>;
  notes: string;
}

interface BulkTriageParams {
  tasks: Array<{ taskId: string; taskSource: 'cadence' | 'manual' }>;
}

interface BulkDismissParams {
  tasks: Array<{ taskId: string; taskSource: 'cadence' | 'manual' }>;
}

export function useBatchTasks() {
  const queryClient = useQueryClient();

  const bulkComplete = useMutation({
    mutationFn: async ({ tasks, notes }: BulkCompleteParams) => {
      const results = await Promise.allSettled(
        tasks.map(({ taskId, taskSource }) =>
          taskService.completeTask(taskId, taskSource, notes)
        )
      );
      
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to complete ${failed.length} of ${tasks.length} tasks`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const bulkTriage = useMutation({
    mutationFn: async ({ tasks }: BulkTriageParams) => {
      const results = await Promise.allSettled(
        tasks.map(({ taskId, taskSource }) =>
          taskService.triageTask(taskId, taskSource)
        )
      );
      
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to triage ${failed.length} of ${tasks.length} tasks`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const bulkDismiss = useMutation({
    mutationFn: async ({ tasks }: BulkDismissParams) => {
      const results = await Promise.allSettled(
        tasks.map(({ taskId, taskSource }) =>
          taskService.dismissTask(taskId, taskSource)
        )
      );
      
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to dismiss ${failed.length} of ${tasks.length} tasks`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    bulkComplete,
    bulkTriage,
    bulkDismiss,
  };
}

// Helper to categorize tasks by overdue status
export function categorizeTasksByDueDate(tasks: UnifiedTask[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue: UnifiedTask[] = [];
  const dueToday: UnifiedTask[] = [];
  const upcoming: UnifiedTask[] = [];

  tasks.forEach((task) => {
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      overdue.push(task);
    } else if (dueDate.getTime() === today.getTime()) {
      dueToday.push(task);
    } else {
      upcoming.push(task);
    }
  });

  return { overdue, dueToday, upcoming };
}

// Helper to get overdue severity
export function getOverdueSeverity(dueDate: string): 'warning' | 'danger' | 'critical' | 'stale' | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 0) return null;
  if (daysOverdue <= 3) return 'warning'; // Yellow/Orange
  if (daysOverdue <= 7) return 'danger'; // Red
  if (daysOverdue <= 30) return 'critical'; // Red + "Needs Attention"
  return 'stale'; // Red + "Stale"
}

