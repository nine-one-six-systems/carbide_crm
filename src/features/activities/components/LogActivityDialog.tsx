import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { useActivityMutations } from '../hooks/useActivityMutations';

const activitySchema = z.object({
  type: z.string().min(1, 'Please select an activity type'),
  subject: z.string().optional(),
  notes: z.string().optional(),
  occurred_at: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

const activityTypeOptions = [
  { value: 'call_inbound', label: 'Inbound Call' },
  { value: 'call_outbound', label: 'Outbound Call' },
  { value: 'email_inbound', label: 'Inbound Email' },
  { value: 'email_outbound', label: 'Outbound Email' },
  { value: 'text_inbound', label: 'Inbound Text' },
  { value: 'text_outbound', label: 'Outbound Text' },
  { value: 'meeting_in_person', label: 'In-Person Meeting' },
  { value: 'meeting_virtual', label: 'Virtual Meeting' },
  { value: 'note', label: 'Note' },
];

interface LogActivityDialogProps {
  contactId?: string;
  organizationId?: string;
  relationshipId?: string;
  trigger?: React.ReactNode;
}

export function LogActivityDialog({
  contactId,
  organizationId,
  relationshipId,
  trigger,
}: LogActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const { create, isCreating } = useActivityMutations();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: '',
      subject: '',
      notes: '',
      occurred_at: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      await create({
        type: values.type,
        contact_id: contactId,
        organization_id: organizationId,
        relationship_id: relationshipId,
        subject: values.subject || undefined,
        notes: values.notes || undefined,
        occurred_at: values.occurred_at
          ? new Date(values.occurred_at).toISOString()
          : undefined,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Log Activity</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedSelect
              name="type"
              label="Activity Type"
              placeholder="Select activity type"
              options={activityTypeOptions}
            />
            <ValidatedInput name="subject" label="Subject" />
            <ValidatedTextarea name="notes" label="Notes" rows={4} />
            <ValidatedInput
              name="occurred_at"
              label="Date & Time"
              type="datetime-local"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Logging...' : 'Log Activity'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

