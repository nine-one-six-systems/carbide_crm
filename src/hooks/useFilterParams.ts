import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

/**
 * Generic hook for managing URL-based filter parameters with Zod validation
 */
export function useFilterParams<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  defaultValues: z.infer<T>
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current URL params into filter object
  const filters = useMemo(() => {
    const params: Record<string, unknown> = {};

    // Extract all search params
    searchParams.forEach((value, key) => {
      // Handle array values (e.g., ?tags=a&tags=b)
      const existing = params[key];
      if (existing !== undefined) {
        params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        // Check if it should be an array by looking at the schema
        const shape = schema.shape[key];
        if (shape instanceof z.ZodArray) {
          params[key] = [value];
        } else if (shape instanceof z.ZodBoolean) {
          params[key] = value === 'true';
        } else if (shape instanceof z.ZodNumber) {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      }
    });

    // Validate and merge with defaults
    const result = schema.safeParse({ ...defaultValues, ...params });
    return result.success ? result.data : defaultValues;
  }, [searchParams, schema, defaultValues]);

  // Update URL params
  const setFilters = useCallback(
    (newFilters: Partial<z.infer<T>>) => {
      const merged = { ...filters, ...newFilters };
      const validated = schema.safeParse(merged);

      if (!validated.success) {
        console.warn('Invalid filter values:', validated.error);
        return;
      }

      const newParams = new URLSearchParams();

      Object.entries(validated.data).forEach(([key, value]) => {
        // Skip default values to keep URL clean
        if (JSON.stringify(value) === JSON.stringify(defaultValues[key])) {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v !== undefined && v !== null && v !== '') {
              newParams.append(key, String(v));
            }
          });
        } else if (value !== undefined && value !== null && value !== '') {
          newParams.set(key, String(value));
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [filters, schema, defaultValues, setSearchParams]
  );

  // Reset to default values
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Set a single filter value
  const setFilter = useCallback(
    <K extends keyof z.infer<T>>(key: K, value: z.infer<T>[K]) => {
      setFilters({ [key]: value } as Partial<z.infer<T>>);
    },
    [setFilters]
  );

  // Check if any filters are active (different from defaults)
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      (key) => JSON.stringify(filters[key]) !== JSON.stringify(defaultValues[key])
    );
  }, [filters, defaultValues]);

  return {
    filters,
    setFilters,
    setFilter,
    resetFilters,
    hasActiveFilters,
  };
}

// Pre-defined filter schemas for common pages
export const contactFilterSchema = z.object({
  query: z.string().default(''),
  tags: z.array(z.string()).default([]),
  sortBy: z.enum(['name', 'created_at', 'updated_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

export const organizationFilterSchema = z.object({
  query: z.string().default(''),
  type: z.string().default(''),
  tags: z.array(z.string()).default([]),
  sortBy: z.enum(['name', 'created_at', 'updated_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

export const taskFilterSchema = z.object({
  status: z.array(z.string()).default(['pending']),
  taskType: z.string().default(''),
  dueDateFrom: z.string().default(''),
  dueDateTo: z.string().default(''),
  sortBy: z.enum(['due_date', 'created_at']).default('due_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const pipelineFilterSchema = z.object({
  type: z.string().default(''),
  ventures: z.array(z.string()).default([]),
  ownerId: z.string().default(''),
});

export type ContactFilters = z.infer<typeof contactFilterSchema>;
export type OrganizationFilters = z.infer<typeof organizationFilterSchema>;
export type TaskFilters = z.infer<typeof taskFilterSchema>;
export type PipelineFilters = z.infer<typeof pipelineFilterSchema>;

