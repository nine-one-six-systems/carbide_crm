import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { EmailEntry } from '@/types/database';

import { useContactMutations } from '../hooks/useContactMutations';

const emailSchema = z.object({
  value: z.string().email('Please enter a valid email address'),
  label: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EditEmailDialogProps {
  contactId: string;
  emailIndex: number;
  existingEmails: EmailEntry[];
  trigger?: React.ReactNode;
}

export function EditEmailDialog({
  contactId,
  emailIndex,
  existingEmails,
  trigger,
}: EditEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating } = useContactMutations();

  const email = existingEmails[emailIndex];

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      value: email?.value || '',
      label: email?.label || '',
      is_primary: email?.is_primary || false,
    },
  });

  useEffect(() => {
    if (open && email) {
      form.reset({
        value: email.value,
        label: email.label || '',
        is_primary: email.is_primary || false,
      });
    }
  }, [open, email, form]);

  const onSubmit = (data: EmailFormData) => {
    // Update the email at the specified index
    const updatedEmails = existingEmails.map((e, idx) => {
      if (idx === emailIndex) {
        return {
          value: data.value,
          label: data.label || '',
          is_primary: data.is_primary,
        };
      }
      // If setting this as primary, unset others
      if (data.is_primary) {
        return { ...e, is_primary: false };
      }
      return e;
    });

    update(
      {
        id: contactId,
        emails: updatedEmails,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-6 w-6 !min-h-0 !min-w-0 p-0 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Email Address</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Personal, Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as primary email</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

