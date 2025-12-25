import { useState, useMemo, useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils';
import type { UnifiedTask } from '@/types/database';

import { useBatchTasks, categorizeTasksByDueDate, getOverdueSeverity } from '../hooks/useBatchTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';
import { useTasks } from '../hooks/useTasks';

import { BatchTaskToolbar, type BatchTaskFilters } from './BatchTaskToolbar';
import { BulkActionBar } from './BulkActionBar';
import { TaskCard } from './TaskCard';


const completeTaskSchema = z.object({
  notes: z.string().min(1, 'Notes are required when completing a task'),
});

type CompleteTaskFormValues = z.infer<typeof completeTaskSchema>;

interface SelectedTask {
  taskId: string;
  taskSource: 'cadence' | 'manual';
}

export function BatchTaskView() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<BatchTaskFilters>({
    taskType: 'all',
    dateRange: 'all',
    showOverdue: true,
    showDueToday: true,
    showUpcoming: true,
    showTriaged: false,
    showDismissed: false,
  });

  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
  const [completeDialogOpen, setCompleteDialogOpen] = useState<{
    taskId: string;
    taskSource: 'cadence' | 'manual';
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overdue', 'dueToday', 'upcoming'])
  );

  // Build search params from filters
  const searchParams = useMemo(() => {
    const params: Record<string, unknown> = {
      assignedTo: user?.id,
    };

    // Status filter
    const statuses: string[] = ['pending'];
    if (filters.showTriaged) statuses.push('triaged');
    if (filters.showDismissed) statuses.push('dismissed');
    params.status = statuses;

    // Task type filter
    if (filters.taskType !== 'all') {
      params.taskType = [filters.taskType];
    }

    // Date range filter
    const today = new Date();
    if (filters.dateRange === '7days') {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      params.dueDateTo = endDate.toISOString().split('T')[0];
    } else if (filters.dateRange === '30days') {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);
      params.dueDateTo = endDate.toISOString().split('T')[0];
    } else if (filters.dateRange === 'custom') {
      if (filters.customDateFrom) {
        params.dueDateFrom = filters.customDateFrom;
      }
      if (filters.customDateTo) {
        params.dueDateTo = filters.customDateTo;
      }
    }

    return params;
  }, [filters, user?.id]);

  const { data: allTasks, isLoading, error } = useTasks(searchParams);
  const { complete, triage, dismiss } = useTaskMutations();
  const { bulkComplete, bulkTriage, bulkDismiss } = useBatchTasks();

  const form = useForm<CompleteTaskFormValues>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: {
      notes: '',
    },
  });

  // Categorize tasks
  const categorizedTasks = useMemo(() => {
    if (!allTasks) {
      return { overdue: [], dueToday: [], upcoming: [], triaged: [], dismissed: [] };
    }

    const pending = allTasks.filter((t) => t.status === 'pending');
    const triaged = allTasks.filter((t) => t.status === 'triaged');
    const dismissed = allTasks.filter((t) => t.status === 'dismissed');

    const { overdue, dueToday, upcoming } = categorizeTasksByDueDate(pending);

    return { overdue, dueToday, upcoming, triaged, dismissed };
  }, [allTasks]);

  // Task counts for toolbar
  const taskCounts = useMemo(
    () => ({
      overdue: categorizedTasks.overdue.length,
      dueToday: categorizedTasks.dueToday.length,
      upcoming: categorizedTasks.upcoming.length,
      triaged: categorizedTasks.triaged.length,
      dismissed: categorizedTasks.dismissed.length,
    }),
    [categorizedTasks]
  );

  // Visible tasks based on filters
  const visibleTasks = useMemo(() => {
    const tasks: UnifiedTask[] = [];
    if (filters.showOverdue) tasks.push(...categorizedTasks.overdue);
    if (filters.showDueToday) tasks.push(...categorizedTasks.dueToday);
    if (filters.showUpcoming) tasks.push(...categorizedTasks.upcoming);
    if (filters.showTriaged) tasks.push(...categorizedTasks.triaged);
    if (filters.showDismissed) tasks.push(...categorizedTasks.dismissed);
    return tasks;
  }, [filters, categorizedTasks]);

  // Selection handlers
  const isTaskSelected = useCallback(
    (task: UnifiedTask) =>
      selectedTasks.some(
        (s) => s.taskId === task.id && s.taskSource === task.task_source
      ),
    [selectedTasks]
  );

  const toggleTaskSelection = useCallback((task: UnifiedTask) => {
    setSelectedTasks((prev) => {
      const exists = prev.some(
        (s) => s.taskId === task.id && s.taskSource === task.task_source
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.taskId === task.id && s.taskSource === task.task_source)
        );
      }
      return [...prev, { taskId: task.id, taskSource: task.task_source }];
    });
  }, []);

  const toggleSectionSelection = useCallback(
    (tasks: UnifiedTask[]) => {
      const allSelected = tasks.every((t) => isTaskSelected(t));
      if (allSelected) {
        setSelectedTasks((prev) =>
          prev.filter(
            (s) =>
              !tasks.some(
                (t) => t.id === s.taskId && t.task_source === s.taskSource
              )
          )
        );
      } else {
        setSelectedTasks((prev) => {
          const newSelections = tasks
            .filter((t) => !isTaskSelected(t))
            .map((t) => ({ taskId: t.id, taskSource: t.task_source }));
          return [...prev, ...newSelections];
        });
      }
    },
    [isTaskSelected]
  );

  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  // Section toggle
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Task actions
  const handleComplete = async (values: CompleteTaskFormValues) => {
    if (!completeDialogOpen) return;
    try {
      await complete({
        taskId: completeDialogOpen.taskId,
        taskSource: completeDialogOpen.taskSource,
        notes: values.notes,
      });
      form.reset();
      setCompleteDialogOpen(null);
      toast.success('Task completed');
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const handleTriage = async (taskId: string, taskSource: 'cadence' | 'manual') => {
    try {
      await triage({ taskId, taskSource });
      toast.success('Task triaged');
    } catch {
      toast.error('Failed to triage task');
    }
  };

  const handleDismiss = async (taskId: string, taskSource: 'cadence' | 'manual') => {
    try {
      await dismiss({ taskId, taskSource });
      toast.success('Task dismissed');
    } catch {
      toast.error('Failed to dismiss task');
    }
  };

  // Bulk actions
  const handleBulkComplete = async (notes: string) => {
    try {
      await bulkComplete.mutateAsync({ tasks: selectedTasks, notes });
      toast.success(`${selectedTasks.length} tasks completed`);
      clearSelection();
    } catch {
      toast.error('Failed to complete some tasks');
    }
  };

  const handleBulkTriage = async () => {
    try {
      await bulkTriage.mutateAsync({ tasks: selectedTasks });
      toast.success(`${selectedTasks.length} tasks triaged`);
      clearSelection();
    } catch {
      toast.error('Failed to triage some tasks');
    }
  };

  const handleBulkDismiss = async () => {
    try {
      await bulkDismiss.mutateAsync({ tasks: selectedTasks });
      toast.success(`${selectedTasks.length} tasks dismissed`);
      clearSelection();
    } catch {
      toast.error('Failed to dismiss some tasks');
    }
  };

  // Render task section
  const renderTaskSection = (
    title: string,
    sectionKey: string,
    tasks: UnifiedTask[],
    badgeVariant: 'default' | 'destructive' | 'secondary' | 'outline' = 'default',
    badgeColor?: string
  ) => {
    if (tasks.length === 0) return null;

    const isExpanded = expandedSections.has(sectionKey);
    const allSelected = tasks.every((t) => isTaskSelected(t));
    const someSelected = tasks.some((t) => isTaskSelected(t));

    return (
      <Card key={sectionKey}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement).dataset.indeterminate = String(
                      someSelected && !allSelected
                    );
                  }
                }}
                onCheckedChange={() => toggleSectionSelection(tasks)}
                aria-label={`Select all ${title} tasks`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(sectionKey)}
                className="gap-2 p-0 h-auto hover:bg-transparent"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <CardTitle className="text-base">{title}</CardTitle>
              </Button>
              <Badge variant={badgeVariant} className={badgeColor}>
                {tasks.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="pt-0 space-y-2">
            {tasks.map((task) => (
              <div key={`${task.task_source}-${task.id}`} className="flex items-start gap-3">
                <Checkbox
                  checked={isTaskSelected(task)}
                  onCheckedChange={() => toggleTaskSelection(task)}
                  className="mt-4"
                  aria-label={`Select task ${task.title}`}
                />
                <div className="flex-1 relative">
                  <TaskCard
                    task={task}
                    onComplete={(taskId, taskSource) =>
                      setCompleteDialogOpen({ taskId, taskSource })
                    }
                    onTriage={handleTriage}
                    onDismiss={handleDismiss}
                  />
                  {task.status === 'pending' && (
                    <OverdueBadge dueDate={task.due_date} />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Error loading tasks"
        description={error instanceof Error ? error.message : 'An error occurred'}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <BatchTaskToolbar
        filters={filters}
        onFiltersChange={setFilters}
        taskCounts={taskCounts}
      />

      {visibleTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="You're all caught up! No tasks match your current filters."
        />
      ) : (
        <div className="space-y-4">
          {filters.showOverdue &&
            renderTaskSection(
              'Overdue',
              'overdue',
              categorizedTasks.overdue,
              'destructive'
            )}
          {filters.showDueToday &&
            renderTaskSection(
              'Due Today',
              'dueToday',
              categorizedTasks.dueToday,
              'secondary',
              'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            )}
          {filters.showUpcoming &&
            renderTaskSection(
              'Upcoming',
              'upcoming',
              categorizedTasks.upcoming,
              'secondary'
            )}
          {filters.showTriaged &&
            renderTaskSection(
              'Triaged',
              'triaged',
              categorizedTasks.triaged,
              'secondary',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            )}
          {filters.showDismissed &&
            renderTaskSection(
              'Dismissed',
              'dismissed',
              categorizedTasks.dismissed,
              'outline'
            )}
        </div>
      )}

      <BulkActionBar
        selectedTasks={selectedTasks}
        totalTasks={visibleTasks.length}
        onClearSelection={clearSelection}
        onBulkComplete={handleBulkComplete}
        onBulkTriage={handleBulkTriage}
        onBulkDismiss={handleBulkDismiss}
        isLoading={
          bulkComplete.isPending || bulkTriage.isPending || bulkDismiss.isPending
        }
      />

      {/* Complete Task Dialog */}
      <Dialog
        open={!!completeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteDialogOpen(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Add notes about completing this task (optional).
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleComplete)} className="space-y-4">
              <ValidatedTextarea
                name="notes"
                label="Notes"
                placeholder="Add notes about completing this task..."
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCompleteDialogOpen(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Complete</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Overdue Badge Component
function OverdueBadge({ dueDate }: { dueDate: string }) {
  const severity = getOverdueSeverity(dueDate);
  if (!severity) return null;

  const badgeStyles = {
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    danger: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
    stale: 'bg-red-200 text-red-900 border-red-400',
  };

  const badgeLabels = {
    warning: 'Overdue',
    danger: 'Overdue',
    critical: 'Needs Attention',
    stale: 'Stale',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'absolute top-2 right-2 text-xs font-medium',
        badgeStyles[severity]
      )}
    >
      {badgeLabels[severity]}
    </Badge>
  );
}

