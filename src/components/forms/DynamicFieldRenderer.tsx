import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
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
import type { CustomFieldDefinition } from '@/types/database';

interface DynamicFieldRendererProps {
  field: CustomFieldDefinition;
  basePath: string;
}

export function DynamicFieldRenderer({ field, basePath }: DynamicFieldRendererProps) {
  const form = useFormContext();
  const fieldPath = `${basePath}.${field.key}`;

  switch (field.field_type) {
    case 'text':
    case 'email':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type={field.field_type === 'email' ? 'email' : 'text'}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  {...formField}
                  value={formField.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'url':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://"
                  {...formField}
                  value={formField.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'number':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  {...formField}
                  value={formField.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    formField.onChange(val === '' ? undefined : parseFloat(val));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'date':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...formField}
                  value={formField.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'boolean':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={formField.value ?? false}
                  onCheckedChange={formField.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{field.label}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      );

    case 'select':
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <Select
                value={formField.value || ''}
                onValueChange={formField.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'multiselect':
      // For multiselect, we'd typically use a custom component
      // For now, render as a series of checkboxes
      return (
        <FormField
          control={form.control}
          name={fieldPath}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <div className="space-y-2">
                {field.options.map((option) => {
                  const values = formField.value as string[] || [];
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${fieldPath}-${option}`}
                        checked={values.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            formField.onChange([...values, option]);
                          } else {
                            formField.onChange(values.filter((v: string) => v !== option));
                          }
                        }}
                      />
                      <label
                        htmlFor={`${fieldPath}-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
}

interface DynamicFieldGroupProps {
  fields: CustomFieldDefinition[];
  basePath: string;
  title?: string;
}

export function DynamicFieldGroup({ fields, basePath, title }: DynamicFieldGroupProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <DynamicFieldRenderer
            key={field.key}
            field={field}
            basePath={basePath}
          />
        ))}
      </div>
    </div>
  );
}

