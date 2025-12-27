import { z } from 'zod';

import type { Venture } from '@/types/database';

// =============================================================================
// PROJECT FORM SCHEMA
// =============================================================================

export const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  scope: z.enum(['internal', 'external'], {
    required_error: 'Scope is required',
  }),
  category: z.enum(
    [
      'product_development',
      'client_delivery',
      'strategic_initiative',
      'operations_infrastructure',
      'investment_portfolio',
    ],
    {
      required_error: 'Category is required',
    }
  ),
  status: z
    .enum(['draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .default('draft'),
  health: z
    .enum(['not_started', 'on_track', 'at_risk', 'blocked'])
    .default('not_started'),
  ventures: z
    .array(
      z.enum([
        'forge',
        'hearth',
        'anvil',
        'crucible',
        'foundry',
        'carbide',
        'lucepta',
        'meridian_44',
        'trade_stone_group',
      ])
    )
    .min(1, 'At least one venture is required'),
  ownerId: z.string().uuid('Invalid owner ID'),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  githubProjectUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

// =============================================================================
// PHASE FORM SCHEMA
// =============================================================================

export const phaseFormSchema = z.object({
  name: z.string().min(1, 'Phase name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: z
    .enum(['not_started', 'in_progress', 'completed'])
    .default('not_started'),
});

export type PhaseFormValues = z.infer<typeof phaseFormSchema>;

// =============================================================================
// MILESTONE FORM SCHEMA
// =============================================================================

export const milestoneFormSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  targetDate: z.string().optional().nullable(),
  completed: z.boolean().default(false),
});

export type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

// =============================================================================
// PROJECT SEARCH/FILTER SCHEMA
// =============================================================================

export const projectSearchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'updated_at', 'target_date', 'health']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  scope: z.enum(['internal', 'external']).optional(),
  category: z
    .enum([
      'product_development',
      'client_delivery',
      'strategic_initiative',
      'operations_infrastructure',
      'investment_portfolio',
    ])
    .optional(),
  status: z
    .enum(['draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .optional(),
  health: z.enum(['not_started', 'on_track', 'at_risk', 'blocked']).optional(),
  venture: z
    .enum([
      'forge',
      'hearth',
      'anvil',
      'crucible',
      'foundry',
      'carbide',
      'lucepta',
      'meridian_44',
      'trade_stone_group',
    ])
    .optional(),
  ownerId: z.string().uuid().optional(),
});

export type ProjectSearchParams = z.infer<typeof projectSearchSchema>;

