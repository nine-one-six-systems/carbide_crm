import { useState, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus } from 'lucide-react';

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
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { ContactForm } from '@/features/contacts/components/ContactForm';
import type { Contact } from '@/types/database';

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

interface AddSecondaryRelationshipDialogProps {
  contactId: string;
  trigger?: React.ReactNode;
}

export function AddSecondaryRelationshipDialog({
  contactId,
  trigger,
}: AddSecondaryRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const [createContactDialogOpen, setCreateContactDialogOpen] = useState(false);
  const [newlyCreatedContact, setNewlyCreatedContact] = useState<Contact | null>(null);
  const { data: contactsData, refetch: refetchContacts } = useContacts({ page: 1, pageSize: 100 });
  const { createSecondary, isCreatingSecondary } = useInterpersonalMutations();

  const form = useForm<RelationshipFormValues>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      related_contact_id: undefined,
      relationship_type: undefined,
      notes: '',
    },
    mode: 'onChange', // Validate on change to clear errors immediately
  });

  const contactOptions = useMemo(() => {
    const baseOptions =
      contactsData?.data
        .filter((c) => c.id !== contactId)
        .map((c) => ({
          value: c.id,
          label: `${c.first_name} ${c.last_name}`,
        })) || [];

    // Add newly created contact if not already in list
    if (newlyCreatedContact && !baseOptions.find((o) => o.value === newlyCreatedContact.id)) {
      return [
        {
          value: newlyCreatedContact.id,
          label: `${newlyCreatedContact.first_name} ${newlyCreatedContact.last_name}`,
        },
        ...baseOptions,
      ];
    }
    return baseOptions;
  }, [contactsData, contactId, newlyCreatedContact]);

  const handleContactCreated = async (createdContact: Contact) => {
    // Set the newly created contact in state immediately
    setNewlyCreatedContact(createdContact);
    // Refetch contacts to ensure the list is up to date
    await refetchContacts();
    // Set the newly created contact as selected
    form.setValue('related_contact_id', createdContact.id, { shouldValidate: true });
    // Close the create dialog
    setCreateContactDialogOpen(false);
  };

  const onSubmit = async (values: RelationshipFormValues) => {
    console.log('Submitting relationship:', values);
    try {
      const result = await createSecondary({
        contact_id: contactId,
        related_contact_id: values.related_contact_id!,
        relationship_type: values.relationship_type,
        notes: values.notes || undefined,
      });
      console.log('Relationship created successfully:', result);
      form.reset({
        related_contact_id: undefined,
        relationship_type: undefined,
        notes: '',
      });
      setNewlyCreatedContact(null);
      setOpen(false);
    } catch (error: any) {
      console.error('Error creating relationship:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      // Re-throw so mutation's onError handler can show toast
      throw error;
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Reset state when dialog closes
          setNewlyCreatedContact(null);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Add Relationship</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
          <DialogDescription>
            Create a relationship between this contact and another contact.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(
              onSubmit,
              (errors) => {
                console.log('Form validation errors:', errors);
                console.log('Form values:', form.getValues());
              }
            )} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="related_contact_id" className="text-sm font-medium">
                  Related Contact
                </label>
                <Dialog open={createContactDialogOpen} onOpenChange={setCreateContactDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        setCreateContactDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Contact</DialogTitle>
                      <DialogDescription>
                        Create a new contact to add as a relationship. The contact will be automatically selected after creation.
                      </DialogDescription>
                    </DialogHeader>
                    <ContactForm
                      onContactCreated={handleContactCreated}
                      onCancel={() => setCreateContactDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <ValidatedSelect
                name="related_contact_id"
                label=""
                placeholder="Select a contact"
                options={contactOptions}
              />
            </div>
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
                  setNewlyCreatedContact(null);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingSecondary}
              >
                {isCreatingSecondary ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

