import { restClient } from '@/lib/supabase/restClient';

import { getPeriodDates } from '../utils/periodUtils';

import { VENTURE_DISPLAY_ORDER } from '@/lib/constants';

import type {
  DashboardFilters,
  LeadershipSummary,
  ActivityVolume,
  PipelineSummary,
  VentureSummary,
  DashboardActivity,
  ColdOpportunity,
  LeadershipSummaryRow,
  ActivityVolumeRow,
  PipelineSummaryRow,
  ColdOpportunityRow,
  DashboardActivityRow,
  OpportunityAttentionItem,
  StageMovement,
  AttentionReason,
  SimplifiedStageCount,
  PipelineCount,
} from '../types/leadershipDashboard.types';
import type { Venture } from '@/types/database';

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
   * Compute attention items from cold opportunities for a specific pipeline type
   */
  computeAttentionItems(
    coldOpportunities: ColdOpportunity[],
    pipelineType: string,
    periodStart: Date
  ): OpportunityAttentionItem[] {
    const items = coldOpportunities
      .filter((opp) => opp.pipelineType === pipelineType)
      .map((opp): OpportunityAttentionItem => {
        const reasons: AttentionReason[] = [];
        
        // Determine attention reasons based on days since activity
        if (opp.daysSinceActivity >= 14) {
          reasons.push({ type: 'ice_cold', days: opp.daysSinceActivity });
        } else if (opp.daysSinceActivity >= 7) {
          reasons.push({ type: 'cold', days: opp.daysSinceActivity });
        }

        // Estimate days in stage (using days since activity as proxy)
        // In a real implementation, this would come from the database
        const daysInStage = opp.daysSinceActivity;
        if (daysInStage >= 30) {
          reasons.push({ type: 'very_stuck', days: daysInStage });
        } else if (daysInStage >= 14) {
          reasons.push({ type: 'stuck', days: daysInStage });
        }

        return {
          id: opp.id,
          entityName: opp.entityName,
          entityType: opp.entityType,
          entityId: opp.entityId,
          pipelineType: opp.pipelineType,
          stage: opp.stage,
          daysSinceActivity: opp.daysSinceActivity,
          daysInStage,
          ownerName: opp.ownerName,
          ventures: opp.ventures,
          attentionReasons: reasons.length > 0 ? reasons : undefined,
        };
      });

    return items.sort((a, b) => {
      // Sort by most urgent first (ice_cold > cold > very_stuck > stuck)
      const aPriority = a.attentionReasons?.[0]?.type === 'ice_cold' ? 4 :
                        a.attentionReasons?.[0]?.type === 'cold' ? 3 :
                        a.attentionReasons?.[0]?.type === 'very_stuck' ? 2 :
                        a.attentionReasons?.[0]?.type === 'stuck' ? 1 : 0;
      const bPriority = b.attentionReasons?.[0]?.type === 'ice_cold' ? 4 :
                        b.attentionReasons?.[0]?.type === 'cold' ? 3 :
                        b.attentionReasons?.[0]?.type === 'very_stuck' ? 2 :
                        b.attentionReasons?.[0]?.type === 'stuck' ? 1 : 0;
      return bPriority - aPriority;
    });
  },

  /**
   * Extract stage movements from activity feed
   */
  extractStageMovements(
    activities: DashboardActivity[],
    pipelineType: string
  ): StageMovement[] {
    const movements: StageMovement[] = [];

    for (const activity of activities) {
      // Only process stage_change activities for this pipeline
      if (activity.type !== 'stage_change' || activity.pipelineType !== pipelineType) {
        continue;
      }

      // Parse stage change from description
      // Format is typically "Stage A → Stage B" or "Moved from Stage A to Stage B"
      const description = activity.description || '';
      const stageMatch = description.match(/(?:from\s+)?([^→\s]+)\s*(?:→|to)\s*([^\s]+)/i);
      
      if (stageMatch) {
        const fromStage = stageMatch[1].trim();
        const toStage = stageMatch[2].trim();

        // Determine if this is a win (check if toStage is a terminal stage)
        const terminalStages = ['Won', 'Closed', 'Invested', 'Committed', 'Active Partnership', 'Active'];
        const isWin = terminalStages.some((stage) => toStage.toLowerCase().includes(stage.toLowerCase()));

        movements.push({
          id: activity.id,
          entityName: activity.entityName,
          entityId: activity.entityId,
          pipelineType: activity.pipelineType!,
          fromStage,
          toStage,
          movedAt: activity.occurredAt,
          ownerName: activity.userName,
          isWin,
        });
      }
    }

    return movements.sort((a, b) => b.movedAt.getTime() - a.movedAt.getTime());
  },

  /**
   * Get pipeline summaries (for pipeline view)
   */
  async getPipelineSummaries(filters: DashboardFilters): Promise<PipelineSummary[]> {
    const { start, end } = getPeriodDates(filters);

    // Fetch all required data in parallel
    const [pipelineData, coldOpportunities, recentActivity] = await Promise.all([
      restClient.rpc<PipelineSummaryRow[]>('get_pipeline_summaries', {
        args: {
          p_period_start: start.toISOString(),
          p_period_end: end.toISOString(),
          p_venture: filters.venture ?? null,
          p_owner_id: filters.ownerId ?? null,
        },
      }),
      leadershipDashboardService.getColdOpportunities(filters, 100), // Get more for filtering
      leadershipDashboardService.getRecentActivity(filters, 100), // Get more for filtering
    ]);

    if (pipelineData.error) {
      console.error('Error fetching pipeline summaries:', pipelineData.error);
      throw pipelineData.error;
    }

    const rows: PipelineSummaryRow[] = pipelineData.data ?? [];

    return rows.map((row) => {
      const attentionItems = leadershipDashboardService.computeAttentionItems(
        coldOpportunities,
        row.pipeline_type,
        start
      );
      
      const recentMovements = leadershipDashboardService.extractStageMovements(
        recentActivity,
        row.pipeline_type
      );

      return {
        type: row.pipeline_type,
        activeCount: row.active_count,
        stageDistribution: (row.stages ?? []).map((s) => ({
          stage: s.stage,
          count: s.count,
        })),
        attentionItems,
        recentMovements,
        ventureBreakdown: (row.ventures ?? []).map((v) => ({
          venture: v.venture,
          count: v.count,
        })),
      };
    });
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

  /**
   * Get venture summaries (for venture view)
   * Aggregates pipeline data by venture
   */
  async getVentureSummaries(filters: DashboardFilters): Promise<VentureSummary[]> {
    const { start, end } = getPeriodDates(filters);

    // Fetch pipeline summaries and related data
    const [pipelineData, coldOpportunities, recentActivity] = await Promise.all([
      restClient.rpc<PipelineSummaryRow[]>('get_pipeline_summaries', {
        args: {
          p_period_start: start.toISOString(),
          p_period_end: end.toISOString(),
          p_venture: null, // Get all ventures
          p_owner_id: filters.ownerId ?? null,
        },
      }),
      leadershipDashboardService.getColdOpportunities(filters, 200), // Get more for filtering
      leadershipDashboardService.getRecentActivity(filters, 200), // Get more for filtering
    ]);

    if (pipelineData.error) {
      console.error('Error fetching venture summaries:', pipelineData.error);
      throw pipelineData.error;
    }

    const rows: PipelineSummaryRow[] = pipelineData.data ?? [];

    // Group pipelines by venture
    const ventureMap = new Map<Venture, {
      pipelines: PipelineSummaryRow[];
      attentionItems: OpportunityAttentionItem[];
      movements: StageMovement[];
    }>();

    // Initialize all ventures from display order
    VENTURE_DISPLAY_ORDER.forEach((venture) => {
      ventureMap.set(venture, {
        pipelines: [],
        attentionItems: [],
        movements: [],
      });
    });

    // Group pipelines by venture
    rows.forEach((row) => {
      const ventures = (row.ventures ?? []).map((v) => v.venture as Venture);
      ventures.forEach((venture) => {
        const ventureData = ventureMap.get(venture);
        if (ventureData) {
          ventureData.pipelines.push(row);
          
          // Add attention items for this venture and pipeline
          const attentionItems = leadershipDashboardService.computeAttentionItems(
            coldOpportunities.filter((opp) => 
              opp.pipelineType === row.pipeline_type && 
              opp.ventures.includes(venture)
            ),
            row.pipeline_type,
            start
          );
          ventureData.attentionItems.push(...attentionItems);

          // Add movements for this venture and pipeline
          const movements = leadershipDashboardService.extractStageMovements(
            recentActivity.filter((act) => 
              act.pipelineType === row.pipeline_type
            ),
            row.pipeline_type
          );
          ventureData.movements.push(...movements);
        }
      });
    });

    // Convert to VentureSummary array
    const summaries: VentureSummary[] = [];

    ventureMap.forEach((data, venture) => {
      if (data.pipelines.length === 0) {
        return; // Skip ventures with no pipelines
      }

      // Calculate totals
      const activeCount = data.pipelines.reduce(
        (sum, p) => sum + p.active_count,
        0
      );

      // Build pipeline breakdown
      const pipelineBreakdown: PipelineCount[] = data.pipelines.map((p) => ({
        type: p.pipeline_type,
        count: p.active_count,
      }));

      // Build simplified stage distribution (aggregate across pipelines)
      const stageMap = new Map<string, number>();
      data.pipelines.forEach((p) => {
        (p.stages ?? []).forEach((s) => {
          const current = stageMap.get(s.stage) || 0;
          stageMap.set(s.stage, current + s.count);
        });
      });

      // Categorize stages into simplified buckets
      const simplifiedStages: SimplifiedStageCount[] = [
        { category: 'early', count: 0 },
        { category: 'mid', count: 0 },
        { category: 'late', count: 0 },
        { category: 'won', count: 0 },
      ];

      stageMap.forEach((count, stage) => {
        const lowerStage = stage.toLowerCase();
        if (lowerStage.includes('won') || lowerStage.includes('closed') || 
            lowerStage.includes('invested') || lowerStage.includes('committed') ||
            lowerStage.includes('active')) {
          simplifiedStages[3].count += count; // won
        } else if (lowerStage.includes('proposal') || lowerStage.includes('negotiation') ||
                   lowerStage.includes('evaluation') || lowerStage.includes('diligence')) {
          simplifiedStages[2].count += count; // late
        } else if (lowerStage.includes('qualified') || lowerStage.includes('discovery')) {
          simplifiedStages[1].count += count; // mid
        } else {
          simplifiedStages[0].count += count; // early
        }
      });

      // Deduplicate and sort attention items and movements
      const uniqueAttentionItems = Array.from(
        new Map(data.attentionItems.map((item) => [item.id, item])).values()
      ).sort((a, b) => {
        const aPriority = a.attentionReasons?.[0]?.type === 'ice_cold' ? 4 :
                          a.attentionReasons?.[0]?.type === 'cold' ? 3 :
                          a.attentionReasons?.[0]?.type === 'very_stuck' ? 2 :
                          a.attentionReasons?.[0]?.type === 'stuck' ? 1 : 0;
        const bPriority = b.attentionReasons?.[0]?.type === 'ice_cold' ? 4 :
                          b.attentionReasons?.[0]?.type === 'cold' ? 3 :
                          b.attentionReasons?.[0]?.type === 'very_stuck' ? 2 :
                          b.attentionReasons?.[0]?.type === 'stuck' ? 1 : 0;
        return bPriority - aPriority;
      });

      const uniqueMovements = Array.from(
        new Map(data.movements.map((mov) => [mov.id, mov])).values()
      ).sort((a, b) => b.movedAt.getTime() - a.movedAt.getTime());

      summaries.push({
        venture,
        activeCount,
        pipelineBreakdown,
        stageDistribution: simplifiedStages.filter((s) => s.count > 0),
        attentionItems: uniqueAttentionItems,
        recentMovements: uniqueMovements,
      });
    });

    // Sort by display order
    return summaries.sort((a, b) => {
      const aIndex = VENTURE_DISPLAY_ORDER.indexOf(a.venture);
      const bIndex = VENTURE_DISPLAY_ORDER.indexOf(b.venture);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  },
};
