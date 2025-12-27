import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { milestoneFormSchema, type MilestoneFormValues } from '@/lib/validators/project';
import type { Milestone } from '../types/project.types';

import { useMilestoneMutations } from '../hooks/useMilestones';

interface MilestoneFormProps {
  phaseId: string;
  milestone?: Milestone;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MilestoneForm({
  phaseId,
  milestone,
  onSuccess,
  onCancel,
}: MilestoneFormProps) {
  const { create, update, isCreating, isUpdating } = useMilestoneMutations();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: milestone
      ? {
          name: milestone.name,
          description: milestone.description || '',
          targetDate: milestone.targetDate
            ? new Date(milestone.targetDate).toISOString().split('T')[0]
            : '',
          completed: milestone.completed,
        }
      : {
          name: '',
          description: '',
          targetDate: '',
          completed: false,
        },
  });

  const onSubmit = (values: MilestoneFormValues) => {
    const callbacks = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (milestone) {
      update(milestone.id, values, callbacks);
    } else {
      create({ phaseId, ...values }, callbacks);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ValidatedInput name="name" label="Milestone Name" />

        <ValidatedTextarea name="description" label="Description" rows={4} />

        <ValidatedInput name="targetDate" label="Target Date" type="date" />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? 'Saving...'
              : milestone
                ? 'Update Milestone'
                : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

