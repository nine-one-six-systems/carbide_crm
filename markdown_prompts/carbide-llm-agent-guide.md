# Carbide CRM - LLM Agent Implementation Guide

> **For:** Cursor + Claude AI Agent  
> **Format:** Atomic tasks with explicit file paths, code patterns, and verification steps  
> **Usage:** Copy relevant sections into Cursor chat or use as `.cursorrules` reference

---

## Quick Reference

```yaml
Tech Stack:
  - Framework: React 18 + TypeScript 5
  - Build: Vite 5
  - Styling: Tailwind CSS 3 + shadcn/ui
  - State: TanStack Query v5
  - Forms: React Hook Form + Zod
  - Backend: Supabase (PostgreSQL + Auth + Realtime)
  - Routing: React Router v6
  - Testing: Vitest + Playwright

Key Directories:
  - Components: src/features/{feature}/components/
  - Hooks: src/features/{feature}/hooks/
  - Services: src/features/{feature}/services/
  - Types: src/features/{feature}/types/ or src/types/
  - Pages: src/pages/
  - Migrations: supabase/migrations/
  - Tests: tests/unit/, tests/e2e/

Patterns to Follow:
  - Use existing components in src/components/ui/ (shadcn)
  - Follow service pattern in src/features/contacts/services/
  - Follow hook pattern in src/features/contacts/hooks/
  - Use existing types in src/types/database.ts as reference
```

---

## TASK BLOCK 1: Leadership Dashboard - Database Layer

### Task 1.1: Create Terminal Stages Helper Function

**File:** `supabase/migrations/00004_leadership_dashboard.sql`

```sql
-- Create this file with the following content:

-- =============================================================================
-- LEADERSHIP DASHBOARD FUNCTIONS
-- =============================================================================

-- Helper function to get terminal (closed) stages for each pipeline type
CREATE OR REPLACE FUNCTION get_terminal_stages(p_type business_relationship_type)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'b2b_client' THEN ARRAY['Won', 'Lost', 'Disqualified']
    WHEN 'b2c_client' THEN ARRAY['Closed', 'Lost', 'Cancelled']
    WHEN 'business_investment_external' THEN ARRAY['Invested', 'Passed', 'Withdrawn']
    WHEN 'internal_business_opportunity' THEN ARRAY['Launched', 'Shelved', 'Merged']
    WHEN 'portfolio_company' THEN ARRAY['Exited', 'Written Off', 'Acquired']
    WHEN 'partnership_opportunity' THEN ARRAY['Active Partnership', 'Declined', 'Dissolved']
    WHEN 'individual_partnership' THEN ARRAY['Active', 'Declined', 'Inactive']
    WHEN 'investor' THEN ARRAY['Committed', 'Passed']
    WHEN 'meridian_44_participant' THEN ARRAY['Active', 'Declined', 'Inactive']
    ELSE ARRAY['Closed', 'Lost']::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Verify:** Run `SELECT get_terminal_stages('b2b_client');` in Supabase SQL editor.

---

### Task 1.2: Create Leadership Summary RPC

**Append to:** `supabase/migrations/00004_leadership_dashboard.sql`

```sql
-- Get summary KPIs for leadership dashboard
CREATE OR REPLACE FUNCTION get_leadership_summary(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  active_count BIGINT,
  advanced_count BIGINT,
  stuck_count BIGINT,
  cold_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_relationships AS (
    SELECT 
      br.id,
      br.type,
      br.stage,
      br.updated_at,
      (
        SELECT MAX(a.occurred_at) 
        FROM activities a 
        WHERE a.relationship_id = br.id
      ) as last_activity
    FROM business_relationships br
    WHERE br.type IN (
      'b2b_client', 'b2c_client', 'business_investment_external',
      'internal_business_opportunity', 'portfolio_company',
      'partnership_opportunity', 'individual_partnership',
      'investor', 'meridian_44_participant'
    )
    AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
    AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
    AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  ),
  stage_changes AS (
    SELECT 
      fr.id,
      (
        SELECT MAX(a.occurred_at)
        FROM activities a
        WHERE a.relationship_id = fr.id 
        AND a.type = 'stage_change'
      ) as last_stage_change
    FROM filtered_relationships fr
  )
  SELECT
    COUNT(*)::BIGINT as active_count,
    COUNT(*) FILTER (
      WHERE sc.last_stage_change >= p_period_start
    )::BIGINT as advanced_count,
    COUNT(*) FILTER (
      WHERE sc.last_stage_change < NOW() - INTERVAL '30 days'
      OR sc.last_stage_change IS NULL
    )::BIGINT as stuck_count,
    COUNT(*) FILTER (
      WHERE fr.last_activity < NOW() - INTERVAL '7 days'
      OR fr.last_activity IS NULL
    )::BIGINT as cold_count
  FROM filtered_relationships fr
  LEFT JOIN stage_changes sc ON fr.id = sc.id;
END;
$$ LANGUAGE plpgsql;
```

**Verify:** Run `SELECT * FROM get_leadership_summary();` in Supabase SQL editor.

---

### Task 1.3: Create Activity Volume RPC

**Append to:** `supabase/migrations/00004_leadership_dashboard.sql`

```sql
-- Get activity volume metrics
CREATE OR REPLACE FUNCTION get_activity_volume(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  calls BIGINT,
  emails BIGINT,
  meetings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE a.type IN ('call_inbound', 'call_outbound'))::BIGINT as calls,
    COUNT(*) FILTER (WHERE a.type IN ('email_inbound', 'email_outbound'))::BIGINT as emails,
    COUNT(*) FILTER (WHERE a.type IN ('meeting_in_person', 'meeting_virtual'))::BIGINT as meetings
  FROM activities a
  LEFT JOIN business_relationships br ON a.relationship_id = br.id
  WHERE a.occurred_at BETWEEN p_period_start AND p_period_end
  AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
  AND (p_owner_id IS NULL OR a.logged_by = p_owner_id);
END;
$$ LANGUAGE plpgsql;
```

---

### Task 1.4: Create Pipeline Summaries RPC

**Append to:** `supabase/migrations/00004_leadership_dashboard.sql`

```sql
-- Get per-pipeline summary data
CREATE OR REPLACE FUNCTION get_pipeline_summaries(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  pipeline_type business_relationship_type,
  active_count BIGINT,
  stages JSONB,
  ventures JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    br.type as pipeline_type,
    COUNT(*)::BIGINT as active_count,
    jsonb_agg(DISTINCT jsonb_build_object('stage', br.stage, 'count', 1)) as stages,
    jsonb_agg(DISTINCT jsonb_build_object('venture', unnest_venture, 'count', 1)) as ventures
  FROM business_relationships br
  CROSS JOIN LATERAL unnest(br.ventures) as unnest_venture
  WHERE br.type IN (
    'b2b_client', 'b2c_client', 'business_investment_external',
    'internal_business_opportunity', 'portfolio_company',
    'partnership_opportunity', 'individual_partnership',
    'investor', 'meridian_44_participant'
  )
  AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
  AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
  AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  GROUP BY br.type;
END;
$$ LANGUAGE plpgsql;
```

---

### Task 1.5: Create Cold Opportunities RPC

**Append to:** `supabase/migrations/00004_leadership_dashboard.sql`

```sql
-- Get opportunities with no recent activity (going cold)
CREATE OR REPLACE FUNCTION get_cold_opportunities(
  p_days_threshold INT DEFAULT 7,
  p_limit INT DEFAULT 10,
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entity_name TEXT,
  entity_type TEXT,
  pipeline_type business_relationship_type,
  stage TEXT,
  days_since_activity INT,
  owner_name TEXT,
  ventures venture[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    br.id,
    COALESCE(c.first_name || ' ' || c.last_name, o.name) as entity_name,
    CASE WHEN br.contact_id IS NOT NULL THEN 'contact' ELSE 'organization' END as entity_type,
    br.type as pipeline_type,
    br.stage,
    EXTRACT(DAY FROM NOW() - COALESCE(
      (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = br.id),
      br.created_at
    ))::INT as days_since_activity,
    p.full_name as owner_name,
    br.ventures
  FROM business_relationships br
  LEFT JOIN contacts c ON br.contact_id = c.id
  LEFT JOIN organizations o ON br.organization_id = o.id
  LEFT JOIN profiles p ON br.owner_id = p.id
  WHERE NOT (br.stage = ANY(get_terminal_stages(br.type)))
  AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
  AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  AND COALESCE(
    (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = br.id),
    br.created_at
  ) < NOW() - (p_days_threshold || ' days')::INTERVAL
  ORDER BY days_since_activity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

**After all tasks:** Run the full migration in Supabase.

---

## TASK BLOCK 2: Leadership Dashboard - Type Definitions

### Task 2.1: Create Type Definitions

**Create file:** `src/features/dashboard/types/leadershipDashboard.types.ts`

```typescript
import type { BusinessRelationshipType, Venture } from '@/types/database';

// View mode toggle
export type DashboardView = 'pipeline' | 'venture';

// Time period options
export type DashboardPeriod = '7d' | '14d' | '30d' | 'quarter' | 'all' | 'custom';

// Filter state
export interface DashboardFilters {
  view: DashboardView;
  period: DashboardPeriod;
  periodStart?: Date;
  periodEnd?: Date;
  venture?: Venture;
  ownerId?: string;
  pipelineType?: BusinessRelationshipType;
}

// Summary KPIs
export interface LeadershipSummary {
  activeCount: number;
  advancedCount: number;
  stuckCount: number;
  coldCount: number;
}

// Activity volume metrics
export interface ActivityVolume {
  calls: number;
  emails: number;
  meetings: number;
}

// Stage distribution
export interface StageCount {
  stage: string;
  count: number;
}

// Venture breakdown
export interface VentureCount {
  venture: Venture;
  count: number;
}

// Pipeline breakdown (for venture view)
export interface PipelineCount {
  type: BusinessRelationshipType;
  count: number;
}

// Simplified stage counts (Early/Mid/Late/Won for venture view)
export interface SimplifiedStageCount {
  category: 'early' | 'mid' | 'late' | 'won';
  count: number;
}

// Opportunity needing attention
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
}

// Stage movement event
export interface StageMovement {
  id: string;
  entityName: string;
  entityId: string;
  pipelineType: BusinessRelationshipType;
  fromStage: string;
  toStage: string;
  movedAt: Date;
  ownerName: string;
}

// Pipeline section data
export interface PipelineSummary {
  type: BusinessRelationshipType;
  activeCount: number;
  stageDistribution: StageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
  ventureBreakdown: VentureCount[];
}

// Venture section data
export interface VentureSummary {
  venture: Venture;
  activeCount: number;
  pipelineBreakdown: PipelineCount[];
  stageDistribution: SimplifiedStageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
}

// Activity feed item
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
```

---

## TASK BLOCK 3: Leadership Dashboard - Service Layer

### Task 3.1: Create Dashboard Service

**Create file:** `src/features/dashboard/services/leadershipDashboardService.ts`

```typescript
import { supabase } from '@/lib/supabase/client';
import type {
  DashboardFilters,
  LeadershipSummary,
  ActivityVolume,
  PipelineSummary,
  VentureSummary,
  DashboardActivity,
  OpportunityAttentionItem,
} from '../types/leadershipDashboard.types';
import { getPeriodDates } from '../utils/periodUtils';

export const leadershipDashboardService = {
  /**
   * Get summary KPIs for the dashboard
   */
  async getSummary(filters: DashboardFilters): Promise<LeadershipSummary> {
    const { start, end } = getPeriodDates(filters);
    
    const { data, error } = await supabase.rpc('get_leadership_summary', {
      p_period_start: start.toISOString(),
      p_period_end: end.toISOString(),
      p_venture: filters.venture ?? null,
      p_owner_id: filters.ownerId ?? null,
    });

    if (error) throw error;
    
    return {
      activeCount: data[0]?.active_count ?? 0,
      advancedCount: data[0]?.advanced_count ?? 0,
      stuckCount: data[0]?.stuck_count ?? 0,
      coldCount: data[0]?.cold_count ?? 0,
    };
  },

  /**
   * Get activity volume metrics
   */
  async getActivityVolume(filters: DashboardFilters): Promise<ActivityVolume> {
    const { start, end } = getPeriodDates(filters);
    
    const { data, error } = await supabase.rpc('get_activity_volume', {
      p_period_start: start.toISOString(),
      p_period_end: end.toISOString(),
      p_venture: filters.venture ?? null,
      p_owner_id: filters.ownerId ?? null,
    });

    if (error) throw error;
    
    return {
      calls: data[0]?.calls ?? 0,
      emails: data[0]?.emails ?? 0,
      meetings: data[0]?.meetings ?? 0,
    };
  },

  /**
   * Get pipeline summaries (for pipeline view)
   */
  async getPipelineSummaries(filters: DashboardFilters): Promise<PipelineSummary[]> {
    const { start, end } = getPeriodDates(filters);
    
    const { data, error } = await supabase.rpc('get_pipeline_summaries', {
      p_period_start: start.toISOString(),
      p_period_end: end.toISOString(),
      p_venture: filters.venture ?? null,
      p_owner_id: filters.ownerId ?? null,
    });

    if (error) throw error;
    
    // Transform the data to match our types
    return (data ?? []).map((row: Record<string, unknown>) => ({
      type: row.pipeline_type,
      activeCount: row.active_count,
      stageDistribution: row.stages ?? [],
      attentionItems: [], // Fetched separately if needed
      recentMovements: [], // Fetched separately if needed
      ventureBreakdown: row.ventures ?? [],
    }));
  },

  /**
   * Get cold opportunities
   */
  async getColdOpportunities(
    filters: DashboardFilters,
    limit = 10
  ): Promise<OpportunityAttentionItem[]> {
    const { data, error } = await supabase.rpc('get_cold_opportunities', {
      p_days_threshold: 7,
      p_limit: limit,
      p_venture: filters.venture ?? null,
      p_owner_id: filters.ownerId ?? null,
    });

    if (error) throw error;
    
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      entityName: row.entity_name,
      entityType: row.entity_type,
      entityId: row.id,
      pipelineType: row.pipeline_type,
      stage: row.stage,
      daysSinceActivity: row.days_since_activity,
      daysInStage: 0, // Calculate if needed
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
    
    let query = supabase
      .from('activities')
      .select(`
        id,
        type,
        subject,
        notes,
        occurred_at,
        logged_by,
        contact_id,
        organization_id,
        relationship_id,
        contacts!contact_id(first_name, last_name),
        organizations!organization_id(name),
        profiles!logged_by(full_name),
        business_relationships!relationship_id(type)
      `)
      .gte('occurred_at', start.toISOString())
      .lte('occurred_at', end.toISOString())
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (filters.ownerId) {
      query = query.eq('logged_by', filters.ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return (data ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      entityName: row.contacts 
        ? `${row.contacts.first_name} ${row.contacts.last_name}`
        : row.organizations?.name ?? 'Unknown',
      entityId: row.contact_id ?? row.organization_id ?? '',
      pipelineType: row.business_relationships?.type,
      description: row.subject ?? row.notes ?? '',
      occurredAt: new Date(row.occurred_at),
      userName: row.profiles?.full_name ?? 'Unknown',
    }));
  },
};
```

---

### Task 3.2: Create Period Utilities

**Create file:** `src/features/dashboard/utils/periodUtils.ts`

```typescript
import { startOfDay, subDays, startOfQuarter, endOfDay } from 'date-fns';
import type { DashboardFilters } from '../types/leadershipDashboard.types';

export function getPeriodDates(filters: DashboardFilters): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);
  
  switch (filters.period) {
    case '7d':
      return { start: startOfDay(subDays(now, 7)), end };
    case '14d':
      return { start: startOfDay(subDays(now, 14)), end };
    case '30d':
      return { start: startOfDay(subDays(now, 30)), end };
    case 'quarter':
      return { start: startOfQuarter(now), end };
    case 'custom':
      return {
        start: filters.periodStart ?? startOfDay(subDays(now, 14)),
        end: filters.periodEnd ?? end,
      };
    case 'all':
    default:
      return { start: new Date('2020-01-01'), end };
  }
}

export function formatPeriodLabel(period: DashboardFilters['period']): string {
  switch (period) {
    case '7d': return 'Last 7 days';
    case '14d': return 'Last 14 days';
    case '30d': return 'Last 30 days';
    case 'quarter': return 'This quarter';
    case 'all': return 'All time';
    case 'custom': return 'Custom range';
    default: return 'Last 14 days';
  }
}
```

---

## TASK BLOCK 4: Leadership Dashboard - Hooks

### Task 4.1: Create Filter Hook with Persistence

**Create file:** `src/features/dashboard/hooks/useDashboardFilters.ts`

```typescript
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { 
  DashboardFilters, 
  DashboardView, 
  DashboardPeriod 
} from '../types/leadershipDashboard.types';
import type { Venture, BusinessRelationshipType } from '@/types/database';

const VIEW_STORAGE_KEY = 'carbide-leadership-view';
const DEFAULT_PERIOD: DashboardPeriod = '14d';
const DEFAULT_VIEW: DashboardView = 'pipeline';

export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get stored view preference
  const storedView = typeof window !== 'undefined' 
    ? localStorage.getItem(VIEW_STORAGE_KEY) as DashboardView | null
    : null;

  // Parse current filters from URL
  const filters: DashboardFilters = useMemo(() => ({
    view: (searchParams.get('view') as DashboardView) || storedView || DEFAULT_VIEW,
    period: (searchParams.get('period') as DashboardPeriod) || DEFAULT_PERIOD,
    periodStart: searchParams.get('period_start') 
      ? new Date(searchParams.get('period_start')!) 
      : undefined,
    periodEnd: searchParams.get('period_end') 
      ? new Date(searchParams.get('period_end')!) 
      : undefined,
    venture: searchParams.get('venture') as Venture | undefined,
    ownerId: searchParams.get('owner') || undefined,
    pipelineType: searchParams.get('pipeline') as BusinessRelationshipType | undefined,
  }), [searchParams, storedView]);

  // Update filters
  const setFilters = useCallback((updates: Partial<DashboardFilters>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        newParams.delete(key);
      } else if (value instanceof Date) {
        newParams.set(key, value.toISOString());
      } else {
        newParams.set(key, String(value));
      }
    });

    // Persist view preference
    if (updates.view) {
      localStorage.setItem(VIEW_STORAGE_KEY, updates.view);
    }

    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Reset to defaults
  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
    localStorage.removeItem(VIEW_STORAGE_KEY);
  }, [setSearchParams]);

  return { filters, setFilters, resetFilters };
}
```

---

### Task 4.2: Create Main Dashboard Hook

**Create file:** `src/features/dashboard/hooks/useLeadershipDashboard.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { leadershipDashboardService } from '../services/leadershipDashboardService';
import type { DashboardFilters } from '../types/leadershipDashboard.types';

const STALE_TIME = 1000 * 60 * 2; // 2 minutes

export function useLeadershipDashboard(filters: DashboardFilters) {
  // Summary KPIs
  const summaryQuery = useQuery({
    queryKey: ['leadership-dashboard', 'summary', filters],
    queryFn: () => leadershipDashboardService.getSummary(filters),
    staleTime: STALE_TIME,
  });

  // Activity volume
  const activityVolumeQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity-volume', filters],
    queryFn: () => leadershipDashboardService.getActivityVolume(filters),
    staleTime: STALE_TIME,
  });

  // Pipeline summaries (only for pipeline view)
  const pipelinesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'pipelines', filters],
    queryFn: () => leadershipDashboardService.getPipelineSummaries(filters),
    staleTime: STALE_TIME,
    enabled: filters.view === 'pipeline',
  });

  // Cold opportunities
  const coldQuery = useQuery({
    queryKey: ['leadership-dashboard', 'cold', filters],
    queryFn: () => leadershipDashboardService.getColdOpportunities(filters, 10),
    staleTime: STALE_TIME,
  });

  // Recent activity
  const activityQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity', filters],
    queryFn: () => leadershipDashboardService.getRecentActivity(filters, 10),
    staleTime: STALE_TIME / 2, // More frequent refresh
  });

  return {
    summary: summaryQuery.data,
    activityVolume: activityVolumeQuery.data,
    pipelineSummaries: pipelinesQuery.data,
    coldOpportunities: coldQuery.data,
    recentActivity: activityQuery.data,
    isLoading: summaryQuery.isLoading || pipelinesQuery.isLoading,
    isError: summaryQuery.isError || pipelinesQuery.isError,
    error: summaryQuery.error || pipelinesQuery.error,
    refetch: () => {
      summaryQuery.refetch();
      activityVolumeQuery.refetch();
      pipelinesQuery.refetch();
      coldQuery.refetch();
      activityQuery.refetch();
    },
  };
}
```

---

## TASK BLOCK 5: Leadership Dashboard - UI Components

### Task 5.1: Create View Toggle Component

**Create file:** `src/features/dashboard/components/DashboardViewToggle.tsx`

```tsx
import { LayoutGrid, Building2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DashboardView } from '../types/leadershipDashboard.types';

interface DashboardViewToggleProps {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}

export function DashboardViewToggle({ view, onChange }: DashboardViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && onChange(value as DashboardView)}
      aria-label="Dashboard view"
    >
      <ToggleGroupItem 
        value="pipeline" 
        aria-label="View by pipeline"
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        <span>By Pipeline</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="venture" 
        aria-label="View by venture"
        className="gap-2"
      >
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <span>By Venture</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

---

### Task 5.2: Create Summary Cards Component

**Create file:** `src/features/dashboard/components/DashboardSummaryCards.tsx`

```tsx
import { TrendingUp, AlertTriangle, Snowflake, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeadershipSummary } from '../types/leadershipDashboard.types';

interface DashboardSummaryCardsProps {
  summary?: LeadershipSummary;
  isLoading: boolean;
}

const CARDS = [
  { key: 'activeCount', label: 'Active', icon: Activity, color: 'text-blue-500' },
  { key: 'advancedCount', label: 'Advanced', icon: TrendingUp, color: 'text-green-500' },
  { key: 'stuckCount', label: 'Stuck (30+ days)', icon: AlertTriangle, color: 'text-amber-500' },
  { key: 'coldCount', label: 'Going Cold', icon: Snowflake, color: 'text-red-500' },
] as const;

export function DashboardSummaryCards({ summary, isLoading }: DashboardSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.[key]?.toLocaleString() ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### Task 5.3: Create Activity Volume Card

**Create file:** `src/features/dashboard/components/ActivityVolumeCard.tsx`

```tsx
import { Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityVolume } from '../types/leadershipDashboard.types';

interface ActivityVolumeCardProps {
  volume?: ActivityVolume;
  isLoading: boolean;
}

export function ActivityVolumeCard({ volume, isLoading }: ActivityVolumeCardProps) {
  const metrics = [
    { label: 'Calls', value: volume?.calls ?? 0, icon: Phone },
    { label: 'Emails', value: volume?.emails ?? 0, icon: Mail },
    { label: 'Meetings', value: volume?.meetings ?? 0, icon: Calendar },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Activity This Period</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : (
          metrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </div>
              <span className="font-medium">{value.toLocaleString()}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Task 5.4: Create Dashboard Filters Component

**Create file:** `src/features/dashboard/components/DashboardFilters.tsx`

```tsx
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DashboardFilters as Filters, DashboardPeriod } from '../types/leadershipDashboard.types';
import { VENTURES } from '@/lib/constants';
import { formatPeriodLabel } from '../utils/periodUtils';

interface DashboardFiltersProps {
  filters: Filters;
  onChange: (updates: Partial<Filters>) => void;
  onReset: () => void;
  hideVentureFilter?: boolean;
  hidePipelineFilter?: boolean;
}

const PERIODS: DashboardPeriod[] = ['7d', '14d', '30d', 'quarter', 'all'];

export function DashboardFilters({
  filters,
  onChange,
  onReset,
  hideVentureFilter,
  hidePipelineFilter,
}: DashboardFiltersProps) {
  const hasFilters = filters.venture || filters.ownerId || filters.pipelineType;

  return (
    <div className="flex items-center gap-2">
      {/* Period selector - always visible */}
      <Select
        value={filters.period}
        onValueChange={(value) => onChange({ period: value as DashboardPeriod })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((period) => (
            <SelectItem key={period} value={period}>
              {formatPeriodLabel(period)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Additional filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {[filters.venture, filters.ownerId, filters.pipelineType].filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Dashboard</h4>
            
            {!hideVentureFilter && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Venture</label>
                <Select
                  value={filters.venture ?? 'all'}
                  onValueChange={(value) => 
                    onChange({ venture: value === 'all' ? undefined : value as Filters['venture'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All ventures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ventures</SelectItem>
                    {VENTURES.map((venture) => (
                      <SelectItem key={venture.value} value={venture.value}>
                        {venture.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="w-full gap-2"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

---

### Task 5.5: Create Main Dashboard Page

**Create file:** `src/pages/LeadershipDashboard.tsx`

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { DashboardViewToggle } from '@/features/dashboard/components/DashboardViewToggle';
import { DashboardFilters } from '@/features/dashboard/components/DashboardFilters';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { ActivityVolumeCard } from '@/features/dashboard/components/ActivityVolumeCard';
import { useLeadershipDashboard } from '@/features/dashboard/hooks/useLeadershipDashboard';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function LeadershipDashboard() {
  const { filters, setFilters, resetFilters } = useDashboardFilters();
  const {
    summary,
    activityVolume,
    pipelineSummaries,
    coldOpportunities,
    recentActivity,
    isLoading,
    isError,
    error,
  } = useLeadershipDashboard(filters);

  const isPipelineView = filters.view === 'pipeline';

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leadership Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Cross-venture business opportunity overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardViewToggle
            view={filters.view}
            onChange={(view) => setFilters({ view })}
          />
          <DashboardFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            hideVentureFilter={!isPipelineView}
            hidePipelineFilter={isPipelineView}
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. {error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <ErrorBoundary fallback={<SummaryCardsFallback />}>
            <DashboardSummaryCards summary={summary} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <ErrorBoundary fallback={<ActivityVolumeFallback />}>
            <ActivityVolumeCard volume={activityVolume} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Pipeline/Venture Sections - TODO: Implement PipelineSection and VentureSection */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : isPipelineView ? (
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground">
              Pipeline sections coming soon. Found {pipelineSummaries?.length ?? 0} pipelines.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground">
              Venture sections coming soon.
            </p>
          </div>
        )}
      </div>

      {/* Cold Opportunities */}
      {coldOpportunities && coldOpportunities.length > 0 && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">Opportunities Going Cold</h2>
          <div className="space-y-2">
            {coldOpportunities.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
              >
                <span className="font-medium">{item.entityName}</span>
                <span className="text-sm text-muted-foreground">
                  {item.daysSinceActivity} days since activity
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback components
function SummaryCardsFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

function ActivityVolumeFallback() {
  return <Skeleton className="h-32 w-full" />;
}

export default LeadershipDashboard;
```

---

### Task 5.6: Add Route to Router

**Update file:** `src/router.tsx`

Add this import at the top:
```typescript
import { LeadershipDashboard } from '@/pages/LeadershipDashboard';
```

Add this route inside your protected routes:
```typescript
{
  path: 'leadership',
  element: (
    <ProtectedRoute requireRole={['manager', 'admin']}>
      <LeadershipDashboard />
    </ProtectedRoute>
  ),
},
```

---

### Task 5.7: Add Navigation Item

**Update file:** `src/components/layout/Sidebar.tsx` (or equivalent)

Add to navigation items:
```typescript
{
  label: 'Leadership',
  href: '/leadership',
  icon: LayoutDashboard, // from lucide-react
  requiredRoles: ['manager', 'admin'],
},
```

---

## TASK BLOCK 6: Constants and Utilities

### Task 6.1: Add Ventures Constant

**Update file:** `src/lib/constants.ts` (create if doesn't exist)

```typescript
import type { Venture } from '@/types/database';

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

export const PIPELINE_TYPES = [
  { value: 'b2b_client', label: 'B2B Clients' },
  { value: 'b2c_client', label: 'B2C Clients' },
  { value: 'business_investment_external', label: 'Investments (External)' },
  { value: 'internal_business_opportunity', label: 'Internal Opportunities' },
  { value: 'portfolio_company', label: 'Portfolio Companies' },
  { value: 'partnership_opportunity', label: 'Partnerships' },
  { value: 'individual_partnership', label: 'Individual Partnerships' },
  { value: 'investor', label: 'Investors' },
  { value: 'meridian_44_participant', label: 'M44 Participants' },
] as const;
```

---

## TASK BLOCK 7: Testing

### Task 7.1: Create Dashboard Hook Tests

**Create file:** `tests/unit/features/dashboard/useDashboardFilters.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useDashboardFilters } from '@/features/dashboard/hooks/useDashboardFilters';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useDashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  it('returns default filters', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    
    expect(result.current.filters.view).toBe('pipeline');
    expect(result.current.filters.period).toBe('14d');
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    
    act(() => {
      result.current.setFilters({ view: 'venture' });
    });
    
    expect(result.current.filters.view).toBe('venture');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'carbide-leadership-view',
      'venture'
    );
  });

  it('resets filters to defaults', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    
    act(() => {
      result.current.setFilters({ view: 'venture', period: '30d' });
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('carbide-leadership-view');
  });
});
```

---

### Task 7.2: Create E2E Dashboard Test

**Create file:** `tests/e2e/leadership-dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Leadership Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager or admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'manager@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('loads dashboard with summary cards', async ({ page }) => {
    await page.goto('/leadership');
    
    // Should see the page title
    await expect(page.getByRole('heading', { name: 'Leadership Dashboard' })).toBeVisible();
    
    // Should see summary cards
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
    await expect(page.getByText('Stuck')).toBeVisible();
    await expect(page.getByText('Going Cold')).toBeVisible();
  });

  test('can toggle between pipeline and venture views', async ({ page }) => {
    await page.goto('/leadership');
    
    // Default is pipeline view
    await expect(page.getByRole('button', { name: /by pipeline/i })).toHaveAttribute('data-state', 'on');
    
    // Click venture view
    await page.getByRole('button', { name: /by venture/i }).click();
    
    // URL should update
    await expect(page).toHaveURL(/view=venture/);
  });

  test('period filter updates data', async ({ page }) => {
    await page.goto('/leadership');
    
    // Change period to 30 days
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Last 30 days' }).click();
    
    // URL should update
    await expect(page).toHaveURL(/period=30d/);
  });

  test('filters persist in URL', async ({ page }) => {
    await page.goto('/leadership?view=venture&period=30d');
    
    // Venture view should be selected
    await expect(page.getByRole('button', { name: /by venture/i })).toHaveAttribute('data-state', 'on');
    
    // Period should be 30 days
    await expect(page.getByRole('combobox').first()).toHaveText('Last 30 days');
  });
});
```

---

## QUICK REFERENCE: Common Patterns

### Pattern: Creating a new Supabase RPC call

```typescript
// 1. Add migration in supabase/migrations/
CREATE OR REPLACE FUNCTION my_function(p_param TEXT)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY SELECT ...;
END;
$$ LANGUAGE plpgsql;

// 2. Call from service
const { data, error } = await supabase.rpc('my_function', {
  p_param: value,
});

// 3. Wrap in React Query hook
const query = useQuery({
  queryKey: ['feature', 'action', params],
  queryFn: () => service.myFunction(params),
  staleTime: 1000 * 60 * 2,
});
```

### Pattern: Creating a protected route

```typescript
// In router.tsx
{
  path: 'my-route',
  element: (
    <ProtectedRoute requireRole={['admin', 'manager']}>
      <MyComponent />
    </ProtectedRoute>
  ),
},
```

### Pattern: Adding a shadcn component

```bash
# In terminal
npx shadcn-ui@latest add toggle-group
```

### Pattern: Creating a form with validation

```typescript
const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
});
```

---

## Remaining Tasks Checklist

After Leadership Dashboard, implement these in order:

```
[ ] Manager Dashboard - verify/complete team overview features
[ ] Admin User Management - CRUD for users
[ ] Data Import/Export - CSV import with field mapping
[ ] In-App Notifications - notification bell and preferences
[ ] Additional E2E Tests - full coverage for critical flows
[ ] Performance Optimization - materialized views, query optimization
```

---

## Agent Instructions

When implementing tasks:

1. **Read existing code first** - Check similar implementations in `src/features/contacts/` for patterns
2. **Use existing UI components** - Always check `src/components/ui/` before creating new ones
3. **Follow type patterns** - Reference `src/types/database.ts` for database types
4. **Test incrementally** - Run `npm run typecheck` after each file
5. **Commit atomically** - One feature or fix per commit

**Commands to run:**
```bash
npm run typecheck    # Check types
npm run lint         # Check lint
npm run dev          # Start dev server
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```
