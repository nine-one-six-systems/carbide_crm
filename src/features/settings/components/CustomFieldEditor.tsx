import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { CustomFieldDefinition } from '@/types/database';
import { useCustomFieldMutations } from '../hooks/useCustomFields';

const fieldSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z][a-z0-9_]*$/, 'Key must be lowercase with underscores'),
  label: z.string().min(1, 'Label is required'),
  field_type: z.enum(['text', 'number', 'date', 'boolean', 'select', 'multiselect', 'url', 'email']),
  category: z.string().min(1, 'Category is required'),
  entity_type: z.enum(['contact', 'organization', 'both']),
  options: z.array(z.string()).default([]),
  is_required: z.boolean().default(false),
  show_on_card: z.boolean().default(false),
  display_order: z.number().default(0),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface CustomFieldEditorProps {
  field?: CustomFieldDefinition;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Single Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
];

const ENTITY_TYPES = [
  { value: 'contact', label: 'Contacts Only' },
  { value: 'organization', label: 'Organizations Only' },
  { value: 'both', label: 'Both' },
];

const CATEGORIES = [
  { value: 'personal', label: 'Personal' },
  { value: 'social', label: 'Social' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'geo', label: 'Geolocation' },
  { value: 'operations', label: 'Operations' },
  { value: 'identifiers', label: 'Identifiers' },
  { value: 'contacts', label: 'Points of Contact' },
  { value: 'custom', label: 'Custom' },
];

export function CustomFieldEditor({ field, trigger, onSuccess }: CustomFieldEditorProps) {
  const [open, setOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const { create, update, isCreating, isUpdating } = useCustomFieldMutations();

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field
      ? {
          key: field.key,
          label: field.label,
          field_type: field.field_type,
          category: field.category,
          entity_type: field.entity_type,
          options: field.options || [],
          is_required: field.is_required,
          show_on_card: field.show_on_card,
          display_order: field.display_order,
        }
      : {
          key: '',
          label: '',
          field_type: 'text',
          category: 'custom',
          entity_type: 'both',
          options: [],
          is_required: false,
          show_on_card: false,
          display_order: 0,
        },
  });

  const watchFieldType = form.watch('field_type');
  const watchOptions = form.watch('options');
  const showOptions = watchFieldType === 'select' || watchFieldType === 'multiselect';

  const handleAddOption = () => {
    if (newOption.trim()) {
      const currentOptions = form.getValues('options') || [];
      if (!currentOptions.includes(newOption.trim())) {
        form.setValue('options', [...currentOptions, newOption.trim()]);
      }
      setNewOption('');
    }
  };

  const handleRemoveOption = (option: string) => {
    const currentOptions = form.getValues('options') || [];
    form.setValue('options', currentOptions.filter(o => o !== option));
  };

  const onSubmit = async (values: FieldFormValues) => {
    try {
      if (field) {
        await update({ id: field.id, ...values });
      } else {
        await create(values);
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add Custom Field'}</DialogTitle>
          <DialogDescription>
            {field
              ? 'Update the custom field definition.'
              : 'Create a new custom field for contacts or organizations.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., favorite_color"
                        {...field}
                        disabled={!!field}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (lowercase, underscores)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Favorite Color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="field_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="entity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applies To</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOptions && (
              <div className="space-y-2">
                <FormLabel>Options</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchOptions?.map((option) => (
                    <Badge key={option} variant="secondary" className="gap-1">
                      {option}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Required Field</FormLabel>
                      <FormDescription>
                        This field must be filled out
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="show_on_card"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Show on Card</FormLabel>
                      <FormDescription>
                        Display this field on contact/org cards
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : field ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

