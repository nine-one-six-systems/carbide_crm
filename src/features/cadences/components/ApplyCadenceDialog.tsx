import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { useAppliedCadenceMutations } from '../hooks/useCadenceMutations';
import { useCadenceTemplates } from '../hooks/useCadenceTemplates';

const applySchema = z.object({
  cadence_template_id: z.string().uuid('Please select a cadence'),
  start_date: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

interface ApplyCadenceDialogProps {
  contactId: string;
  relationshipId?: string;
  trigger?: React.ReactNode;
}

export function ApplyCadenceDialog({
  contactId,
  relationshipId,
  trigger,
}: ApplyCadenceDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: templates } = useCadenceTemplates();
  const { apply, isApplying } = useAppliedCadenceMutations();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      cadence_template_id: '',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const templateOptions =
    templates?.map((t) => ({
      value: t.id,
      label: t.name,
    })) || [];

  const onSubmit = async (values: ApplyFormValues) => {
    try {
      await apply({
        cadence_template_id: values.cadence_template_id,
        contact_id: contactId,
        relationship_id: relationshipId,
        start_date: values.start_date,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error applying cadence:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Apply Cadence</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Cadence</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedSelect
              name="cadence_template_id"
              label="Cadence Template"
              placeholder="Select a cadence"
              options={templateOptions}
            />
            <ValidatedInput
              name="start_date"
              label="Start Date"
              type="date"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isApplying}>
                {isApplying ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

