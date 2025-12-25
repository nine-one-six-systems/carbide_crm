import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectOption {
  value: string;
  label: string;
}

interface ValidatedSelectProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  options: SelectOption[];
  validateOnBlur?: boolean;
}

export function ValidatedSelect({
  name,
  label,
  description,
  placeholder = 'Select an option',
  options,
  validateOnBlur = true,
}: ValidatedSelectProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // Ensure value is always a string or undefined (never empty string for Radix Select)
        const selectValue = field.value === '' || field.value === null ? undefined : field.value;
        
        return (
          <FormItem>
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Trigger validation immediately when value changes
                form.trigger(name);
              }}
              value={selectValue}
              onOpenChange={(open) => {
                if (!open && validateOnBlur) {
                  form.trigger(name);
                }
              }}
            >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
        );
      }}
    />
  );
}

