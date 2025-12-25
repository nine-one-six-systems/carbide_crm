import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { contactFormSchema, type ContactFormValues } from '@/lib/validators/contact';
import type { Contact } from '@/types/database';
import type { ContactCreatePayload, ContactUpdatePayload } from '@/types/api';

import { contactService } from '../services/contactService';
import { useContactMutations } from '../hooks/useContactMutations';
import { CustomAttributesForm } from './CustomAttributesForm';


interface ContactFormProps {
  contact?: Contact;
  onSuccess?: () => void;
  onContactCreated?: (contact: Contact) => void;
  onCancel?: () => void;
}

export function ContactForm({ contact, onSuccess, onContactCreated, onCancel }: ContactFormProps) {
  const queryClient = useQueryClient();
  const { update, isUpdating } = useContactMutations();
  
  const createMutation = useMutation({
    mutationFn: (payload: ContactCreatePayload) => contactService.create(payload),
    onSuccess: (createdContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
      onContactCreated?.(createdContact);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contact',
        variant: 'destructive',
      });
    },
  });

  const isCreating = createMutation.isPending;

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
          custom_attributes: contact.custom_attributes || {},
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
          custom_attributes: {},
        },
  });

  const onSubmit = (values: ContactFormValues) => {
    if (contact) {
      update({ id: contact.id, ...values }, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    } else {
      createMutation.mutate(values);
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

        <Separator className="my-6" />
        
        <div>
          <h3 className="text-sm font-medium mb-4">Additional Information</h3>
          <CustomAttributesForm />
        </div>

        <div className="flex justify-end gap-2 pt-4">
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

