import type { BusinessRelationshipType, Venture } from '@/types/database';

// =============================================================================
// VIEW & FILTER TYPES
// =============================================================================

/** Dashboard view mode toggle */
export type DashboardView = 'pipeline' | 'venture';

/** Time period options for filtering */
export type DashboardPeriod = '7d' | '14d' | '30d' | 'quarter' | 'all' | 'custom';

/** Filter state for the dashboard */
export interface DashboardFilters {
  view: DashboardView;
  period: DashboardPeriod;
  periodStart?: Date;
  periodEnd?: Date;
  venture?: Venture;
  ownerId?: string;
  pipelineType?: BusinessRelationshipType;
}

// =============================================================================
// SUMMARY & METRICS TYPES
// =============================================================================

/** Summary KPIs displayed at the top of the dashboard */
export interface LeadershipSummary {
  activeCount: number;
  advancedCount: number;
  stuckCount: number;
  coldCount: number;
}

/** Activity volume metrics (calls, emails, meetings) */
export interface ActivityVolume {
  calls: number;
  emails: number;
  meetings: number;
}

// =============================================================================
// DISTRIBUTION & BREAKDOWN TYPES
// =============================================================================

/** Stage count for distribution visualization */
export interface StageCount {
  stage: string;
  count: number;
}

/** Venture count for breakdown display */
export interface VentureCount {
  venture: Venture | string;
  count: number;
}

/** Pipeline count for venture view breakdown */
export interface PipelineCount {
  type: BusinessRelationshipType;
  count: number;
}

/** Simplified stage counts (Early/Mid/Late/Won for aggregated views) */
export interface SimplifiedStageCount {
  category: 'early' | 'mid' | 'late' | 'won';
  count: number;
}

// =============================================================================
// ATTENTION & OPPORTUNITY TYPES
// =============================================================================

/** Attention reason types */
export type AttentionReason =
  | { type: 'stuck'; days: number }
  | { type: 'very_stuck'; days: number }
  | { type: 'stale'; days: number }
  | { type: 'cold'; days: number }
  | { type: 'ice_cold'; days: number };

/** Opportunity that needs attention (stuck or cold) */
export interface OpportunityAttentionItem {
  id: string;
  entityName: string;
  entityType: 'contact' | 'organization';
  entityId: string;
  pipelineType: BusinessRelationshipType;
  stage: string;
  daysSinceActivity: number;
  daysInStage: number;
  ownerName: string;
  ventures: Venture[];
  attentionReasons?: AttentionReason[];
}

/** Stage movement event for recent activity */
export interface StageMovement {
  id: string;
  entityName: string;
  entityId: string;
  pipelineType: BusinessRelationshipType;
  fromStage: string;
  toStage: string;
  movedAt: Date;
  ownerName: string;
  isWin?: boolean;
}

// =============================================================================
// SECTION DATA TYPES
// =============================================================================

/** Pipeline section data (for pipeline view) */
export interface PipelineSummary {
  type: BusinessRelationshipType;
  activeCount: number;
  stageDistribution: StageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
  ventureBreakdown: VentureCount[];
}

/** Venture section data (for venture view) */
export interface VentureSummary {
  venture: Venture;
  activeCount: number;
  pipelineBreakdown: PipelineCount[];
  stageDistribution: SimplifiedStageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
}

// =============================================================================
// ACTIVITY FEED TYPES
// =============================================================================

/** Activity item for the cross-pipeline activity feed */
export interface DashboardActivity {
  id: string;
  type: string;
  entityName: string;
  entityId: string;
  pipelineType?: BusinessRelationshipType;
  description: string;
  occurredAt: Date;
  userName: string;
}

/** Cold opportunity for the coverage gaps section */
export interface ColdOpportunity {
  id: string;
  entityName: string;
  entityType: 'contact' | 'organization';
  entityId: string;
  pipelineType: BusinessRelationshipType;
  stage: string;
  daysSinceActivity: number;
  ownerName: string;
  ventures: Venture[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/** Raw response from get_leadership_summary RPC */
export interface LeadershipSummaryRow {
  active_count: number;
  advanced_count: number;
  stuck_count: number;
  cold_count: number;
}

/** Raw response from get_activity_volume RPC */
export interface ActivityVolumeRow {
  calls: number;
  emails: number;
  meetings: number;
}

/** Raw response from get_pipeline_summaries RPC */
export interface PipelineSummaryRow {
  pipeline_type: BusinessRelationshipType;
  active_count: number;
  stages: Array<{ stage: string; count: number }>;
  ventures: Array<{ venture: string; count: number }>;
}

/** Raw response from get_cold_opportunities RPC */
export interface ColdOpportunityRow {
  id: string;
  entity_name: string;
  entity_type: string;
  pipeline_type: BusinessRelationshipType;
  stage: string;
  days_since_activity: number;
  owner_name: string;
  ventures: Venture[];
}

/** Raw response from get_dashboard_activity RPC */
export interface DashboardActivityRow {
  id: string;
  activity_type: string;
  entity_name: string;
  entity_id: string;
  pipeline_type: BusinessRelationshipType | null;
  description: string;
  occurred_at: string;
  user_name: string;
}

