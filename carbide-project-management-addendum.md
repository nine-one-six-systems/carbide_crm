# Carbide CRM - Project Management PRD Addendum

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Development  
**Companion To:** carbide-prd-v2.md, carbide-technical-prd.md

---

## Overview

This addendum defines the **Project Management Module** — a lightweight project tracking layer designed for executive oversight of initiatives across the NineOneSix ecosystem. This module complements the existing CRM relationship pipelines by tracking projects and initiatives rather than sales/relationship progression.

### Design Philosophy

**Keep it simple.** The developer uses GitHub Projects for technical task management. This module is for high-level initiative tracking — answering "What are we working on?" not "What's the next code commit?"

---

## Table of Contents

1. [Purpose & User Stories](#1-purpose--user-stories)
2. [Module Scope](#2-module-scope)
3. [Data Model](#3-data-model)
4. [Information Architecture](#4-information-architecture)
5. [UI Specifications](#5-ui-specifications)
6. [Filtering & Views](#6-filtering--views)
7. [Technical Implementation](#7-technical-implementation)
8. [Database Schema](#8-database-schema)
9. [Type Definitions](#9-type-definitions)
10. [Component Architecture](#10-component-architecture)
11. [Routing & Navigation](#11-routing--navigation)
12. [Integration Points](#12-integration-points)
13. [Accessibility Requirements](#13-accessibility-requirements)
14. [Success Metrics](#14-success-metrics)

---

## 1. Purpose & User Stories

### Primary Purpose

Provide leadership with a centralized view to answer: *"What initiatives are we working on across our businesses, and what's their status?"*

### User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Executive | See all active projects across ventures | I understand where our effort is focused |
| Executive | Filter projects by venture, type, health, or owner | I can focus on specific areas |
| Executive | See project health at a glance | I can identify at-risk initiatives early |
| Executive | View project phases and milestones | I understand progress without micromanaging |
| Executive | Link to GitHub Projects | I can dive into technical details when needed |
| Executive | Associate projects with CRM entities | I see the full picture of client/partner work |
| Project Owner | Update project status quickly | Leadership stays informed with minimal overhead |
| Project Owner | Mark milestones complete | Progress is visible to stakeholders |

### What This Module is NOT

| This Module IS | This Module is NOT |
|----------------|-------------------|
| High-level initiative tracking | Task management (use GitHub Projects) |
| Executive visibility | Sprint planning tool |
| Cross-venture portfolio view | Time tracking system |
| Progress & health monitoring | Resource allocation tool |
| Milestone tracking | Detailed Gantt charting |

---

## 2. Module Scope

### Project Scope

Projects can be categorized as **Internal** or **External**:

| Scope | Definition | Examples |
|-------|------------|----------|
| **Internal** | NineOneSix-owned venture initiatives | Product launches, infrastructure upgrades, strategic initiatives within Forge/Hearth/etc. |
| **External** | Client, portfolio, or partnership work | Client delivery projects, portfolio company support, joint ventures |

### Project Categories

| Category | Description | Typical Scope |
|----------|-------------|---------------|
| **Product Development** | Building or enhancing products/services | Internal |
| **Client Delivery** | Work for paying clients | External |
| **Strategic Initiative** | Cross-venture or business development | Internal |
| **Operations/Infrastructure** | Internal systems, processes, tools | Internal |
| **Investment/Portfolio** | Portfolio company support, due diligence | External |

### Ventures

Projects can be tagged with one or more ventures from the NineOneSix ecosystem:

- Forge (Production software development)
- Hearth (Business architecture & advisory)
- Anvil (Operations management systems)
- Crucible (Peer network for founders)
- Foundry (Venture incubation & investment)
- Carbide (Sales & marketing solutions)
- Lucepta (Healthcare technology)
- Meridian 44 (Expert-owned AI platforms)
- Trade Stone Group (Financial engine & investor network)

---

## 3. Data Model

### Project Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | String | Yes | Project name |
| `description` | Text | No | Project description/summary |
| `scope` | Enum | Yes | `internal` or `external` |
| `category` | Enum | Yes | Project category (see above) |
| `status` | Enum | Yes | Current project status |
| `health` | Enum | Yes | Health indicator |
| `ventures` | Venture[] | Yes | Associated venture(s) |
| `owner_id` | UUID | Yes | Project owner (FK to profiles) |
| `start_date` | Date | No | Planned/actual start date |
| `target_date` | Date | No | Target completion date |
| `completed_date` | Date | No | Actual completion date |
| `github_project_url` | String | No | Link to GitHub Projects board |
| `created_at` | Timestamp | Yes | Record creation |
| `updated_at` | Timestamp | Yes | Last update |
| `created_by` | UUID | Yes | User who created |

### Project Status Lifecycle

```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌───────────┐
│  Draft  │ ──► │ Planning │ ──► │ Active │ ──► │ Completed │
└─────────┘     └──────────┘     └────────┘     └───────────┘
                     │                │
                     ▼                ▼
               ┌─────────┐      ┌───────────┐
               │ On Hold │ ◄──► │ Cancelled │
               └─────────┘      └───────────┘
```

| Status | Description |
|--------|-------------|
| **Draft** | Initial creation, not yet planned |
| **Planning** | Actively being scoped and planned |
| **Active** | In progress, work is happening |
| **On Hold** | Paused, waiting on external factors |
| **Completed** | Successfully finished |
| **Cancelled** | Abandoned, will not complete |

### Health Indicators

| Health | Description | Visual |
|--------|-------------|--------|
| **On Track** | Progressing as expected | 🟢 Green |
| **At Risk** | Potential issues, needs attention | 🟡 Yellow |
| **Blocked** | Cannot progress, intervention needed | 🔴 Red |
| **Not Started** | No health assessment yet (Draft status) | ⚪ Gray |

### Phase Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `project_id` | UUID | Yes | FK to projects |
| `name` | String | Yes | Phase name |
| `description` | Text | No | Phase description |
| `order` | Integer | Yes | Display order (1, 2, 3...) |
| `start_date` | Date | No | Optional start date |
| `target_date` | Date | No | Optional target date |
| `status` | Enum | Yes | `not_started`, `in_progress`, `completed` |
| `created_at` | Timestamp | Yes | Record creation |
| `updated_at` | Timestamp | Yes | Last update |

### Milestone Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `phase_id` | UUID | Yes | FK to phases |
| `name` | String | Yes | Milestone name |
| `description` | Text | No | Milestone description |
| `order` | Integer | Yes | Display order within phase |
| `target_date` | Date | No | Optional target date |
| `completed` | Boolean | Yes | Is milestone complete? |
| `completed_at` | Timestamp | No | When completed |
| `completed_by` | UUID | No | Who marked it complete |
| `created_at` | Timestamp | Yes | Record creation |
| `updated_at` | Timestamp | Yes | Last update |

### CRM Linkages

Projects can optionally link to existing Carbide CRM entities:

| Link Table | Description |
|------------|-------------|
| `project_contacts` | Links projects to contacts (e.g., client stakeholders) |
| `project_organizations` | Links projects to organizations (e.g., client company) |
| `project_relationships` | Links projects to business relationships (e.g., B2B client relationship) |

---

## 4. Information Architecture

### Navigation Placement

```
Carbide CRM
├── Home (Salesperson Dashboard)
├── Contacts
├── Organizations
├── Pipelines
│   ├── B2B Clients
│   ├── Investments
│   └── ... (other pipelines)
├── Projects  ◄── NEW MODULE
│   ├── All Projects (default view)
│   ├── By Venture
│   └── By Category
├── Tasks
├── Manager Dashboard
├── Leadership Dashboard
└── Admin
```

### Project List → Project Detail Hierarchy

```
Projects List View
├── Filters (Scope, Category, Venture, Status, Health, Owner)
├── Project Cards/Rows
│   └── Click → Project Detail View
│
Project Detail View
├── Header (Name, Status, Health, Owner, Dates)
├── Description
├── Metadata (Scope, Category, Ventures)
├── GitHub Link (if present)
├── Phases Section
│   ├── Phase 1
│   │   ├── Milestone 1.1 ☑
│   │   ├── Milestone 1.2 ☑
│   │   └── Milestone 1.3 ☐
│   ├── Phase 2
│   │   └── ...
│   └── [Add Phase]
├── Linked Entities Section
│   ├── Organizations
│   ├── Contacts
│   └── Business Relationships
└── Activity Log (status changes, milestone completions)
```

---

## 5. UI Specifications

### 5.1 Projects List View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Projects                                                      [+ New Project]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Scope: [All ▼] Category: [All ▼] Venture: [All ▼] Status: [All ▼] Health: [All ▼]│
│ Owner: [All ▼]                                                   [Reset Filters]│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SUMMARY                                                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │     12      │ │      8      │ │      3      │ │      1      │               │
│  │   Active    │ │  On Track   │ │  At Risk    │ │   Blocked   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 🟢 Carbide CRM v2 Launch                              [Active] [Internal]   ││
│  │    Product Development · Forge, Carbide · Sarah Chen                        ││
│  │    Target: Jan 15, 2025 · 6/10 milestones complete                          ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 🟡 Acme Corp Platform Build                           [Active] [External]   ││
│  │    Client Delivery · Forge · Dan Smith                                      ││
│  │    Target: Feb 28, 2025 · 3/8 milestones complete    [→ GitHub]             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 🔴 M44 Expert Onboarding System                       [Active] [Internal]   ││
│  │    Product Development · Meridian 44 · Mike Johnson                         ││
│  │    Target: Dec 31, 2024 · 2/5 milestones complete · BLOCKED                 ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ⚪ Trade Stone API Integration                         [Draft] [Internal]   ││
│  │    Operations/Infrastructure · Trade Stone Group · Lisa Park                ││
│  │    No dates set · 0/0 milestones                                            ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Project Detail View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Projects                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Carbide CRM v2 Launch                                              [Edit]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                 │
│  Status: [Active ▼]        Health: [🟢 On Track ▼]        Owner: Sarah Chen    │
│  Started: Nov 1, 2024      Target: Jan 15, 2025                                │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Internal · Product Development · Forge, Carbide                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  Complete rebuild of Carbide CRM with modern React/TypeScript stack,           │
│  multi-pipeline support, and leadership dashboard.                             │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PHASES & MILESTONES                                           [+ Add Phase]   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ▼ Phase 1: Foundation                           [Completed] Nov 1 - Nov 30  ││
│  │   ────────────────────────────────────────────────────────────────────────  ││
│  │   ☑ Database schema complete                                    Nov 10     ││
│  │   ☑ Auth system live                                            Nov 15     ││
│  │   ☑ Core CRUD operational                                       Nov 28     ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ▼ Phase 2: Features                             [In Progress] Dec 1 - Dec 31││
│  │   ────────────────────────────────────────────────────────────────────────  ││
│  │   ☑ Pipeline Kanban views                                       Dec 10     ││
│  │   ☑ Cadence system                                              Dec 15     ││
│  │   ☑ Task management                                             Dec 18     ││
│  │   ☐ Leadership Dashboard                                        Dec 28     ││
│  │   ☐ Manager Dashboard                                           Dec 31     ││
│  │                                                          [+ Add Milestone]  ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ▶ Phase 3: Polish & Launch                      [Not Started] Jan 1 - Jan 15││
│  │   2 milestones                                                              ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  LINKS                                                                          │
│                                                                                 │
│  GitHub Project: https://github.com/orgs/nine-one-six.../projects/3  [Open →]  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Linked Organizations                                      [+ Link Org]      ││
│  │ (none)                                                                      ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Linked Contacts                                        [+ Link Contact]     ││
│  │ (none)                                                                      ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ACTIVITY                                                                       │
│  ────────────────────────────────────────────────────────────────────────────   │
│  Dec 18 · Sarah Chen marked "Task management" complete                         │
│  Dec 15 · Sarah Chen marked "Cadence system" complete                          │
│  Dec 10 · Sarah Chen marked "Pipeline Kanban views" complete                   │
│  Dec 1  · Sarah Chen changed status: Planning → Active                         │
│  Dec 1  · Sarah Chen changed Phase 2 status: Not Started → In Progress         │
│  Nov 30 · Sarah Chen changed Phase 1 status: In Progress → Completed           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Project Create/Edit Modal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ New Project                                                              [×]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Project Name *                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  Description                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                                                                             ││
│  │                                                                             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌────────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Scope *                    │  │ Category *                               │  │
│  │ ○ Internal                 │  │ [Select category...              ▼]     │  │
│  │ ○ External                 │  │                                          │  │
│  └────────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                                 │
│  Ventures *                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ □ Forge  □ Hearth  □ Anvil  □ Crucible  □ Foundry                          ││
│  │ □ Carbide  □ Lucepta  □ Meridian 44  □ Trade Stone Group                   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  Owner *                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ [Select owner...                                                    ▼]     ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌──────────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ Start Date                       │  │ Target Date                        │  │
│  │ [      Pick a date...        📅] │  │ [      Pick a date...          📅] │  │
│  └──────────────────────────────────┘  └────────────────────────────────────┘  │
│                                                                                 │
│  GitHub Project URL                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ https://                                                                    ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                        [Cancel]  [Create Project]│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Filtering & Views

### Available Filters

| Filter | Options | Default |
|--------|---------|---------|
| **Scope** | All, Internal, External | All |
| **Category** | All, Product Development, Client Delivery, Strategic Initiative, Operations/Infrastructure, Investment/Portfolio | All |
| **Venture** | All, or multi-select from venture list | All |
| **Status** | All, Draft, Planning, Active, On Hold, Completed, Cancelled | All (or Active only) |
| **Health** | All, On Track, At Risk, Blocked | All |
| **Owner** | All, or select specific user | All |

### Filter Persistence

- Filters persist in URL query params for shareability
- Last-used filters stored in localStorage per user

### Quick Views (Optional Presets)

| Quick View | Filters Applied |
|------------|-----------------|
| **Active Projects** | Status = Active |
| **Needs Attention** | Health = At Risk OR Blocked |
| **My Projects** | Owner = Current User |
| **Internal Initiatives** | Scope = Internal |
| **Client Work** | Scope = External, Category = Client Delivery |

---

## 7. Technical Implementation

### Tech Stack Alignment

This module uses the same stack as the rest of Carbide:

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod |
| **Backend** | Supabase (PostgreSQL) |

### File Structure

```
src/
├── features/
│   └── projects/
│       ├── components/
│       │   ├── ProjectList.tsx
│       │   ├── ProjectCard.tsx
│       │   ├── ProjectDetail.tsx
│       │   ├── ProjectForm.tsx
│       │   ├── ProjectFilters.tsx
│       │   ├── ProjectSummaryCards.tsx
│       │   ├── PhaseList.tsx
│       │   ├── PhaseItem.tsx
│       │   ├── PhaseForm.tsx
│       │   ├── MilestoneItem.tsx
│       │   ├── MilestoneForm.tsx
│       │   ├── LinkedEntities.tsx
│       │   ├── ProjectActivityFeed.tsx
│       │   └── skeletons/
│       │       ├── ProjectListSkeleton.tsx
│       │       └── ProjectDetailSkeleton.tsx
│       ├── hooks/
│       │   ├── useProjects.ts
│       │   ├── useProject.ts
│       │   ├── useProjectFilters.ts
│       │   ├── useProjectMutations.ts
│       │   ├── usePhases.ts
│       │   └── useMilestones.ts
│       ├── services/
│       │   └── projectService.ts
│       ├── types/
│       │   └── project.types.ts
│       └── utils/
│           └── projectUtils.ts
├── pages/
│   └── projects/
│       ├── ProjectsPage.tsx
│       └── ProjectDetailPage.tsx
```

---

## 8. Database Schema

### Migration: XXXXXX_projects_module.sql

```sql
-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE project_scope AS ENUM ('internal', 'external');

CREATE TYPE project_category AS ENUM (
  'product_development',
  'client_delivery',
  'strategic_initiative',
  'operations_infrastructure',
  'investment_portfolio'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);

CREATE TYPE project_health AS ENUM (
  'not_started',
  'on_track',
  'at_risk',
  'blocked'
);

CREATE TYPE phase_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- =============================================================================
-- PROJECTS TABLE
-- =============================================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  scope project_scope NOT NULL,
  category project_category NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  health project_health NOT NULL DEFAULT 'not_started',
  ventures venture[] NOT NULL DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  start_date DATE,
  target_date DATE,
  completed_date DATE,
  github_project_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  CONSTRAINT ventures_not_empty CHECK (array_length(ventures, 1) > 0)
);

CREATE INDEX projects_scope_idx ON public.projects(scope);
CREATE INDEX projects_category_idx ON public.projects(category);
CREATE INDEX projects_status_idx ON public.projects(status);
CREATE INDEX projects_health_idx ON public.projects(health);
CREATE INDEX projects_owner_idx ON public.projects(owner_id);
CREATE INDEX projects_ventures_idx ON public.projects USING GIN(ventures);

-- =============================================================================
-- PHASES TABLE
-- =============================================================================

CREATE TABLE public.project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  start_date DATE,
  target_date DATE,
  status phase_status NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, "order")
);

CREATE INDEX phases_project_idx ON public.project_phases(project_id);
CREATE INDEX phases_status_idx ON public.project_phases(status);

-- =============================================================================
-- MILESTONES TABLE
-- =============================================================================

CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES public.project_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  target_date DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(phase_id, "order")
);

CREATE INDEX milestones_phase_idx ON public.project_milestones(phase_id);
CREATE INDEX milestones_completed_idx ON public.project_milestones(completed);

-- =============================================================================
-- CRM LINKAGE TABLES
-- =============================================================================

CREATE TABLE public.project_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role TEXT, -- e.g., "Stakeholder", "Technical Lead", "Sponsor"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, contact_id)
);

CREATE INDEX project_contacts_project_idx ON public.project_contacts(project_id);
CREATE INDEX project_contacts_contact_idx ON public.project_contacts(contact_id);

CREATE TABLE public.project_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT, -- e.g., "Client", "Partner", "Vendor"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, organization_id)
);

CREATE INDEX project_orgs_project_idx ON public.project_organizations(project_id);
CREATE INDEX project_orgs_org_idx ON public.project_organizations(organization_id);

CREATE TABLE public.project_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  relationship_id UUID NOT NULL REFERENCES public.business_relationships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(project_id, relationship_id)
);

CREATE INDEX project_rels_project_idx ON public.project_relationships(project_id);
CREATE INDEX project_rels_rel_idx ON public.project_relationships(relationship_id);

-- =============================================================================
-- PROJECT ACTIVITY LOG
-- =============================================================================

CREATE TABLE public.project_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  activity_type TEXT NOT NULL, -- 'status_change', 'health_change', 'milestone_completed', etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store old/new values, milestone_id, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX project_activities_project_idx ON public.project_activities(project_id);
CREATE INDEX project_activities_created_idx ON public.project_activities(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at
  BEFORE UPDATE ON public.project_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RLS POLICIES (Open access for now as requested)
-- =============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access (open access per requirements)
CREATE POLICY "Authenticated users can do anything with projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with phases"
  ON public.project_phases FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with milestones"
  ON public.project_milestones FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with project_contacts"
  ON public.project_contacts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with project_organizations"
  ON public.project_organizations FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with project_relationships"
  ON public.project_relationships FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do anything with project_activities"
  ON public.project_activities FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Helper Functions

```sql
-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get project with milestone counts
CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  scope project_scope,
  category project_category,
  status project_status,
  health project_health,
  ventures venture[],
  owner_name TEXT,
  start_date DATE,
  target_date DATE,
  total_milestones BIGINT,
  completed_milestones BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.scope,
    p.category,
    p.status,
    p.health,
    p.ventures,
    pr.full_name AS owner_name,
    p.start_date,
    p.target_date,
    COUNT(m.id) AS total_milestones,
    COUNT(m.id) FILTER (WHERE m.completed = TRUE) AS completed_milestones
  FROM projects p
  JOIN profiles pr ON p.owner_id = pr.id
  LEFT JOIN project_phases ph ON ph.project_id = p.id
  LEFT JOIN project_milestones m ON m.phase_id = ph.id
  WHERE p.id = p_project_id
  GROUP BY p.id, p.name, p.scope, p.category, p.status, p.health, 
           p.ventures, pr.full_name, p.start_date, p.target_date;
END;
$$ LANGUAGE plpgsql;

-- Get projects list with filters and milestone counts
CREATE OR REPLACE FUNCTION get_projects_list(
  p_scope project_scope DEFAULT NULL,
  p_category project_category DEFAULT NULL,
  p_status project_status DEFAULT NULL,
  p_health project_health DEFAULT NULL,
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  scope project_scope,
  category project_category,
  status project_status,
  health project_health,
  ventures venture[],
  owner_id UUID,
  owner_name TEXT,
  start_date DATE,
  target_date DATE,
  github_project_url TEXT,
  total_milestones BIGINT,
  completed_milestones BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.scope,
    p.category,
    p.status,
    p.health,
    p.ventures,
    p.owner_id,
    pr.full_name AS owner_name,
    p.start_date,
    p.target_date,
    p.github_project_url,
    COUNT(m.id) AS total_milestones,
    COUNT(m.id) FILTER (WHERE m.completed = TRUE) AS completed_milestones,
    p.created_at,
    p.updated_at
  FROM projects p
  JOIN profiles pr ON p.owner_id = pr.id
  LEFT JOIN project_phases ph ON ph.project_id = p.id
  LEFT JOIN project_milestones m ON m.phase_id = ph.id
  WHERE 
    (p_scope IS NULL OR p.scope = p_scope)
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_health IS NULL OR p.health = p_health)
    AND (p_venture IS NULL OR p_venture = ANY(p.ventures))
    AND (p_owner_id IS NULL OR p.owner_id = p_owner_id)
  GROUP BY p.id, p.name, p.scope, p.category, p.status, p.health, 
           p.ventures, p.owner_id, pr.full_name, p.start_date, 
           p.target_date, p.github_project_url, p.created_at, p.updated_at
  ORDER BY 
    CASE p.health 
      WHEN 'blocked' THEN 1 
      WHEN 'at_risk' THEN 2 
      WHEN 'on_track' THEN 3 
      ELSE 4 
    END,
    p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Type Definitions

### src/features/projects/types/project.types.ts

```typescript
import type { Venture } from '@/types/database';

// =============================================================================
// ENUMS
// =============================================================================

export type ProjectScope = 'internal' | 'external';

export type ProjectCategory =
  | 'product_development'
  | 'client_delivery'
  | 'strategic_initiative'
  | 'operations_infrastructure'
  | 'investment_portfolio';

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectHealth = 'not_started' | 'on_track' | 'at_risk' | 'blocked';

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

// =============================================================================
// CORE ENTITIES
// =============================================================================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  scope: ProjectScope;
  category: ProjectCategory;
  status: ProjectStatus;
  health: ProjectHealth;
  ventures: Venture[];
  ownerId: string;
  ownerName?: string;
  startDate: Date | null;
  targetDate: Date | null;
  completedDate: Date | null;
  githubProjectUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectWithStats extends Project {
  totalMilestones: number;
  completedMilestones: number;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  order: number;
  startDate: Date | null;
  targetDate: Date | null;
  status: PhaseStatus;
  createdAt: Date;
  updatedAt: Date;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  phaseId: string;
  name: string;
  description: string | null;
  order: number;
  targetDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// LINKED ENTITIES
// =============================================================================

export interface ProjectContact {
  id: string;
  projectId: string;
  contactId: string;
  role: string | null;
  createdAt: Date;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string[];
  };
}

export interface ProjectOrganization {
  id: string;
  projectId: string;
  organizationId: string;
  role: string | null;
  createdAt: Date;
  organization?: {
    id: string;
    name: string;
  };
}

export interface ProjectRelationship {
  id: string;
  projectId: string;
  relationshipId: string;
  createdAt: Date;
  relationship?: {
    id: string;
    type: string;
    stage: string;
  };
}

// =============================================================================
// ACTIVITY
// =============================================================================

export type ProjectActivityType =
  | 'created'
  | 'status_change'
  | 'health_change'
  | 'phase_status_change'
  | 'milestone_completed'
  | 'milestone_uncompleted'
  | 'phase_added'
  | 'milestone_added'
  | 'link_added'
  | 'link_removed'
  | 'updated';

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  activityType: ProjectActivityType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// =============================================================================
// FILTERS & PARAMS
// =============================================================================

export interface ProjectFilters {
  scope?: ProjectScope;
  category?: ProjectCategory;
  status?: ProjectStatus;
  health?: ProjectHealth;
  venture?: Venture;
  ownerId?: string;
}

export interface ProjectListParams extends ProjectFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'updated_at' | 'target_date' | 'health';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// PAYLOADS
// =============================================================================

export interface CreateProjectPayload {
  name: string;
  description?: string;
  scope: ProjectScope;
  category: ProjectCategory;
  ventures: Venture[];
  ownerId: string;
  startDate?: string;
  targetDate?: string;
  githubProjectUrl?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  scope?: ProjectScope;
  category?: ProjectCategory;
  status?: ProjectStatus;
  health?: ProjectHealth;
  ventures?: Venture[];
  ownerId?: string;
  startDate?: string | null;
  targetDate?: string | null;
  completedDate?: string | null;
  githubProjectUrl?: string | null;
}

export interface CreatePhasePayload {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdatePhasePayload {
  name?: string;
  description?: string;
  startDate?: string | null;
  targetDate?: string | null;
  status?: PhaseStatus;
}

export interface CreateMilestonePayload {
  phaseId: string;
  name: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateMilestonePayload {
  name?: string;
  description?: string;
  targetDate?: string | null;
  completed?: boolean;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export const PROJECT_SCOPE_LABELS: Record<ProjectScope, string> = {
  internal: 'Internal',
  external: 'External',
};

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  product_development: 'Product Development',
  client_delivery: 'Client Delivery',
  strategic_initiative: 'Strategic Initiative',
  operations_infrastructure: 'Operations/Infrastructure',
  investment_portfolio: 'Investment/Portfolio',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  not_started: 'Not Started',
  on_track: 'On Track',
  at_risk: 'At Risk',
  blocked: 'Blocked',
};

export const PROJECT_HEALTH_COLORS: Record<ProjectHealth, string> = {
  not_started: 'gray',
  on_track: 'green',
  at_risk: 'yellow',
  blocked: 'red',
};

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};
```

---

## 10. Component Architecture

### Key Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `ProjectList` | Main list view with filters | `initialFilters?` |
| `ProjectCard` | Single project in list | `project: ProjectWithStats` |
| `ProjectDetail` | Full project view | `projectId: string` |
| `ProjectForm` | Create/edit modal | `project?: Project`, `onSave`, `onCancel` |
| `ProjectFilters` | Filter controls | `filters`, `onChange` |
| `ProjectSummaryCards` | KPI cards (Active, On Track, etc.) | `projects: ProjectWithStats[]` |
| `PhaseList` | Phases accordion | `phases: Phase[]`, `projectId` |
| `PhaseItem` | Single phase with milestones | `phase: Phase`, `onUpdate` |
| `PhaseForm` | Add/edit phase | `phase?: Phase`, `onSave`, `onCancel` |
| `MilestoneItem` | Single milestone checkbox | `milestone: Milestone`, `onToggle` |
| `MilestoneForm` | Add/edit milestone | `milestone?: Milestone`, `onSave`, `onCancel` |
| `LinkedEntities` | Contacts, orgs, relationships | `projectId`, entity arrays |
| `ProjectActivityFeed` | Activity log | `activities: ProjectActivity[]` |

### Component Hierarchy

```
ProjectsPage
├── ProjectFilters
├── ProjectSummaryCards
└── ProjectList
    └── ProjectCard (×n)
        └── Click → Navigate to ProjectDetailPage

ProjectDetailPage
├── ProjectDetail
│   ├── Header (status/health dropdowns, edit button)
│   ├── Description
│   ├── Metadata badges
│   ├── GitHub link
│   ├── PhaseList
│   │   └── PhaseItem (×n)
│   │       ├── Phase header (name, dates, status)
│   │       └── MilestoneItem (×n)
│   │           └── Checkbox + name + target date
│   ├── LinkedEntities
│   │   ├── Organizations list
│   │   ├── Contacts list
│   │   └── Relationships list
│   └── ProjectActivityFeed
└── ProjectForm (modal, when editing)
```

---

## 11. Routing & Navigation

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/projects` | `ProjectsPage` | List view with filters |
| `/projects/:id` | `ProjectDetailPage` | Single project detail |

### Navigation Updates

Add to main sidebar navigation:

```typescript
// In navigation config
{
  name: 'Projects',
  href: '/projects',
  icon: FolderKanban, // from lucide-react
}
```

Position after Pipelines, before Tasks.

---

## 12. Integration Points

### CRM Entity Linking

When linking a project to CRM entities:

1. **Contact linking**: Use existing contact search/select component
2. **Organization linking**: Use existing organization search/select component
3. **Relationship linking**: Show relationships for linked contacts/orgs

### GitHub Projects

The `github_project_url` field stores a simple URL. The UI shows:
- A clickable "View on GitHub" link that opens in new tab
- No API integration — just a navigation link

### Activity Logging

Log activities for:
- Project created
- Status changed (with old → new values)
- Health changed (with old → new values)
- Phase status changed
- Milestone completed/uncompleted
- Entity linked/unlinked

---

## 13. Accessibility Requirements

Follow existing Carbide accessibility patterns:

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | All interactive elements focusable, logical tab order |
| **Screen readers** | Proper ARIA labels, live regions for status changes |
| **Color contrast** | Health indicators have text labels, not just colors |
| **Focus indicators** | Visible focus rings on all interactive elements |
| **Form labels** | All inputs have associated labels |

### Health Indicator Accessibility

Never rely on color alone:
- 🟢 **On Track** (green + text label)
- 🟡 **At Risk** (yellow + text label)
- 🔴 **Blocked** (red + text label)
- ⚪ **Not Started** (gray + text label)

---

## 14. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Adoption** | 100% of active projects tracked | Count of projects created |
| **Update frequency** | Projects updated weekly | Avg days between updates |
| **Milestone completion** | 80%+ milestones completed on time | Completed vs target date |
| **Executive engagement** | Weekly dashboard views | Analytics on /projects views |
| **Time to update** | <2 min to update status/milestone | User testing |

---

## Appendix A: Display Constants

### Add to src/lib/constants.ts

```typescript
import type { 
  ProjectScope, 
  ProjectCategory, 
  ProjectStatus, 
  ProjectHealth 
} from '@/features/projects/types/project.types';

export const PROJECT_SCOPES: Array<{ value: ProjectScope; label: string }> = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
];

export const PROJECT_CATEGORIES: Array<{ value: ProjectCategory; label: string }> = [
  { value: 'product_development', label: 'Product Development' },
  { value: 'client_delivery', label: 'Client Delivery' },
  { value: 'strategic_initiative', label: 'Strategic Initiative' },
  { value: 'operations_infrastructure', label: 'Operations/Infrastructure' },
  { value: 'investment_portfolio', label: 'Investment/Portfolio' },
];

export const PROJECT_STATUSES: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PROJECT_HEALTH_OPTIONS: Array<{ 
  value: ProjectHealth; 
  label: string; 
  color: string;
  icon: string;
}> = [
  { value: 'not_started', label: 'Not Started', color: 'gray', icon: '⚪' },
  { value: 'on_track', label: 'On Track', color: 'green', icon: '🟢' },
  { value: 'at_risk', label: 'At Risk', color: 'yellow', icon: '🟡' },
  { value: 'blocked', label: 'Blocked', color: 'red', icon: '🔴' },
];
```

---

## Appendix B: Sample Data

```sql
-- Sample project
INSERT INTO projects (name, description, scope, category, status, health, ventures, owner_id, start_date, target_date, github_project_url, created_by)
VALUES (
  'Carbide CRM v2 Launch',
  'Complete rebuild of Carbide CRM with modern React/TypeScript stack, multi-pipeline support, and leadership dashboard.',
  'internal',
  'product_development',
  'active',
  'on_track',
  ARRAY['forge', 'carbide']::venture[],
  '{{owner_uuid}}',
  '2024-11-01',
  '2025-01-15',
  'https://github.com/orgs/nine-one-six-systems/projects/3',
  '{{creator_uuid}}'
);

-- Sample phases
INSERT INTO project_phases (project_id, name, description, "order", start_date, target_date, status)
VALUES 
  ('{{project_uuid}}', 'Foundation', 'Core infrastructure and database setup', 1, '2024-11-01', '2024-11-30', 'completed'),
  ('{{project_uuid}}', 'Features', 'Build out main CRM features', 2, '2024-12-01', '2024-12-31', 'in_progress'),
  ('{{project_uuid}}', 'Polish & Launch', 'Testing, bug fixes, and production deployment', 3, '2025-01-01', '2025-01-15', 'not_started');

-- Sample milestones
INSERT INTO project_milestones (phase_id, name, "order", target_date, completed, completed_at)
VALUES
  ('{{phase1_uuid}}', 'Database schema complete', 1, '2024-11-10', TRUE, '2024-11-10'),
  ('{{phase1_uuid}}', 'Auth system live', 2, '2024-11-15', TRUE, '2024-11-15'),
  ('{{phase1_uuid}}', 'Core CRUD operational', 3, '2024-11-28', TRUE, '2024-11-28'),
  ('{{phase2_uuid}}', 'Pipeline Kanban views', 1, '2024-12-10', TRUE, '2024-12-10'),
  ('{{phase2_uuid}}', 'Cadence system', 2, '2024-12-15', TRUE, '2024-12-15'),
  ('{{phase2_uuid}}', 'Task management', 3, '2024-12-18', TRUE, '2024-12-18'),
  ('{{phase2_uuid}}', 'Leadership Dashboard', 4, '2024-12-28', FALSE, NULL),
  ('{{phase2_uuid}}', 'Manager Dashboard', 5, '2024-12-31', FALSE, NULL),
  ('{{phase3_uuid}}', 'Beta testing complete', 1, '2025-01-10', FALSE, NULL),
  ('{{phase3_uuid}}', 'Production deploy', 2, '2025-01-15', FALSE, NULL);
```

---

*End of Project Management PRD Addendum*
