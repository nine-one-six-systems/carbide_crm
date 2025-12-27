import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { ContactCombobox } from '@/features/contacts/components/ContactCombobox';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { projectService } from '../services/projectService';
import { toast } from '@/components/ui/use-toast';
import { Form } from '@/components/ui/form';

const linkContactSchema = z.object({
  contactId: z.string().uuid('Please select a contact'),
  role: z.string().optional(),
});

type LinkContactFormValues = z.infer<typeof linkContactSchema>;

interface LinkContactDialogProps {
  projectId: string;
  linkedContactIds: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LinkContactDialog({
  projectId,
  linkedContactIds,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LinkContactDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const { data: contactsData } = useContacts({
    page: 1,
    pageSize: 1000,
  });

  const form = useForm<LinkContactFormValues>({
    resolver: zodResolver(linkContactSchema),
    defaultValues: {
      contactId: '',
      role: '',
    },
  });

  // Filter out already linked contacts
  const availableContacts = useMemo(() => {
    return (contactsData?.data || []).filter(
      (contact) => !linkedContactIds.includes(contact.id)
    );
  }, [contactsData?.data, linkedContactIds]);

  const onSubmit = async (values: LinkContactFormValues) => {
    try {
      await projectService.linkContact(projectId, values.contactId, values.role || undefined);
      toast({
        title: 'Success',
        description: 'Contact linked successfully',
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to link contact',
        variant: 'destructive',
      });
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
            Associate a contact with this project and optionally specify their role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact</label>
            <ContactCombobox
              value={form.watch('contactId')}
              onChange={(value) => form.setValue('contactId', value)}
              placeholder="Select a contact"
            />
            {form.formState.errors.contactId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.contactId.message}
              </p>
            )}
          </div>

          <ValidatedInput name="role" label="Role (optional)" />

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
            <Button type="submit" disabled={availableContacts.length === 0}>
              Link Contact
            </Button>
          </div>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

