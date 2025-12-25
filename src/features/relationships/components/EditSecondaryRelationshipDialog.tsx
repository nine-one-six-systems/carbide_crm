import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Pencil } from 'lucide-react';

import { ValidatedSelect } from '@/components/forms/ValidatedSelect';
import { ValidatedTextarea } from '@/components/forms/ValidatedTextarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import type { SecondaryRelationship } from '@/types/database';

import { useInterpersonalMutations } from '../hooks/useInterpersonalRelationships';

const relationshipSchema = z.object({
  relationship_type: z.string().min(1, 'Please select a relationship type'),
  notes: z.string().optional(),
});

type RelationshipFormValues = z.infer<typeof relationshipSchema>;

const relationshipTypeOptions = [
  { value: 'parent_child', label: 'Parent/Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'husband', label: 'Husband' },
  { value: 'wife', label: 'Wife' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'former_colleague', label: 'Former Colleague' },
  { value: 'manager_reports_to', label: 'Manager/Reports To' },
  { value: 'mentor_mentee', label: 'Mentor/Mentee' },
  { value: 'referral_source', label: 'Referral Source' },
  { value: 'business_partner', label: 'Business Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

interface EditSecondaryRelationshipDialogProps {
  relationship: SecondaryRelationship;
  trigger?: React.ReactNode;
}

export function EditSecondaryRelationshipDialog({
  relationship,
  trigger,
}: EditSecondaryRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateSecondary, isUpdatingSecondary } = useInterpersonalMutations();

  const form = useForm<RelationshipFormValues>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      relationship_type: relationship.relationship_type,
      notes: relationship.notes || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        relationship_type: relationship.relationship_type,
        notes: relationship.notes || '',
      });
    }
  }, [open, relationship, form]);

  const onSubmit = async (values: RelationshipFormValues) => {
    try {
      await updateSecondary({
        id: relationship.id,
        relationship_type: values.relationship_type,
        notes: values.notes || undefined,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Relationship</DialogTitle>
          <DialogDescription>
            Update the relationship type and notes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
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
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingSecondary}>
                {isUpdatingSecondary ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

