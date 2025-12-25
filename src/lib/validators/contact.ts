import { z } from 'zod';

// Email entry schema
export const emailEntrySchema = z.object({
  value: z.string().email('Please enter a valid email address'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean().default(false),
});

// Phone entry schema
export const phoneEntrySchema = z.object({
  value: z.string().min(1, 'Phone number is required'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean().default(false),
});

// Address entry schema
export const addressEntrySchema = z.object({
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  label: z.string().optional(),
});

// Custom attributes schemas
export const personalAttributesSchema = z.object({
  favorite_food: z.string().optional(),
  favorite_drink: z.string().optional(),
  coffee_order: z.string().optional(),
  favorite_restaurant: z.string().optional(),
  hobbies: z.string().optional(),
  leisure_activities: z.string().optional(),
  goals: z.string().optional(),
  birthday: z.string().optional(),
  anniversary: z.string().optional(),
  marital_status: z.string().optional(),
  dependents: z.string().optional(),
}).optional();

export const socialAttributesSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  skype: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
}).optional();

export const preferenceAttributesSchema = z.object({
  email_opt_out: z.boolean().optional(),
  sms_opt_out: z.boolean().optional(),
  email_opt_out_reason: z.string().optional(),
}).optional();

export const geoAttributesSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  created_lat: z.number().optional(),
  created_lng: z.number().optional(),
  created_address: z.string().optional(),
}).optional();

export const customAttributesSchema = z.object({
  personal: personalAttributesSchema,
  social: socialAttributesSchema,
  preferences: preferenceAttributesSchema,
  geo: geoAttributesSchema,
  legacy: z.record(z.unknown()).optional(),
}).passthrough().optional();

// Contact form schema with transforms
export const contactFormSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    emails: z
      .array(emailEntrySchema)
      .default([])
      .transform((emails) => {
        // Ensure at most one primary email
        const primaryCount = emails.filter((e) => e.is_primary).length;
        if (primaryCount > 1) {
          return emails.map((email, index) => ({
            ...email,
            is_primary: index === emails.findIndex((e) => e.is_primary),
          }));
        }
        return emails;
      }),
    phones: z
      .array(phoneEntrySchema)
      .default([])
      .transform((phones) => {
        // Ensure at most one primary phone
        const primaryCount = phones.filter((p) => p.is_primary).length;
        if (primaryCount > 1) {
          return phones.map((phone, index) => ({
            ...phone,
            is_primary: index === phones.findIndex((p) => p.is_primary),
          }));
        }
        return phones;
      }),
    addresses: z.array(addressEntrySchema).default([]),
    job_title: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    tags: z.array(z.string()).default([]),
    avatar_url: z.string().url().optional().nullable().or(z.literal('')),
    custom_attributes: customAttributesSchema,
  })
;

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Contact search schema
export const contactSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['first_name', 'last_name', 'created_at', 'updated_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().uuid().optional(),
  hasOrganization: z.boolean().optional(),
});

export type ContactSearchParams = z.infer<typeof contactSearchSchema>;

