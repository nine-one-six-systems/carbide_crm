import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';

import { useContactOrgLinkMutations } from '../hooks/useContactOrgLinks';
import { useOrganizations } from '../hooks/useOrganizations';

const linkSchema = z.object({
  organization_id: z.string().uuid('Please select an organization'),
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
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
});

type LinkFormValues = z.infer<typeof linkSchema>;

interface AddContactToOrgDialogProps {
  contactId: string;
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

export function AddContactToOrgDialog({
  contactId,
  trigger,
}: AddContactToOrgDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: organizationsData } = useOrganizations({
    page: 1,
    pageSize: 100,
  });
  const { create, isCreating } = useContactOrgLinkMutations();

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      organization_id: '',
      role_title: '',
      role_type: undefined,
      is_primary: false,
      is_current: true,
      start_date: '',
      end_date: '',
      notes: '',
    },
  });

  const organizationOptions =
    organizationsData?.data.map((org) => ({
      value: org.id,
      label: org.name,
    })) || [];

  const onSubmit = async (values: LinkFormValues) => {
    try {
      await create({
        contact_id: contactId,
        ...values,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Add to Organization</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contact to Organization</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedSelect
              name="organization_id"
              label="Organization"
              placeholder="Select organization"
              options={organizationOptions}
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
            <ValidatedInput name="notes" label="Notes" />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

