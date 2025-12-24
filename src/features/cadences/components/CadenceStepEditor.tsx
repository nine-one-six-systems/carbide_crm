import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { cadenceStepSchema, type CadenceStepValues } from '@/lib/validators/cadence';
import type { CadenceStep } from '@/types/database';

interface CadenceStepEditorProps {
  step?: CadenceStep;
  stepNumber: number;
  onSave: (values: CadenceStepValues) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

const taskTypeOptions = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'send_mailer', label: 'Send Mailer' },
  { value: 'other', label: 'Other' },
];

export function CadenceStepEditor({
  step,
  stepNumber,
  onSave,
  onDelete,
  onCancel,
}: CadenceStepEditorProps) {
  const form = useForm<CadenceStepValues>({
    resolver: zodResolver(cadenceStepSchema),
    defaultValues: step
      ? {
          step_number: step.step_number,
          name: step.name,
          task_type: step.task_type,
          day_offset: step.day_offset,
          description: step.description || undefined,
        }
      : {
          step_number: stepNumber,
          name: '',
          task_type: 'email',
          day_offset: 0,
          description: undefined,
        },
  });

  const onSubmit = (values: CadenceStepValues) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Step {stepNumber}</h4>
          <div className="flex gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                aria-label="Delete step"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
        <ValidatedInput name="name" label="Step Name" />
        <ValidatedSelect
          name="task_type"
          label="Task Type"
          options={taskTypeOptions}
        />
        <ValidatedInput
          name="day_offset"
          label="Day Offset"
          type="number"
        />
        <ValidatedTextarea
          name="description"
          label="Description"
          rows={3}
        />
        <Button type="submit">{step ? 'Update Step' : 'Add Step'}</Button>
      </form>
    </Form>
  );
}

