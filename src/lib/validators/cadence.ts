import { z } from 'zod';

export const cadenceStepSchema = z.object({
  step_number: z.number().int().positive(),
  name: z.string().min(1, 'Step name is required').max(200),
  task_type: z.enum(['call', 'email', 'text', 'meeting', 'send_mailer', 'other']),
  day_offset: z.number().int().min(0).default(0),
  description: z.string().max(1000).optional().nullable(),
});

export type CadenceStepValues = z.infer<typeof cadenceStepSchema>;

export const cadenceTemplateFormSchema = z.object({
  name: z.string().min(1, 'Cadence name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  relationship_types: z
    .array(
      z.enum([
        'b2b_client',
        'b2c_client',
        'non_business_investment',
        'business_investment_external',
        'internal_business_opportunity',
        'portfolio_company',
        'partnership_opportunity',
        'individual_partnership',
        'investor',
        'meridian_44_participant',
      ])
    )
    .default([]),
  is_active: z.boolean().default(true),
  steps: z
    .array(cadenceStepSchema)
    .min(1, 'At least one step is required')
    .transform((steps) => {
      // Ensure step numbers are sequential starting from 1
      return steps.map((step, index) => ({
        ...step,
        step_number: index + 1,
      }));
    }),
});

export type CadenceTemplateFormValues = z.infer<typeof cadenceTemplateFormSchema>;

export const applyCadenceSchema = z.object({
  cadence_template_id: z.string().uuid('Please select a cadence'),
  contact_id: z.string().uuid('Please select a contact'),
  relationship_id: z.string().uuid().optional().nullable(),
  start_date: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: 'Please enter a valid start date' }
  ),
});

export type ApplyCadenceValues = z.infer<typeof applyCadenceSchema>;

export const pauseCadenceSchema = z.object({
  applied_cadence_id: z.string().uuid(),
});

export const resumeCadenceSchema = z.object({
  applied_cadence_id: z.string().uuid(),
});

export const clearCadenceSchema = z.object({
  applied_cadence_id: z.string().uuid(),
  clear_reason: z.string().min(1, 'Clear reason is required').max(500),
});

export type ClearCadenceValues = z.infer<typeof clearCadenceSchema>;

