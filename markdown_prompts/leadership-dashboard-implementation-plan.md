# Leadership Dashboard Implementation Plan

**Total Estimated Time:** 80-100 hours  
**Recommended Sprint Allocation:** 3-4 sprints  
**Prerequisites:** Existing business_relationships, activities, and profiles tables

---

## Overview: Component Hierarchy & File Structure

```
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── LeadershipDashboard.tsx        # Main container (CHUNK 9)
│       │   ├── DashboardViewToggle.tsx        # Pipeline/Venture toggle (CHUNK 7)
│       │   ├── DashboardSummaryCards.tsx      # KPI cards row (CHUNK 7)
│       │   ├── ActivityVolumeCard.tsx         # Calls/Emails/Meetings (CHUNK 7)
│       │   ├── DashboardFilters.tsx           # Period, venture, owner filters (CHUNK 8)
│       │   ├── PipelineSection.tsx            # Collapsible pipeline block (CHUNK 10)
│       │   ├── VentureSection.tsx             # Collapsible venture block (CHUNK 11)
│       │   ├── PipelineBreakdownBadges.tsx    # Mini venture badges (CHUNK 10)
│       │   ├── StageDistributionBar.tsx       # Horizontal stage viz (CHUNK 10)
│       │   ├── AttentionList.tsx              # Stuck/cold items (CHUNK 11)
│       │   ├── RecentMovementList.tsx         # Stage changes (CHUNK 11)
│       │   ├── CrossPipelineActivityFeed.tsx  # Activity feed (CHUNK 12)
│       │   ├── ActivityCoverageGaps.tsx       # Cold opportunities (CHUNK 12)
│       │   └── skeletons/                     # Loading skeletons (CHUNK 8)
│       │       ├── SummaryCardsSkeleton.tsx
│       │       ├── PipelineSectionSkeleton.tsx
│       │       └── ActivityFeedSkeleton.tsx
│       ├── hooks/
│       │   ├── useLeadershipDashboard.ts      # Main data hook (CHUNK 6)
│       │   ├── useDashboardFilters.ts         # Filter state + persistence (CHUNK 5)
│       │   ├── usePipelineSummary.ts          # Per-pipeline data (CHUNK 6)
│       │   └── useActivityVolume.ts           # Activity metrics (CHUNK 6)
│       ├── services/
│       │   └── leadershipDashboardService.ts  # API calls (CHUNK 4)
│       ├── utils/
│       │   └── periodUtils.ts                 # Date range helpers (CHUNK 4)
│       ├── types/
│       │   └── leadershipDashboard.types.ts   # Type definitions (CHUNK 3)
│       └── index.ts                           # Barrel exports (CHUNK 13)
├── pages/
│   └── LeadershipDashboard.tsx                # Page wrapper (CHUNK 13)
└── tests/
    ├── unit/
    │   └── dashboard/
    │       ├── useDashboardFilters.test.ts    # (CHUNK 14)
    │       └── leadershipDashboardService.test.ts
    └── e2e/
        └── leadership-dashboard.spec.ts       # (CHUNK 15)

supabase/
└── migrations/
    └── 00006_leadership_dashboard.sql         # (CHUNKS 1-2)
```

---

## Implementation Chunks

---

## 🗄️ PHASE 1: DATABASE LAYER (Chunks 1-2)

### CHUNK 1: Core Database Functions (2 hours)

**Goal:** Create helper function and leadership summary RPC

**Files to create/modify:**
- `supabase/migrations/00006_leadership_dashboard.sql`

#### Cursor Prompt 1.1: Create Migration File with Helper Function

```
Create a new Supabase migration file at supabase/migrations/00006_leadership_dashboard.sql

Add the following:
1. A header comment block with purpose and date
2. A function called get_terminal_stages that:
   - Takes p_type of business_relationship_type
   - Returns TEXT[]
   - Returns the appropriate terminal stages for each pipeline type:
     - b2b_client: ['Won', 'Lost', 'Churned', 'Disqualified']
     - b2c_client: ['Closed', 'Lost', 'Churned', 'Cancelled']
     - business_investment_external: ['Invested', 'Passed', 'Withdrawn', 'Portfolio']
     - internal_business_opportunity: ['Launched', 'Shelved', 'Merged']
     - portfolio_company: ['Exited', 'Written Off', 'Acquired', 'Wound Down']
     - partnership_opportunity: ['Active Partnership', 'Declined', 'Dissolved', 'Inactive']
     - individual_partnership: ['Active', 'Declined', 'Inactive']
     - investor: ['Committed', 'Passed', 'Funded']
     - meridian_44_participant: ['Active Contributor', 'Declined', 'Inactive']
     - Default: ['Closed', 'Lost']
   - Mark as IMMUTABLE for query optimization

Reference the existing business_relationship_type enum from 00001_initial_schema.sql
```

#### Cursor Prompt 1.2: Create Leadership Summary RPC

```
In the same migration file, add the get_leadership_summary function:

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
)

The function should:
1. Filter business_relationships to included pipeline types only:
   - b2b_client, b2c_client, business_investment_external, internal_business_opportunity,
   - portfolio_company, partnership_opportunity, individual_partnership, investor, meridian_44_participant
2. Exclude terminal stages using get_terminal_stages()
3. Apply venture filter if provided (p_venture = ANY(br.ventures))
4. Apply owner filter if provided (br.owner_id = p_owner_id)
5. Count:
   - active_count: All matching non-terminal relationships
   - advanced_count: Those with stage_change activity in period
   - stuck_count: No stage change in 30+ days
   - cold_count: No activity of any type in 7+ days
6. Use LEFT JOIN LATERAL for last_stage_change and last_activity subqueries
7. Mark as STABLE

Reference the existing activities table for activity lookups.
```

#### Verification Steps:
```sql
-- Test in Supabase SQL Editor:
SELECT * FROM get_terminal_stages('b2b_client');
-- Expected: {Won,Lost,Churned,Disqualified}

SELECT * FROM get_leadership_summary();
-- Expected: Row with active_count, advanced_count, stuck_count, cold_count
```

---

### CHUNK 2: Additional Database Functions (2 hours)

**Goal:** Create activity volume, pipeline summaries, and cold opportunities RPCs

#### Cursor Prompt 2.1: Create Activity Volume RPC

```
Append to supabase/migrations/00006_leadership_dashboard.sql:

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
)

Count activities by type within the period:
- calls: activity type IN ('call_inbound', 'call_outbound')
- emails: activity type IN ('email_inbound', 'email_outbound')  
- meetings: activity type IN ('meeting_in_person', 'meeting_virtual')

Filter by:
- activities.occurred_at BETWEEN p_period_start AND p_period_end
- Venture filter via JOIN to business_relationships
- Owner filter on activities.logged_by

Mark as STABLE.
```

#### Cursor Prompt 2.2: Create Pipeline Summaries RPC

```
Append to the migration file:

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
)

For each pipeline type (b2b_client, b2c_client, etc.):
1. Count active (non-terminal) relationships
2. Build JSONB array of stage distribution: [{"stage": "Lead", "count": 5}, ...]
3. Build JSONB array of venture breakdown: [{"venture": "forge", "count": 3}, ...]
4. Apply venture and owner filters
5. GROUP BY pipeline type

Use CTEs for clarity:
- filtered_relationships: Apply all filters
- stage_counts: GROUP BY type, stage
- venture_counts: CROSS JOIN LATERAL unnest(ventures), GROUP BY type, venture

Return only pipelines that have at least 1 active relationship.
```

#### Cursor Prompt 2.3: Create Cold Opportunities RPC

```
Append to the migration file:

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
)

Find relationships with no activity in p_days_threshold days:
1. JOIN to contacts and organizations to get entity_name
2. Use COALESCE(c.first_name || ' ' || c.last_name, o.name)
3. entity_type: 'contact' if contact_id IS NOT NULL, else 'organization'
4. Calculate days_since_activity using NOW() - last_activity
5. JOIN profiles for owner_name
6. Apply filters, ORDER BY days_since_activity DESC, LIMIT p_limit

Only include non-terminal relationships.
```

#### Cursor Prompt 2.4: Create Dashboard Activity Feed RPC

```
Append to the migration file:

CREATE OR REPLACE FUNCTION get_dashboard_activity(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  entity_name TEXT,
  entity_id UUID,
  pipeline_type business_relationship_type,
  description TEXT,
  occurred_at TIMESTAMPTZ,
  user_name TEXT
)

Return recent activities across all pipelines:
1. JOIN activities to business_relationships, contacts, organizations, profiles
2. Filter by period, venture, owner
3. ORDER BY occurred_at DESC
4. LIMIT p_limit

Include activities like stage changes, calls, emails, meetings, notes.
```

#### Verification Steps:
```sql
SELECT * FROM get_activity_volume();
SELECT * FROM get_pipeline_summaries();
SELECT * FROM get_cold_opportunities();
SELECT * FROM get_dashboard_activity();
```

---

## 📝 PHASE 2: TYPES & SERVICE LAYER (Chunks 3-4)

### CHUNK 3: Type Definitions (1.5 hours)

**Goal:** Create comprehensive TypeScript types for the dashboard

**Files to create:**
- `src/features/dashboard/types/leadershipDashboard.types.ts`

#### Cursor Prompt 3.1: Create Type Definitions File

```
Create src/features/dashboard/types/leadershipDashboard.types.ts with:

1. Import Venture and BusinessRelationshipType from '@/types/database'

2. Filter types:
   - DashboardView = 'pipeline' | 'venture'
   - DashboardPeriod = '7d' | '14d' | '30d' | 'quarter' | 'all' | 'custom'
   - DashboardFilters interface with:
     - view: DashboardView
     - period: DashboardPeriod
     - periodStart?: Date
     - periodEnd?: Date
     - venture?: Venture
     - ownerId?: string
     - pipelineType?: BusinessRelationshipType

3. Summary types:
   - LeadershipSummary: { activeCount, advancedCount, stuckCount, coldCount }
   - ActivityVolume: { calls, emails, meetings }
   - StageCount: { stage: string, count: number }
   - VentureCount: { venture: Venture, count: number }
   - PipelineCount: { type: BusinessRelationshipType, count: number }

4. Attention item types:
   - AttentionReason = 'stuck' | 'cold' | 'high_value' | 'at_risk'
   - OpportunityAttentionItem interface with id, entityName, entityType, stage, 
     daysInStage, daysSinceActivity, ownerName, ventures, reasons

5. Movement types:
   - StageMovement: { id, entityName, entityId, pipelineType, fromStage, toStage, 
     movedAt: Date, ownerName, isWin?: boolean }

6. Section data types:
   - PipelineSummary: { type, activeCount, stageDistribution, attentionItems, 
     recentMovements, ventureBreakdown }
   - VentureSummary: { venture, activeCount, pipelineBreakdown, stageDistribution, 
     attentionItems, recentMovements }

7. Activity feed types:
   - DashboardActivity: { id, type, entityName, entityId, pipelineType?, 
     description, occurredAt: Date, userName }
   - ColdOpportunity: { id, entityName, entityType, entityId, pipelineType, 
     stage, daysSinceActivity, ownerName, ventures }

8. API response row types (matching SQL return shapes):
   - LeadershipSummaryRow, ActivityVolumeRow, PipelineSummaryRow, 
     ColdOpportunityRow, DashboardActivityRow

Use proper TypeScript conventions: interfaces for objects, type aliases for unions.
Export all types.
```

---

### CHUNK 4: Service Layer & Utilities (2 hours)

**Goal:** Create API service and date utilities

**Files to create:**
- `src/features/dashboard/utils/periodUtils.ts`
- `src/features/dashboard/services/leadershipDashboardService.ts`

#### Cursor Prompt 4.1: Create Period Utilities

```
Create src/features/dashboard/utils/periodUtils.ts

Export a function getPeriodDates(filters: DashboardFilters): { start: Date, end: Date }

Handle each period type:
- '7d': start = now - 7 days, end = now
- '14d': start = now - 14 days, end = now
- '30d': start = now - 30 days, end = now
- 'quarter': start = beginning of current quarter, end = now
- 'all': start = new Date(0), end = now
- 'custom': use filters.periodStart and filters.periodEnd (with fallbacks)

Use date-fns for date manipulation (startOfQuarter, subDays, etc.)
Import DashboardFilters from '../types/leadershipDashboard.types'
```

#### Cursor Prompt 4.2: Create Dashboard Service

```
Create src/features/dashboard/services/leadershipDashboardService.ts

Import supabase client from '@/lib/supabase/client'
Import types from '../types/leadershipDashboard.types'
Import getPeriodDates from '../utils/periodUtils'

Create leadershipDashboardService object with methods:

1. async getSummary(filters: DashboardFilters): Promise<LeadershipSummary>
   - Call supabase.rpc('get_leadership_summary', {...})
   - Transform row to LeadershipSummary (snake_case to camelCase)
   - Handle both array and single row responses

2. async getActivityVolume(filters: DashboardFilters): Promise<ActivityVolume>
   - Call get_activity_volume RPC
   - Transform response

3. async getPipelineSummaries(filters: DashboardFilters): Promise<PipelineSummary[]>
   - Call get_pipeline_summaries RPC
   - Map rows, parse JSONB stages/ventures arrays
   - Initialize empty attentionItems and recentMovements arrays

4. async getColdOpportunities(filters: DashboardFilters, limit?: number): Promise<ColdOpportunity[]>
   - Call get_cold_opportunities RPC
   - Transform rows

5. async getRecentActivity(filters: DashboardFilters, limit?: number): Promise<DashboardActivity[]>
   - Call get_dashboard_activity RPC
   - Transform rows, convert occurred_at string to Date

Each method should:
- Use getPeriodDates(filters) to compute date range
- Pass null for optional params when undefined
- Log errors with console.error before throwing
- Include proper TypeScript generics for supabase.rpc<T>()

Export the service object as default and named export.
```

---

## 🪝 PHASE 3: HOOKS & STATE (Chunks 5-6)

### CHUNK 5: Filter State Hook (1.5 hours)

**Goal:** Create filter management with localStorage persistence

**Files to create:**
- `src/features/dashboard/hooks/useDashboardFilters.ts`

#### Cursor Prompt 5.1: Create Filter State Hook

```
Create src/features/dashboard/hooks/useDashboardFilters.ts

This hook manages dashboard filter state with:
1. URL query param synchronization (for shareable links)
2. localStorage persistence (for returning users)
3. Default values

Implementation:

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DashboardFilters, DashboardView, DashboardPeriod } from '../types/leadershipDashboard.types';

const STORAGE_KEY = 'leadership-dashboard-filters';
const DEFAULT_FILTERS: DashboardFilters = {
  view: 'pipeline',
  period: '14d',
};

export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL > localStorage > defaults
  const [filters, setFiltersState] = useState<DashboardFilters>(() => {
    // Try URL params first
    const urlView = searchParams.get('view') as DashboardView | null;
    const urlPeriod = searchParams.get('period') as DashboardPeriod | null;
    // ... more URL params
    
    // Fall back to localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
      } catch {}
    }
    
    return DEFAULT_FILTERS;
  });

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Sync to URL params on change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.view !== 'pipeline') params.set('view', filters.view);
    if (filters.period !== '14d') params.set('period', filters.period);
    if (filters.venture) params.set('venture', filters.venture);
    if (filters.ownerId) params.set('owner', filters.ownerId);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const setFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = filters.venture || filters.ownerId || 
    filters.period !== '14d' || filters.pipelineType;

  return { filters, setFilters, resetFilters, hasActiveFilters };
}
```

---

### CHUNK 6: Data Fetching Hooks (2 hours)

**Goal:** Create React Query hooks for dashboard data

**Files to create:**
- `src/features/dashboard/hooks/useLeadershipDashboard.ts`

#### Cursor Prompt 6.1: Create Main Dashboard Hook

```
Create src/features/dashboard/hooks/useLeadershipDashboard.ts

This is the main data-fetching hook that coordinates all dashboard queries.

import { useQuery } from '@tanstack/react-query';
import { leadershipDashboardService } from '../services/leadershipDashboardService';
import type { DashboardFilters } from '../types/leadershipDashboard.types';

export function useLeadershipDashboard(filters: DashboardFilters) {
  // Create stable query key from filters
  const filterKey = JSON.stringify({
    view: filters.view,
    period: filters.period,
    venture: filters.venture,
    ownerId: filters.ownerId,
  });

  // Summary KPIs query
  const summaryQuery = useQuery({
    queryKey: ['leadership-dashboard', 'summary', filterKey],
    queryFn: () => leadershipDashboardService.getSummary(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 min
  });

  // Activity volume query
  const activityVolumeQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity-volume', filterKey],
    queryFn: () => leadershipDashboardService.getActivityVolume(filters),
    staleTime: 1000 * 60 * 5,
  });

  // Pipeline summaries query (only when in pipeline view)
  const pipelineSummariesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'pipeline-summaries', filterKey],
    queryFn: () => leadershipDashboardService.getPipelineSummaries(filters),
    staleTime: 1000 * 60 * 5,
    enabled: filters.view === 'pipeline',
  });

  // Cold opportunities query
  const coldOpportunitiesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'cold-opportunities', filterKey],
    queryFn: () => leadershipDashboardService.getColdOpportunities(filters, 10),
    staleTime: 1000 * 60 * 5,
  });

  // Recent activity query
  const recentActivityQuery = useQuery({
    queryKey: ['leadership-dashboard', 'recent-activity', filterKey],
    queryFn: () => leadershipDashboardService.getRecentActivity(filters, 20),
    staleTime: 1000 * 60 * 5,
  });

  // Aggregate loading and error states
  const isLoading = summaryQuery.isLoading || activityVolumeQuery.isLoading;
  const isError = summaryQuery.isError || activityVolumeQuery.isError;
  const error = summaryQuery.error || activityVolumeQuery.error;

  // Refetch all queries
  const refetch = () => {
    summaryQuery.refetch();
    activityVolumeQuery.refetch();
    pipelineSummariesQuery.refetch();
    coldOpportunitiesQuery.refetch();
    recentActivityQuery.refetch();
  };

  return {
    summary: summaryQuery.data,
    activityVolume: activityVolumeQuery.data,
    pipelineSummaries: pipelineSummariesQuery.data,
    coldOpportunities: coldOpportunitiesQuery.data,
    recentActivity: recentActivityQuery.data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
```

---

## 🎨 PHASE 4: UI COMPONENTS (Chunks 7-12)

### CHUNK 7: Core UI Components - Part 1 (2 hours)

**Goal:** Create toggle, summary cards, and activity volume card

**Files to create:**
- `src/features/dashboard/components/DashboardViewToggle.tsx`
- `src/features/dashboard/components/DashboardSummaryCards.tsx`
- `src/features/dashboard/components/ActivityVolumeCard.tsx`

#### Cursor Prompt 7.1: Create View Toggle Component

```
Create src/features/dashboard/components/DashboardViewToggle.tsx

A toggle group that switches between Pipeline and Venture views.

Props:
- view: DashboardView
- onChange: (view: DashboardView) => void

Use shadcn ToggleGroup component.
Include icons: LayoutGrid for Pipeline, Building2 for Venture (from lucide-react)
Show labels only on sm+ breakpoints.
Add proper aria-labels for accessibility.

Example structure:
<ToggleGroup type="single" value={view} onValueChange={onChange}>
  <ToggleGroupItem value="pipeline" aria-label="View by pipeline">
    <LayoutGrid className="h-4 w-4" />
    <span className="hidden sm:inline">By Pipeline</span>
  </ToggleGroupItem>
  ...
</ToggleGroup>
```

#### Cursor Prompt 7.2: Create Summary Cards Component

```
Create src/features/dashboard/components/DashboardSummaryCards.tsx

Display 4 KPI cards in a responsive grid:
1. Active Opportunities (with icon: TrendingUp)
2. Advanced This Period (with icon: ArrowUpRight)
3. Stuck (14+ days) (with icon: AlertTriangle, warning color if > 0)
4. Cold (7+ days) (with icon: Snowflake, warning color if > 0)

Props:
- summary?: LeadershipSummary
- isLoading: boolean

When isLoading, show Skeleton components.
When stuck or cold count > 0, add visual warning indicator.

Use shadcn Card components.
Grid: 2 columns on mobile, 4 columns on lg+.

Each card shows:
- Icon (colored based on type)
- Label text (muted)
- Value (large, bold)
- Optional badge/indicator for warning states
```

#### Cursor Prompt 7.3: Create Activity Volume Card

```
Create src/features/dashboard/components/ActivityVolumeCard.tsx

A compact card showing activity metrics for the period.

Props:
- volume?: ActivityVolume
- isLoading: boolean

Display metrics vertically:
- Phone icon + "Calls" + count
- Mail icon + "Emails" + count  
- Calendar icon + "Meetings" + count
- Divider
- "Total" row with sum

When isLoading, show skeleton.

Use compact spacing since this sits in a narrow column.
Icons from lucide-react: Phone, Mail, Calendar
```

---

### CHUNK 8: Core UI Components - Part 2 (2 hours)

**Goal:** Create filters and skeletons

**Files to create:**
- `src/features/dashboard/components/DashboardFilters.tsx`
- `src/features/dashboard/components/skeletons/SummaryCardsSkeleton.tsx`
- `src/features/dashboard/components/skeletons/PipelineSectionSkeleton.tsx`

#### Cursor Prompt 8.1: Create Dashboard Filters Component

```
Create src/features/dashboard/components/DashboardFilters.tsx

A popover-based filter panel with:
1. Period selector (Select): 7d, 14d, 30d, Quarter, All Time
2. Venture filter (Select): All ventures + list of ventures (conditionally shown)
3. Pipeline filter (Select): All pipelines + list (conditionally shown)
4. Owner filter (Select with search): All owners + user list
5. Reset filters button

Props:
- filters: DashboardFilters
- onChange: (updates: Partial<DashboardFilters>) => void
- onReset: () => void
- hideVentureFilter?: boolean (hide when in venture view)
- hidePipelineFilter?: boolean (hide when in pipeline view)

Use shadcn Popover, Select, Button components.
Show filter icon with badge count when filters are active.
Include "Clear filters" action.

Define constants for:
- PERIODS: { value: '7d', label: 'Last 7 Days' }, ...
- VENTURES: { value: 'forge', label: 'Forge' }, ...
- PIPELINE_TYPES: { value: 'b2b_client', label: 'B2B Clients' }, ...
```

#### Cursor Prompt 8.2: Create Skeleton Components

```
Create skeleton loading components:

1. src/features/dashboard/components/skeletons/SummaryCardsSkeleton.tsx
   - 4 card skeletons in a grid matching DashboardSummaryCards layout
   - Each with shimmer animation

2. src/features/dashboard/components/skeletons/PipelineSectionSkeleton.tsx
   - Collapsible header skeleton
   - Stage bar skeleton
   - List item skeletons (3-4 rows)

Use shadcn Skeleton component with appropriate heights/widths.
Match the exact layout of the real components.
Include shimmer animation via CSS class.
```

---

### CHUNK 9: Main Dashboard Container (2 hours)

**Goal:** Create the main dashboard component that orchestrates everything

**Files to create:**
- `src/features/dashboard/components/LeadershipDashboard.tsx`

#### Cursor Prompt 9.1: Create Main Dashboard Component

```
Create src/features/dashboard/components/LeadershipDashboard.tsx

This is the main container component that:
1. Uses useDashboardFilters() for filter state
2. Uses useLeadershipDashboard(filters) for data
3. Renders the complete dashboard layout

Structure:
<div className="container mx-auto space-y-6 py-6">
  {/* Header row */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1>Leadership Dashboard</h1>
      <p className="text-muted-foreground">Cross-venture business opportunity overview</p>
    </div>
    <div className="flex items-center gap-4">
      <DashboardViewToggle ... />
      <DashboardFilters ... />
      <RefreshButton onClick={refetch} />
    </div>
  </div>

  {/* Error alert if isError */}
  {isError && <Alert variant="destructive">...</Alert>}

  {/* Summary row: 4/5 for cards, 1/5 for activity volume */}
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
    <div className="lg:col-span-4">
      <ErrorBoundary><DashboardSummaryCards ... /></ErrorBoundary>
    </div>
    <div className="lg:col-span-1">
      <ErrorBoundary><ActivityVolumeCard ... /></ErrorBoundary>
    </div>
  </div>

  {/* Pipeline or Venture sections */}
  <div className="space-y-4">
    {isPipelineView ? (
      PIPELINE_DISPLAY_ORDER.map(type => <PipelineSection ... />)
    ) : (
      VENTURE_DISPLAY_ORDER.map(venture => <VentureSection ... />)
    )}
  </div>

  {/* Activity feed */}
  <CrossPipelineActivityFeed ... />

  {/* Cold opportunities */}
  <ActivityCoverageGaps ... />
</div>

Define constants:
PIPELINE_DISPLAY_ORDER = ['b2b_client', 'b2c_client', ...]
VENTURE_DISPLAY_ORDER = ['forge', 'hearth', ...]

Wrap sections in ErrorBoundary for resilience.
Only render sections that have data (skip empty ones when not loading).
```

---

### CHUNK 10: Pipeline Section Components (2.5 hours)

**Goal:** Create pipeline section with stage distribution

**Files to create:**
- `src/features/dashboard/components/PipelineSection.tsx`
- `src/features/dashboard/components/StageDistributionBar.tsx`
- `src/features/dashboard/components/PipelineBreakdownBadges.tsx`

#### Cursor Prompt 10.1: Create Pipeline Section Component

```
Create src/features/dashboard/components/PipelineSection.tsx

A collapsible section for each pipeline type.

Props:
- type: BusinessRelationshipType
- data?: PipelineSummary
- isLoading: boolean
- defaultExpanded: boolean

Structure:
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger className="w-full">
    <div className="flex items-center justify-between p-4 border rounded-lg">
      {/* Left: Chevron + Pipeline label + active count badge */}
      <div className="flex items-center gap-2">
        {isOpen ? <ChevronDown /> : <ChevronRight />}
        <span className="font-semibold">{PIPELINE_LABELS[type]}</span>
        <Badge>{data?.activeCount ?? 0} active</Badge>
        {hasAttention && <Badge variant="warning">Needs attention</Badge>}
      </div>
      {/* Right: Venture breakdown badges */}
      <PipelineBreakdownBadges ventures={data?.ventureBreakdown} />
    </div>
  </CollapsibleTrigger>
  
  <CollapsibleContent>
    <div className="p-4 pt-0 space-y-4">
      {/* Stage distribution bar */}
      <StageDistributionBar stages={data?.stageDistribution} type={type} />
      
      {/* Two-column layout: Recent movements + Attention items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentMovementList movements={data?.recentMovements} />
        <AttentionList items={data?.attentionItems} />
      </div>
    </div>
  </CollapsibleContent>
</Collapsible>

Define PIPELINE_LABELS constant mapping type to display name.
Use shadcn Collapsible, Badge components.
Auto-expand if hasAttention (attentionItems.length > 0).
```

#### Cursor Prompt 10.2: Create Stage Distribution Bar

```
Create src/features/dashboard/components/StageDistributionBar.tsx

A horizontal bar showing stage distribution with colored segments.

Props:
- stages?: StageCount[]
- type: BusinessRelationshipType

Render a horizontal segmented bar where:
- Each segment width is proportional to count
- Each stage has a consistent color (define color map)
- Hover shows tooltip with stage name and count
- Click navigates to filtered pipeline view (optional)

Below the bar, show legend with stage dots and counts.

Use Tailwind for colors. Define stage colors:
const STAGE_COLORS: Record<string, string> = {
  'Lead': 'bg-blue-500',
  'Qualified': 'bg-cyan-500',
  'Discovery': 'bg-teal-500',
  'Proposal': 'bg-yellow-500',
  'Negotiation': 'bg-orange-500',
  'Won': 'bg-green-500',
  'Active': 'bg-emerald-500',
  // Add more as needed
};

Handle edge cases:
- Empty stages array: show "No data" message
- Single stage: full width
- Many stages: ensure minimum visible width per segment
```

#### Cursor Prompt 10.3: Create Pipeline Breakdown Badges

```
Create src/features/dashboard/components/PipelineBreakdownBadges.tsx

Mini badges showing venture distribution within a pipeline.

Props:
- ventures?: VentureCount[]

Show up to 3 venture badges with counts, then "+N more" if more exist.
Use small/xs badge variant.
Each venture has a subtle background color.

Example output: [Forge: 5] [Hearth: 3] [+2 more]

Define VENTURE_COLORS for consistent coloring.
```

---

### CHUNK 11: Venture Section & Lists (2.5 hours)

**Goal:** Create venture section and shared list components

**Files to create:**
- `src/features/dashboard/components/VentureSection.tsx`
- `src/features/dashboard/components/AttentionList.tsx`
- `src/features/dashboard/components/RecentMovementList.tsx`

#### Cursor Prompt 11.1: Create Venture Section Component

```
Create src/features/dashboard/components/VentureSection.tsx

Similar to PipelineSection but for venture-centric view.

Props:
- venture: Venture
- data?: VentureSummary
- isLoading: boolean
- defaultExpanded: boolean

Structure similar to PipelineSection but:
- Show pipeline breakdown instead of venture breakdown
- Use simplified stage distribution (aggregated across pipelines)
- Different color scheme per venture

Define VENTURE_LABELS and VENTURE_COLORS constants.
```

#### Cursor Prompt 11.2: Create Attention List Component

```
Create src/features/dashboard/components/AttentionList.tsx

List of opportunities needing attention (stuck or cold).

Props:
- items?: OpportunityAttentionItem[]
- maxItems?: number (default 5)
- title?: string (default "Needs Attention")

Each item shows:
- Entity name (link to detail)
- Stage badge
- Warning indicator (stuck/cold)
- Days stuck or since activity
- Owner name (small/muted)

Use icons: AlertTriangle for stuck, Snowflake for cold
Show "View all" link if items.length > maxItems
Empty state: "No items need attention" with CheckCircle icon
```

#### Cursor Prompt 11.3: Create Recent Movement List

```
Create src/features/dashboard/components/RecentMovementList.tsx

List of recent stage changes.

Props:
- movements?: StageMovement[]
- maxItems?: number (default 5)
- title?: string (default "Recent Movement")

Each item shows:
- Arrow icon (up for forward, trophy for wins)
- Entity name (link)
- "Stage A → Stage B"
- Time ago (use formatDistanceToNow from date-fns)
- Owner name (small/muted)

Special styling for wins (isWin: true): green background, trophy icon
Show "View all" link if more items exist
Empty state: "No recent movement"
```

---

### CHUNK 12: Activity Feed & Cold Opportunities (2 hours)

**Goal:** Create bottom section components

**Files to create:**
- `src/features/dashboard/components/CrossPipelineActivityFeed.tsx`
- `src/features/dashboard/components/ActivityCoverageGaps.tsx`

#### Cursor Prompt 12.1: Create Activity Feed Component

```
Create src/features/dashboard/components/CrossPipelineActivityFeed.tsx

A feed showing recent activities across all pipelines.

Props:
- activities?: DashboardActivity[]
- isLoading: boolean
- maxItems?: number (default 10)

Card with header "Recent Activity" and activity list.
Each activity shows:
- Activity type icon (getActivityIcon helper)
- Entity name (link)
- Description text
- Pipeline type badge (small)
- Time ago
- User name

Activity icons:
- call_*: Phone
- email_*: Mail
- meeting_*: Calendar
- note: FileText
- stage_change: ArrowRight

Use virtualization if list is long (optional enhancement).
Show skeleton when loading.
```

#### Cursor Prompt 12.2: Create Activity Coverage Gaps Component

```
Create src/features/dashboard/components/ActivityCoverageGaps.tsx

Highlights opportunities that have gone cold (no activity in 7+ days).

Props:
- opportunities?: ColdOpportunity[]
- isLoading: boolean

Card with warning header "Activity Coverage Gaps" (with AlertTriangle icon).
Table/list showing:
- Entity name (link)
- Pipeline type
- Current stage
- Days since activity (bold, red if > 14)
- Owner
- Action button: "Log Activity" (optional)

Sort by days since activity descending.
Show up to 10 items with "View all cold opportunities" link.
Empty state: "All opportunities have recent activity" (success message)
```

---

## 🔗 PHASE 5: INTEGRATION & TESTING (Chunks 13-15)

### CHUNK 13: Routing & Integration (1.5 hours)

**Goal:** Wire up routing and navigation

**Files to create/modify:**
- `src/features/dashboard/index.ts`
- `src/pages/LeadershipDashboard.tsx`
- `src/router.tsx` (modify)
- `src/components/layout/Sidebar.tsx` (modify)

#### Cursor Prompt 13.1: Create Barrel Exports

```
Create src/features/dashboard/index.ts

Export all public components and hooks:

// Components
export { LeadershipDashboard } from './components/LeadershipDashboard';
export { DashboardViewToggle } from './components/DashboardViewToggle';
export { DashboardSummaryCards } from './components/DashboardSummaryCards';
// ... etc

// Hooks
export { useLeadershipDashboard } from './hooks/useLeadershipDashboard';
export { useDashboardFilters } from './hooks/useDashboardFilters';

// Types
export type * from './types/leadershipDashboard.types';
```

#### Cursor Prompt 13.2: Create Page Component

```
Create src/pages/LeadershipDashboard.tsx

A thin wrapper that adds page-level concerns:

import { LeadershipDashboard as LeadershipDashboardContent } from '@/features/dashboard';

export function LeadershipDashboard() {
  return (
    <PageContainer>
      <LeadershipDashboardContent />
    </PageContainer>
  );
}

export default LeadershipDashboard;

Use the PageContainer layout component if it exists.
This allows for lazy loading the feature.
```

#### Cursor Prompt 13.3: Add Route Configuration

```
Modify src/router.tsx to add the leadership dashboard route:

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingScreen } from '@/components/ui/loading-screen';

const LeadershipDashboard = lazy(() => import('@/pages/LeadershipDashboard'));

// In the routes array, add:
{
  path: 'leadership',
  element: (
    <ProtectedRoute requireManager>
      <Suspense fallback={<LoadingScreen />}>
        <LeadershipDashboard />
      </Suspense>
    </ProtectedRoute>
  ),
},

Ensure ProtectedRoute component checks for manager or admin role.
Place this route within the authenticated layout.
```

#### Cursor Prompt 13.4: Add Navigation Link

```
Modify src/components/layout/Sidebar.tsx (or equivalent navigation component):

Add a new navigation item for Leadership Dashboard:
- Only visible to users with role 'manager' or 'admin'
- Icon: BarChart3 from lucide-react
- Label: "Leadership"
- Path: "/leadership"

Example:
{user.role === 'manager' || user.role === 'admin' ? (
  <NavItem
    to="/leadership"
    icon={<BarChart3 className="h-4 w-4" />}
    label="Leadership"
  />
) : null}
```

---

### CHUNK 14: Unit Tests (2 hours)

**Goal:** Write unit tests for hooks and service

**Files to create:**
- `src/features/dashboard/__tests__/useDashboardFilters.test.ts`
- `src/features/dashboard/__tests__/leadershipDashboardService.test.ts`

#### Cursor Prompt 14.1: Create Filter Hook Tests

```
Create src/features/dashboard/__tests__/useDashboardFilters.test.ts

Test the useDashboardFilters hook:

1. Test default values
   - view should be 'pipeline'
   - period should be '14d'

2. Test setFilters
   - Partial updates merge correctly
   - Setting view updates state

3. Test resetFilters
   - Returns to default values

4. Test localStorage persistence
   - Filters saved on change
   - Filters restored on mount

5. Test URL param sync (may require router mock)
   - Params update when filters change

Use @testing-library/react-hooks or renderHook from @testing-library/react.
Mock localStorage and useSearchParams.
```

#### Cursor Prompt 14.2: Create Service Tests

```
Create src/features/dashboard/__tests__/leadershipDashboardService.test.ts

Test the leadershipDashboardService:

1. Mock supabase.rpc calls

2. Test getSummary
   - Calls correct RPC with transformed params
   - Transforms response correctly (snake_case to camelCase)
   - Handles empty response
   - Throws on error

3. Test getPipelineSummaries
   - Parses JSONB stages/ventures arrays
   - Returns empty array on no data

4. Test getColdOpportunities
   - Respects limit parameter
   - Transforms entity_type correctly

Use vitest and vi.mock for Supabase client.
```

---

### CHUNK 15: E2E Tests (2 hours)

**Goal:** Write Playwright E2E tests for the dashboard

**Files to create:**
- `tests/e2e/leadership-dashboard.spec.ts`

#### Cursor Prompt 15.1: Create E2E Test Suite

```
Create tests/e2e/leadership-dashboard.spec.ts

Using Playwright:

import { test, expect } from '@playwright/test';

test.describe('Leadership Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager/admin user
    await page.goto('/login');
    await page.fill('[name="email"]', 'manager@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('loads dashboard with default view', async ({ page }) => {
    await page.goto('/leadership');
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Leadership Dashboard');
    
    // Verify summary cards are visible
    await expect(page.locator('[data-testid="summary-cards"]')).toBeVisible();
    
    // Verify pipeline view is default
    await expect(page.locator('[data-testid="view-toggle"]')).toHaveAttribute(
      'data-value', 'pipeline'
    );
  });

  test('switches between pipeline and venture views', async ({ page }) => {
    await page.goto('/leadership');
    
    // Click venture view toggle
    await page.click('[data-testid="view-toggle-venture"]');
    
    // Verify venture sections appear
    await expect(page.locator('[data-testid="venture-section"]').first()).toBeVisible();
    
    // Click pipeline view toggle
    await page.click('[data-testid="view-toggle-pipeline"]');
    
    // Verify pipeline sections appear
    await expect(page.locator('[data-testid="pipeline-section"]').first()).toBeVisible();
  });

  test('persists filters in URL', async ({ page }) => {
    await page.goto('/leadership');
    
    // Open filters and select a period
    await page.click('[data-testid="filter-button"]');
    await page.selectOption('[data-testid="period-select"]', '30d');
    
    // Verify URL contains filter
    await expect(page).toHaveURL(/period=30d/);
    
    // Reload and verify filter persisted
    await page.reload();
    await expect(page.locator('[data-testid="period-select"]')).toHaveValue('30d');
  });

  test('displays cold opportunities when present', async ({ page }) => {
    await page.goto('/leadership');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="cold-opportunities"]');
    
    // Verify cold opportunities section exists
    await expect(page.locator('[data-testid="cold-opportunities"]')).toBeVisible();
  });

  test('is accessible via keyboard', async ({ page }) => {
    await page.goto('/leadership');
    
    // Tab through major elements
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing and verify all interactive elements are reachable
  });
});
```

---

## 📋 Implementation Checklist

Use this to track progress:

### Database (Chunks 1-2)
- [ ] Create migration file `00006_leadership_dashboard.sql`
- [ ] `get_terminal_stages()` function
- [ ] `get_leadership_summary()` function
- [ ] `get_activity_volume()` function
- [ ] `get_pipeline_summaries()` function
- [ ] `get_cold_opportunities()` function
- [ ] `get_dashboard_activity()` function
- [ ] Run and verify migrations in Supabase

### Types & Service (Chunks 3-4)
- [ ] Type definitions file
- [ ] Period utilities
- [ ] Dashboard service with all methods
- [ ] Error handling in service

### Hooks (Chunks 5-6)
- [ ] `useDashboardFilters` with localStorage + URL sync
- [ ] `useLeadershipDashboard` with React Query

### UI Components (Chunks 7-12)
- [ ] `DashboardViewToggle`
- [ ] `DashboardSummaryCards`
- [ ] `ActivityVolumeCard`
- [ ] `DashboardFilters`
- [ ] Skeleton components
- [ ] `LeadershipDashboard` (main)
- [ ] `PipelineSection`
- [ ] `StageDistributionBar`
- [ ] `PipelineBreakdownBadges`
- [ ] `VentureSection`
- [ ] `AttentionList`
- [ ] `RecentMovementList`
- [ ] `CrossPipelineActivityFeed`
- [ ] `ActivityCoverageGaps`

### Integration (Chunk 13)
- [ ] Barrel exports
- [ ] Page component
- [ ] Route configuration
- [ ] Navigation link (manager/admin only)

### Testing (Chunks 14-15)
- [ ] Unit tests for hooks
- [ ] Unit tests for service
- [ ] E2E tests for full flow
- [ ] Accessibility audit

---

## Estimated Time by Chunk

| Chunk | Description | Time | Cumulative |
|-------|-------------|------|------------|
| 1 | Core DB Functions | 2h | 2h |
| 2 | Additional DB Functions | 2h | 4h |
| 3 | Type Definitions | 1.5h | 5.5h |
| 4 | Service Layer | 2h | 7.5h |
| 5 | Filter Hook | 1.5h | 9h |
| 6 | Data Hooks | 2h | 11h |
| 7 | Core UI Part 1 | 2h | 13h |
| 8 | Core UI Part 2 | 2h | 15h |
| 9 | Main Container | 2h | 17h |
| 10 | Pipeline Section | 2.5h | 19.5h |
| 11 | Venture & Lists | 2.5h | 22h |
| 12 | Activity Feed | 2h | 24h |
| 13 | Integration | 1.5h | 25.5h |
| 14 | Unit Tests | 2h | 27.5h |
| 15 | E2E Tests | 2h | 29.5h |
| **Total** | | **~30h** | |

*Note: Buffer time for debugging, code review, and iteration may add 20-30%.*
