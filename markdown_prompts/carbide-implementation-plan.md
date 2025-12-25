# Carbide CRM - Implementation Plan for Remaining Functionality

**Version:** 1.0  
**Created:** December 2024  
**Based On:** carbide-prd-v2.md, carbide-technical-prd.md, carbide-technical-prd-addendum.md, carbide-leadership-dashboard-addendum.md

---

## Executive Summary

This document outlines the remaining functionality to be implemented in Carbide CRM based on the PRD requirements. The analysis is based on the project knowledge base, including existing completion plans that show many Phase 1 features have been implemented.

### Implementation Status Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     IMPLEMENTATION STATUS                           │
├─────────────────────────────────────────────────────────────────────┤
│  ████████████████████████████████░░░░░░░░  ~75% Complete           │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ Core CRUD (Contacts, Orgs, Relationships)                       │
│  ✅ Pipeline Kanban Views                                           │
│  ✅ Cadence System                                                  │
│  ✅ Task Management                                                 │
│  ✅ Batch Task View                                                 │
│  ✅ Activity Tracking & Timeline                                    │
│  ✅ Salesperson Dashboard                                           │
│  ✅ Global Search                                                   │
│  ✅ Saved Filters                                                   │
│  ✅ Household View                                                  │
│  ✅ Realtime Subscriptions                                          │
│  ✅ Testing Infrastructure (Vitest/Playwright)                      │
│  ✅ CI/CD Pipeline                                                  │
│  ✅ Theme/i18n/Accessibility                                        │
│  ✅ Virtual Scrolling                                               │
│  ✅ Form Enhancements (Auto-save, unsaved changes)                  │
│  ✅ Error Boundaries                                                │
├─────────────────────────────────────────────────────────────────────┤
│  🔶 Manager Dashboard (Partial - needs verification)                │
│  🔶 Admin User Management (Partial - needs completion)              │
├─────────────────────────────────────────────────────────────────────┤
│  ❌ Leadership Dashboard (New - Not Started)                        │
│  ❌ Data Import/Export                                              │
│  ❌ In-App Notifications                                            │
│  ❌ Additional E2E Test Coverage                                    │
│  ❌ Performance Optimization (Materialized Views)                   │
│  ❌ Production Hardening                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Critical New Features

### 1.1 Leadership Dashboard (Priority: HIGH)

**Source:** carbide-leadership-dashboard-addendum.md  
**Estimated Effort:** 3-4 sprints  
**Dependencies:** Existing business relationships, activity log

The Leadership Dashboard is a major new feature for executive oversight across all pipelines and ventures.

#### Database Layer

| Task | Description | Estimate |
|------|-------------|----------|
| Create `get_leadership_summary` RPC | Aggregate KPI counts (active, advanced, stuck, cold) | 4h |
| Create `get_activity_volume` RPC | Count calls/emails/meetings by period | 2h |
| Create `get_pipeline_summaries` RPC | Per-pipeline stage distribution and metrics | 4h |
| Create `get_venture_summaries` RPC | Per-venture aggregated metrics | 4h |
| Create `get_dashboard_activity` RPC | Cross-pipeline activity feed | 3h |
| Create `get_cold_opportunities` RPC | Opportunities with no recent activity | 2h |
| Create `get_terminal_stages` helper | Define terminal stages per pipeline type | 1h |
| (Optional) Create materialized view | Performance optimization for large datasets | 4h |

```sql
-- Example: Migration 00004_leadership_dashboard.sql
CREATE OR REPLACE FUNCTION get_terminal_stages(p_type business_relationship_type)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'b2b_client' THEN ARRAY['Won', 'Lost', 'Disqualified']
    WHEN 'b2c_client' THEN ARRAY['Closed', 'Lost', 'Cancelled']
    WHEN 'business_investment_external' THEN ARRAY['Invested', 'Passed', 'Withdrawn']
    WHEN 'portfolio_company' THEN ARRAY['Exited', 'Written Off']
    WHEN 'investor' THEN ARRAY['Committed', 'Passed']
    ELSE ARRAY['Closed', 'Lost']::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Frontend Components

| Component | Description | Estimate |
|-----------|-------------|----------|
| `LeadershipDashboard.tsx` | Main container with dual view toggle | 4h |
| `DashboardViewToggle.tsx` | Pipeline/Venture view switcher | 2h |
| `DashboardSummaryCards.tsx` | KPI cards (Active, Advanced, Stuck, Cold) | 3h |
| `ActivityVolumeCard.tsx` | Calls/Emails/Meetings metrics | 2h |
| `PipelineSection.tsx` | Collapsible pipeline block with metrics | 4h |
| `VentureSection.tsx` | Collapsible venture block with metrics | 4h |
| `PipelineBreakdownBadges.tsx` | Mini venture badges in pipeline view | 2h |
| `StageDistributionBar.tsx` | Horizontal stage visualization | 3h |
| `AttentionList.tsx` | Stuck/cold opportunities list | 3h |
| `RecentMovementList.tsx` | Recent stage changes | 2h |
| `CrossPipelineActivityFeed.tsx` | Activity feed across pipelines | 3h |
| `ActivityCoverageGaps.tsx` | Cold opportunities alert list | 2h |
| `DashboardFilters.tsx` | Time period, venture, owner filters | 3h |

#### Hooks & Services

| File | Description | Estimate |
|------|-------------|----------|
| `useLeadershipDashboard.ts` | Main data hook with conditional queries | 4h |
| `usePipelineSummary.ts` | Per-pipeline aggregates | 2h |
| `useVentureSummary.ts` | Per-venture aggregates | 2h |
| `useActivityVolume.ts` | Activity counts | 1h |
| `useAttentionItems.ts` | Stuck/cold items | 2h |
| `useDashboardFilters.ts` | Filter state with URL/localStorage persistence | 3h |
| `leadershipDashboardService.ts` | API calls to Supabase RPCs | 3h |

#### Type Definitions

```typescript
// src/features/dashboard/types/leadershipDashboard.types.ts

export type DashboardView = 'pipeline' | 'venture';
export type DashboardPeriod = '7d' | '14d' | '30d' | 'quarter' | 'all' | 'custom';

export interface DashboardFilters {
  view: DashboardView;
  period: DashboardPeriod;
  periodStart?: Date;
  periodEnd?: Date;
  venture?: Venture;
  ownerId?: string;
  pipelineType?: BusinessRelationshipType;
}

export interface LeadershipSummary {
  activeCount: number;
  advancedCount: number;
  stuckCount: number;
  coldCount: number;
}

export interface ActivityVolume {
  calls: number;
  emails: number;
  meetings: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface PipelineSummary {
  type: BusinessRelationshipType;
  activeCount: number;
  stageDistribution: StageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
  ventureBreakdown: VentureCount[];
}

export interface VentureSummary {
  venture: Venture;
  activeCount: number;
  pipelineBreakdown: PipelineCount[];
  stageDistribution: SimplifiedStageCount[];
  attentionItems: OpportunityAttentionItem[];
  recentMovements: StageMovement[];
}
```

#### Routing & Access Control

```typescript
// Update src/router.tsx
{
  path: 'leadership',
  element: (
    <ProtectedRoute requireManager>
      <LeadershipDashboard />
    </ProtectedRoute>
  ),
},
```

#### Testing Requirements

| Test Type | Description | Estimate |
|-----------|-------------|----------|
| Unit: `useDashboardFilters` | Filter state management | 2h |
| Unit: `useLeadershipDashboard` | Data fetching hook | 2h |
| Component: `PipelineSection` | Render and interactions | 2h |
| Component: `VentureSection` | Render and interactions | 2h |
| Component: View toggle | Switching between views | 1h |
| E2E: Pipeline view flow | Full dashboard navigation | 2h |
| E2E: Venture view flow | Full dashboard navigation | 2h |
| E2E: Filter persistence | URL and localStorage | 2h |
| Accessibility audit | Keyboard nav, screen reader | 2h |

**Total Estimate:** ~80-100 hours

---

### 1.2 Manager Dashboard Enhancement (Priority: HIGH)

**Source:** carbide-prd-v2.md Section 7.4  
**Estimated Effort:** 1-2 sprints  
**Dependencies:** Existing task system, team data

The Manager Dashboard may be partially implemented. Verify and complete the following:

#### Required Components

| Component | Description | Status |
|-----------|-------------|--------|
| Team overview cards | Tasks by assignee summary | Verify |
| Cadence performance table | Conversion rates by cadence | Implement |
| Activity trends chart | Tasks completed, cadences added over time | Implement |
| Alert system | Overdue task warnings, stuck relationships | Verify |
| Task reassignment | Bulk reassign tasks to different users | Verify |
| Workload distribution | Visual workload balancing | Implement |

#### Database Requirements

```sql
-- Team task summary RPC
CREATE OR REPLACE FUNCTION get_team_task_summary(
  p_team_user_ids UUID[],
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  pending_count INT,
  overdue_count INT,
  completed_today INT,
  completed_week INT
) AS $$
-- Implementation
$$ LANGUAGE plpgsql;

-- Cadence performance metrics
CREATE OR REPLACE FUNCTION get_cadence_performance(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  cadence_id UUID,
  cadence_name TEXT,
  applied_count INT,
  completed_count INT,
  conversion_rate DECIMAL
) AS $$
-- Implementation
$$ LANGUAGE plpgsql;
```

**Total Estimate:** ~40-50 hours

---

### 1.3 Admin User Management (Priority: MEDIUM)

**Source:** carbide-prd-v2.md Section 10.1  
**Estimated Effort:** 1 sprint

#### Required Features

| Feature | Description | Estimate |
|---------|-------------|----------|
| User list view | Table of all users with roles | 4h |
| Create user | Form to invite new user | 4h |
| Edit user role | Change user role (admin/manager/user) | 2h |
| Deactivate user | Soft delete/deactivate | 2h |
| User profile management | Admin edit any profile | 3h |

#### Components

```
src/features/admin/
├── components/
│   ├── UserManagement.tsx
│   ├── UserTable.tsx
│   ├── UserFormDialog.tsx
│   └── RoleSelector.tsx
├── hooks/
│   └── useUsers.ts
└── services/
    └── userService.ts
```

**Total Estimate:** ~20-25 hours

---

## Phase 2: Important Features

### 2.1 Data Import/Export (Priority: MEDIUM)

**Source:** carbide-prd-v2.md (implied)  
**Estimated Effort:** 1-2 sprints

#### Import Features

| Feature | Description | Estimate |
|---------|-------------|----------|
| CSV contact import | Parse and validate CSV | 6h |
| Field mapping UI | Map CSV columns to fields | 4h |
| Duplicate detection | Warn on potential duplicates | 4h |
| Import preview | Review before committing | 3h |
| Batch insert | Efficient bulk insert | 4h |
| Import history | Track past imports | 2h |

#### Export Features

| Feature | Description | Estimate |
|---------|-------------|----------|
| Contact export | CSV export with filters | 4h |
| Organization export | CSV export | 3h |
| Activity export | CSV export by date range | 3h |
| Custom field selection | Choose columns to export | 2h |

**Total Estimate:** ~35-40 hours

---

### 2.2 In-App Notifications (Priority: MEDIUM)

**Source:** carbide-prd-v2.md Section 8 (Requirements Checklist)  
**Estimated Effort:** 1 sprint

#### Required Features

| Feature | Description | Estimate |
|---------|-------------|----------|
| Notification bell | Header icon with count | 2h |
| Notification dropdown | List recent notifications | 4h |
| Notification types | Task due, assignment, mentions | 3h |
| Mark as read | Individual and bulk | 2h |
| Notification settings | User preferences | 3h |
| Real-time delivery | Supabase realtime channel | 4h |

#### Database Schema

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'task_due', 'task_assigned', 'mention', etc.
  title TEXT NOT NULL,
  body TEXT,
  link TEXT, -- URL to navigate to
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_unread_idx 
  ON public.notifications(user_id, is_read) 
  WHERE is_read = false;
```

**Total Estimate:** ~25-30 hours

---

### 2.3 Additional E2E Test Coverage (Priority: MEDIUM)

**Source:** carbide-technical-prd.md Section 12  
**Estimated Effort:** 1 sprint

#### Critical User Flows

| Flow | Description | Estimate |
|------|-------------|----------|
| Contact CRUD | Create, edit, view, search contacts | 3h |
| Organization CRUD | Full organization lifecycle | 3h |
| Cadence workflow | Apply, pause, resume, complete cadence | 4h |
| Task workflow | Create task, complete with notes, triage | 3h |
| Pipeline management | Move deals through stages | 3h |
| Search & filter | Global search, saved filters | 3h |
| Batch task operations | Bulk complete, triage, dismiss | 3h |
| Household view | Family timeline aggregation | 2h |
| Auth flows | Login, logout, session handling | 2h |
| Role-based access | Verify admin/manager/user permissions | 3h |

**Total Estimate:** ~30 hours

---

## Phase 3: Polish & Optimization

### 3.1 Performance Optimization (Priority: LOW-MEDIUM)

| Task | Description | Estimate |
|------|-------------|----------|
| Materialized views | Leadership dashboard cache | 4h |
| Query optimization | Analyze and optimize slow queries | 6h |
| Bundle analysis | Reduce JavaScript bundle size | 3h |
| Image optimization | Lazy loading, WebP conversion | 2h |
| API response caching | React Query stale time tuning | 2h |
| Database indexing | Review and add missing indexes | 3h |

**Total Estimate:** ~20 hours

---

### 3.2 Accessibility Audit Completion (Priority: MEDIUM)

| Task | Description | Estimate |
|------|-------------|----------|
| Screen reader testing | Test with NVDA/VoiceOver | 4h |
| Keyboard navigation audit | Verify all flows | 3h |
| Color contrast verification | Tool-based checking | 2h |
| Focus management | Modal and drawer focus trapping | 3h |
| ARIA attribute audit | Verify all dynamic content | 3h |
| Mobile accessibility | Touch target sizes | 2h |

**Total Estimate:** ~17 hours

---

### 3.3 Documentation (Priority: LOW)

| Task | Description | Estimate |
|------|-------------|----------|
| API documentation | Document all Supabase RPCs | 4h |
| Component storybook | Document UI components | 6h |
| User guide | End-user documentation | 6h |
| Admin guide | System administration | 4h |
| Developer onboarding | Setup and contribution guide | 3h |

**Total Estimate:** ~23 hours

---

## Implementation Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Sprint 1-2: Leadership Dashboard (Database & Core Components)              │
│  ═══════════════════════════════════════════════════                        │
│  • Database RPCs and migrations                                             │
│  • Core dashboard components                                                │
│  • Dual view (Pipeline/Venture) implementation                              │
│                                                                             │
│  Sprint 3: Leadership Dashboard (Polish & Testing)                          │
│  ══════════════════════════════════════════════════                         │
│  • Filter persistence                                                       │
│  • Activity feed integration                                                │
│  • Unit and E2E tests                                                       │
│  • Accessibility audit                                                      │
│                                                                             │
│  Sprint 4: Manager Dashboard & Admin Features                               │
│  ════════════════════════════════════════════════                           │
│  • Verify/complete Manager Dashboard                                        │
│  • Admin user management                                                    │
│  • Role-based access enforcement                                            │
│                                                                             │
│  Sprint 5: Data Import/Export                                               │
│  ════════════════════════════════                                           │
│  • CSV import with field mapping                                            │
│  • Export functionality                                                     │
│  • Duplicate detection                                                      │
│                                                                             │
│  Sprint 6: Notifications & E2E Testing                                      │
│  ════════════════════════════════════════                                   │
│  • In-app notification system                                               │
│  • Comprehensive E2E test coverage                                          │
│                                                                             │
│  Sprint 7: Polish & Production Readiness                                    │
│  ═══════════════════════════════════════════                                │
│  • Performance optimization                                                 │
│  • Accessibility completion                                                 │
│  • Documentation                                                            │
│  • Production deployment prep                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Priority Matrix

| Feature | Business Value | Effort | Priority | Sprint |
|---------|---------------|--------|----------|--------|
| Leadership Dashboard | High | High | P0 | 1-3 |
| Manager Dashboard Completion | High | Medium | P0 | 4 |
| Admin User Management | Medium | Low | P1 | 4 |
| Data Import/Export | High | Medium | P1 | 5 |
| In-App Notifications | Medium | Medium | P2 | 6 |
| E2E Test Coverage | High | Medium | P1 | 6 |
| Performance Optimization | Medium | Low | P2 | 7 |
| Accessibility Completion | Medium | Low | P2 | 7 |
| Documentation | Low | Low | P3 | 7 |

---

## Technical Debt Items

Items identified during analysis that should be addressed:

| Item | Description | Priority |
|------|-------------|----------|
| TypeScript strict mode | Ensure all types are explicit | Medium |
| Error boundary coverage | Verify all routes have boundaries | High |
| Loading state consistency | Standardize skeleton patterns | Low |
| API error handling | Consistent error messages | Medium |
| Test coverage gaps | Increase unit test coverage | Medium |
| Bundle size monitoring | Set up size tracking | Low |

---

## Explicitly Deferred (Phase 2 Product Roadmap)

These features are explicitly deferred per the PRD:

- Protected Client Timelines
- Commission Calculation
- Auto-Clear Cadence Rules
- Recruiting/Hiring Module
- Branch/Division Ownership
- Staleness Auto-Archiving
- Email Integration
- Calendar Integration
- Automated Workflows
- Document Storage (file uploads)
- Native Mobile App

---

## Success Criteria

### Leadership Dashboard
- [ ] Page loads in < 2 seconds
- [ ] Data refreshes every 5 minutes
- [ ] All filters persist correctly
- [ ] Dual view toggle works seamlessly
- [ ] Accessible via keyboard and screen reader

### Manager Dashboard
- [ ] Shows accurate team task counts
- [ ] Cadence performance metrics are correct
- [ ] Task reassignment works
- [ ] Alerts trigger appropriately

### Overall System
- [ ] 80%+ E2E test coverage for critical flows
- [ ] WCAG 2.2 AA compliance
- [ ] < 3s initial page load
- [ ] < 100ms interaction response time
- [ ] Zero critical security vulnerabilities

---

## Appendix A: File Structure for New Features

```
src/
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── LeadershipDashboard.tsx
│   │   │   ├── DashboardViewToggle.tsx
│   │   │   ├── DashboardSummaryCards.tsx
│   │   │   ├── ActivityVolumeCard.tsx
│   │   │   ├── PipelineSection.tsx
│   │   │   ├── VentureSection.tsx
│   │   │   ├── PipelineBreakdownBadges.tsx
│   │   │   ├── StageDistributionBar.tsx
│   │   │   ├── AttentionList.tsx
│   │   │   ├── RecentMovementList.tsx
│   │   │   ├── CrossPipelineActivityFeed.tsx
│   │   │   ├── ActivityCoverageGaps.tsx
│   │   │   └── DashboardFilters.tsx
│   │   ├── hooks/
│   │   │   ├── useLeadershipDashboard.ts
│   │   │   ├── usePipelineSummary.ts
│   │   │   ├── useVentureSummary.ts
│   │   │   ├── useActivityVolume.ts
│   │   │   ├── useAttentionItems.ts
│   │   │   └── useDashboardFilters.ts
│   │   ├── services/
│   │   │   └── leadershipDashboardService.ts
│   │   └── types/
│   │       └── leadershipDashboard.types.ts
│   │
│   ├── admin/
│   │   ├── components/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserFormDialog.tsx
│   │   │   └── RoleSelector.tsx
│   │   ├── hooks/
│   │   │   └── useUsers.ts
│   │   └── services/
│   │       └── userService.ts
│   │
│   ├── import-export/
│   │   ├── components/
│   │   │   ├── ImportWizard.tsx
│   │   │   ├── FieldMapper.tsx
│   │   │   ├── ImportPreview.tsx
│   │   │   ├── ExportDialog.tsx
│   │   │   └── DuplicateWarning.tsx
│   │   ├── hooks/
│   │   │   ├── useImport.ts
│   │   │   └── useExport.ts
│   │   └── services/
│   │       ├── importService.ts
│   │       └── exportService.ts
│   │
│   └── notifications/
│       ├── components/
│       │   ├── NotificationBell.tsx
│       │   ├── NotificationDropdown.tsx
│       │   ├── NotificationItem.tsx
│       │   └── NotificationSettings.tsx
│       ├── hooks/
│       │   └── useNotifications.ts
│       └── services/
│           └── notificationService.ts
│
├── pages/
│   ├── LeadershipDashboard.tsx
│   └── AdminUsers.tsx
│
└── tests/
    └── e2e/
        ├── leadership-dashboard.spec.ts
        ├── manager-dashboard.spec.ts
        ├── user-management.spec.ts
        ├── import-export.spec.ts
        └── notifications.spec.ts
```

---

## Appendix B: Database Migration Order

```
supabase/migrations/
├── 00001_initial_schema.sql          ✅ Exists
├── 00002_rls_policies.sql            ✅ Exists
├── 00003_functions.sql               ✅ Exists
├── 00004_leadership_dashboard.sql    📝 To Create
├── 00005_notifications.sql           📝 To Create
└── 00006_performance_indexes.sql     📝 To Create
```

---

**Document History:**
- v1.0 (Dec 2024): Initial implementation plan based on PRD gap analysis
