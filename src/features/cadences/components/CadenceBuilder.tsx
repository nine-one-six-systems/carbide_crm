import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  cadenceTemplateFormSchema,
  type CadenceTemplateFormValues,
  type CadenceStepValues,
} from '@/lib/validators/cadence';
import type { CadenceTemplate, CadenceStep } from '@/types/database';

import { useCadenceTemplateMutations, useCadenceStepMutations } from '../hooks/useCadenceMutations';

import { CadenceStepEditor } from './CadenceStepEditor';

interface CadenceBuilderProps {
  template?: CadenceTemplate;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CadenceBuilder({
  template,
  onSuccess,
  onCancel,
}: CadenceBuilderProps) {
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const { create: createTemplate, update: updateTemplate } = useCadenceTemplateMutations();
  const { create: createStep, update: updateStep, delete: deleteStep } = useCadenceStepMutations();

  const form = useForm<CadenceTemplateFormValues>({
    resolver: zodResolver(cadenceTemplateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || undefined,
          relationship_types: template.relationship_types || [],
          is_active: template.is_active,
          steps: (template.steps || []).map((step) => ({
            step_number: step.step_number,
            name: step.name,
            task_type: step.task_type,
            day_offset: step.day_offset,
            description: step.description || undefined,
          })),
        }
      : {
          name: '',
          description: undefined,
          relationship_types: [],
          is_active: true,
          steps: [],
        },
  });

  const steps = form.watch('steps');

  const handleAddStep = () => {
    const newStepNumber = steps.length + 1;
    form.setValue('steps', [
      ...steps,
      {
        step_number: newStepNumber,
        name: '',
        task_type: 'email',
        day_offset: 0,
        description: undefined,
      },
    ]);
    setEditingStepIndex(steps.length);
  };

  const handleSaveStep = (values: CadenceStepValues) => {
    const currentSteps = form.getValues('steps');
    if (editingStepIndex !== null) {
      const updatedSteps = [...currentSteps];
      updatedSteps[editingStepIndex] = values;
      form.setValue('steps', updatedSteps);
    } else {
      form.setValue('steps', [...currentSteps, values]);
    }
    setEditingStepIndex(null);
  };

  const handleDeleteStep = (index: number) => {
    const currentSteps = form.getValues('steps');
    const updatedSteps = currentSteps.filter((_, i) => i !== index);
    // Re-number steps
    const renumberedSteps = updatedSteps.map((step, i) => ({
      ...step,
      step_number: i + 1,
    }));
    form.setValue('steps', renumberedSteps);
    setEditingStepIndex(null);
  };

  const onSubmit = async (values: CadenceTemplateFormValues) => {
    try {
      let templateId: string;
      if (template) {
        await updateTemplate({
          id: template.id,
          name: values.name,
          description: values.description || null,
          relationship_types: values.relationship_types,
          is_active: values.is_active,
        });
        templateId = template.id;

        // Update steps
        const existingSteps = template.steps || [];
        const newSteps = values.steps;

        // Delete removed steps
        for (const existingStep of existingSteps) {
          if (!newSteps.find((s) => s.step_number === existingStep.step_number)) {
            await deleteStep(existingStep.id);
          }
        }

        // Update or create steps
        for (const step of newSteps) {
          const existingStep = existingSteps.find(
            (s) => s.step_number === step.step_number
          );
          if (existingStep) {
            await updateStep({ id: existingStep.id, ...step });
          } else {
            await createStep({ cadence_id: templateId, ...step });
          }
        }
      } else {
        const newTemplate = await createTemplate({
          name: values.name,
          description: values.description || undefined,
          relationship_types: values.relationship_types,
          is_active: values.is_active,
        });
        templateId = newTemplate.id;

        // Create steps
        for (const step of values.steps) {
          await createStep({ cadence_id: templateId, ...step });
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving cadence:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ValidatedInput name="name" label="Cadence Name" />
        <ValidatedTextarea name="description" label="Description" rows={3} />
        <div>
          <h3 className="mb-4 font-semibold">Steps</h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index}>
                {editingStepIndex === index ? (
                  <CadenceStepEditor
                    step={step as CadenceStep}
                    stepNumber={index + 1}
                    onSave={handleSaveStep}
                    onDelete={() => handleDeleteStep(index)}
                    onCancel={() => setEditingStepIndex(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">
                        Step {step.step_number}: {step.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.task_type} • Day {step.day_offset}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingStepIndex(index)}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddStep}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {template ? 'Update Cadence' : 'Create Cadence'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

