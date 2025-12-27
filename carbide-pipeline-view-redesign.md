# Carbide CRM - Pipeline View Redesign

**Version:** 1.0  
**Created:** December 27, 2024  
**Status:** Ready for Implementation  
**Target:** `/src/features/pipelines/` (new feature module)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Philosophy](#2-design-philosophy)
3. [Information Architecture](#3-information-architecture)
4. [Component Specifications](#4-component-specifications)
5. [TypeScript Types](#5-typescript-types)
6. [Database Requirements](#6-database-requirements)
7. [Hooks & Services](#7-hooks--services)
8. [Implementation Prompts](#8-implementation-prompts)
9. [File Structure](#9-file-structure)
10. [Build Order](#10-build-order)

---

## 1. Overview

### Purpose

Replace the existing basic Pipeline Kanban with an intuitive, progressive-disclosure pipeline view that serves salespeople, managers, and executives without overwhelming any persona.

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Progressive Disclosure** | Start simple, reveal complexity on demand |
| **Consistent Entry Point** | Same default view for all users (v1) |
| **Attention-Driven** | Surface stuck/cold deals without cluttering |
| **Fast Interactions** | Quick actions without full page navigation |
| **Visual Clarity** | Clean cards, collapsible stages, optional swim lanes |

### User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Salesperson | See my active deals organized by stage | I can focus on moving deals forward |
| Salesperson | Quickly log a call or schedule a task from a card | I don't lose context switching screens |
| Manager | Toggle between my deals and all team deals | I can monitor workload distribution |
| Manager | See which deals are stuck or going cold | I can intervene before deals die |
| Executive | Group deals by venture | I understand cross-venture pipeline health |
| All Users | Collapse early-stage columns | I can focus on deals closer to closing |
| All Users | Close deals via a structured modal | Terminal stages stay off the board |

---

## 2. Design Philosophy

### Aesthetic Direction

**Tone:** Clean, utilitarian, information-dense but not cluttered. Inspired by modern project management tools (Linear, Notion) rather than legacy CRMs.

**Visual Characteristics:**
- Muted color palette with venture-specific accent colors
- Subtle shadows and borders (not flat, not heavy)
- Compact typography with clear hierarchy
- Generous whitespace between columns, tight spacing within cards
- Smooth micro-animations for drag, collapse, and state changes

**Color System (Venture Badges):**
```css
--venture-forge: #E85D04;      /* Warm orange */
--venture-hearth: #9D4EDD;     /* Purple */
--venture-anvil: #0077B6;      /* Deep blue */
--venture-crucible: #2D6A4F;   /* Forest green */
--venture-foundry: #E63946;    /* Red */
--venture-carbide: #1D3557;    /* Navy */
--venture-lucepta: #F4A261;    /* Peach */
--venture-meridian-44: #118AB2; /* Teal */
--venture-trade-stone: #6C757D; /* Gray */
```

**Attention States:**
```css
--attention-stuck: #FFC107;    /* Amber for 14+ days in stage */
--attention-cold: #0DCAF0;     /* Cyan for 7+ days no activity */
--attention-critical: #DC3545; /* Red for 30+ days stuck */
```

---

## 3. Information Architecture

### 3.1 View Modes

| Mode | Layout | Best For |
|------|--------|----------|
| **Kanban** | Horizontal columns with draggable cards | Visual pipeline management, salespeople |
| **List** | Sortable table with inline actions | Bulk operations, data export, managers |

### 3.2 Stage Architecture

**Active Stages** (visible on board):

| Pipeline Type | Active Stages |
|---------------|---------------|
| B2B Client | Lead → Qualified → Discovery → Proposal → Negotiation → Active |
| B2C Client | Lead → Qualified → Discovery → Proposal → Negotiation → Active |
| Investor | Prospect → Contacted → Interested → Meeting → Due Diligence → Terms → Committed → Funded → Active |
| Meridian 44 | Identified → Outreach → Interested → Onboarding → Active Contributor |

**Terminal Stages** (hidden, accessed via "Close Deal" modal):

| Pipeline Type | Terminal Stages |
|---------------|-----------------|
| B2B Client | Won, Lost, Churned |
| B2C Client | Won, Lost, Churned |
| Investor | Passed |
| Meridian 44 | Declined, Inactive |

### 3.3 Filtering Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 1: Primary Toggles (always visible)                       │
│ ┌─────────────────┐ ┌─────────────────┐                         │
│ │ My Deals (•)    │ │ All Deals ( )   │    [Needs Attention ◻]  │
│ └─────────────────┘ └─────────────────┘                         │
├─────────────────────────────────────────────────────────────────┤
│ LEVEL 2: Secondary Filters (collapsible bar)                    │
│ [Venture ▼] [Owner ▼] [Created ▼] [More Filters ▼] [Clear All]  │
├─────────────────────────────────────────────────────────────────┤
│ LEVEL 3: Saved Views (dropdown)                                 │
│ [★ Saved Views ▼] → "My Forge Deals", "Team Stuck Deals", etc.  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Grouping Options

| Group By | Description | Visual |
|----------|-------------|--------|
| **None** (default) | Single Kanban board | Standard columns |
| **Venture** | Swim lanes per venture | Stacked horizontal boards |
| **Owner** | Swim lanes per salesperson | Stacked horizontal boards |

### 3.5 Summary Header

Always visible stats bar:

```
┌─────────────────────────────────────────────────────────────────┐
│ B2B Pipeline · 47 Active · +8 this period · ⚠️ 5 stuck · ❄️ 3 cold │
└─────────────────────────────────────────────────────────────────┘
```

Each metric is clickable to filter the board.

---

## 4. Component Specifications

### 4.1 Component Tree

```
PipelineView (page)
├── PipelineHeader
│   ├── PipelineTypeSelector (dropdown)
│   ├── ViewModeToggle (kanban/list)
│   └── PipelineStats (summary metrics)
├── PipelineFilters
│   ├── DealOwnershipToggle (my/all)
│   ├── AttentionFilterToggle
│   ├── SecondaryFilters (collapsible)
│   │   ├── VentureFilter (multi-select)
│   │   ├── OwnerFilter (multi-select)
│   │   └── DateRangeFilter
│   ├── GroupBySelector
│   └── SavedViewsDropdown
├── PipelineKanban (conditional)
│   ├── SwimLane (repeated if grouped)
│   │   ├── SwimLaneHeader
│   │   └── StageColumns
│   │       ├── StageColumn (repeated)
│   │       │   ├── StageColumnHeader (collapsible)
│   │       │   └── DealCard (repeated, draggable)
│   │       │       ├── DealCardHeader
│   │       │       ├── DealCardMeta
│   │       │       ├── DealCardAttention
│   │       │       └── DealCardActions (menu)
│   │       └── AddDealButton
│   └── DragOverlay
├── PipelineList (conditional)
│   ├── PipelineTable
│   │   ├── TableHeader (sortable)
│   │   └── TableRow (repeated)
│   │       └── RowActions
│   └── TablePagination
├── CloseDealModal
│   ├── OutcomeSelector (Won/Lost/Churned)
│   ├── ReasonInput (conditional)
│   └── NotesInput
├── QuickActionModals
│   ├── LogCallModal
│   ├── ScheduleTaskModal
│   └── MoveStageModal
└── ClosedDealsDrawer (slide-out panel)
```

### 4.2 PipelineHeader

**Purpose:** Pipeline type selection, view mode toggle, summary stats

**Props:**
```typescript
interface PipelineHeaderProps {
  pipelineType: BusinessRelationshipType;
  onPipelineTypeChange: (type: BusinessRelationshipType) => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (mode: 'kanban' | 'list') => void;
  stats: PipelineStats;
  isLoading: boolean;
}
```

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [B2B Clients ▼]                                    [≡ List] [⊞ Kanban]     │
│                                                                             │
│ 47 Active  •  +8 this period  •  ⚠️ 5 stuck  •  ❄️ 3 cold  [View Closed →] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Pipeline type dropdown shows all 4 types with counts
- View mode toggle persists to localStorage
- Stats are clickable to apply filters
- "View Closed" opens ClosedDealsDrawer

---

### 4.3 PipelineFilters

**Purpose:** All filtering, grouping, and saved view controls

**Props:**
```typescript
interface PipelineFiltersProps {
  filters: PipelineFilters;
  onFiltersChange: (filters: Partial<PipelineFilters>) => void;
  onClearFilters: () => void;
  groupBy: 'none' | 'venture' | 'owner';
  onGroupByChange: (groupBy: 'none' | 'venture' | 'owner') => void;
  savedViews: SavedView[];
  onSaveView: (name: string) => void;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
  showOwnerFilter: boolean; // Only when "All Deals" is active
}
```

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐                                           │
│ │ ● My Deals   │ │ ○ All Deals  │    [◻ Needs Attention]                    │
│ └──────────────┘ └──────────────┘                                           │
│                                                                             │
│ [▼ Filters] [Venture ▼] [Owner ▼] [Created ▼]  [Group: Venture ▼] [★ Views]│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- "My Deals" / "All Deals" toggle is radio-style
- "Needs Attention" checkbox filters to stuck OR cold
- Secondary filters collapse on mobile
- "Group by" only shows Venture/Owner/None
- Saved Views dropdown with save/load/delete

---

### 4.4 StageColumn

**Purpose:** Single Kanban column representing a pipeline stage

**Props:**
```typescript
interface StageColumnProps {
  stage: PipelineStage;
  deals: PipelineDeal[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDrop: (dealId: string, stage: string) => void;
  isDropTarget: boolean;
}
```

**Wireframe (Expanded):**
```
┌─────────────────────┐
│ Discovery (4)    ▼  │  ← Clickable to collapse
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Acme Corp    •••│ │
│ │ [Forge] 👤 12d  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Beta LLC     •••│ │
│ │ [Anvil] 👤  5d  │ │
│ │ ⚠️ Stuck 14d     │ │
│ └─────────────────┘ │
│        ...          │
│ [+ Add Deal]        │
└─────────────────────┘
```

**Wireframe (Collapsed):**
```
┌───────────────┐
│ Discovery (4) │
│       ▶       │
└───────────────┘
```

**Behavior:**
- Header click toggles collapse
- Collapsed state stored in localStorage per user
- Drop zone highlights on drag-over
- Scroll within column if many cards
- "Add Deal" opens quick-create modal (links to existing contact/org selector)

---

### 4.5 DealCard

**Purpose:** Individual deal representation in Kanban view

**Props:**
```typescript
interface DealCardProps {
  deal: PipelineDeal;
  isDragging: boolean;
  onQuickAction: (action: QuickActionType, dealId: string) => void;
}
```

**Wireframe:**
```
┌───────────────────────────────┐
│ Acme Corporation          ••• │  ← Quick actions dropdown
│ ┌───────┐                     │
│ │ Forge │  👤 Dan    ⏱️ 12d   │  ← Venture badge, owner, days in stage
│ └───────┘                     │
│ ⚠️ No activity in 8 days      │  ← Attention flag (conditional)
└───────────────────────────────┘
```

**Card States:**
| State | Visual Treatment |
|-------|------------------|
| Default | Standard border, white background |
| Dragging | Elevated shadow, slight rotation, reduced opacity at origin |
| Stuck (14d+) | Left border amber, warning icon |
| Cold (7d+) | Left border cyan, snowflake icon |
| Critical (30d+) | Left border red, both icons |

**Quick Actions Menu:**
```
┌─────────────────────┐
│ 📞 Log Call         │
│ ✓  Schedule Task    │
│ →  Move to Stage  ▶ │  ← Submenu with stages
│ 👁  View Contact    │
│ ─────────────────── │
│ ✕  Close Deal       │  ← Opens CloseDealModal
└─────────────────────┘
```

---

### 4.6 SwimLane

**Purpose:** Grouped horizontal section when grouping by Venture or Owner

**Props:**
```typescript
interface SwimLaneProps {
  groupKey: string; // venture slug or owner ID
  groupLabel: string; // "Forge" or "Dan Martinez"
  groupColor?: string; // For venture color coding
  dealCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: React.ReactNode; // StageColumns
}
```

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▼ Forge (12 deals)                                              [Expand All]│
├─────────────────────────────────────────────────────────────────────────────┤
│ │ Lead (3)  │ Qualified (4) │ Discovery (2) │ Proposal (2) │ Active (1) │  │
│ │  [Card]   │   [Card]      │    [Card]     │   [Card]     │   [Card]   │  │
│ │  [Card]   │   [Card]      │    [Card]     │   [Card]     │            │  │
│ │  [Card]   │   [Card]      │               │              │            │  │
│ │           │   [Card]      │               │              │            │  │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▶ Hearth (8 deals)  ← Collapsed swim lane                                   │
└─────────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▼ Anvil (5 deals)                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ │ Lead (1)  │ Qualified (2) │ Discovery (1) │ Proposal (1) │ Active (0) │  │
│ │  [Card]   │   [Card]      │    [Card]     │   [Card]     │            │  │
│ │           │   [Card]      │               │              │            │  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Click header to collapse/expand entire swim lane
- Collapsed shows only header with count
- Drag between swim lanes updates venture/owner assignment (with confirmation)
- Color-coded left border for venture swim lanes

---

### 4.7 CloseDealModal

**Purpose:** Structured flow for moving deals to terminal stages

**Props:**
```typescript
interface CloseDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: PipelineDeal;
  terminalStages: PipelineStage[];
  onSubmit: (outcome: CloseDealOutcome) => void;
  isSubmitting: boolean;
}
```

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Close Deal                                               [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Closing: Acme Corporation                                       │
│ Current Stage: Proposal                                         │
│                                                                 │
│ How did this deal close?                                        │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │     🎉      │ │     ✕       │ │     📤      │                │
│ │    Won      │ │    Lost     │ │   Churned   │                │
│ │             │ │  (selected) │ │             │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│ Reason (required for Lost):                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ [Select a reason ▼]                                         ││
│ │ • Went with competitor                                      ││
│ │ • Budget constraints                                        ││
│ │ • Project cancelled                                         ││
│ │ • No response                                               ││
│ │ • Other                                                     ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Notes (optional):                                               │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │                                                             ││
│ │                                                             ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                              [Cancel]  [Close Deal]             │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Outcome selection is required
- Reason dropdown appears for "Lost" outcome
- Notes always optional
- Submit creates stage_change activity with metadata
- Success toast: "Deal closed as [outcome]"
- Deal removed from board immediately (optimistic update)

---

### 4.8 ClosedDealsDrawer

**Purpose:** Access to terminal-stage deals without cluttering the main board

**Props:**
```typescript
interface ClosedDealsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineType: BusinessRelationshipType;
  filters: {
    outcome?: 'won' | 'lost' | 'churned';
    dateRange?: { start: Date; end: Date };
    searchQuery?: string;
  };
  onFiltersChange: (filters: Partial<ClosedDealsFilters>) => void;
}
```

**Wireframe:**
```
┌───────────────────────────────────────────────────────┐
│ Closed Deals                                     [×]  │
├───────────────────────────────────────────────────────┤
│ [All ▼] [Won ○] [Lost ○] [Churned ○]  [🔍 Search...] │
├───────────────────────────────────────────────────────┤
│                                                       │
│ ┌───────────────────────────────────────────────────┐│
│ │ 🎉 Acme Corp · Won · Dec 15, 2024                 ││
│ │    Forge · Dan Martinez                      [→]  ││
│ └───────────────────────────────────────────────────┘│
│ ┌───────────────────────────────────────────────────┐│
│ │ ✕ Beta LLC · Lost · Dec 10, 2024                  ││
│ │    Anvil · Sarah Chen · Budget constraints   [→]  ││
│ └───────────────────────────────────────────────────┘│
│ ┌───────────────────────────────────────────────────┐│
│ │ 📤 Gamma Inc · Churned · Dec 5, 2024              ││
│ │    Forge · Mike Johnson                      [→]  ││
│ └───────────────────────────────────────────────────┘│
│                                                       │
│ [Load more...]                                        │
└───────────────────────────────────────────────────────┘
```

**Behavior:**
- Slides in from right (480px width)
- Filters by outcome and date
- Search by entity name
- Click row to navigate to contact/org detail
- Option to "Reopen" deal (move back to last active stage)

---

### 4.9 PipelineList (Table View)

**Purpose:** Data-dense alternative view for bulk operations

**Columns:**
| Column | Sortable | Width |
|--------|----------|-------|
| Entity Name | Yes | flex |
| Stage | Yes | 120px |
| Venture | Yes | 100px |
| Owner | Yes | 140px |
| Days in Stage | Yes | 100px |
| Last Activity | Yes | 120px |
| Attention | No | 80px |
| Actions | No | 60px |

**Features:**
- Column sorting (click header)
- Multi-select rows for bulk actions
- Inline stage change dropdown
- Same quick actions as card menu
- Pagination (25/50/100 per page)
- Export to CSV

---

## 5. TypeScript Types

```typescript
// src/features/pipelines/types/index.ts

import type { BusinessRelationshipType, Venture } from '@/types/database';

// ============================================
// Core Domain Types
// ============================================

export interface PipelineDeal {
  id: string;
  entityType: 'contact' | 'organization';
  entityId: string;
  entityName: string;
  relationshipType: BusinessRelationshipType;
  stage: string;
  ventures: Venture[];
  primaryVenture: Venture | null;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  daysInStage: number;
  daysSinceActivity: number;
  lastActivityDate: Date | null;
  lastActivityType: string | null;
  createdAt: Date;
  updatedAt: Date;
  attentionStatus: AttentionStatus | null;
}

export type AttentionStatus = 
  | { type: 'stuck'; days: number }      // 14-29 days in stage
  | { type: 'very_stuck'; days: number } // 30+ days in stage
  | { type: 'cold'; days: number }       // 7-13 days no activity
  | { type: 'ice_cold'; days: number };  // 14+ days no activity

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  isTerminal: boolean;
  terminalType: 'won' | 'lost' | 'churned' | null;
}

export interface PipelineStats {
  activeCount: number;
  advancedThisPeriod: number;
  stuckCount: number;
  coldCount: number;
  periodLabel: string;
}

// ============================================
// Filter Types
// ============================================

export interface PipelineFilters {
  pipelineType: BusinessRelationshipType;
  ownership: 'my' | 'all';
  needsAttention: boolean;
  ventures: Venture[];
  ownerIds: string[];
  createdAfter: Date | null;
  createdBefore: Date | null;
  searchQuery: string;
}

export type GroupByOption = 'none' | 'venture' | 'owner';

export interface SavedView {
  id: string;
  name: string;
  filters: PipelineFilters;
  groupBy: GroupByOption;
  collapsedStages: string[];
  createdAt: Date;
}

// ============================================
// Grouping Types
// ============================================

export interface SwimLaneData {
  key: string;
  label: string;
  color?: string;
  dealCount: number;
  deals: PipelineDeal[];
}

export interface GroupedDeals {
  groupBy: GroupByOption;
  lanes: SwimLaneData[];
}

// ============================================
// Action Types
// ============================================

export type QuickActionType = 
  | 'log_call'
  | 'schedule_task'
  | 'move_stage'
  | 'view_contact'
  | 'close_deal';

export interface CloseDealOutcome {
  dealId: string;
  outcome: 'won' | 'lost' | 'churned' | 'passed' | 'declined' | 'inactive';
  reason?: string;
  notes?: string;
}

export interface MoveStagePayload {
  dealId: string;
  fromStage: string;
  toStage: string;
}

// ============================================
// View State Types
// ============================================

export type ViewMode = 'kanban' | 'list';

export interface PipelineViewState {
  viewMode: ViewMode;
  groupBy: GroupByOption;
  collapsedStages: string[];
  collapsedLanes: string[];
}

// ============================================
// API Response Types
// ============================================

export interface PipelineDealsResponse {
  deals: PipelineDeal[];
  stats: PipelineStats;
  stages: PipelineStage[];
}

export interface ClosedDealsResponse {
  deals: PipelineDeal[];
  totalCount: number;
  hasMore: boolean;
}
```

---

## 6. Database Requirements

### 6.1 New RPC Functions

#### `get_pipeline_deals`

Returns active deals for a pipeline with computed attention status.

```sql
-- Migration: supabase/migrations/00007_pipeline_view_functions.sql

CREATE OR REPLACE FUNCTION get_pipeline_deals(
  p_pipeline_type business_relationship_type,
  p_user_id UUID DEFAULT NULL,
  p_owner_filter UUID DEFAULT NULL,
  p_ventures venture[] DEFAULT NULL,
  p_needs_attention BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  relationship_type business_relationship_type,
  stage TEXT,
  ventures venture[],
  primary_venture venture,
  owner_id UUID,
  owner_name TEXT,
  owner_avatar_url TEXT,
  days_in_stage INTEGER,
  days_since_activity INTEGER,
  last_activity_date TIMESTAMPTZ,
  last_activity_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  attention_type TEXT,
  attention_days INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH terminal_stages AS (
    SELECT stage_name 
    FROM pipeline_stages 
    WHERE relationship_type = p_pipeline_type 
    AND is_terminal = true
  ),
  deal_activities AS (
    SELECT 
      a.relationship_id,
      MAX(a.occurred_at) as last_activity,
      MAX(a.occurred_at) FILTER (WHERE a.type = 'stage_change') as last_stage_change,
      (array_agg(a.type ORDER BY a.occurred_at DESC))[1] as last_activity_type
    FROM activities a
    GROUP BY a.relationship_id
  ),
  deals_with_attention AS (
    SELECT 
      br.id,
      CASE 
        WHEN br.contact_id IS NOT NULL THEN 'contact'
        ELSE 'organization'
      END as entity_type,
      COALESCE(br.contact_id, br.organization_id) as entity_id,
      COALESCE(c.full_name, o.name) as entity_name,
      br.type as relationship_type,
      br.stage,
      br.ventures,
      br.ventures[1] as primary_venture,
      br.owner_id,
      u.full_name as owner_name,
      u.avatar_url as owner_avatar_url,
      EXTRACT(DAY FROM NOW() - COALESCE(da.last_stage_change, br.created_at))::INTEGER as days_in_stage,
      EXTRACT(DAY FROM NOW() - COALESCE(da.last_activity, br.created_at))::INTEGER as days_since_activity,
      da.last_activity as last_activity_date,
      da.last_activity_type,
      br.created_at,
      br.updated_at,
      CASE
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_activity, br.created_at)) >= 14 THEN 'ice_cold'
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_activity, br.created_at)) >= 7 THEN 'cold'
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_stage_change, br.created_at)) >= 30 THEN 'very_stuck'
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_stage_change, br.created_at)) >= 14 THEN 'stuck'
        ELSE NULL
      END as attention_type,
      CASE
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_activity, br.created_at)) >= 7 
          THEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_activity, br.created_at))::INTEGER
        WHEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_stage_change, br.created_at)) >= 14
          THEN EXTRACT(DAY FROM NOW() - COALESCE(da.last_stage_change, br.created_at))::INTEGER
        ELSE NULL
      END as attention_days
    FROM business_relationships br
    LEFT JOIN contacts c ON br.contact_id = c.id
    LEFT JOIN organizations o ON br.organization_id = o.id
    LEFT JOIN users u ON br.owner_id = u.id
    LEFT JOIN deal_activities da ON da.relationship_id = br.id
    WHERE br.type = p_pipeline_type
    AND br.stage NOT IN (SELECT stage_name FROM terminal_stages)
    AND (p_owner_filter IS NULL OR br.owner_id = p_owner_filter)
    AND (p_ventures IS NULL OR br.ventures && p_ventures)
  )
  SELECT * FROM deals_with_attention d
  WHERE (NOT p_needs_attention OR d.attention_type IS NOT NULL)
  ORDER BY 
    CASE d.attention_type 
      WHEN 'ice_cold' THEN 1
      WHEN 'very_stuck' THEN 2
      WHEN 'cold' THEN 3
      WHEN 'stuck' THEN 4
      ELSE 5
    END,
    d.days_in_stage DESC;
END;
$$;
```

#### `get_pipeline_stats`

Returns summary statistics for a pipeline.

```sql
CREATE OR REPLACE FUNCTION get_pipeline_stats(
  p_pipeline_type business_relationship_type,
  p_user_id UUID DEFAULT NULL,
  p_owner_filter UUID DEFAULT NULL,
  p_ventures venture[] DEFAULT NULL,
  p_period_days INTEGER DEFAULT 14
)
RETURNS TABLE (
  active_count BIGINT,
  advanced_this_period BIGINT,
  stuck_count BIGINT,
  cold_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH terminal_stages AS (
    SELECT stage_name 
    FROM pipeline_stages 
    WHERE relationship_type = p_pipeline_type 
    AND is_terminal = true
  ),
  active_deals AS (
    SELECT br.id
    FROM business_relationships br
    WHERE br.type = p_pipeline_type
    AND br.stage NOT IN (SELECT stage_name FROM terminal_stages)
    AND (p_owner_filter IS NULL OR br.owner_id = p_owner_filter)
    AND (p_ventures IS NULL OR br.ventures && p_ventures)
  ),
  deal_metrics AS (
    SELECT 
      ad.id,
      (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = ad.id) as last_activity,
      (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = ad.id AND a.type = 'stage_change') as last_stage_change,
      (SELECT COUNT(*) FROM activities a WHERE a.relationship_id = ad.id AND a.type = 'stage_change' AND a.occurred_at >= NOW() - (p_period_days || ' days')::INTERVAL) as stage_changes_in_period
    FROM active_deals ad
  )
  SELECT
    COUNT(*)::BIGINT as active_count,
    COUNT(*) FILTER (WHERE dm.stage_changes_in_period > 0)::BIGINT as advanced_this_period,
    COUNT(*) FILTER (WHERE EXTRACT(DAY FROM NOW() - COALESCE(dm.last_stage_change, NOW() - INTERVAL '999 days')) >= 14)::BIGINT as stuck_count,
    COUNT(*) FILTER (WHERE EXTRACT(DAY FROM NOW() - COALESCE(dm.last_activity, NOW() - INTERVAL '999 days')) >= 7)::BIGINT as cold_count
  FROM deal_metrics dm;
END;
$$;
```

#### `get_closed_deals`

Returns terminal-stage deals with pagination.

```sql
CREATE OR REPLACE FUNCTION get_closed_deals(
  p_pipeline_type business_relationship_type,
  p_outcome TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  stage TEXT,
  outcome TEXT,
  closed_reason TEXT,
  ventures venture[],
  owner_id UUID,
  owner_name TEXT,
  closed_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH terminal_stages AS (
    SELECT stage_name, terminal_type
    FROM pipeline_stages 
    WHERE relationship_type = p_pipeline_type 
    AND is_terminal = true
  ),
  closed AS (
    SELECT 
      br.id,
      CASE WHEN br.contact_id IS NOT NULL THEN 'contact' ELSE 'organization' END as entity_type,
      COALESCE(br.contact_id, br.organization_id) as entity_id,
      COALESCE(c.full_name, o.name) as entity_name,
      br.stage,
      ts.terminal_type as outcome,
      br.attributes->>'close_reason' as closed_reason,
      br.ventures,
      br.owner_id,
      u.full_name as owner_name,
      br.updated_at as closed_at,
      COUNT(*) OVER() as total_count
    FROM business_relationships br
    LEFT JOIN contacts c ON br.contact_id = c.id
    LEFT JOIN organizations o ON br.organization_id = o.id
    LEFT JOIN users u ON br.owner_id = u.id
    INNER JOIN terminal_stages ts ON br.stage = ts.stage_name
    WHERE br.type = p_pipeline_type
    AND (p_outcome IS NULL OR ts.terminal_type = p_outcome)
    AND (p_search_query IS NULL OR 
         COALESCE(c.full_name, o.name) ILIKE '%' || p_search_query || '%')
  )
  SELECT * FROM closed
  ORDER BY closed_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
```

### 6.2 Indexes

```sql
-- Add to migration file
CREATE INDEX IF NOT EXISTS idx_relationships_type_stage 
  ON business_relationships(type, stage);

CREATE INDEX IF NOT EXISTS idx_relationships_owner_type 
  ON business_relationships(owner_id, type);

CREATE INDEX IF NOT EXISTS idx_relationships_ventures 
  ON business_relationships USING GIN(ventures);

CREATE INDEX IF NOT EXISTS idx_activities_relationship_occurred 
  ON activities(relationship_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_relationship_type_occurred 
  ON activities(relationship_id, type, occurred_at DESC);
```

---

## 7. Hooks & Services

### 7.1 Service Layer

```typescript
// src/features/pipelines/services/pipelineService.ts

import { restClient } from '@/lib/supabase/rest-client';
import type {
  BusinessRelationshipType,
  Venture,
} from '@/types/database';
import type {
  PipelineDeal,
  PipelineStats,
  PipelineStage,
  PipelineFilters,
  CloseDealOutcome,
  MoveStagePayload,
  ClosedDealsResponse,
} from '../types';

export const pipelineService = {
  /**
   * Fetch active deals for a pipeline
   */
  async getDeals(
    pipelineType: BusinessRelationshipType,
    filters: Partial<PipelineFilters>,
    currentUserId: string
  ): Promise<{ deals: PipelineDeal[]; stats: PipelineStats }> {
    const ownerFilter = filters.ownership === 'my' ? currentUserId : 
                        filters.ownerIds?.length === 1 ? filters.ownerIds[0] : null;
    
    const [dealsResult, statsResult] = await Promise.all([
      restClient.rpc<PipelineDealRow[]>('get_pipeline_deals', {
        args: {
          p_pipeline_type: pipelineType,
          p_user_id: currentUserId,
          p_owner_filter: ownerFilter,
          p_ventures: filters.ventures?.length ? filters.ventures : null,
          p_needs_attention: filters.needsAttention ?? false,
        },
      }),
      restClient.rpc<PipelineStatsRow[]>('get_pipeline_stats', {
        args: {
          p_pipeline_type: pipelineType,
          p_user_id: currentUserId,
          p_owner_filter: ownerFilter,
          p_ventures: filters.ventures?.length ? filters.ventures : null,
        },
      }),
    ]);

    return {
      deals: dealsResult.map(transformDealRow),
      stats: transformStatsRow(statsResult[0]),
    };
  },

  /**
   * Fetch pipeline stages (active only, ordered)
   */
  async getStages(pipelineType: BusinessRelationshipType): Promise<PipelineStage[]> {
    const result = await restClient
      .from('pipeline_stages')
      .select('*')
      .eq('relationship_type', pipelineType)
      .eq('is_terminal', false)
      .order('stage_order', { ascending: true });

    return result.map((row) => ({
      id: row.id,
      name: row.stage_name,
      order: row.stage_order,
      isTerminal: row.is_terminal,
      terminalType: row.terminal_type,
    }));
  },

  /**
   * Fetch terminal stages for close modal
   */
  async getTerminalStages(pipelineType: BusinessRelationshipType): Promise<PipelineStage[]> {
    const result = await restClient
      .from('pipeline_stages')
      .select('*')
      .eq('relationship_type', pipelineType)
      .eq('is_terminal', true)
      .order('stage_order', { ascending: true });

    return result.map((row) => ({
      id: row.id,
      name: row.stage_name,
      order: row.stage_order,
      isTerminal: row.is_terminal,
      terminalType: row.terminal_type,
    }));
  },

  /**
   * Move deal to a new stage
   */
  async moveDealToStage(payload: MoveStagePayload, userId: string): Promise<void> {
    // Update relationship stage
    await restClient
      .from('business_relationships')
      .update({ stage: payload.toStage, updated_at: new Date().toISOString() })
      .eq('id', payload.dealId);

    // Log stage change activity
    await restClient.from('activities').insert({
      relationship_id: payload.dealId,
      type: 'stage_change',
      description: `Stage changed: ${payload.fromStage} → ${payload.toStage}`,
      logged_by: userId,
      occurred_at: new Date().toISOString(),
      metadata: {
        from_stage: payload.fromStage,
        to_stage: payload.toStage,
        changed_via: 'pipeline_view',
      },
    });
  },

  /**
   * Close a deal (move to terminal stage)
   */
  async closeDeal(outcome: CloseDealOutcome, userId: string): Promise<void> {
    // Get current stage for activity log
    const deal = await restClient
      .from('business_relationships')
      .select('stage')
      .eq('id', outcome.dealId)
      .single();

    // Update relationship with terminal stage and close metadata
    await restClient
      .from('business_relationships')
      .update({
        stage: outcome.outcome === 'won' ? 'Won' : 
               outcome.outcome === 'lost' ? 'Lost' :
               outcome.outcome === 'churned' ? 'Churned' :
               outcome.outcome === 'passed' ? 'Passed' :
               outcome.outcome === 'declined' ? 'Declined' : 'Inactive',
        updated_at: new Date().toISOString(),
        attributes: {
          close_reason: outcome.reason,
          close_notes: outcome.notes,
          closed_at: new Date().toISOString(),
          closed_by: userId,
        },
      })
      .eq('id', outcome.dealId);

    // Log stage change activity
    await restClient.from('activities').insert({
      relationship_id: outcome.dealId,
      type: 'stage_change',
      description: `Deal closed as ${outcome.outcome}${outcome.reason ? `: ${outcome.reason}` : ''}`,
      logged_by: userId,
      occurred_at: new Date().toISOString(),
      metadata: {
        from_stage: deal.stage,
        to_stage: outcome.outcome,
        close_reason: outcome.reason,
        close_notes: outcome.notes,
        is_terminal: true,
      },
    });
  },

  /**
   * Fetch closed deals with pagination
   */
  async getClosedDeals(
    pipelineType: BusinessRelationshipType,
    filters: { outcome?: string; searchQuery?: string },
    pagination: { limit: number; offset: number }
  ): Promise<ClosedDealsResponse> {
    const result = await restClient.rpc<ClosedDealRow[]>('get_closed_deals', {
      args: {
        p_pipeline_type: pipelineType,
        p_outcome: filters.outcome ?? null,
        p_search_query: filters.searchQuery ?? null,
        p_limit: pagination.limit,
        p_offset: pagination.offset,
      },
    });

    const totalCount = result[0]?.total_count ?? 0;

    return {
      deals: result.map(transformClosedDealRow),
      totalCount,
      hasMore: pagination.offset + result.length < totalCount,
    };
  },

  /**
   * Reopen a closed deal
   */
  async reopenDeal(dealId: string, toStage: string, userId: string): Promise<void> {
    const deal = await restClient
      .from('business_relationships')
      .select('stage')
      .eq('id', dealId)
      .single();

    await restClient
      .from('business_relationships')
      .update({
        stage: toStage,
        updated_at: new Date().toISOString(),
        attributes: {
          reopened_at: new Date().toISOString(),
          reopened_by: userId,
        },
      })
      .eq('id', dealId);

    await restClient.from('activities').insert({
      relationship_id: dealId,
      type: 'stage_change',
      description: `Deal reopened: ${deal.stage} → ${toStage}`,
      logged_by: userId,
      occurred_at: new Date().toISOString(),
      metadata: {
        from_stage: deal.stage,
        to_stage: toStage,
        is_reopen: true,
      },
    });
  },
};

// Transform functions
function transformDealRow(row: PipelineDealRow): PipelineDeal {
  return {
    id: row.id,
    entityType: row.entity_type as 'contact' | 'organization',
    entityId: row.entity_id,
    entityName: row.entity_name,
    relationshipType: row.relationship_type,
    stage: row.stage,
    ventures: row.ventures,
    primaryVenture: row.primary_venture,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerAvatarUrl: row.owner_avatar_url,
    daysInStage: row.days_in_stage,
    daysSinceActivity: row.days_since_activity,
    lastActivityDate: row.last_activity_date ? new Date(row.last_activity_date) : null,
    lastActivityType: row.last_activity_type,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    attentionStatus: row.attention_type
      ? { type: row.attention_type, days: row.attention_days }
      : null,
  };
}

function transformStatsRow(row: PipelineStatsRow): PipelineStats {
  return {
    activeCount: row.active_count,
    advancedThisPeriod: row.advanced_this_period,
    stuckCount: row.stuck_count,
    coldCount: row.cold_count,
    periodLabel: 'Last 14 days',
  };
}
```

### 7.2 React Hooks

```typescript
// src/features/pipelines/hooks/usePipelineDeals.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { pipelineService } from '../services/pipelineService';
import type { PipelineFilters, MoveStagePayload, CloseDealOutcome } from '../types';
import type { BusinessRelationshipType } from '@/types/database';

export const pipelineKeys = {
  all: ['pipeline'] as const,
  deals: (type: BusinessRelationshipType, filters: Partial<PipelineFilters>) =>
    [...pipelineKeys.all, 'deals', type, filters] as const,
  stages: (type: BusinessRelationshipType) =>
    [...pipelineKeys.all, 'stages', type] as const,
  terminalStages: (type: BusinessRelationshipType) =>
    [...pipelineKeys.all, 'terminalStages', type] as const,
  closedDeals: (type: BusinessRelationshipType, filters: object) =>
    [...pipelineKeys.all, 'closed', type, filters] as const,
};

export function usePipelineDeals(
  pipelineType: BusinessRelationshipType,
  filters: Partial<PipelineFilters>
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: pipelineKeys.deals(pipelineType, filters),
    queryFn: () => pipelineService.getDeals(pipelineType, filters, user!.id),
    enabled: !!user,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}

export function usePipelineStages(pipelineType: BusinessRelationshipType) {
  return useQuery({
    queryKey: pipelineKeys.stages(pipelineType),
    queryFn: () => pipelineService.getStages(pipelineType),
    staleTime: Infinity, // Stages rarely change
  });
}

export function useTerminalStages(pipelineType: BusinessRelationshipType) {
  return useQuery({
    queryKey: pipelineKeys.terminalStages(pipelineType),
    queryFn: () => pipelineService.getTerminalStages(pipelineType),
    staleTime: Infinity,
  });
}

export function useMoveDealStage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: MoveStagePayload) =>
      pipelineService.moveDealToStage(payload, user!.id),
    onMutate: async (payload) => {
      // Optimistic update: move card immediately
      await queryClient.cancelQueries({ queryKey: pipelineKeys.all });

      const previousData = queryClient.getQueriesData({ queryKey: pipelineKeys.all });

      queryClient.setQueriesData(
        { queryKey: pipelineKeys.all },
        (old: any) => {
          if (!old?.deals) return old;
          return {
            ...old,
            deals: old.deals.map((deal: any) =>
              deal.id === payload.dealId
                ? { ...deal, stage: payload.toStage, daysInStage: 0 }
                : deal
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _payload, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}

export function useCloseDeal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (outcome: CloseDealOutcome) =>
      pipelineService.closeDeal(outcome, user!.id),
    onMutate: async (outcome) => {
      // Optimistic update: remove card from board
      await queryClient.cancelQueries({ queryKey: pipelineKeys.all });

      queryClient.setQueriesData(
        { queryKey: pipelineKeys.all },
        (old: any) => {
          if (!old?.deals) return old;
          return {
            ...old,
            deals: old.deals.filter((deal: any) => deal.id !== outcome.dealId),
            stats: {
              ...old.stats,
              activeCount: old.stats.activeCount - 1,
            },
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
    },
  });
}

// src/features/pipelines/hooks/usePipelineViewState.ts

import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ViewMode, GroupByOption, PipelineFilters } from '../types';
import type { BusinessRelationshipType } from '@/types/database';

const DEFAULT_FILTERS: PipelineFilters = {
  pipelineType: 'b2b_client',
  ownership: 'my',
  needsAttention: false,
  ventures: [],
  ownerIds: [],
  createdAfter: null,
  createdBefore: null,
  searchQuery: '',
};

export function usePipelineViewState(pipelineType: BusinessRelationshipType) {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    `pipeline-view-mode-${pipelineType}`,
    'kanban'
  );

  const [groupBy, setGroupBy] = useLocalStorage<GroupByOption>(
    `pipeline-group-by-${pipelineType}`,
    'none'
  );

  const [collapsedStages, setCollapsedStages] = useLocalStorage<string[]>(
    `pipeline-collapsed-stages-${pipelineType}`,
    []
  );

  const [collapsedLanes, setCollapsedLanes] = useLocalStorage<string[]>(
    `pipeline-collapsed-lanes-${pipelineType}`,
    []
  );

  const [filters, setFilters] = useLocalStorage<PipelineFilters>(
    `pipeline-filters-${pipelineType}`,
    { ...DEFAULT_FILTERS, pipelineType }
  );

  const toggleStageCollapse = (stageName: string) => {
    setCollapsedStages((prev) =>
      prev.includes(stageName)
        ? prev.filter((s) => s !== stageName)
        : [...prev, stageName]
    );
  };

  const toggleLaneCollapse = (laneKey: string) => {
    setCollapsedLanes((prev) =>
      prev.includes(laneKey)
        ? prev.filter((l) => l !== laneKey)
        : [...prev, laneKey]
    );
  };

  const updateFilters = (updates: Partial<PipelineFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, pipelineType });
  };

  return {
    viewMode,
    setViewMode,
    groupBy,
    setGroupBy,
    collapsedStages,
    toggleStageCollapse,
    collapsedLanes,
    toggleLaneCollapse,
    filters,
    updateFilters,
    resetFilters,
  };
}

// src/features/pipelines/hooks/useGroupedDeals.ts

import { useMemo } from 'react';
import type { PipelineDeal, GroupByOption, SwimLaneData } from '../types';
import type { Venture } from '@/types/database';

const VENTURE_COLORS: Record<Venture, string> = {
  forge: '#E85D04',
  hearth: '#9D4EDD',
  anvil: '#0077B6',
  crucible: '#2D6A4F',
  foundry: '#E63946',
  carbide: '#1D3557',
  lucepta: '#F4A261',
  meridian_44: '#118AB2',
  trade_stone_group: '#6C757D',
};

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

export function useGroupedDeals(
  deals: PipelineDeal[],
  groupBy: GroupByOption,
  owners?: Array<{ id: string; name: string }>
): SwimLaneData[] {
  return useMemo(() => {
    if (groupBy === 'none') {
      return [
        {
          key: 'all',
          label: 'All Deals',
          dealCount: deals.length,
          deals,
        },
      ];
    }

    if (groupBy === 'venture') {
      const ventureMap = new Map<Venture, PipelineDeal[]>();

      // Initialize all ventures
      Object.keys(VENTURE_LABELS).forEach((v) => {
        ventureMap.set(v as Venture, []);
      });

      // Group deals by primary venture
      deals.forEach((deal) => {
        const venture = deal.primaryVenture || deal.ventures[0];
        if (venture) {
          const existing = ventureMap.get(venture) || [];
          ventureMap.set(venture, [...existing, deal]);
        }
      });

      // Convert to swim lanes, filtering out empty ventures
      return Array.from(ventureMap.entries())
        .filter(([_, ventureDeals]) => ventureDeals.length > 0)
        .map(([venture, ventureDeals]) => ({
          key: venture,
          label: VENTURE_LABELS[venture],
          color: VENTURE_COLORS[venture],
          dealCount: ventureDeals.length,
          deals: ventureDeals,
        }))
        .sort((a, b) => b.dealCount - a.dealCount);
    }

    if (groupBy === 'owner') {
      const ownerMap = new Map<string, PipelineDeal[]>();

      deals.forEach((deal) => {
        const existing = ownerMap.get(deal.ownerId) || [];
        ownerMap.set(deal.ownerId, [...existing, deal]);
      });

      return Array.from(ownerMap.entries())
        .map(([ownerId, ownerDeals]) => {
          const owner = owners?.find((o) => o.id === ownerId);
          return {
            key: ownerId,
            label: owner?.name || ownerDeals[0]?.ownerName || 'Unknown',
            dealCount: ownerDeals.length,
            deals: ownerDeals,
          };
        })
        .sort((a, b) => b.dealCount - a.dealCount);
    }

    return [];
  }, [deals, groupBy, owners]);
}
```

---

## 8. Implementation Prompts

### Prompt 1: Database Migration

```
Create the database migration file for the pipeline view redesign.

File: supabase/migrations/00007_pipeline_view_functions.sql

Requirements:
1. Create `get_pipeline_deals` RPC function that:
   - Accepts: p_pipeline_type, p_user_id, p_owner_filter, p_ventures, p_needs_attention
   - Returns deals with computed: days_in_stage, days_since_activity, attention_type, attention_days
   - Excludes terminal stages (use subquery from pipeline_stages where is_terminal = true)
   - Calculates attention_type: 'ice_cold' (14d+ no activity), 'cold' (7-13d), 'very_stuck' (30d+), 'stuck' (14-29d)
   - Orders by attention priority, then days_in_stage DESC

2. Create `get_pipeline_stats` RPC function that:
   - Returns: active_count, advanced_this_period, stuck_count, cold_count
   - Uses same filtering as get_pipeline_deals
   - advanced_this_period counts deals with stage_change activity in last p_period_days

3. Create `get_closed_deals` RPC function that:
   - Returns paginated terminal-stage deals with total_count
   - Supports outcome filter and search_query filter
   - Includes close_reason from attributes JSONB

4. Add indexes for performance:
   - idx_relationships_type_stage
   - idx_relationships_owner_type
   - idx_relationships_ventures (GIN)
   - idx_activities_relationship_occurred
   - idx_activities_relationship_type_occurred

Reference the existing schema:
- business_relationships table with: type, stage, ventures, owner_id, contact_id, organization_id, attributes
- pipeline_stages table with: relationship_type, stage_name, stage_order, is_terminal, terminal_type
- activities table with: relationship_id, type, occurred_at, logged_by

Use the SQL patterns from carbide-leadership-dashboard-addendum.md as reference.
```

### Prompt 2: Types and Service Layer

```
Create the TypeScript types and service layer for the pipeline view.

Files to create:
1. src/features/pipelines/types/index.ts
2. src/features/pipelines/services/pipelineService.ts

For types/index.ts:
- PipelineDeal interface with all fields from get_pipeline_deals RPC
- AttentionStatus discriminated union: stuck | very_stuck | cold | ice_cold
- PipelineStage, PipelineStats, PipelineFilters interfaces
- GroupByOption, ViewMode, SavedView types
- QuickActionType, CloseDealOutcome, MoveStagePayload types
- SwimLaneData and GroupedDeals for grouping support

For services/pipelineService.ts:
- getDeals(pipelineType, filters, currentUserId) - calls get_pipeline_deals and get_pipeline_stats RPCs
- getStages(pipelineType) - fetches active stages ordered by stage_order
- getTerminalStages(pipelineType) - fetches terminal stages for close modal
- moveDealToStage(payload, userId) - updates stage and logs activity
- closeDeal(outcome, userId) - moves to terminal stage with metadata
- getClosedDeals(pipelineType, filters, pagination) - paginated closed deals
- reopenDeal(dealId, toStage, userId) - moves from terminal back to active

Use restClient from @/lib/supabase/rest-client.
Follow patterns from existing services like leadershipDashboardService.ts.
Include transform functions for row-to-domain mapping.
```

### Prompt 3: React Hooks

```
Create the React hooks for pipeline data fetching and view state management.

Files to create:
1. src/features/pipelines/hooks/usePipelineDeals.ts
2. src/features/pipelines/hooks/usePipelineViewState.ts
3. src/features/pipelines/hooks/useGroupedDeals.ts
4. src/features/pipelines/hooks/index.ts (barrel export)

For usePipelineDeals.ts:
- pipelineKeys factory for query key management
- usePipelineDeals(pipelineType, filters) - fetches deals and stats
- usePipelineStages(pipelineType) - fetches active stages (staleTime: Infinity)
- useTerminalStages(pipelineType) - fetches terminal stages
- useMoveDealStage() - mutation with optimistic update
- useCloseDeal() - mutation with optimistic removal from board
- useClosedDeals(pipelineType, filters, pagination) - paginated query

For usePipelineViewState.ts:
- Uses useLocalStorage for persistence
- Manages: viewMode, groupBy, collapsedStages, collapsedLanes, filters
- Provides: toggleStageCollapse, toggleLaneCollapse, updateFilters, resetFilters
- Keys scoped by pipelineType

For useGroupedDeals.ts:
- Pure computation hook using useMemo
- Groups deals by venture or owner
- Returns SwimLaneData[] with color coding for ventures
- Handles 'none' grouping as single lane

Use TanStack Query v5 patterns.
Reference existing hooks in src/features/dashboard/hooks/ for patterns.
```

### Prompt 4: Core UI Components (Part 1)

```
Create the pipeline header and filter components.

Files to create:
1. src/features/pipelines/components/PipelineHeader.tsx
2. src/features/pipelines/components/PipelineFilters.tsx
3. src/features/pipelines/components/PipelineStats.tsx

For PipelineHeader.tsx:
- Pipeline type dropdown (B2B, B2C, Investor, Meridian 44)
- View mode toggle (Kanban/List) using ToggleGroup from shadcn
- Renders PipelineStats inline
- "View Closed" button that opens ClosedDealsDrawer
- Uses PageContainer pattern for consistency

For PipelineFilters.tsx:
- Primary row: "My Deals" / "All Deals" toggle (RadioGroup style)
- "Needs Attention" checkbox
- Secondary row (collapsible on mobile):
  - Venture multi-select dropdown
  - Owner multi-select (only visible when "All Deals")
  - Date range picker
- Group By selector: None / Venture / Owner
- Saved Views dropdown with save/load/delete
- Clear All button when filters active

For PipelineStats.tsx:
- Horizontal stat display: "47 Active • +8 this period • ⚠️ 5 stuck • ❄️ 3 cold"
- Each metric clickable to apply filter
- Loading skeleton state
- Use Badge component for counts

Use shadcn/ui components: Select, Button, Toggle, ToggleGroup, Popover, Badge, Checkbox
Follow accessibility patterns from WCAG-2.2-Guide.md.
```

### Prompt 5: Core UI Components (Part 2)

```
Create the Kanban board components.

Files to create:
1. src/features/pipelines/components/PipelineKanban.tsx
2. src/features/pipelines/components/StageColumn.tsx
3. src/features/pipelines/components/DealCard.tsx
4. src/features/pipelines/components/SwimLane.tsx
5. src/features/pipelines/components/DealCardActions.tsx

For PipelineKanban.tsx:
- Main container with DndContext from @dnd-kit
- Renders SwimLanes if groupBy !== 'none', otherwise single row of StageColumns
- Handles drag start/end events
- DragOverlay for smooth dragging visual

For StageColumn.tsx:
- Droppable area (useDroppable from @dnd-kit)
- Collapsible header with stage name and count
- ScrollArea for cards with max-height
- "Add Deal" button at bottom
- Visual feedback when drag target

For DealCard.tsx:
- Draggable (useDraggable from @dnd-kit)
- Shows: entity name, venture badge, owner avatar, days in stage
- Attention indicator (left border color + icon) when stuck/cold
- Quick actions menu (DealCardActions) on hover/click

For SwimLane.tsx:
- Collapsible section header with group label and count
- Color-coded left border for venture lanes
- Contains horizontal row of StageColumns
- "Expand All" / "Collapse All" for nested stages

For DealCardActions.tsx:
- DropdownMenu with actions: Log Call, Schedule Task, Move to Stage (submenu), View Contact, Close Deal
- Move to Stage shows all active stages as submenu items
- Triggers appropriate modals/navigation

Use existing patterns from PipelineKanban.tsx and SortableRelationshipCard.tsx.
Ensure keyboard accessibility for all interactions.
```

### Prompt 6: Modals and Drawer

```
Create the modal and drawer components for pipeline actions.

Files to create:
1. src/features/pipelines/components/CloseDealModal.tsx
2. src/features/pipelines/components/ClosedDealsDrawer.tsx
3. src/features/pipelines/components/LogCallModal.tsx
4. src/features/pipelines/components/ScheduleTaskModal.tsx
5. src/features/pipelines/components/MoveStageModal.tsx

For CloseDealModal.tsx:
- Dialog showing deal info (name, current stage)
- Outcome selection: Won / Lost / Churned (or pipeline-specific terminals)
- Reason dropdown (required for Lost): "Went with competitor", "Budget constraints", "Project cancelled", "No response", "Other"
- Notes textarea (optional)
- Cancel and "Close Deal" buttons
- Uses useCloseDeal mutation
- Toast on success: "Deal closed as [outcome]"

For ClosedDealsDrawer.tsx:
- Sheet component sliding from right (480px width)
- Filter tabs: All / Won / Lost / Churned
- Search input
- List of closed deals with: icon, name, outcome, date, venture, owner, reason
- Click to navigate to contact/org detail
- "Reopen" action on each row
- Infinite scroll or "Load more" pagination

For LogCallModal.tsx:
- Quick call logging form
- Direction: Inbound / Outbound toggle
- Duration: optional input
- Notes: textarea
- Creates activity with type 'call_inbound' or 'call_outbound'

For ScheduleTaskModal.tsx:
- Task creation form
- Task type dropdown (call, email, meeting, follow-up)
- Due date picker
- Notes textarea
- Creates task linked to relationship

For MoveStageModal.tsx:
- Simple confirmation dialog
- Shows current stage and target stage
- Confirms the move
- Used when drag is cancelled or for explicit moves

Use shadcn components: Dialog, Sheet, Select, Textarea, Button, Input
Follow form patterns from React-TypeScript-Best-Practices-Guide.md.
```

### Prompt 7: List View and Table

```
Create the list/table view alternative to Kanban.

Files to create:
1. src/features/pipelines/components/PipelineList.tsx
2. src/features/pipelines/components/PipelineTable.tsx
3. src/features/pipelines/components/PipelineTableRow.tsx

For PipelineList.tsx:
- Container that renders PipelineTable
- Handles pagination state
- Bulk action toolbar when rows selected

For PipelineTable.tsx:
- Uses TanStack Table v8
- Columns: checkbox, Entity Name, Stage, Venture, Owner, Days in Stage, Last Activity, Attention, Actions
- Sortable columns: Entity Name, Stage, Venture, Owner, Days in Stage, Last Activity
- Multi-row selection with checkbox column
- Sticky header on scroll

For PipelineTableRow.tsx:
- Renders single deal row
- Stage as inline dropdown (quick change)
- Venture as colored badge
- Owner as avatar + name
- Days in Stage with color coding (amber 14+, red 30+)
- Attention column shows icons/badges
- Actions column with same menu as DealCardActions

Additional features:
- Column visibility toggle (dropdown to show/hide columns)
- Export to CSV button
- Pagination: 25 / 50 / 100 per page

Use existing table patterns from Carbide (TanStack Table).
Follow accessibility requirements for data tables.
```

### Prompt 8: Page Integration

```
Create the main pipeline page and integrate all components.

Files to create/modify:
1. src/features/pipelines/components/PipelineView.tsx (main page component)
2. src/features/pipelines/components/index.ts (barrel export)
3. src/pages/Pipelines.tsx (update existing)
4. src/routes/index.tsx (if needed)

For PipelineView.tsx:
- Main orchestrating component
- Uses all hooks: usePipelineDeals, usePipelineStages, usePipelineViewState, useGroupedDeals
- Renders: PipelineHeader, PipelineFilters, PipelineKanban OR PipelineList
- Handles modal state for all quick action modals
- Error boundary wrapper around main content
- Loading skeleton state

For index.ts:
- Export all components for clean imports

For updating Pipelines.tsx:
- Replace existing implementation with PipelineView
- Keep route at /pipelines

Integration requirements:
- URL state sync: ?type=b2b_client&view=kanban&groupBy=venture
- Keyboard shortcuts:
  - 'k' toggle kanban/list
  - 'g' then 'v' group by venture
  - 'g' then 'o' group by owner
  - 'g' then 'n' no grouping
  - '/' focus search
- Responsive: 
  - Desktop: full Kanban with 5-6 columns visible
  - Tablet: 3-4 columns, horizontal scroll
  - Mobile: single column visible, swipe between stages OR default to list view

Follow routing patterns from carbide-technical-prd.md.
```

### Prompt 9: Testing

```
Create tests for the pipeline view feature.

Files to create:
1. src/features/pipelines/hooks/__tests__/usePipelineDeals.test.ts
2. src/features/pipelines/hooks/__tests__/useGroupedDeals.test.ts
3. src/features/pipelines/services/__tests__/pipelineService.test.ts
4. src/features/pipelines/components/__tests__/DealCard.test.tsx
5. src/features/pipelines/components/__tests__/PipelineKanban.test.tsx
6. e2e/pipelines.spec.ts

For hook tests (Vitest):
- Test usePipelineDeals query behavior
- Test useMoveDealStage optimistic updates
- Test useGroupedDeals grouping logic for all group types
- Test usePipelineViewState localStorage persistence

For service tests:
- Mock restClient responses
- Test transform functions
- Test error handling

For component tests (Vitest + React Testing Library):
- DealCard renders all states (default, stuck, cold, critical)
- DealCard quick actions menu opens and triggers callbacks
- PipelineKanban drag and drop behavior

For E2E tests (Playwright):
- Navigate to pipeline view
- Switch between pipeline types
- Toggle view modes
- Drag card between stages
- Close a deal via modal
- Filter by "Needs Attention"
- Group by venture and verify swim lanes
- Open closed deals drawer
- Keyboard navigation through board

Follow testing patterns from carbide-technical-prd.md section 12.
```

---

## 9. File Structure

```
src/features/pipelines/
├── components/
│   ├── __tests__/
│   │   ├── DealCard.test.tsx
│   │   └── PipelineKanban.test.tsx
│   ├── CloseDealModal.tsx
│   ├── ClosedDealsDrawer.tsx
│   ├── DealCard.tsx
│   ├── DealCardActions.tsx
│   ├── LogCallModal.tsx
│   ├── MoveStageModal.tsx
│   ├── PipelineFilters.tsx
│   ├── PipelineHeader.tsx
│   ├── PipelineKanban.tsx
│   ├── PipelineList.tsx
│   ├── PipelineStats.tsx
│   ├── PipelineTable.tsx
│   ├── PipelineTableRow.tsx
│   ├── PipelineView.tsx
│   ├── ScheduleTaskModal.tsx
│   ├── StageColumn.tsx
│   ├── SwimLane.tsx
│   └── index.ts
├── hooks/
│   ├── __tests__/
│   │   ├── useGroupedDeals.test.ts
│   │   └── usePipelineDeals.test.ts
│   ├── useGroupedDeals.ts
│   ├── usePipelineDeals.ts
│   ├── usePipelineViewState.ts
│   └── index.ts
├── services/
│   ├── __tests__/
│   │   └── pipelineService.test.ts
│   └── pipelineService.ts
├── types/
│   └── index.ts
└── index.ts

supabase/migrations/
└── 00007_pipeline_view_functions.sql

e2e/
└── pipelines.spec.ts
```

---

## 10. Build Order

### Phase 1: Foundation (Day 1-2)
1. ✅ Database migration (00007_pipeline_view_functions.sql)
2. ✅ Types (src/features/pipelines/types/index.ts)
3. ✅ Service layer (pipelineService.ts)
4. ✅ Hooks (usePipelineDeals.ts, usePipelineViewState.ts, useGroupedDeals.ts)

### Phase 2: Core Kanban (Day 3-4)
5. ✅ DealCard component
6. ✅ DealCardActions component
7. ✅ StageColumn component
8. ✅ SwimLane component
9. ✅ PipelineKanban container

### Phase 3: Chrome & Filters (Day 5-6)
10. ✅ PipelineStats component
11. ✅ PipelineHeader component
12. ✅ PipelineFilters component
13. ✅ Saved views functionality

### Phase 4: Modals (Day 7)
14. ✅ CloseDealModal
15. ✅ LogCallModal
16. ✅ ScheduleTaskModal
17. ✅ MoveStageModal
18. ✅ ClosedDealsDrawer

### Phase 5: List View (Day 8)
19. ✅ PipelineTable
20. ✅ PipelineTableRow
21. ✅ PipelineList container

### Phase 6: Integration (Day 9)
22. ✅ PipelineView page component
23. ✅ Update Pipelines.tsx
24. ✅ URL state sync
25. ✅ Keyboard shortcuts

### Phase 7: Testing & Polish (Day 10)
26. ✅ Unit tests
27. ✅ E2E tests
28. ✅ Accessibility audit
29. ✅ Performance optimization
30. ✅ Documentation update

---

## Appendix: Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `k` | Toggle Kanban/List view |
| `g` then `v` | Group by Venture |
| `g` then `o` | Group by Owner |
| `g` then `n` | No grouping |
| `/` | Focus search |
| `?` | Show shortcuts help |
| `Escape` | Close modal/menu |

### Color Reference

| Venture | Hex | Usage |
|---------|-----|-------|
| Forge | #E85D04 | Badge, swim lane border |
| Hearth | #9D4EDD | Badge, swim lane border |
| Anvil | #0077B6 | Badge, swim lane border |
| Crucible | #2D6A4F | Badge, swim lane border |
| Foundry | #E63946 | Badge, swim lane border |
| Carbide | #1D3557 | Badge, swim lane border |
| Lucepta | #F4A261 | Badge, swim lane border |
| Meridian 44 | #118AB2 | Badge, swim lane border |
| Trade Stone | #6C757D | Badge, swim lane border |

| Attention State | Hex | Card Border |
|-----------------|-----|-------------|
| Stuck (14-29d) | #FFC107 | Left 3px solid |
| Very Stuck (30d+) | #DC3545 | Left 3px solid |
| Cold (7-13d) | #0DCAF0 | Left 3px solid |
| Ice Cold (14d+) | #0DCAF0 | Left 3px solid + icon |

---

*End of Pipeline View Redesign Specification*
