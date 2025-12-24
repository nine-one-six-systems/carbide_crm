import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { taskFormSchema, type TaskFormValues } from '@/lib/validators/task';

import { useTaskMutations } from '../hooks/useTaskMutations';

interface TaskFormProps {
  contactId?: string;
  organizationId?: string;
  relationshipId?: string;
  onSuccess?: () => void;
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

export function TaskForm({
  contactId: initialContactId,
  organizationId: initialOrganizationId,
  relationshipId,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const { user } = useAuth();
  const { create, isCreating } = useTaskMutations();
  const { data: contactsData } = useContacts({ page: 1, pageSize: 100 });
  const { data: organizationsData } = useOrganizations({ page: 1, pageSize: 100 });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      task_type: undefined,
      due_date: new Date().toISOString().split('T')[0],
      contact_id: initialContactId || undefined,
      organization_id: initialOrganizationId || undefined,
      relationship_id: relationshipId || undefined,
      notes: undefined,
    },
  });

  const contactOptions =
    contactsData?.data.map((c) => ({
      value: c.id,
      label: `${c.first_name} ${c.last_name}`,
    })) || [];

  const organizationOptions =
    organizationsData?.data.map((o) => ({
      value: o.id,
      label: o.name,
    })) || [];

  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;

    try {
      await create({
        title: values.title,
        task_type: values.task_type || undefined,
        due_date: values.due_date,
        contact_id: values.contact_id || undefined,
        organization_id: values.organization_id || undefined,
        relationship_id: values.relationship_id || undefined,
        assigned_to: user.id,
        notes: values.notes || undefined,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ValidatedInput name="title" label="Task Title" />
        <ValidatedSelect
          name="task_type"
          label="Task Type"
          placeholder="Select task type"
          options={taskTypeOptions}
        />
        <ValidatedInput name="due_date" label="Due Date" type="date" />
        {!initialContactId && (
          <ValidatedSelect
            name="contact_id"
            label="Contact"
            placeholder="Select contact (optional)"
            options={contactOptions}
          />
        )}
        {!initialOrganizationId && (
          <ValidatedSelect
            name="organization_id"
            label="Organization"
            placeholder="Select organization (optional)"
            options={organizationOptions}
          />
        )}
        <ValidatedTextarea name="notes" label="Notes" rows={3} />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

