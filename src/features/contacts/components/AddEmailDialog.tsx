import { useState } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Mail } from 'lucide-react';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import type { EmailEntry } from '@/types/database';

import { useContactMutations } from '../hooks/useContactMutations';

const emailSchema = z.object({
  value: z.string().email('Please enter a valid email address'),
  label: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface AddEmailDialogProps {
  contactId: string;
  existingEmails: EmailEntry[];
  iconOnly?: boolean;
  circular?: boolean;
  trigger?: React.ReactNode;
}

export function AddEmailDialog({ contactId, existingEmails, iconOnly = false, circular = false, trigger }: AddEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating } = useContactMutations();

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      value: '',
      label: '',
      is_primary: false,
    },
  });

  const onSubmit = (data: EmailFormData) => {
    // If this is primary, unset other primaries
    const updatedEmails = data.is_primary
      ? existingEmails.map((email) => ({
          ...email,
          is_primary: false,
        }))
      : [...existingEmails];

    // Add the new email
    const newEmail: EmailEntry = {
      value: data.value,
      label: data.label || '',
      is_primary: data.is_primary,
    };

    updatedEmails.push(newEmail);

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

  const buttonContent = circular ? (
    <Button
      variant="default"
      size="icon"
      className="h-6 w-6 !min-h-0 !min-w-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-0 flex items-center justify-center"
    >
      <Plus className="h-3.5 w-3.5" />
    </Button>
  ) : iconOnly ? (
    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600">
      <Plus className="h-3.5 w-3.5" />
    </Button>
  ) : (
    <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-600">
      <Plus className="h-4 w-4 mr-2 shrink-0" />
      Add email
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : iconOnly && circular ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                {buttonContent}
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Add email</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          {buttonContent}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Email Address</DialogTitle>
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
                {isUpdating ? 'Adding...' : 'Add Email'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

