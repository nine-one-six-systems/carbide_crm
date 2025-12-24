import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { useContacts } from '@/features/contacts/hooks/useContacts';

import { useInterpersonalMutations } from '../hooks/useInterpersonalRelationships';


const relationshipSchema = z.object({
  related_contact_id: z.string().uuid('Please select a contact'),
  relationship_type: z.string().min(1, 'Please select a relationship type'),
  notes: z.string().optional(),
});

type RelationshipFormValues = z.infer<typeof relationshipSchema>;

const relationshipTypeOptions = [
  { value: 'parent_child', label: 'Parent/Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'former_colleague', label: 'Former Colleague' },
  { value: 'manager_reports_to', label: 'Manager/Reports To' },
  { value: 'mentor_mentee', label: 'Mentor/Mentee' },
  { value: 'referral_source', label: 'Referral Source' },
  { value: 'business_partner', label: 'Business Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

interface AddSecondaryRelationshipDialogProps {
  contactId: string;
  trigger?: React.ReactNode;
}

export function AddSecondaryRelationshipDialog({
  contactId,
  trigger,
}: AddSecondaryRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: contactsData } = useContacts({ page: 1, pageSize: 100 });
  const { createSecondary, isCreatingSecondary } = useInterpersonalMutations();

  const form = useForm<RelationshipFormValues>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      related_contact_id: '',
      relationship_type: '',
      notes: '',
    },
  });

  const contactOptions =
    contactsData?.data
      .filter((c) => c.id !== contactId)
      .map((c) => ({
        value: c.id,
        label: `${c.first_name} ${c.last_name}`,
      })) || [];

  const onSubmit = async (values: RelationshipFormValues) => {
    try {
      await createSecondary({
        contact_id: contactId,
        related_contact_id: values.related_contact_id,
        relationship_type: values.relationship_type,
        notes: values.notes || undefined,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Add Relationship</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ValidatedSelect
              name="related_contact_id"
              label="Related Contact"
              placeholder="Select a contact"
              options={contactOptions}
            />
            <ValidatedSelect
              name="relationship_type"
              label="Relationship Type"
              placeholder="Select relationship type"
              options={relationshipTypeOptions}
            />
            <ValidatedTextarea name="notes" label="Notes" rows={3} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingSecondary}>
                {isCreatingSecondary ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

