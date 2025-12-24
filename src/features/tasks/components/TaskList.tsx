import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import type { TaskSearchParams } from '@/types/api';

import { useTaskMutations } from '../hooks/useTaskMutations';
import { useTasks } from '../hooks/useTasks';

import { TaskCard } from './TaskCard';

interface TaskListProps {
  searchParams?: TaskSearchParams;
  showActions?: boolean;
}

const completeTaskSchema = z.object({
  notes: z.string().min(1, 'Notes are required when completing a task'),
});

type CompleteTaskFormValues = z.infer<typeof completeTaskSchema>;

export function TaskList({ searchParams = {}, showActions = true }: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks(searchParams);
  const { complete, triage, dismiss } = useTaskMutations();
  const [completeDialogOpen, setCompleteDialogOpen] = useState<{
    taskId: string;
    taskSource: 'cadence' | 'manual';
  } | null>(null);

  const form = useForm<CompleteTaskFormValues>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: {
      notes: '',
    },
  });

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
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTriage = async (taskId: string, taskSource: 'cadence' | 'manual') => {
    try {
      await triage({ taskId, taskSource });
    } catch (error) {
      console.error('Error triaging task:', error);
    }
  };

  const handleDismiss = async (taskId: string, taskSource: 'cadence' | 'manual') => {
    try {
      await dismiss({ taskId, taskSource });
    } catch (error) {
      console.error('Error dismissing task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
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

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="You're all caught up!"
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={`${task.task_source}-${task.id}`}
            task={task}
            onComplete={
              showActions
                ? (taskId, taskSource) =>
                    setCompleteDialogOpen({ taskId, taskSource })
                : undefined
            }
            onTriage={showActions ? handleTriage : undefined}
            onDismiss={showActions ? handleDismiss : undefined}
          />
        ))}
      </div>
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
    </>
  );
}

