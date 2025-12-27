import { useState, useMemo, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
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
import type { Organization } from '@/types/database';

import { OrganizationForm } from './OrganizationForm';
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
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [newlyCreatedOrg, setNewlyCreatedOrg] = useState<Organization | null>(null);
  const { data: organizationsData, refetch: refetchOrganizations } = useOrganizations({
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

  const organizationOptions = useMemo(() => {
    const baseOptions =
      organizationsData?.data.map((org) => ({
        value: org.id,
        label: org.name,
      })) || [];

    // If a new organization was just created, ensure it's in the options
    if (newlyCreatedOrg && !baseOptions.find((opt) => opt.value === newlyCreatedOrg.id)) {
      return [
        { value: newlyCreatedOrg.id, label: newlyCreatedOrg.name },
        ...baseOptions,
      ];
    }

    return baseOptions;
  }, [organizationsData?.data, newlyCreatedOrg]);

  // When a new organization is created and options are updated, select it
  useEffect(() => {
    if (newlyCreatedOrg && organizationOptions.find((opt) => opt.value === newlyCreatedOrg.id)) {
      form.setValue('organization_id', newlyCreatedOrg.id, { shouldValidate: true });
    }
  }, [newlyCreatedOrg, organizationOptions, form]);

  const handleOrganizationCreated = async (createdOrg?: Organization) => {
    if (createdOrg) {
      setNewlyCreatedOrg(createdOrg);
      // Close the create dialog first
      setCreateOrgDialogOpen(false);
      // Refetch to ensure the list is up to date, then set the value
      await refetchOrganizations();
      // Set the newly created organization in the form after refetch completes
      form.setValue('organization_id', createdOrg.id, { shouldValidate: true });
    } else {
      setCreateOrgDialogOpen(false);
    }
  };

  const onSubmit = async (values: LinkFormValues) => {
    try {
      // Filter out empty strings and undefined values for optional fields
      const payload: Record<string, unknown> = {
        contact_id: contactId,
        organization_id: values.organization_id,
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
        {trigger || <Button variant="outline">Add to Organization</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contact to Organization</DialogTitle>
          <DialogDescription>
            Associate this contact with an organization and specify their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="organization_id" className="text-sm font-medium">
                  Organization
                </label>
                <Dialog open={createOrgDialogOpen} onOpenChange={setCreateOrgDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        setCreateOrgDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Organization</DialogTitle>
                      <DialogDescription>
                        Create a new organization to add this contact to. The organization will be automatically selected after creation.
                      </DialogDescription>
                    </DialogHeader>
                    <OrganizationForm
                      onSuccess={handleOrganizationCreated}
                      onCancel={() => setCreateOrgDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <ValidatedSelect
                name="organization_id"
                label=""
                placeholder="Select organization"
                options={organizationOptions}
              />
            </div>

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

