import type { Venture, BusinessRelationshipType } from '@/types/database';

/**
 * List of ventures in the NineOneSix ecosystem
 */
export const VENTURES: Array<{ value: Venture; label: string }> = [
  { value: 'forge', label: 'Forge' },
  { value: 'hearth', label: 'Hearth' },
  { value: 'anvil', label: 'Anvil' },
  { value: 'crucible', label: 'Crucible' },
  { value: 'foundry', label: 'Foundry' },
  { value: 'carbide', label: 'Carbide' },
  { value: 'lucepta', label: 'Lucepta' },
  { value: 'meridian_44', label: 'Meridian 44' },
  { value: 'trade_stone_group', label: 'Trade Stone Group' },
];

/**
 * Pipeline types included in the Leadership Dashboard
 */
export const PIPELINE_TYPES: Array<{
  value: BusinessRelationshipType;
  label: string;
  shortLabel?: string;
}> = [
  { value: 'b2b_client', label: 'B2B Clients', shortLabel: 'B2B' },
  { value: 'b2c_client', label: 'B2C Clients', shortLabel: 'B2C' },
  {
    value: 'business_investment_external',
    label: 'Investments (External)',
    shortLabel: 'Investments',
  },
  {
    value: 'internal_business_opportunity',
    label: 'Internal Opportunities',
    shortLabel: 'Internal',
  },
  { value: 'portfolio_company', label: 'Portfolio Companies', shortLabel: 'Portfolio' },
  { value: 'partnership_opportunity', label: 'Partnerships', shortLabel: 'Partners' },
  {
    value: 'individual_partnership',
    label: 'Individual Partnerships',
    shortLabel: 'Individuals',
  },
  { value: 'investor', label: 'Investors', shortLabel: 'Investors' },
  {
    value: 'meridian_44_participant',
    label: 'M44 Participants',
    shortLabel: 'M44',
  },
];

/**
 * Lookup function for venture label by value
 */
export function getVentureLabel(value: Venture): string {
  const venture = VENTURES.find((v) => v.value === value);
  return venture?.label ?? value;
}

/**
 * Lookup function for pipeline type label by value
 */
export function getPipelineTypeLabel(
  value: BusinessRelationshipType,
  short = false
): string {
  const pipeline = PIPELINE_TYPES.find((p) => p.value === value);
  if (short && pipeline?.shortLabel) {
    return pipeline.shortLabel;
  }
  return pipeline?.label ?? value;
}

/**
 * Pipeline types included in leadership dashboard (for filtering)
 */
export const LEADERSHIP_PIPELINE_TYPES: BusinessRelationshipType[] = PIPELINE_TYPES.map(
  (p) => p.value
);

/**
 * Display order for pipelines in the Leadership Dashboard
 */
export const PIPELINE_DISPLAY_ORDER: BusinessRelationshipType[] = [
  'b2b_client',
  'b2c_client',
  'business_investment_external',
  'internal_business_opportunity',
  'portfolio_company',
  'partnership_opportunity',
  'individual_partnership',
  'investor',
  'meridian_44_participant',
];

/**
 * Display order for ventures in the Leadership Dashboard
 */
export const VENTURE_DISPLAY_ORDER: Venture[] = [
  'forge',
  'hearth',
  'anvil',
  'crucible',
  'foundry',
  'carbide',
  'lucepta',
  'meridian_44',
  'trade_stone_group',
];

