import { z } from 'zod';

import { addressEntrySchema, socialAttributesSchema, geoAttributesSchema } from './contact';

// Organization-specific custom attribute schemas
export const operationsAttributesSchema = z.object({
  vehicles: z.number().optional(),
  location_count: z.number().optional(),
  timezone: z.string().optional(),
}).optional();

export const identifierAttributesSchema = z.object({
  site_code: z.string().optional(),
}).optional();

export const orgContactAttributesSchema = z.object({
  admin_poc: z.string().optional(),
  onsite_poc: z.string().optional(),
}).optional();

export const orgCustomAttributesSchema = z.object({
  social: socialAttributesSchema,
  geo: geoAttributesSchema,
  operations: operationsAttributesSchema,
  identifiers: identifierAttributesSchema,
  contacts: orgContactAttributesSchema,
  legacy: z.record(z.unknown()).optional(),
}).passthrough().optional();

export const organizationFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(200),
  type: z
    .enum(['company', 'fund', 'agency', 'non_profit', 'government', 'other'])
    .optional()
    .nullable(),
  industry: z.string().max(200).optional().nullable(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  addresses: z.array(addressEntrySchema).default([]),
  description: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).default([]),
  logo_url: z.string().url().optional().nullable().or(z.literal('')),
  custom_attributes: orgCustomAttributesSchema,
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export const organizationSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'created_at', 'updated_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type OrganizationSearchParams = z.infer<typeof organizationSearchSchema>;

