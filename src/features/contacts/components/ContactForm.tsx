import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { contactFormSchema, type ContactFormValues } from '@/lib/validators/contact';
import type { Contact } from '@/types/database';

import { useContactMutations } from '../hooks/useContactMutations';


interface ContactFormProps {
  contact?: Contact;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const { create, update, isCreating, isUpdating } = useContactMutations();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contact
      ? {
          first_name: contact.first_name,
          last_name: contact.last_name,
          emails: contact.emails || [],
          phones: contact.phones || [],
          addresses: contact.addresses || [],
          job_title: contact.job_title || '',
          description: contact.description || '',
          tags: contact.tags || [],
          avatar_url: contact.avatar_url || '',
        }
      : {
          first_name: '',
          last_name: '',
          emails: [],
          phones: [],
          addresses: [],
          job_title: '',
          description: '',
          tags: [],
          avatar_url: '',
        },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      if (contact) {
        await update({ id: contact.id, ...values });
      } else {
        await create(values);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <ValidatedInput name="first_name" label="First Name" />
          <ValidatedInput name="last_name" label="Last Name" />
        </div>

        <ValidatedInput name="job_title" label="Job Title" />

        <ValidatedTextarea
          name="description"
          label="Description"
          rows={4}
        />

        <ValidatedInput name="avatar_url" label="Avatar URL" type="url" />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? 'Saving...'
              : contact
                ? 'Update Contact'
                : 'Create Contact'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

