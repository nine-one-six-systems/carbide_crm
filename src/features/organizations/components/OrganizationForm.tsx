import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from '@/lib/validators/organization';
import type { Organization } from '@/types/database';

import { useOrganizationMutations } from '../hooks/useOrganizationMutations';


interface OrganizationFormProps {
  organization?: Organization;
  onSuccess?: (createdOrganization?: Organization) => void;
  onCancel?: () => void;
}

const organizationTypeOptions = [
  { value: 'company', label: 'Company' },
  { value: 'fund', label: 'Fund' },
  { value: 'agency', label: 'Agency' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

export function OrganizationForm({
  organization,
  onSuccess,
  onCancel,
}: OrganizationFormProps) {
  const { create, update, isCreating, isUpdating } = useOrganizationMutations();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: organization
      ? {
          name: organization.name,
          type: organization.type || null,
          industry: organization.industry || '',
          website: organization.website || '',
          addresses: organization.addresses || [],
          description: organization.description || '',
          tags: organization.tags || [],
          logo_url: organization.logo_url || '',
        }
      : {
          name: '',
          type: null,
          industry: '',
          website: '',
          addresses: [],
          description: '',
          tags: [],
          logo_url: '',
        },
  });

  const onSubmit = (values: OrganizationFormValues) => {
    if (organization) {
      const callbacks = {
        onSuccess: () => {
          onSuccess?.(organization);
        },
      };
      update({ id: organization.id, ...values }, callbacks);
    } else {
      const callbacks = {
        onSuccess: (createdOrg?: Organization) => {
          onSuccess?.(createdOrg);
        },
      };
      create(values, callbacks);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ValidatedInput name="name" label="Organization Name" />

        <ValidatedSelect
          name="type"
          label="Type"
          placeholder="Select organization type"
          options={organizationTypeOptions}
        />

        <ValidatedInput name="industry" label="Industry" />

        <ValidatedInput name="website" label="Website" type="url" />

        <ValidatedTextarea
          name="description"
          label="Description"
          rows={4}
        />

        <ValidatedInput name="logo_url" label="Logo URL" type="url" />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? 'Saving...'
              : organization
                ? 'Update Organization'
                : 'Create Organization'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

