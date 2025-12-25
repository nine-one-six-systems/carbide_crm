import { restClient } from '@/lib/supabase/restClient';

import { getPeriodDates } from '../utils/periodUtils';

import type {
  DashboardFilters,
  LeadershipSummary,
  ActivityVolume,
  PipelineSummary,
  DashboardActivity,
  ColdOpportunity,
  LeadershipSummaryRow,
  ActivityVolumeRow,
  PipelineSummaryRow,
  ColdOpportunityRow,
  DashboardActivityRow,
} from '../types/leadershipDashboard.types';

export const leadershipDashboardService = {
  /**
   * Get summary KPIs for the dashboard (Active, Advanced, Stuck, Cold counts)
   */
  async getSummary(filters: DashboardFilters): Promise<LeadershipSummary> {
    const { start, end } = getPeriodDates(filters);

    const { data, error } = await restClient.rpc<LeadershipSummaryRow | LeadershipSummaryRow[]>('get_leadership_summary', {
      args: {
        p_period_start: start.toISOString(),
        p_period_end: end.toISOString(),
        p_venture: filters.venture ?? null,
        p_owner_id: filters.ownerId ?? null,
      },
    });

    if (error) {
      console.error('Error fetching leadership summary:', error);
      throw error;
    }

    // Handle both array and single row responses
    const row: LeadershipSummaryRow = Array.isArray(data) ? data[0] : data;

    return {
      activeCount: row?.active_count ?? 0,
      advancedCount: row?.advanced_count ?? 0,
      stuckCount: row?.stuck_count ?? 0,
      coldCount: row?.cold_count ?? 0,
    };
  },

  /**
   * Get activity volume metrics (calls, emails, meetings)
   */
  async getActivityVolume(filters: DashboardFilters): Promise<ActivityVolume> {
    const { start, end } = getPeriodDates(filters);

    const { data, error } = await restClient.rpc<ActivityVolumeRow | ActivityVolumeRow[]>('get_activity_volume', {
      args: {
        p_period_start: start.toISOString(),
        p_period_end: end.toISOString(),
        p_venture: filters.venture ?? null,
        p_owner_id: filters.ownerId ?? null,
      },
    });

    if (error) {
      console.error('Error fetching activity volume:', error);
      throw error;
    }

    const row: ActivityVolumeRow = Array.isArray(data) ? data[0] : data;

    return {
      calls: row?.calls ?? 0,
      emails: row?.emails ?? 0,
      meetings: row?.meetings ?? 0,
    };
  },

  /**
   * Get pipeline summaries (for pipeline view)
   */
  async getPipelineSummaries(filters: DashboardFilters): Promise<PipelineSummary[]> {
    const { start, end } = getPeriodDates(filters);

    const { data, error } = await restClient.rpc<PipelineSummaryRow[]>('get_pipeline_summaries', {
      args: {
        p_period_start: start.toISOString(),
        p_period_end: end.toISOString(),
        p_venture: filters.venture ?? null,
        p_owner_id: filters.ownerId ?? null,
      },
    });

    if (error) {
      console.error('Error fetching pipeline summaries:', error);
      throw error;
    }

    const rows: PipelineSummaryRow[] = data ?? [];

    return rows.map((row) => ({
      type: row.pipeline_type,
      activeCount: row.active_count,
      stageDistribution: (row.stages ?? []).map((s) => ({
        stage: s.stage,
        count: s.count,
      })),
      attentionItems: [], // Populated separately if needed
      recentMovements: [], // Populated separately if needed
      ventureBreakdown: (row.ventures ?? []).map((v) => ({
        venture: v.venture,
        count: v.count,
      })),
    }));
  },

  /**
   * Get cold opportunities (no activity in 7+ days)
   */
  async getColdOpportunities(
    filters: DashboardFilters,
    limit = 10
  ): Promise<ColdOpportunity[]> {
    const { data, error } = await restClient.rpc<ColdOpportunityRow[]>('get_cold_opportunities', {
      args: {
        p_days_threshold: 7,
        p_limit: limit,
        p_venture: filters.venture ?? null,
        p_owner_id: filters.ownerId ?? null,
      },
    });

    if (error) {
      console.error('Error fetching cold opportunities:', error);
      throw error;
    }

    const rows: ColdOpportunityRow[] = data ?? [];

    return rows.map((row) => ({
      id: row.id,
      entityName: row.entity_name,
      entityType: row.entity_type as 'contact' | 'organization',
      entityId: row.id, // Using relationship ID as the entity ID for navigation
      pipelineType: row.pipeline_type,
      stage: row.stage,
      daysSinceActivity: row.days_since_activity,
      ownerName: row.owner_name,
      ventures: row.ventures ?? [],
    }));
  },

  /**
   * Get recent activity feed
   */
  async getRecentActivity(
    filters: DashboardFilters,
    limit = 10
  ): Promise<DashboardActivity[]> {
    const { start, end } = getPeriodDates(filters);

    const { data, error } = await restClient.rpc<DashboardActivityRow[]>('get_dashboard_activity', {
      args: {
        p_period_start: start.toISOString(),
        p_period_end: end.toISOString(),
        p_venture: filters.venture ?? null,
        p_owner_id: filters.ownerId ?? null,
        p_limit: limit,
      },
    });

    if (error) {
      console.error('Error fetching dashboard activity:', error);
      throw error;
    }

    const rows: DashboardActivityRow[] = data ?? [];

    return rows.map((row) => ({
      id: row.id,
      type: row.activity_type,
      entityName: row.entity_name,
      entityId: row.entity_id,
      pipelineType: row.pipeline_type ?? undefined,
      description: row.description,
      occurredAt: new Date(row.occurred_at),
      userName: row.user_name,
    }));
  },
};
