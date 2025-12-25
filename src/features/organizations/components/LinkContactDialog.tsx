import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';

import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useContactOrgLinkMutations } from '../hooks/useContactOrgLinks';

const linkSchema = z.object({
  contact_id: z.string().uuid('Please select a contact'),
  role_title: z.string().optional(),
  role_type: z
    .enum([
      'executive',
      'employee',
      'founder',
      'board_member',
      'advisor',
      'investor',
      'consultant',
      'partner',
      'other',
    ])
    .optional(),
  is_primary: z.boolean().default(false),
  is_current: z.boolean().default(true),
  start_date: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  end_date: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  notes: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface LinkContactDialogProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

const roleTypeOptions = [
  { value: 'executive', label: 'Executive' },
  { value: 'employee', label: 'Employee' },
  { value: 'founder', label: 'Founder' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'investor', label: 'Investor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

export function LinkContactDialog({
  organizationId,
  trigger,
}: LinkContactDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: contactsData } = useContacts({
    page: 1,
    pageSize: 100,
  });
  const { create, isCreating } = useContactOrgLinkMutations();

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      contact_id: '',
      role_title: '',
      role_type: undefined,
      is_primary: false,
      is_current: true,
      start_date: '',
      end_date: '',
      notes: '',
    },
  });

  const contactOptions =
    contactsData?.data.map((contact) => ({
      value: contact.id,
      label: `${contact.first_name} ${contact.last_name}`,
    })) || [];

  const onSubmit = async (values: LinkFormValues) => {
    try {
      // Filter out empty strings and undefined values for optional fields
      const payload: Record<string, unknown> = {
        organization_id: organizationId,
        contact_id: values.contact_id,
        is_primary: values.is_primary,
        is_current: values.is_current,
      };

      // Only include optional fields if they have values
      if (values.role_title && values.role_title.trim()) {
        payload.role_title = values.role_title.trim();
      }
      if (values.role_type) {
        payload.role_type = values.role_type;
      }
      if (values.start_date && values.start_date.trim()) {
        payload.start_date = values.start_date.trim();
      }
      if (values.end_date && values.end_date.trim()) {
        payload.end_date = values.end_date.trim();
      }
      if (values.notes && values.notes.trim()) {
        payload.notes = values.notes.trim();
      }

      await create(payload as any);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Link Contact</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Contact</DialogTitle>
          <DialogDescription>
            Associate a contact with this organization and specify their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedSelect
              name="contact_id"
              label="Contact"
              placeholder="Select a contact"
              options={contactOptions}
            />

            <ValidatedInput name="role_title" label="Role Title" />

            <ValidatedSelect
              name="role_type"
              label="Role Type"
              placeholder="Select role type"
              options={roleTypeOptions}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={form.watch('is_primary')}
                onCheckedChange={(checked) =>
                  form.setValue('is_primary', checked === true)
                }
              />
              <Label htmlFor="is_primary" className="cursor-pointer">
                Primary organization
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_current"
                checked={form.watch('is_current')}
                onCheckedChange={(checked) =>
                  form.setValue('is_current', checked === true)
                }
              />
              <Label htmlFor="is_current" className="cursor-pointer">
                Current role
              </Label>
            </div>

            <ValidatedInput name="start_date" label="Start Date" type="date" />
            <ValidatedInput name="end_date" label="End Date" type="date" />
            <ValidatedTextarea name="notes" label="Notes" rows={3} />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Linking...' : 'Link Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

