import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { phaseFormSchema, type PhaseFormValues } from '@/lib/validators/project';
import { PHASE_STATUS_LABELS, type Phase } from '../types/project.types';

import { usePhaseMutations } from '../hooks/usePhases';

interface PhaseFormProps {
  projectId: string;
  phase?: Phase;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PhaseForm({ projectId, phase, onSuccess, onCancel }: PhaseFormProps) {
  const { create, update, isCreating, isUpdating } = usePhaseMutations();

  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: phase
      ? {
          name: phase.name,
          description: phase.description || '',
          startDate: phase.startDate ? new Date(phase.startDate).toISOString().split('T')[0] : '',
          targetDate: phase.targetDate ? new Date(phase.targetDate).toISOString().split('T')[0] : '',
          status: phase.status,
        }
      : {
          name: '',
          description: '',
          startDate: '',
          targetDate: '',
          status: 'not_started',
        },
  });

  const onSubmit = (values: PhaseFormValues) => {
    const callbacks = {
      onSuccess: () => {
        onSuccess?.();
      },
    };

    if (phase) {
      update(phase.id, values, callbacks);
    } else {
      create({ projectId, ...values }, callbacks);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ValidatedInput name="name" label="Phase Name" />

        <ValidatedTextarea name="description" label="Description" rows={4} />

        <div className="grid gap-4 md:grid-cols-2">
          <ValidatedInput name="startDate" label="Start Date" type="date" />
          <ValidatedInput name="targetDate" label="Target Date" type="date" />
        </div>

        <ValidatedSelect
          name="status"
          label="Status"
          placeholder="Select status"
          options={Object.entries(PHASE_STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'Saving...' : phase ? 'Update Phase' : 'Create Phase'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

