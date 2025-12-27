import { useState } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import type { AddressEntry } from '@/types/database';

import { useContactMutations } from '../hooks/useContactMutations';

const addressSchema = z.object({
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().optional(),
  label: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddAddressDialogProps {
  contactId: string;
  existingAddresses: AddressEntry[];
  iconOnly?: boolean;
  circular?: boolean;
  trigger?: React.ReactNode;
}

export function AddAddressDialog({
  contactId,
  existingAddresses,
  iconOnly = false,
  circular = false,
  trigger,
}: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating } = useContactMutations();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
      label: '',
    },
  });

  const onSubmit = (data: AddressFormData) => {
    // Create the new address entry
    const newAddress: AddressEntry = {
      street1: data.street1,
      street2: data.street2 || undefined,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country || undefined,
      label: data.label || undefined,
    };

    // Add to existing addresses
    const updatedAddresses = [...existingAddresses, newAddress];

    update(
      {
        id: contactId,
        addresses: updatedAddresses,
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
      Add address
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
            <TooltipContent>Add address</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger asChild>
          {buttonContent}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="street1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address 2 (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apt 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Home, Work, Mailing" {...field} />
                  </FormControl>
                  <FormMessage />
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
                {isUpdating ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

