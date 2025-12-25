# Carbide CRM - Leadership Dashboard PRD Addendum

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Development  
**Companion To:** carbide-prd-v2.md, carbide-technical-prd.md

---

## Overview

This addendum defines the **Leadership Dashboard** — a new top-level view designed for executive oversight of business opportunities across the NineOneSix ecosystem. Unlike the existing Salesperson Dashboard (individual daily work) and Manager Dashboard (team oversight), the Leadership Dashboard provides a cross-venture, cross-pipeline view focused on **progress and activity** rather than dollar values.

---

## Table of Contents

1. [Purpose & User Stories](#1-purpose--user-stories)
2. [Dashboard Scope](#2-dashboard-scope)
3. [Information Architecture](#3-information-architecture)
4. [UI Specifications](#4-ui-specifications)
5. [Data Requirements](#5-data-requirements)
6. [Filtering & Drill-Down](#6-filtering--drill-down)
7. [Technical Implementation](#7-technical-implementation)
8. [Database Queries](#8-database-queries)
9. [Component Architecture](#9-component-architecture)
10. [Routing & Navigation](#10-routing--navigation)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Success Metrics](#12-success-metrics)

---

## 1. Purpose & User Stories

### Primary Purpose

Provide leadership with a single view to answer: *"What's happening across our businesses right now?"*

### User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Executive | See all active opportunities across ventures | I understand where we're focused |
| Executive | Identify stuck/stale opportunities | I can intervene before deals die |
| Executive | See recent activity across pipelines | I know the team is engaged |
| Executive | Filter by venture or pipeline type | I can focus on specific business areas |
| Executive | Drill down to specific opportunities | I can get details without switching views |
| Executive | See opportunities needing attention | I can prioritize leadership support |

### Key Differentiators from Other Dashboards

| Dashboard | Primary User | Focus | Time Horizon |
|-----------|--------------|-------|--------------|
| **Salesperson Home** | Individual contributors | My tasks, my contacts, my activity | Today/This week |
| **Manager Dashboard** | Team leads | Team performance, workload distribution, alerts | This week/month |
| **Leadership Dashboard** | Executives | Business health, opportunity progress, cross-venture view | Rolling 30 days (configurable) |

---

## 2. Dashboard Scope

### Included Pipeline Types

The Leadership Dashboard focuses on **revenue and growth-generating pipelines**:

| Pipeline Type | Why Included |
|---------------|--------------|
| **B2B Clients** | Core revenue driver |
| **B2C Clients** | Consumer revenue stream |
| **Business Investment Opportunities (External)** | Foundry deal flow |
| **Internal Business Opportunities** | New venture development |
| **Portfolio Companies** | Investment health monitoring |
| **Partnership Opportunities** | Strategic growth |
| **Individual Partnerships** | Collaborator/contractor relationships |
| **Investor Pipeline** | Capital raising progress |
| **Meridian 44 Participants** | M44 platform growth |

### Excluded from Default View

| Pipeline Type | Reason |
|---------------|--------|
| **Non-Business Investment Opportunities** | Asset management (real estate, securities) — optionally includable via filter |

---

## 3. Information Architecture

### Dual View Modes: Toggle Between Pipeline-Centric and Venture-Centric

The dashboard supports **two organizational views** with a toggle switch:

| View Mode | Primary Dimension | Secondary Breakdown | Best For |
|-----------|-------------------|---------------------|----------|
| **By Pipeline** | Pipeline type (B2B, Investments, etc.) | Venture tags within each | "How are our client deals doing across all ventures?" |
| **By Venture** | Venture (Forge, Hearth, etc.) | Pipeline types within each | "How is Forge doing across all its activities?" |

### Information Hierarchy: Pipeline-Centric View (Default)

```
Leadership Dashboard
├── View Toggle [By Pipeline | By Venture]
├── Global Filters (Time Period, Venture, Owner)
├── Summary Row
│   ├── KPI Cards (Active, Advanced, Stuck, Cold)
│   └── Activity Volume (Calls, Emails, Meetings this period)
├── Pipeline Sections (expandable/collapsible)
│   ├── B2B Clients
│   │   ├── Stage Distribution Bar
│   │   ├── Recent Stage Movements
│   │   ├── Needs Attention List
│   │   └── Venture Breakdown (mini-badges)
│   ├── Investments
│   │   └── ...
│   └── [Other Pipelines]
├── Activity Feed (cross-pipeline, last 10-20)
└── Activity Coverage Gaps (opportunities going cold)
```

### Information Hierarchy: Venture-Centric View

```
Leadership Dashboard
├── View Toggle [By Pipeline | By Venture]
├── Global Filters (Time Period, Pipeline Type, Owner)
├── Summary Row
│   ├── KPI Cards (Active, Advanced, Stuck, Cold)
│   └── Activity Volume (Calls, Emails, Meetings this period)
├── Venture Sections (expandable/collapsible)
│   ├── Forge
│   │   ├── Pipeline Breakdown (B2B: 5, Partnerships: 2, etc.)
│   │   ├── Stage Distribution (aggregated across pipelines)
│   │   ├── Recent Stage Movements
│   │   └── Needs Attention List
│   ├── Hearth
│   │   └── ...
│   └── [Other Ventures]
├── Activity Feed (cross-venture, last 10-20)
└── Activity Coverage Gaps
```

---

## 4. UI Specifications

### 4.1 Wireframe: Pipeline-Centric View (Default)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Leadership Dashboard                                                            │
│                                                                                 │
│ View: [● By Pipeline] [○ By Venture]              [Time: Last 14 Days ▼]        │
│                                                                                 │
│ Filters: [All Ventures ▼] [All Owners ▼] [All Pipelines ▼]      [Reset Filters] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SUMMARY                                                                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │Active Opps│ │ Advanced  │ │Stuck(14d+)│ │  Cold     │ │ Activity Volume   │  │
│  │    47     │ │    12     │ │    5 ⚠    │ │ (7d+) 8 ⚠ │ │ 📞 34  ✉️ 89  📅 12│  │
│  │           │ │this period│ │           │ │           │ │    this period    │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ▼ B2B CLIENTS (18 active)                                    [View Pipeline →] │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ STAGE DISTRIBUTION                                                          ││
│  │ Lead    Qualified   Discovery   Proposal   Negotiation   Won    Active      ││
│  │  ●3       ●4          ●5          ●2          ●1         ●1      ●2         ││
│  │                                                                             ││
│  │ RECENT MOVEMENT (3 this period)                             [See all →]     ││
│  │ ↗️ Gamma LLC: Lead → Qualified (2 days ago, Sarah)                          ││
│  │ ↗️ Delta Co: Discovery → Proposal (4 days ago, Mike)                        ││
│  │ 🎉 Epsilon Inc: Negotiation → Won (6 days ago, Dan)                         ││
│  │                                                                             ││
│  │ ⚠ NEEDS ATTENTION (2)                                                       ││
│  │ ┌─────────────────────────────────────────────────────────────────────────┐ ││
│  │ │ Acme Corp        Proposal    21 days in stage    No activity 9 days     │ ││
│  │ │ [Forge] · Dan                                                  [View →] │ ││
│  │ └─────────────────────────────────────────────────────────────────────────┘ ││
│  │ ┌─────────────────────────────────────────────────────────────────────────┐ ││
│  │ │ Beta Industries  Discovery   35 days in stage    Last: Call 12 days ago │ ││
│  │ │ [Anvil] · Sarah                                                [View →] │ ││
│  │ └─────────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ▶ INVESTMENTS (8 active, 1 needs attention)                  [View Pipeline →] │
│                                                                                 │
│  ▶ PARTNERSHIPS (5 active)                                    [View Pipeline →] │
│                                                                                 │
│  ▶ INVESTOR PIPELINE (12 active, 2 need attention)            [View Pipeline →] │
│                                                                                 │
│  ▶ MERIDIAN 44 (23 active)                                    [View Pipeline →] │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  RECENT ACTIVITY (all pipelines)                               [View all →]     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 📞 Call with John Smith (Acme Corp) · B2B Client · Dan · 2 hours ago        ││
│  │ ✉️ Email to Sarah Chen (Foundry App) · Investment · Mike · 4 hours ago      ││
│  │ 📅 Meeting: M44 Onboarding (Dr. Martinez) · M44 · Lisa · Yesterday          ││
│  │ 📝 Note added: Partnership terms review · Partnership · Dan · Yesterday     ││
│  │ ↗️ Stage Change: Lead → Qualified (Beta LLC) · B2B · Sarah · 2 days ago     ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ❄️ ACTIVITY COVERAGE GAPS (opportunities going cold)          [View all →]     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 8 opportunities have no activity in 7+ days                                 ││
│  │                                                                             ││
│  │ • Acme Corp (B2B) · 9 days · Proposal stage · Dan                  [View →] ││
│  │ • TechStart Inc (Investment) · 11 days · Due Diligence · Mike      [View →] ││
│  │ • GlobalPart LLC (Partnership) · 8 days · Negotiation · Lisa       [View →] ││
│  │ [Show 5 more...]                                                            ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Wireframe: Venture-Centric View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Leadership Dashboard                                                            │
│                                                                                 │
│ View: [○ By Pipeline] [● By Venture]              [Time: Last 14 Days ▼]        │
│                                                                                 │
│ Filters: [All Pipelines ▼] [All Owners ▼]                       [Reset Filters] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SUMMARY                                                                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │Active Opps│ │ Advanced  │ │Stuck(14d+)│ │  Cold     │ │ Activity Volume   │  │
│  │    47     │ │    12     │ │    5 ⚠    │ │ (7d+) 8 ⚠ │ │ 📞 34  ✉️ 89  📅 12│  │
│  │           │ │this period│ │           │ │           │ │    this period    │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ▼ FORGE (15 active opportunities)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ PIPELINE BREAKDOWN                                                          ││
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                             ││
│  │ │B2B: 8   │ │B2C: 3   │ │Partner:2│ │Invest: 2│                             ││
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘                             ││
│  │                                                                             ││
│  │ STAGE DISTRIBUTION (all Forge pipelines)                                    ││
│  │ Early ●●●●●●  Mid ●●●●●  Late ●●●  Won ●                                    ││
│  │                                                                             ││
│  │ RECENT MOVEMENT (2 this period)                             [See all →]     ││
│  │ ↗️ Gamma LLC (B2B): Lead → Qualified (2 days ago)                           ││
│  │ 🎉 Epsilon Inc (B2B): Negotiation → Won (6 days ago)                        ││
│  │                                                                             ││
│  │ ⚠ NEEDS ATTENTION (1)                                                       ││
│  │ ┌─────────────────────────────────────────────────────────────────────────┐ ││
│  │ │ Acme Corp (B2B)   Proposal    21 days in stage    No activity 9 days    │ ││
│  │ │ Dan                                                            [View →] │ ││
│  │ └─────────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ▶ HEARTH (8 active, 1 needs attention)                                         │
│                                                                                 │
│  ▶ ANVIL (6 active)                                                             │
│                                                                                 │
│  ▶ CRUCIBLE (4 active)                                                          │
│                                                                                 │
│  ▶ FOUNDRY (12 active, 2 need attention)                                        │
│                                                                                 │
│  ▶ CARBIDE (2 active)                                                           │
│                                                                                 │
│  ▶ LUCEPTA (3 active)                                                           │
│                                                                                 │
│  ▶ MERIDIAN 44 (8 active)                                                       │
│                                                                                 │
│  ▶ TRADE STONE GROUP (5 active)                                                 │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [RECENT ACTIVITY and ACTIVITY COVERAGE GAPS same as Pipeline view]            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Summary Row Components

| Component | Metrics | Visual |
|-----------|---------|--------|
| **Active Opportunities** | Total count in non-terminal stages | Large number |
| **Advanced This Period** | Forward stage movements in time window | Number + ↗️ trend |
| **Stuck (14+ days)** | No stage change in 14+ days | Number + ⚠️ if > 0 |
| **Cold (7+ days)** | No activity in 7+ days | Number + ⚠️ if > 0 |
| **Activity Volume** | Calls, Emails, Meetings logged this period | Three mini-metrics with icons |

### 4.4 Activity Volume Card Detail

```
┌─────────────────────────────────────────┐
│ Activity Volume (last 14 days)          │
│                                         │
│  📞 Calls      34  (+8 vs prior period) │
│  ✉️ Emails     89  (+12 vs prior)       │
│  📅 Meetings   12  (-2 vs prior)        │
│  💬 Texts      23  (+5 vs prior)        │
│  📝 Notes      45  (no comparison)      │
│                                         │
│  Total: 203 activities                  │
└─────────────────────────────────────────┘
```

### 4.5 Time Period Options

| Option | Value | Description |
|--------|-------|-------------|
| **Last 7 Days** | `7d` | Quick recent view |
| **Last 14 Days** | `14d` | **Default** |
| **Last 30 Days** | `30d` | Monthly view |
| **This Quarter** | `quarter` | Current calendar quarter |
| **All Time** | `all` | No time filter |
| **Custom Range** | `custom` | Date picker for start/end |

### 4.6 View Toggle Component

```
┌─────────────────────────────────────┐
│  View: [● By Pipeline] [○ By Venture]  │
└─────────────────────────────────────┘
```

- Segmented control / toggle button group
- Selection persists in URL (`?view=pipeline` or `?view=venture`)
- User preference saved to localStorage for return visits

### 4.7 Attention Indicators

| Indicator | Trigger | Visual | Color |
|-----------|---------|--------|-------|
| **Stuck** | No stage change in 14+ days | ⚠️ icon | Yellow |
| **Very Stuck** | No stage change in 30+ days | ⚠️ icon | Orange |
| **Stale** | No stage change in 60+ days | ⚠️ icon + "Stale" badge | Red |
| **Cold** | No activity logged in 7+ days | ❄️ snowflake | Light blue |
| **Ice Cold** | No activity logged in 14+ days | ❄️ icon + glow | Blue |

### 4.8 Collapsed vs Expanded Section States

**Collapsed State (default for sections with 0 attention items):**
```
▶ PARTNERSHIPS (5 active)                                    [View Pipeline →]
```

**Expanded State (default for sections WITH attention items):**
```
▼ B2B CLIENTS (18 active, 2 need attention)                  [View Pipeline →]
  [Stage distribution bar]
  [Recent movement list]
  [Needs attention list]
```

Auto-expand logic: Sections with `attentionItems.length > 0` expand by default on page load.

---

## 5. Data Requirements

### 5.1 Core Data Points Per Opportunity

| Field | Source | Purpose |
|-------|--------|---------|
| `relationship.id` | relationships table | Unique identifier |
| `relationship.type` | relationships table | Pipeline type |
| `relationship.stage` | relationships table | Current stage |
| `relationship.ventures` | relationships table | Venture tags |
| `relationship.owner_id` | relationships table | Assigned owner |
| `relationship.updated_at` | relationships table | Last modification |
| `contact.full_name` or `organization.name` | contacts/organizations | Display name |
| `last_stage_change` | activities table | Most recent stage_change activity |
| `last_activity` | activities table | Most recent activity of any type |
| `days_in_stage` | Calculated | `now() - last_stage_change` |
| `days_since_activity` | Calculated | `now() - last_activity` |

### 5.2 Aggregated Metrics

| Metric | Query Logic |
|--------|-------------|
| Active count per pipeline | `COUNT(*) WHERE stage NOT IN (terminal_stages) GROUP BY type` |
| Active count per venture | `COUNT(*) WHERE stage NOT IN (terminal_stages) GROUP BY venture` |
| Stage distribution | `COUNT(*) GROUP BY type, stage` |
| Advanced this period | `COUNT(*) WHERE activity_type = 'stage_change' AND direction = 'forward' AND occurred_at > period_start` |
| Stuck count | `COUNT(*) WHERE days_in_stage >= 14` |
| Cold count | `COUNT(*) WHERE days_since_activity >= 7` |

### 5.3 Activity Volume Metrics

| Metric | Query Logic |
|--------|-------------|
| Calls this period | `COUNT(*) WHERE type IN ('call_inbound', 'call_outbound') AND occurred_at BETWEEN period_start AND period_end` |
| Emails this period | `COUNT(*) WHERE type IN ('email_inbound', 'email_outbound') AND occurred_at BETWEEN period_start AND period_end` |
| Meetings this period | `COUNT(*) WHERE type IN ('meeting_in_person', 'meeting_virtual') AND occurred_at BETWEEN period_start AND period_end` |
| Texts this period | `COUNT(*) WHERE type IN ('text_inbound', 'text_outbound') AND occurred_at BETWEEN period_start AND period_end` |
| Notes this period | `COUNT(*) WHERE type = 'note' AND occurred_at BETWEEN period_start AND period_end` |
| Prior period comparison | Same queries with `period_start - period_length` to `period_start` |

### 5.4 Terminal Stages by Pipeline Type

These stages are excluded from "active" counts:

| Pipeline Type | Terminal Stages |
|---------------|-----------------|
| B2B Clients | Lost, Churned |
| B2C Clients | Lost, Churned |
| Business Investment (External) | Declined, Portfolio (moves to Portfolio Companies) |
| Internal Business Opportunities | Shelved |
| Portfolio Companies | Exit, Wound Down |
| Partnership Opportunities | Declined, Inactive |
| Individual Partnerships | Declined, Inactive |
| Investor Pipeline | Passed |
| Meridian 44 Participants | Declined, Inactive |

---

## 6. Filtering & Drill-Down

### 6.1 View Toggle

| Option | URL Param | Description |
|--------|-----------|-------------|
| **By Pipeline** | `view=pipeline` | Primary dimension is pipeline type (default) |
| **By Venture** | `view=venture` | Primary dimension is venture |

User preference is stored in `localStorage` and used as default on return visits.

### 6.2 Global Filters

| Filter | Options | Default | Behavior |
|--------|---------|---------|----------|
| **Time Period** | Last 7 days, **Last 14 days**, Last 30 days, This Quarter, All Time, Custom | **Last 14 days** | Affects all period-based metrics |
| **Venture** | All, Forge, Hearth, Anvil, Crucible, Foundry, Carbide, Lucepta, Meridian 44, Trade Stone Group | All | Filters all sections (hidden in Venture view) |
| **Pipeline Type** | All, B2B, B2C, Investments, etc. | All | Shows/hides pipeline sections (hidden in Pipeline view) |
| **Owner** | All, [List of users] | All | Filters by relationship owner |

### 6.3 Drill-Down Interactions

| Element | Click Action | Destination |
|---------|--------------|-------------|
| Summary card number | Filter dashboard to that subset | Same page, filtered |
| View toggle | Switch between Pipeline/Venture views | Same page, re-organized |
| Pipeline/Venture section header | Expand/collapse section | Same page |
| "View Pipeline →" link | Navigate to pipeline Kanban | `/pipelines/:type` |
| Opportunity row | Open opportunity detail | `/contacts/:id` or `/organizations/:id` with relationship panel |
| Activity feed item | Open related entity | Contact/org detail page |
| Activity volume card | Navigate to activity list | `/activities?type=...&period=...` |
| "See all →" link | Navigate to filtered view | Context-dependent destination |

### 6.4 URL Query Parameters

Dashboard state should be shareable via URL:

```
/leadership?view=pipeline&period=14d&venture=forge&owner=user123
```

| Param | Type | Example | Default |
|-------|------|---------|---------|
| `view` | Enum | `pipeline`, `venture` | `pipeline` |
| `period` | Enum | `7d`, `14d`, `30d`, `quarter`, `all`, `custom` | `14d` |
| `period_start` | ISO Date | `2024-01-01` (only with `period=custom`) | — |
| `period_end` | ISO Date | `2024-01-31` (only with `period=custom`) | — |
| `venture` | Enum | `forge`, `hearth`, etc. | — (all) |
| `pipeline` | Enum | `b2b_client`, `investor`, etc. | — (all) |
| `owner` | UUID | User ID | — (all) |

---

## 7. Technical Implementation

### 7.1 New Files Required

```
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── LeadershipDashboard.tsx        # Main container
│       │   ├── DashboardViewToggle.tsx        # Pipeline/Venture toggle
│       │   ├── DashboardSummaryCards.tsx      # KPI cards row
│       │   ├── ActivityVolumeCard.tsx         # Calls/Emails/Meetings metrics
│       │   ├── PipelineSection.tsx            # Collapsible pipeline block
│       │   ├── VentureSection.tsx             # Collapsible venture block
│       │   ├── StageDistributionBar.tsx       # Horizontal stage viz
│       │   ├── AttentionList.tsx              # Stuck/cold opportunities
│       │   ├── RecentMovementList.tsx         # Stage changes
│       │   ├── CrossPipelineActivityFeed.tsx  # Activity feed
│       │   ├── ActivityCoverageGaps.tsx       # Cold opportunities list
│       │   └── DashboardFilters.tsx           # Filter controls
│       ├── hooks/
│       │   ├── useLeadershipDashboard.ts      # Main data hook
│       │   ├── usePipelineSummary.ts          # Per-pipeline aggregates
│       │   ├── useVentureSummary.ts           # Per-venture aggregates
│       │   ├── useActivityVolume.ts           # Activity counts
│       │   ├── useAttentionItems.ts           # Stuck/cold items
│       │   └── useDashboardFilters.ts         # Filter state management
│       ├── services/
│       │   └── leadershipDashboardService.ts  # API calls
│       └── types/
│           └── leadershipDashboard.types.ts   # Type definitions
├── pages/
│   └── LeadershipDashboard.tsx                # Page component
```

### 7.2 Type Definitions

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

export interface DashboardSummary {
  activeOpportunities: number;
  advancedThisPeriod: number;
  stuckCount: number;
  coldCount: number;
}

export interface ActivityVolume {
  calls: number;
  callsDelta: number;
  emails: number;
  emailsDelta: number;
  meetings: number;
  meetingsDelta: number;
  texts: number;
  textsDelta: number;
  notes: number;
  total: number;
}

export interface PipelineSummary {
  type: BusinessRelationshipType;
  activeCount: number;
  stageDistribution: StageCount[];
  attentionItems: AttentionItem[];
  recentMovements: StageMovement[];
  ventureBreakdown: VentureCount[];
}

export interface VentureSummary {
  venture: Venture;
  activeCount: number;
  pipelineBreakdown: PipelineCount[];
  stageDistribution: StageCount[]; // Aggregated across pipelines
  attentionItems: AttentionItem[];
  recentMovements: StageMovement[];
}

export interface PipelineCount {
  type: BusinessRelationshipType;
  count: number;
}

export interface VentureCount {
  venture: Venture;
  count: number;
}

export interface StageCount {
  stage: string;
  count: number;
  isTerminal: boolean;
}

export interface AttentionItem {
  relationshipId: string;
  entityName: string;
  entityType: 'contact' | 'organization';
  entityId: string;
  pipelineType: BusinessRelationshipType;
  stage: string;
  daysInStage: number;
  daysSinceActivity: number;
  ventures: Venture[];
  ownerName: string;
  ownerId: string;
  attentionReasons: AttentionReason[];
}

export type AttentionReason = 
  | { type: 'stuck'; days: number }
  | { type: 'very_stuck'; days: number }
  | { type: 'stale'; days: number }
  | { type: 'cold'; days: number }
  | { type: 'ice_cold'; days: number };

export interface StageMovement {
  relationshipId: string;
  entityName: string;
  entityId: string;
  pipelineType: BusinessRelationshipType;
  fromStage: string;
  toStage: string;
  movedAt: Date;
  movedBy: string;
  isWin: boolean;
}

export interface DashboardActivity {
  id: string;
  type: ActivityType;
  entityName: string;
  entityType: 'contact' | 'organization';
  entityId: string;
  pipelineType: BusinessRelationshipType;
  ventures: Venture[];
  ownerName: string;
  occurredAt: Date;
  summary: string;
}

export interface ColdOpportunity {
  relationshipId: string;
  entityName: string;
  entityId: string;
  pipelineType: BusinessRelationshipType;
  stage: string;
  daysSinceActivity: number;
  ownerName: string;
}
```

### 7.3 Service Layer

```typescript
// src/features/dashboard/services/leadershipDashboardService.ts

import { supabase } from '@/lib/supabase';
import type { 
  DashboardFilters, 
  DashboardSummary, 
  PipelineSummary,
  VentureSummary,
  ActivityVolume,
  DashboardActivity,
  ColdOpportunity,
} from '../types/leadershipDashboard.types';

const INCLUDED_PIPELINE_TYPES = [
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

export const leadershipDashboardService = {
  async getSummary(filters: DashboardFilters): Promise<DashboardSummary> {
    const { data, error } = await supabase.rpc('get_leadership_summary', {
      p_period_start: filters.periodStart,
      p_period_end: filters.periodEnd,
      p_venture: filters.venture,
      p_owner_id: filters.ownerId,
    });
    
    if (error) throw error;
    return data;
  },

  async getActivityVolume(filters: DashboardFilters): Promise<ActivityVolume> {
    const { data, error } = await supabase.rpc('get_activity_volume', {
      p_period_start: filters.periodStart,
      p_period_end: filters.periodEnd,
      p_venture: filters.venture,
      p_owner_id: filters.ownerId,
    });
    
    if (error) throw error;
    return data;
  },

  async getPipelineSummaries(filters: DashboardFilters): Promise<PipelineSummary[]> {
    const { data, error } = await supabase.rpc('get_pipeline_summaries', {
      p_pipeline_types: INCLUDED_PIPELINE_TYPES,
      p_period_start: filters.periodStart,
      p_period_end: filters.periodEnd,
      p_venture: filters.venture,
      p_owner_id: filters.ownerId,
    });
    
    if (error) throw error;
    return data;
  },

  async getVentureSummaries(filters: DashboardFilters): Promise<VentureSummary[]> {
    const { data, error } = await supabase.rpc('get_venture_summaries', {
      p_pipeline_types: INCLUDED_PIPELINE_TYPES,
      p_period_start: filters.periodStart,
      p_period_end: filters.periodEnd,
      p_pipeline_type: filters.pipelineType,
      p_owner_id: filters.ownerId,
    });
    
    if (error) throw error;
    return data;
  },

  async getRecentActivity(
    filters: DashboardFilters, 
    limit: number = 10
  ): Promise<DashboardActivity[]> {
    const { data, error } = await supabase.rpc('get_dashboard_activity', {
      p_pipeline_types: INCLUDED_PIPELINE_TYPES,
      p_period_start: filters.periodStart,
      p_period_end: filters.periodEnd,
      p_venture: filters.venture,
      p_owner_id: filters.ownerId,
      p_limit: limit,
    });
    
    if (error) throw error;
    return data;
  },

  async getColdOpportunities(
    filters: DashboardFilters,
    limit: number = 10
  ): Promise<ColdOpportunity[]> {
    const { data, error } = await supabase.rpc('get_cold_opportunities', {
      p_pipeline_types: INCLUDED_PIPELINE_TYPES,
      p_days_threshold: 7,
      p_venture: filters.venture,
      p_owner_id: filters.ownerId,
      p_limit: limit,
    });
    
    if (error) throw error;
    return data;
  },
};
```

---

## 8. Database Queries

### 8.1 PostgreSQL Functions (Supabase RPC)

```sql
-- Function: get_leadership_summary
CREATE OR REPLACE FUNCTION get_leadership_summary(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'activeOpportunities', (
      SELECT COUNT(*)
      FROM business_relationships br
      WHERE br.type = ANY(ARRAY['b2b_client', 'b2c_client', 'business_investment_external', 
                                 'internal_business_opportunity', 'portfolio_company',
                                 'partnership_opportunity', 'individual_partnership',
                                 'investor', 'meridian_44_participant']::business_relationship_type[])
        AND br.stage NOT IN (SELECT unnest(get_terminal_stages(br.type)))
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
    ),
    'advancedThisPeriod', (
      SELECT COUNT(DISTINCT al.relationship_id)
      FROM activity_log al
      JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type = 'stage_change'
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
    ),
    'stuckCount', (
      SELECT COUNT(*)
      FROM business_relationships br
      LEFT JOIN LATERAL (
        SELECT MAX(occurred_at) as last_stage_change
        FROM activity_log al
        WHERE al.relationship_id = br.id AND al.type = 'stage_change'
      ) lsc ON true
      WHERE br.stage NOT IN (SELECT unnest(get_terminal_stages(br.type)))
        AND (lsc.last_stage_change IS NULL OR lsc.last_stage_change < NOW() - INTERVAL '14 days')
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
    ),
    'coldCount', (
      SELECT COUNT(*)
      FROM business_relationships br
      LEFT JOIN LATERAL (
        SELECT MAX(occurred_at) as last_activity
        FROM activity_log al
        WHERE al.relationship_id = br.id
      ) la ON true
      WHERE br.stage NOT IN (SELECT unnest(get_terminal_stages(br.type)))
        AND (la.last_activity IS NULL OR la.last_activity < NOW() - INTERVAL '7 days')
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function: get_activity_volume
CREATE OR REPLACE FUNCTION get_activity_volume(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  period_length INTERVAL;
  prior_start TIMESTAMPTZ;
  prior_end TIMESTAMPTZ;
BEGIN
  -- Calculate prior period for comparison
  period_length := p_period_end - p_period_start;
  prior_end := p_period_start;
  prior_start := prior_end - period_length;

  SELECT json_build_object(
    'calls', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type IN ('call_inbound', 'call_outbound')
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    ),
    'callsDelta', (
      SELECT 
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('call_inbound', 'call_outbound')
           AND al.occurred_at BETWEEN p_period_start AND p_period_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
        -
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('call_inbound', 'call_outbound')
           AND al.occurred_at BETWEEN prior_start AND prior_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
    ),
    'emails', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type IN ('email_inbound', 'email_outbound')
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    ),
    'emailsDelta', (
      SELECT 
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('email_inbound', 'email_outbound')
           AND al.occurred_at BETWEEN p_period_start AND p_period_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
        -
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('email_inbound', 'email_outbound')
           AND al.occurred_at BETWEEN prior_start AND prior_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
    ),
    'meetings', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type IN ('meeting_in_person', 'meeting_virtual')
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    ),
    'meetingsDelta', (
      SELECT 
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('meeting_in_person', 'meeting_virtual')
           AND al.occurred_at BETWEEN p_period_start AND p_period_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
        -
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('meeting_in_person', 'meeting_virtual')
           AND al.occurred_at BETWEEN prior_start AND prior_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
    ),
    'texts', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type IN ('text_inbound', 'text_outbound')
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    ),
    'textsDelta', (
      SELECT 
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('text_inbound', 'text_outbound')
           AND al.occurred_at BETWEEN p_period_start AND p_period_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
        -
        (SELECT COUNT(*) FROM activity_log al
         LEFT JOIN business_relationships br ON al.relationship_id = br.id
         WHERE al.type IN ('text_inbound', 'text_outbound')
           AND al.occurred_at BETWEEN prior_start AND prior_end
           AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
           AND (p_owner_id IS NULL OR al.logged_by = p_owner_id))
    ),
    'notes', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.type = 'note'
        AND al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    ),
    'total', (
      SELECT COUNT(*) FROM activity_log al
      LEFT JOIN business_relationships br ON al.relationship_id = br.id
      WHERE al.occurred_at BETWEEN p_period_start AND p_period_end
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR al.logged_by = p_owner_id)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function: get_cold_opportunities
CREATE OR REPLACE FUNCTION get_cold_opportunities(
  p_pipeline_types business_relationship_type[],
  p_days_threshold INTEGER DEFAULT 7,
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(cold_opps))
    FROM (
      SELECT 
        br.id as "relationshipId",
        COALESCE(c.first_name || ' ' || c.last_name, o.name) as "entityName",
        COALESCE(br.contact_id, br.organization_id)::TEXT as "entityId",
        br.type as "pipelineType",
        br.stage,
        EXTRACT(DAY FROM NOW() - COALESCE(la.last_activity, br.created_at))::INTEGER as "daysSinceActivity",
        p.full_name as "ownerName"
      FROM business_relationships br
      LEFT JOIN contacts c ON br.contact_id = c.id
      LEFT JOIN organizations o ON br.organization_id = o.id
      LEFT JOIN profiles p ON br.owner_id = p.id
      LEFT JOIN LATERAL (
        SELECT MAX(occurred_at) as last_activity
        FROM activity_log al
        WHERE al.relationship_id = br.id
      ) la ON true
      WHERE br.type = ANY(p_pipeline_types)
        AND br.stage NOT IN (SELECT unnest(get_terminal_stages(br.type)))
        AND (la.last_activity IS NULL OR la.last_activity < NOW() - (p_days_threshold || ' days')::INTERVAL)
        AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
        AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
      ORDER BY la.last_activity ASC NULLS FIRST
      LIMIT p_limit
    ) cold_opps
  );
END;
$$ LANGUAGE plpgsql STABLE;


-- Helper function: get_terminal_stages
CREATE OR REPLACE FUNCTION get_terminal_stages(p_type business_relationship_type)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'b2b_client' THEN ARRAY['Lost', 'Churned']
    WHEN 'b2c_client' THEN ARRAY['Lost', 'Churned']
    WHEN 'business_investment_external' THEN ARRAY['Declined', 'Portfolio']
    WHEN 'internal_business_opportunity' THEN ARRAY['Shelved']
    WHEN 'portfolio_company' THEN ARRAY['Exit', 'Wound Down']
    WHEN 'partnership_opportunity' THEN ARRAY['Declined', 'Inactive']
    WHEN 'individual_partnership' THEN ARRAY['Declined', 'Inactive']
    WHEN 'investor' THEN ARRAY['Passed']
    WHEN 'meridian_44_participant' THEN ARRAY['Declined', 'Inactive']
    ELSE ARRAY[]::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 8.2 Materialized View for Performance (Optional)

For large datasets, consider a materialized view refreshed periodically:

```sql
CREATE MATERIALIZED VIEW leadership_dashboard_cache AS
SELECT 
  br.id,
  br.type,
  br.stage,
  br.ventures,
  br.owner_id,
  COALESCE(c.first_name || ' ' || c.last_name, o.name) as entity_name,
  CASE WHEN br.contact_id IS NOT NULL THEN 'contact' ELSE 'organization' END as entity_type,
  COALESCE(br.contact_id, br.organization_id) as entity_id,
  lsc.last_stage_change,
  la.last_activity,
  EXTRACT(DAY FROM NOW() - lsc.last_stage_change) as days_in_stage,
  EXTRACT(DAY FROM NOW() - la.last_activity) as days_since_activity,
  p.full_name as owner_name
FROM business_relationships br
LEFT JOIN contacts c ON br.contact_id = c.id
LEFT JOIN organizations o ON br.organization_id = o.id
LEFT JOIN profiles p ON br.owner_id = p.id
LEFT JOIN LATERAL (
  SELECT MAX(occurred_at) as last_stage_change
  FROM activity_log al
  WHERE al.relationship_id = br.id AND al.type = 'stage_change'
) lsc ON true
LEFT JOIN LATERAL (
  SELECT MAX(occurred_at) as last_activity
  FROM activity_log al
  WHERE al.relationship_id = br.id
) la ON true
WHERE br.type = ANY(ARRAY['b2b_client', 'b2c_client', 'business_investment_external', 
                           'internal_business_opportunity', 'portfolio_company',
                           'partnership_opportunity', 'individual_partnership',
                           'investor', 'meridian_44_participant']::business_relationship_type[]);

CREATE INDEX idx_ldc_type ON leadership_dashboard_cache(type);
CREATE INDEX idx_ldc_owner ON leadership_dashboard_cache(owner_id);
CREATE INDEX idx_ldc_ventures ON leadership_dashboard_cache USING GIN(ventures);

-- Refresh periodically (e.g., every 5 minutes via cron or Supabase scheduled function)
REFRESH MATERIALIZED VIEW CONCURRENTLY leadership_dashboard_cache;
```

---

## 9. Component Architecture

### 9.1 Main Dashboard Component

```typescript
// src/features/dashboard/components/LeadershipDashboard.tsx

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { DashboardViewToggle } from './DashboardViewToggle';
import { DashboardFilters } from './DashboardFilters';
import { DashboardSummaryCards } from './DashboardSummaryCards';
import { ActivityVolumeCard } from './ActivityVolumeCard';
import { PipelineSection } from './PipelineSection';
import { VentureSection } from './VentureSection';
import { CrossPipelineActivityFeed } from './CrossPipelineActivityFeed';
import { ActivityCoverageGaps } from './ActivityCoverageGaps';
import { useLeadershipDashboard } from '../hooks/useLeadershipDashboard';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { Skeleton } from '@/components/ui/skeleton';

const PIPELINE_DISPLAY_ORDER = [
  'b2b_client',
  'b2c_client',
  'business_investment_external',
  'internal_business_opportunity',
  'portfolio_company',
  'partnership_opportunity',
  'individual_partnership',
  'investor',
  'meridian_44_participant',
] as const;

const VENTURE_DISPLAY_ORDER = [
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

export function LeadershipDashboard() {
  const { filters, setFilters, resetFilters } = useDashboardFilters();
  const { 
    summary, 
    activityVolume,
    pipelineSummaries, 
    ventureSummaries,
    recentActivity,
    coldOpportunities,
    isLoading 
  } = useLeadershipDashboard(filters);

  const isPipelineView = filters.view === 'pipeline';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Leadership Dashboard</h1>
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

      {/* Summary Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-4">
          <ErrorBoundary fallback={<SummaryCardsError />}>
            <Suspense fallback={<SummaryCardsSkeleton />}>
              <DashboardSummaryCards summary={summary} isLoading={isLoading} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-1">
          <ErrorBoundary fallback={<ActivityVolumeError />}>
            <ActivityVolumeCard volume={activityVolume} isLoading={isLoading} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Pipeline or Venture Sections */}
      <div className="space-y-4">
        {isPipelineView ? (
          // Pipeline-centric view
          PIPELINE_DISPLAY_ORDER.map((type) => {
            const pipelineData = pipelineSummaries?.find((p) => p.type === type);
            if (!pipelineData && !isLoading) return null;
            
            return (
              <ErrorBoundary key={type} fallback={<PipelineSectionError type={type} />}>
                <PipelineSection
                  type={type}
                  data={pipelineData}
                  isLoading={isLoading}
                  defaultExpanded={(pipelineData?.attentionItems.length ?? 0) > 0}
                />
              </ErrorBoundary>
            );
          })
        ) : (
          // Venture-centric view
          VENTURE_DISPLAY_ORDER.map((venture) => {
            const ventureData = ventureSummaries?.find((v) => v.venture === venture);
            if (!ventureData && !isLoading) return null;
            
            return (
              <ErrorBoundary key={venture} fallback={<VentureSectionError venture={venture} />}>
                <VentureSection
                  venture={venture}
                  data={ventureData}
                  isLoading={isLoading}
                  defaultExpanded={(ventureData?.attentionItems.length ?? 0) > 0}
                />
              </ErrorBoundary>
            );
          })
        )}
      </div>

      {/* Cross-Pipeline/Venture Activity Feed */}
      <ErrorBoundary fallback={<ActivityFeedError />}>
        <CrossPipelineActivityFeed 
          activities={recentActivity} 
          isLoading={isLoading} 
        />
      </ErrorBoundary>

      {/* Activity Coverage Gaps */}
      <ErrorBoundary fallback={<CoverageGapsError />}>
        <ActivityCoverageGaps
          opportunities={coldOpportunities}
          isLoading={isLoading}
        />
      </ErrorBoundary>
    </div>
  );
}
```

### 9.2 View Toggle Component

```typescript
// src/features/dashboard/components/DashboardViewToggle.tsx

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, Building2 } from 'lucide-react';
import type { DashboardView } from '../types';

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
      className="border rounded-lg"
    >
      <ToggleGroupItem 
        value="pipeline" 
        aria-label="View by pipeline"
        className="gap-2 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">By Pipeline</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="venture" 
        aria-label="View by venture"
        className="gap-2 px-3"
      >
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline">By Venture</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
```

### 9.3 Activity Volume Card Component

```typescript
// src/features/dashboard/components/ActivityVolumeCard.tsx

import { Phone, Mail, Calendar, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ActivityVolume } from '../types';

interface ActivityVolumeCardProps {
  volume?: ActivityVolume;
  isLoading: boolean;
}

export function ActivityVolumeCard({ volume, isLoading }: ActivityVolumeCardProps) {
  if (isLoading) {
    return <ActivityVolumeSkeleton />;
  }

  const metrics = [
    { icon: Phone, label: 'Calls', value: volume?.calls ?? 0, delta: volume?.callsDelta ?? 0 },
    { icon: Mail, label: 'Emails', value: volume?.emails ?? 0, delta: volume?.emailsDelta ?? 0 },
    { icon: Calendar, label: 'Meetings', value: volume?.meetings ?? 0, delta: volume?.meetingsDelta ?? 0 },
    { icon: MessageSquare, label: 'Texts', value: volume?.texts ?? 0, delta: volume?.textsDelta ?? 0 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activity Volume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.map(({ icon: Icon, label, value, delta }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              {delta !== 0 && (
                <span className={cn(
                  'text-xs',
                  delta > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold">{volume?.total ?? 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 9.4 Venture Section Component

```typescript
// src/features/dashboard/components/VentureSection.tsx

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StageDistributionBar } from './StageDistributionBar';
import { AttentionList } from './AttentionList';
import { RecentMovementList } from './RecentMovementList';
import { PipelineBreakdownBadges } from './PipelineBreakdownBadges';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { VentureSummary, Venture } from '../types';

const VENTURE_LABELS: Record<Venture, string> = {
  forge: 'Forge',
  hearth: 'Hearth',
  anvil: 'Anvil',
  crucible: 'Crucible',
  foundry: 'Foundry',
  carbide: 'Carbide',
  lucepta: 'Lucepta',
  meridian_44: 'Meridian 44',
  trade_stone_group: 'Trade Stone Group',
};

interface VentureSectionProps {
  venture: Venture;
  data?: VentureSummary;
  isLoading: boolean;
  defaultExpanded: boolean;
}

export function VentureSection({ 
  venture, 
  data, 
  isLoading, 
  defaultExpanded 
}: VentureSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  
  const label = VENTURE_LABELS[venture];
  const hasAttention = (data?.attentionItems.length ?? 0) > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        'rounded-lg border bg-card',
        hasAttention && 'border-warning/50'
      )}>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">
                ({data?.activeCount ?? '...'} active)
              </span>
              {hasAttention && (
                <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                  {data?.attentionItems.length} need attention
                </span>
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="border-t p-4 space-y-4">
            {/* Pipeline Breakdown */}
            <PipelineBreakdownBadges 
              breakdown={data?.pipelineBreakdown ?? []} 
              isLoading={isLoading}
            />

            {/* Stage Distribution */}
            <StageDistributionBar 
              stages={data?.stageDistribution ?? []} 
              isLoading={isLoading}
              showSimplified // Aggregated view uses Early/Mid/Late/Won
            />

            {/* Recent Movement */}
            <RecentMovementList 
              movements={data?.recentMovements ?? []} 
              isLoading={isLoading}
              showPipelineType // Show which pipeline in venture view
            />

            {/* Needs Attention */}
            {hasAttention && (
              <AttentionList 
                items={data?.attentionItems ?? []} 
                showPipelineType // Show which pipeline in venture view
              />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
```

### 9.5 Custom Hook with Dual View Support

```typescript
// src/features/dashboard/hooks/useLeadershipDashboard.ts

import { useQuery } from '@tanstack/react-query';
import { leadershipDashboardService } from '../services/leadershipDashboardService';
import type { DashboardFilters } from '../types';

export function useLeadershipDashboard(filters: DashboardFilters) {
  const summaryQuery = useQuery({
    queryKey: ['leadership-dashboard', 'summary', filters],
    queryFn: () => leadershipDashboardService.getSummary(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const activityVolumeQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity-volume', filters],
    queryFn: () => leadershipDashboardService.getActivityVolume(filters),
    staleTime: 1000 * 60 * 2,
  });

  const pipelinesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'pipelines', filters],
    queryFn: () => leadershipDashboardService.getPipelineSummaries(filters),
    staleTime: 1000 * 60 * 2,
    enabled: filters.view === 'pipeline',
  });

  const venturesQuery = useQuery({
    queryKey: ['leadership-dashboard', 'ventures', filters],
    queryFn: () => leadershipDashboardService.getVentureSummaries(filters),
    staleTime: 1000 * 60 * 2,
    enabled: filters.view === 'venture',
  });

  const activityQuery = useQuery({
    queryKey: ['leadership-dashboard', 'activity', filters],
    queryFn: () => leadershipDashboardService.getRecentActivity(filters, 10),
    staleTime: 1000 * 60 * 1,
  });

  const coldQuery = useQuery({
    queryKey: ['leadership-dashboard', 'cold', filters],
    queryFn: () => leadershipDashboardService.getColdOpportunities(filters, 10),
    staleTime: 1000 * 60 * 2,
  });

  return {
    summary: summaryQuery.data,
    activityVolume: activityVolumeQuery.data,
    pipelineSummaries: pipelinesQuery.data,
    ventureSummaries: venturesQuery.data,
    recentActivity: activityQuery.data,
    coldOpportunities: coldQuery.data,
    isLoading: summaryQuery.isLoading || 
      (filters.view === 'pipeline' ? pipelinesQuery.isLoading : venturesQuery.isLoading),
    isError: summaryQuery.isError || pipelinesQuery.isError || venturesQuery.isError,
    refetch: () => {
      summaryQuery.refetch();
      activityVolumeQuery.refetch();
      pipelinesQuery.refetch();
      venturesQuery.refetch();
      activityQuery.refetch();
      coldQuery.refetch();
    },
  };
}
```

---

## 10. Routing & Navigation

### 10.1 Add Route

```typescript
// Update src/router.tsx

import { LeadershipDashboard } from '@/pages/LeadershipDashboard';

// Add to routes array:
{
  path: 'leadership',
  element: (
    <ProtectedRoute requireManager>
      <LeadershipDashboard />
    </ProtectedRoute>
  ),
},
```

### 10.2 Navigation Update

Add to main navigation (AppShell sidebar):

```typescript
// In navigation items array:
{
  label: 'Leadership',
  href: '/leadership',
  icon: LayoutDashboard,
  requiredRole: 'manager', // Managers and Admins only
},
```

### 10.3 Access Control

| Role | Access |
|------|--------|
| Admin | ✅ Full access |
| Manager | ✅ Full access |
| User | ❌ Not visible in nav, redirects to /dashboard |

### 10.4 View Preference Persistence

```typescript
// src/features/dashboard/hooks/useDashboardFilters.ts

import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import type { DashboardFilters, DashboardView, DashboardPeriod } from '../types';

const VIEW_STORAGE_KEY = 'leadership-dashboard-view';
const DEFAULT_PERIOD: DashboardPeriod = '14d';

export function useDashboardFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get stored view preference or default
  const storedView = localStorage.getItem(VIEW_STORAGE_KEY) as DashboardView | null;
  
  const filters: DashboardFilters = {
    view: (searchParams.get('view') as DashboardView) || storedView || 'pipeline',
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
  };

  // Persist view preference
  useEffect(() => {
    if (filters.view) {
      localStorage.setItem(VIEW_STORAGE_KEY, filters.view);
    }
  }, [filters.view]);

  const setFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          next.delete(key);
        } else if (key === 'periodStart' || key === 'periodEnd') {
          next.set(key.replace(/([A-Z])/g, '_$1').toLowerCase(), 
            (value as Date).toISOString().split('T')[0]);
        } else {
          next.set(key, String(value));
        }
      });
      
      return next;
    });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams({ view: filters.view, period: DEFAULT_PERIOD });
  }, [setSearchParams, filters.view]);

  return { filters, setFilters, resetFilters };
}
```

---

## 11. Accessibility Requirements

### 11.1 Keyboard Navigation

| Element | Key | Action |
|---------|-----|--------|
| Pipeline section header | Enter/Space | Toggle expand/collapse |
| Filter dropdowns | Arrow keys | Navigate options |
| Opportunity row | Enter | Navigate to detail |
| "View Pipeline" link | Enter | Navigate to pipeline |

### 11.2 Screen Reader Considerations

```typescript
// Summary card example with ARIA
<div 
  role="region" 
  aria-label="Dashboard summary"
  className="grid grid-cols-4 gap-4"
>
  <div 
    role="status" 
    aria-label="Active opportunities count"
  >
    <span className="sr-only">Active opportunities:</span>
    <span className="text-3xl font-bold">{summary.activeOpportunities}</span>
  </div>
  {/* ... */}
</div>

// Collapsible section with ARIA
<Collapsible>
  <CollapsibleTrigger
    aria-expanded={isOpen}
    aria-controls={`pipeline-${type}-content`}
  >
    {/* ... */}
  </CollapsibleTrigger>
  <CollapsibleContent id={`pipeline-${type}-content`}>
    {/* ... */}
  </CollapsibleContent>
</Collapsible>
```

### 11.3 Color Contrast

All attention indicators must meet WCAG AA contrast ratios:
- Warning yellow: Use `text-warning-foreground` on `bg-warning`
- Error red: Use `text-destructive-foreground` on `bg-destructive`

---

## 12. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Page Load Time** | < 2 seconds | Performance monitoring |
| **Data Freshness** | < 5 minutes old | Cache refresh timing |
| **Usage Frequency** | Weekly by all managers/admins | Analytics |
| **Drill-Down Rate** | > 30% of sessions click through | Click tracking |
| **Stuck Opportunity Reduction** | 20% fewer 30+ day stuck items | Before/after comparison |
| **Activity Coverage** | < 10% opportunities cold (7+ days) | Dashboard metric itself |

---

## Integration Checklist

### Database
- [ ] Create `get_leadership_summary` RPC function
- [ ] Create `get_activity_volume` RPC function
- [ ] Create `get_pipeline_summaries` RPC function
- [ ] Create `get_venture_summaries` RPC function
- [ ] Create `get_dashboard_activity` RPC function
- [ ] Create `get_cold_opportunities` RPC function
- [ ] Create `get_terminal_stages` helper function
- [ ] (Optional) Create materialized view for performance

### Frontend
- [ ] Add type definitions (DashboardView, ActivityVolume, VentureSummary, etc.)
- [ ] Create service layer with all API methods
- [ ] Create `useDashboardFilters` hook with localStorage persistence
- [ ] Create `useLeadershipDashboard` hook with conditional queries
- [ ] Build `LeadershipDashboard` main component
- [ ] Build `DashboardViewToggle` component
- [ ] Build `DashboardSummaryCards` component
- [ ] Build `ActivityVolumeCard` component
- [ ] Build `PipelineSection` component
- [ ] Build `VentureSection` component
- [ ] Build `PipelineBreakdownBadges` component
- [ ] Build `StageDistributionBar` component
- [ ] Build `AttentionList` component
- [ ] Build `RecentMovementList` component
- [ ] Build `CrossPipelineActivityFeed` component
- [ ] Build `ActivityCoverageGaps` component
- [ ] Build `DashboardFilters` component
- [ ] Add route to router (`/leadership`)
- [ ] Add navigation item (Manager/Admin only)
- [ ] Implement URL query param persistence

### Testing
- [ ] Unit tests for `useDashboardFilters` hook
- [ ] Unit tests for `useLeadershipDashboard` hook
- [ ] Component tests for `PipelineSection`
- [ ] Component tests for `VentureSection`
- [ ] Component tests for view toggle behavior
- [ ] E2E test for full dashboard flow (Pipeline view)
- [ ] E2E test for full dashboard flow (Venture view)
- [ ] E2E test for filter persistence
- [ ] Accessibility audit (keyboard nav, screen reader)

### Documentation
- [ ] Update main PRD with Leadership Dashboard section
- [ ] Add to UI specifications section (Section 7)
- [ ] Update routing documentation
- [ ] Add to user guide/help docs

---

**Document Version History:**
- v1.0 (Dec 2024): Initial Leadership Dashboard addendum
- v1.1 (Dec 2024): Added dual view toggle (Pipeline/Venture), activity volume metrics, 14-day default period, activity coverage gaps section
