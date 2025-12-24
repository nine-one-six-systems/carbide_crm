import { z } from 'zod';

// Business Relationship Types
export const businessRelationshipTypes = [
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
] as const;

export const ventures = [
  'forge',
  'hearth',
  'anvil',
  'crucible',
  'foundry',
  'carbide',
  'lucepta',
  'meridian_44',
  'trade_stone_group',
] as const;

export const pipelineStages = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
] as const;

// Business Relationship Form Schema
export const businessRelationshipFormSchema = z.object({
  type: z.enum(businessRelationshipTypes, {
    required_error: 'Relationship type is required',
  }),
  contact_id: z.string().uuid().optional().nullable(),
  organization_id: z.string().uuid().optional().nullable(),
  stage: z.string().min(1, 'Stage is required'),
  ventures: z.array(z.enum(ventures)).default([]),
  owner_id: z.string().uuid({ message: 'Owner is required' }),
  // Type-specific attributes
  attributes: z.object({
    // B2B/B2C Client attributes
    contract_value: z.number().optional(),
    contract_start_date: z.string().optional(),
    contract_end_date: z.string().optional(),
    // Investment attributes
    investment_amount: z.number().optional(),
    equity_percentage: z.number().min(0).max(100).optional(),
    investment_date: z.string().optional(),
    // Partnership attributes
    partnership_type: z.string().optional(),
    revenue_share: z.number().min(0).max(100).optional(),
    // Common attributes
    notes: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    expected_close_date: z.string().optional(),
    estimated_value: z.number().optional(),
  }).optional().default({}),
}).refine(
  (data) => data.contact_id || data.organization_id,
  {
    message: 'Either contact or organization must be selected',
    path: ['contact_id'],
  }
);

// Primary Relationship Group Schema
export const primaryRelationshipGroupFormSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
});

// Primary Relationship Member Schema
export const primaryRelationshipMemberFormSchema = z.object({
  group_id: z.string().uuid(),
  contact_id: z.string().uuid(),
  role: z.enum(['spouse', 'partner', 'child', 'parent', 'sibling'], {
    required_error: 'Role is required',
  }),
  is_adult: z.boolean().default(true),
});

// Secondary Relationship Schema
export const secondaryRelationshipFormSchema = z.object({
  contact_id: z.string().uuid(),
  related_contact_id: z.string().uuid(),
  relationship_type: z.enum([
    'parent_child',
    'sibling',
    'colleague',
    'former_colleague',
    'manager_reports_to',
    'mentor_mentee',
    'referral_source',
    'business_partner',
    'friend',
    'other',
  ], {
    required_error: 'Relationship type is required',
  }),
  notes: z.string().optional(),
});

export type BusinessRelationshipFormValues = z.infer<typeof businessRelationshipFormSchema>;
export type PrimaryRelationshipGroupFormValues = z.infer<typeof primaryRelationshipGroupFormSchema>;
export type PrimaryRelationshipMemberFormValues = z.infer<typeof primaryRelationshipMemberFormSchema>;
export type SecondaryRelationshipFormValues = z.infer<typeof secondaryRelationshipFormSchema>;

