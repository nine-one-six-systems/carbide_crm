import { forwardRef } from 'react';

import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
  validateOnBlur?: boolean;
}

export const ValidatedTextarea = forwardRef<
  HTMLTextAreaElement,
  ValidatedTextareaProps
>(({ name, label, description, validateOnBlur = true, className, ...props }, ref) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              {...field}
              {...props}
              ref={ref}
              className={cn(className)}
              onBlur={(e) => {
                field.onBlur();
                if (validateOnBlur) {
                  form.trigger(name);
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

ValidatedTextarea.displayName = 'ValidatedTextarea';

