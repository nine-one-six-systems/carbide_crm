# Leadership Dashboard - Cursor Prompts Quick Reference

Copy these prompts directly into Cursor chat to implement each piece.

---

## CHUNK 1: Database - Core Functions (2h)

### Prompt 1.1: Migration File + Helper Function
```
Create supabase/migrations/00006_leadership_dashboard.sql with:

1. Header comment block
2. get_terminal_stages(p_type business_relationship_type) RETURNS TEXT[]
   - Returns terminal stages per pipeline type
   - IMMUTABLE for optimization

Terminal stages by type:
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
```

### Prompt 1.2: Leadership Summary RPC
```
Add to 00006_leadership_dashboard.sql:

get_leadership_summary(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (active_count, advanced_count, stuck_count, cold_count)

Count:
- active_count: Non-terminal relationships matching filters
- advanced_count: With stage_change in period
- stuck_count: No stage change in 30+ days
- cold_count: No activity in 7+ days

Use CTEs and LEFT JOIN LATERAL for efficiency.
Mark as STABLE.
```

---

## CHUNK 2: Database - Additional Functions (2h)

### Prompt 2.1: Activity Volume RPC
```
Add to 00006_leadership_dashboard.sql:

get_activity_volume(p_period_start, p_period_end, p_venture, p_owner_id)
RETURNS TABLE (calls BIGINT, emails BIGINT, meetings BIGINT)

Count activities in period:
- calls: type IN ('call_inbound', 'call_outbound')
- emails: type IN ('email_inbound', 'email_outbound')
- meetings: type IN ('meeting_in_person', 'meeting_virtual')

Mark as STABLE.
```

### Prompt 2.2: Pipeline Summaries RPC
```
Add get_pipeline_summaries() that returns:
- pipeline_type
- active_count  
- stages JSONB: [{"stage": "Lead", "count": 5}, ...]
- ventures JSONB: [{"venture": "forge", "count": 3}, ...]

Use CTEs: filtered_relationships, stage_counts, venture_counts
Only return pipelines with active relationships.
```

### Prompt 2.3: Cold Opportunities RPC
```
Add get_cold_opportunities(p_days_threshold, p_limit, p_venture, p_owner_id)
RETURNS TABLE (id, entity_name, entity_type, pipeline_type, stage, days_since_activity, owner_name, ventures)

Find relationships with no activity in p_days_threshold days.
JOIN contacts/organizations for entity_name.
ORDER BY days_since_activity DESC, LIMIT p_limit.
```

### Prompt 2.4: Dashboard Activity RPC
```
Add get_dashboard_activity(p_period_start, p_period_end, p_venture, p_owner_id, p_limit)
RETURNS TABLE (id, activity_type, entity_name, entity_id, pipeline_type, description, occurred_at, user_name)

Return recent activities across all pipelines.
ORDER BY occurred_at DESC.
```

---

## CHUNK 3: Type Definitions (1.5h)

### Prompt 3.1: Create Types File
```
Create src/features/dashboard/types/leadershipDashboard.types.ts with:

1. DashboardView = 'pipeline' | 'venture'
2. DashboardPeriod = '7d' | '14d' | '30d' | 'quarter' | 'all' | 'custom'
3. DashboardFilters interface
4. LeadershipSummary: { activeCount, advancedCount, stuckCount, coldCount }
5. ActivityVolume: { calls, emails, meetings }
6. StageCount, VentureCount, PipelineCount
7. OpportunityAttentionItem with reasons
8. StageMovement for recent movements
9. PipelineSummary and VentureSummary for sections
10. DashboardActivity and ColdOpportunity
11. API row types matching SQL returns

Import Venture, BusinessRelationshipType from @/types/database.
Export all types.
```

---

## CHUNK 4: Service Layer (2h)

### Prompt 4.1: Period Utilities
```
Create src/features/dashboard/utils/periodUtils.ts

Export getPeriodDates(filters: DashboardFilters): { start: Date, end: Date }

Handle: '7d', '14d', '30d', 'quarter', 'all', 'custom'
Use date-fns (subDays, startOfQuarter).
```

### Prompt 4.2: Dashboard Service
```
Create src/features/dashboard/services/leadershipDashboardService.ts

Methods:
- getSummary(filters): Promise<LeadershipSummary>
- getActivityVolume(filters): Promise<ActivityVolume>
- getPipelineSummaries(filters): Promise<PipelineSummary[]>
- getColdOpportunities(filters, limit): Promise<ColdOpportunity[]>
- getRecentActivity(filters, limit): Promise<DashboardActivity[]>

Each method:
- Uses getPeriodDates(filters)
- Calls supabase.rpc()
- Transforms snake_case to camelCase
- Logs errors before throwing
```

---

## CHUNK 5: Filter Hook (1.5h)

### Prompt 5.1: Create Filter State Hook
```
Create src/features/dashboard/hooks/useDashboardFilters.ts

Features:
- Default: view='pipeline', period='14d'
- localStorage persistence with key 'leadership-dashboard-filters'
- URL query param sync using useSearchParams
- setFilters(partial) for updates
- resetFilters() to defaults
- hasActiveFilters computed property

Initialize from: URL params > localStorage > defaults
Sync to localStorage on every change.
Sync non-default values to URL params.
```

---

## CHUNK 6: Data Fetching Hook (2h)

### Prompt 6.1: Main Dashboard Hook
```
Create src/features/dashboard/hooks/useLeadershipDashboard.ts

Uses React Query (TanStack Query v5) with:
- summaryQuery: get_leadership_summary
- activityVolumeQuery: get_activity_volume
- pipelineSummariesQuery: get_pipeline_summaries (enabled when view='pipeline')
- coldOpportunitiesQuery: get_cold_opportunities
- recentActivityQuery: get_dashboard_activity

Config:
- staleTime: 5 minutes
- refetchInterval: 5 minutes (auto-refresh)
- Query keys include filter hash for cache invalidation

Return: { summary, activityVolume, pipelineSummaries, coldOpportunities, recentActivity, isLoading, isError, error, refetch }
```

---

## CHUNK 7: Core UI Components Part 1 (2h)

### Prompt 7.1: View Toggle
```
Create src/features/dashboard/components/DashboardViewToggle.tsx

ToggleGroup with Pipeline (LayoutGrid icon) and Venture (Building2 icon) options.
Props: view, onChange
Show labels only on sm+ screens.
Add aria-labels.
Use shadcn ToggleGroup.
```

### Prompt 7.2: Summary Cards
```
Create src/features/dashboard/components/DashboardSummaryCards.tsx

4 cards in responsive grid (2 cols mobile, 4 cols lg):
1. Active Opportunities (TrendingUp icon)
2. Advanced This Period (ArrowUpRight icon)
3. Stuck 14+ days (AlertTriangle, warning if > 0)
4. Cold 7+ days (Snowflake, warning if > 0)

Props: summary?: LeadershipSummary, isLoading: boolean
Use shadcn Card, Skeleton.
```

### Prompt 7.3: Activity Volume Card
```
Create src/features/dashboard/components/ActivityVolumeCard.tsx

Compact vertical list:
- Phone icon + Calls + count
- Mail icon + Emails + count
- Calendar icon + Meetings + count
- Divider + Total

Props: volume?: ActivityVolume, isLoading: boolean
Use shadcn Card.
```

---

## CHUNK 8: Core UI Components Part 2 (2h)

### Prompt 8.1: Dashboard Filters
```
Create src/features/dashboard/components/DashboardFilters.tsx

Popover with:
- Period select: 7d, 14d, 30d, Quarter, All
- Venture select (conditionally shown)
- Pipeline select (conditionally shown)  
- Owner select with search
- Reset button

Props: filters, onChange, onReset, hideVentureFilter?, hidePipelineFilter?
Show badge count when filters active.
Use shadcn Popover, Select, Button.
```

### Prompt 8.2: Skeleton Components
```
Create:
- src/features/dashboard/components/skeletons/SummaryCardsSkeleton.tsx
- src/features/dashboard/components/skeletons/PipelineSectionSkeleton.tsx

Match layouts of real components with shimmer animation.
Use shadcn Skeleton.
```

---

## CHUNK 9: Main Dashboard Container (2h)

### Prompt 9.1: Main Component
```
Create src/features/dashboard/components/LeadershipDashboard.tsx

Structure:
- Header with title, view toggle, filters, refresh button
- Error alert if isError
- Summary row: 4/5 for cards, 1/5 for activity volume
- Pipeline or Venture sections (conditional)
- Activity feed
- Cold opportunities

Use ErrorBoundary around each major section.
Define PIPELINE_DISPLAY_ORDER and VENTURE_DISPLAY_ORDER constants.
Skip empty sections when not loading.
```

---

## CHUNK 10: Pipeline Section (2.5h)

### Prompt 10.1: Pipeline Section
```
Create src/features/dashboard/components/PipelineSection.tsx

Collapsible section with:
- Header: chevron, label, active count badge, attention indicator, venture badges
- Content: StageDistributionBar, 2-column grid with RecentMovementList + AttentionList

Props: type, data?, isLoading, defaultExpanded
Auto-expand if has attention items.
Use shadcn Collapsible.
```

### Prompt 10.2: Stage Distribution Bar
```
Create src/features/dashboard/components/StageDistributionBar.tsx

Horizontal segmented bar with proportional widths.
Define STAGE_COLORS constant.
Show legend below with stage dots and counts.
Handle empty states.
```

### Prompt 10.3: Pipeline Breakdown Badges
```
Create src/features/dashboard/components/PipelineBreakdownBadges.tsx

Show up to 3 venture badges with counts, then "+N more".
Define VENTURE_COLORS constant.
Use small badge variant.
```

---

## CHUNK 11: Venture Section & Lists (2.5h)

### Prompt 11.1: Venture Section
```
Create src/features/dashboard/components/VentureSection.tsx

Similar to PipelineSection but:
- Shows pipeline breakdown instead of venture breakdown
- Uses aggregated stage distribution
- Different color per venture

Define VENTURE_LABELS and VENTURE_COLORS.
```

### Prompt 11.2: Attention List
```
Create src/features/dashboard/components/AttentionList.tsx

List of stuck/cold opportunities.
Each item: entity name (link), stage badge, warning icon, days count, owner.
Icons: AlertTriangle (stuck), Snowflake (cold).
Props: items?, maxItems=5, title.
Empty state with CheckCircle.
```

### Prompt 11.3: Recent Movement List
```
Create src/features/dashboard/components/RecentMovementList.tsx

List of stage changes.
Each item: arrow icon, entity name, "Stage A → Stage B", time ago, owner.
Special styling for wins (trophy icon, green).
Use formatDistanceToNow from date-fns.
Empty state message.
```

---

## CHUNK 12: Activity Feed & Cold Opportunities (2h)

### Prompt 12.1: Activity Feed
```
Create src/features/dashboard/components/CrossPipelineActivityFeed.tsx

Card with "Recent Activity" header and activity list.
Each: type icon, entity name, description, pipeline badge, time ago, user.
Define getActivityIcon helper.
Props: activities?, isLoading, maxItems=10.
```

### Prompt 12.2: Cold Opportunities
```
Create src/features/dashboard/components/ActivityCoverageGaps.tsx

Warning card showing cold opportunities.
Table: entity name, pipeline, stage, days since activity (red if > 14), owner.
Empty state: success message.
Props: opportunities?, isLoading.
```

---

## CHUNK 13: Integration (1.5h)

### Prompt 13.1: Barrel Exports
```
Create src/features/dashboard/index.ts

Export all components, hooks, and types.
```

### Prompt 13.2: Page Component
```
Create src/pages/LeadershipDashboard.tsx

Thin wrapper with PageContainer.
Import LeadershipDashboard from @/features/dashboard.
Export default for lazy loading.
```

### Prompt 13.3: Router
```
Update src/router.tsx:

Add route at '/leadership':
- Lazy load LeadershipDashboard
- Wrap with ProtectedRoute requireManager
- Suspense with LoadingScreen fallback
```

### Prompt 13.4: Navigation
```
Update Sidebar/Navigation component:

Add "Leadership" link (BarChart3 icon) at '/leadership'.
Only visible when user.role is 'manager' or 'admin'.
```

---

## CHUNK 14: Unit Tests (2h)

### Prompt 14.1: Filter Hook Tests
```
Create src/features/dashboard/__tests__/useDashboardFilters.test.ts

Test:
- Default values
- setFilters merges correctly
- resetFilters returns to defaults
- localStorage persistence
- URL param sync

Use @testing-library/react renderHook.
Mock localStorage and useSearchParams.
```

### Prompt 14.2: Service Tests
```
Create src/features/dashboard/__tests__/leadershipDashboardService.test.ts

Mock supabase.rpc.
Test each method:
- Correct RPC called
- Response transformed correctly
- Errors thrown appropriately
```

---

## CHUNK 15: E2E Tests (2h)

### Prompt 15.1: E2E Test Suite
```
Create tests/e2e/leadership-dashboard.spec.ts

Playwright tests:
1. Loads with default view
2. Switches between pipeline/venture views
3. Persists filters in URL
4. Displays cold opportunities
5. Keyboard accessibility

Login as manager user in beforeEach.
Add data-testid attributes to components for reliable selection.
```

---

## Verification Commands

```bash
# Database
supabase db push  # Apply migrations
supabase functions serve  # Test locally

# Frontend
npm run typecheck  # Verify types
npm run lint  # Check code quality
npm run test  # Run unit tests
npm run test:e2e  # Run Playwright tests

# Full verification
npm run build  # Ensure production build works
```
