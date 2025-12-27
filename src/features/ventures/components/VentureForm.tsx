import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Venture, VentureFormValues, VentureStatus } from '../types/venture.types';
import { VENTURE_STATUS_OPTIONS } from '../types/venture.types';

const ventureFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Slug must be lowercase letters, numbers, and underscores only'),
  description: z.string().nullable().optional(),
  logo_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .nullable()
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'incubating', 'sunset', 'archived'] as const),
  founded_date: z.string().nullable().optional(),
});

interface VentureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venture?: Venture | null;
  onSubmit: (values: VentureFormValues) => void;
  isLoading?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function VentureForm({
  open,
  onOpenChange,
  venture,
  onSubmit,
  isLoading = false,
}: VentureFormProps) {
  const isEditing = !!venture;

  const form = useForm<VentureFormValues>({
    resolver: zodResolver(ventureFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      website: '',
      primary_color: '#3B82F6',
      status: 'active' as VentureStatus,
      founded_date: '',
    },
  });

  // Reset form when venture changes
  useEffect(() => {
    if (venture) {
      form.reset({
        name: venture.name,
        slug: venture.slug,
        description: venture.description || '',
        logo_url: venture.logo_url || '',
        website: venture.website || '',
        primary_color: venture.primary_color || '#3B82F6',
        status: venture.status,
        founded_date: venture.founded_date || '',
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        website: '',
        primary_color: '#3B82F6',
        status: 'active',
        founded_date: '',
      });
    }
  }, [venture, form]);

  // Auto-generate slug from name (only for new ventures)
  const watchName = form.watch('name');
  useEffect(() => {
    if (!isEditing && watchName) {
      const currentSlug = form.getValues('slug');
      const generatedSlug = generateSlug(watchName);
      // Only auto-update if slug hasn't been manually edited
      if (!currentSlug || currentSlug === generateSlug(form.getValues('name').slice(0, -1))) {
        form.setValue('slug', generatedSlug);
      }
    }
  }, [watchName, isEditing, form]);

  const handleSubmit = (values: VentureFormValues) => {
    // Clean up empty strings to null
    const cleanedValues: VentureFormValues = {
      ...values,
      description: values.description || null,
      logo_url: values.logo_url || null,
      website: values.website || null,
      primary_color: values.primary_color || null,
      founded_date: values.founded_date || null,
    };
    onSubmit(cleanedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Venture' : 'Create Venture'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the venture details below.'
              : 'Add a new venture to the NineOneSix ecosystem.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Forge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="forge" {...field} />
                    </FormControl>
                    <FormDescription>URL identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this venture do?"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VENTURE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="founded_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://forge.example.com"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="#3B82F6"
                          {...field}
                          value={field.value || ''}
                          className="flex-1"
                        />
                      </FormControl>
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: field.value || '#6B7280' }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Venture'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

