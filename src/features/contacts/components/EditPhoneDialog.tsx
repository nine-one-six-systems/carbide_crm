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
import type { PhoneEntry } from '@/types/database';

import { useContactMutations } from '../hooks/useContactMutations';

const phoneSchema = z.object({
  value: z.string().min(1, 'Phone number is required'),
  label: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

interface EditPhoneDialogProps {
  contactId: string;
  phoneIndex: number;
  existingPhones: PhoneEntry[];
  trigger?: React.ReactNode;
}

export function EditPhoneDialog({
  contactId,
  phoneIndex,
  existingPhones,
  trigger,
}: EditPhoneDialogProps) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating } = useContactMutations();

  const phone = existingPhones[phoneIndex];

  const form = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      value: phone?.value || '',
      label: phone?.label || '',
      is_primary: phone?.is_primary || false,
    },
  });

  useEffect(() => {
    if (open && phone) {
      form.reset({
        value: phone.value,
        label: phone.label || '',
        is_primary: phone.is_primary || false,
      });
    }
  }, [open, phone, form]);

  const onSubmit = (data: PhoneFormData) => {
    // If this is primary, unset other primaries
    const updatedPhones = existingPhones.map((p, idx) => {
      if (idx === phoneIndex) {
        return {
          value: data.value,
          label: data.label || '',
          is_primary: data.is_primary,
        };
      }
      // If setting this as primary, unset others
      if (data.is_primary) {
        return { ...p, is_primary: false };
      }
      return p;
    });

    update(
      {
        id: contactId,
        phones: updatedPhones,
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
          <Button variant="ghost" size="icon" className="h-6 w-6 min-h-0 min-w-0 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Phone Number</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
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
                    <Input placeholder="Mobile, Work, Home" {...field} />
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
                    <FormLabel>Set as primary phone</FormLabel>
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
                {isUpdating ? 'Updating...' : 'Update Phone'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

