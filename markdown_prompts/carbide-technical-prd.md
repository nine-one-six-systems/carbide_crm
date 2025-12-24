# Carbide CRM - Technical PRD

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Development  
**Companion To:** carbide-prd-v2.md (Business Requirements)

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Project Structure](#2-project-structure)
3. [Database Schema (Supabase)](#3-database-schema-supabase)
4. [Type Definitions](#4-type-definitions)
5. [API Layer Architecture](#5-api-layer-architecture)
6. [State Management](#6-state-management)
7. [Routing Structure](#7-routing-structure)
8. [Component Architecture](#8-component-architecture)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Real-time Features](#10-real-time-features)
11. [Performance Optimization](#11-performance-optimization)
12. [Testing Strategy](#12-testing-strategy)
13. [Accessibility Requirements](#13-accessibility-requirements)
14. [Security Considerations](#14-security-considerations)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)
16. [Development Workflow](#16-development-workflow)

---

## 1. Tech Stack Overview

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Build Tool** | Vite | 5.x | Fast development & optimized builds |
| **Framework** | React | 18.x | UI component library |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible component primitives |
| **Backend** | Supabase | Latest | PostgreSQL, Auth, Realtime, Storage |
| **Hosting** | Vercel | Latest | Edge deployment, preview environments |

### Key Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| **Data Fetching** | TanStack Query (React Query) v5 | Server state, caching, mutations |
| **Forms** | React Hook Form + Zod | Form state, validation |
| **Routing** | React Router v6 | Client-side routing |
| **Tables** | TanStack Table v8 | Data tables with sorting, filtering |
| **Drag & Drop** | @dnd-kit | Kanban boards, sortable lists |
| **Date Handling** | date-fns | Date formatting and manipulation |
| **Icons** | Lucide React | Consistent icon set |
| **Toast/Notifications** | Sonner | Toast notifications |
| **Charts** | Recharts | Dashboard visualizations |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Pre-commit linting |
| Vitest | Unit testing |
| Playwright | E2E testing |
| TypeScript strict mode | Enhanced type checking |

---

## 2. Project Structure

```
carbide/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       └── preview.yml            # Preview deployments
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                    # Static assets (images, fonts)
│   ├── components/                # Shared UI components
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/               # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── data-display/         # Data presentation components
│   │   │   ├── DataTable.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   └── ActivityFeed.tsx
│   │   └── forms/                # Form components
│   │       ├── ContactForm.tsx
│   │       ├── OrganizationForm.tsx
│   │       └── TaskForm.tsx
│   ├── features/                  # Feature modules (domain-driven)
│   │   ├── contacts/
│   │   │   ├── components/
│   │   │   │   ├── ContactCard.tsx
│   │   │   │   ├── ContactDetail.tsx
│   │   │   │   ├── ContactList.tsx
│   │   │   │   └── ContactSidebar.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useContact.ts
│   │   │   │   ├── useContacts.ts
│   │   │   │   └── useContactMutations.ts
│   │   │   ├── services/
│   │   │   │   └── contactService.ts
│   │   │   ├── types/
│   │   │   │   └── contact.types.ts
│   │   │   └── index.ts
│   │   ├── organizations/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── relationships/         # Business relationships (pipelines)
│   │   │   ├── components/
│   │   │   │   ├── PipelineKanban.tsx
│   │   │   │   ├── RelationshipCard.tsx
│   │   │   │   └── StageSelector.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── cadences/
│   │   │   ├── components/
│   │   │   │   ├── CadenceBuilder.tsx
│   │   │   │   ├── CadenceList.tsx
│   │   │   │   └── ApplyCadenceDialog.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── BatchTaskView.tsx
│   │   │   │   └── TaskCard.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── activities/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── SalespersonDashboard.tsx
│   │   │   │   ├── ManagerDashboard.tsx
│   │   │   │   └── DashboardWidgets/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   └── ProtectedRoute.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts
│   │       └── context/
│   │           └── AuthContext.tsx
│   ├── hooks/                     # Shared custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── useKeyboardShortcut.ts
│   ├── lib/                       # Utility libraries
│   │   ├── supabase/
│   │   │   ├── client.ts          # Supabase client initialization
│   │   │   ├── database.types.ts  # Generated types from Supabase
│   │   │   └── middleware.ts
│   │   ├── utils.ts               # General utilities
│   │   ├── formatters.ts          # Date, currency, phone formatters
│   │   └── validators.ts          # Zod schemas
│   ├── pages/                     # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── Contacts.tsx
│   │   ├── ContactDetail.tsx
│   │   ├── Organizations.tsx
│   │   ├── OrganizationDetail.tsx
│   │   ├── Pipelines.tsx
│   │   ├── Tasks.tsx
│   │   ├── Cadences.tsx
│   │   ├── Settings.tsx
│   │   └── NotFound.tsx
│   ├── stores/                    # Global state (if needed beyond React Query)
│   │   └── uiStore.ts             # UI preferences, sidebar state
│   ├── types/                     # Shared TypeScript types
│   │   ├── database.ts            # Database entity types
│   │   ├── api.ts                 # API response types
│   │   └── enums.ts               # Shared enumerations
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   ├── router.tsx                 # Route definitions
│   └── index.css                  # Global styles + Tailwind
├── supabase/
│   ├── migrations/                # Database migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_functions.sql
│   ├── seed.sql                   # Development seed data
│   └── config.toml                # Supabase project config
├── tests/
│   ├── unit/                      # Vitest unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # Playwright E2E tests
├── .env.example
├── .env.local                     # Local env (gitignored)
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

### Feature Module Structure

Each feature follows a consistent pattern:

```
features/{feature}/
├── components/          # Feature-specific React components
├── hooks/               # Custom hooks for data fetching and state
├── services/            # API service functions
├── types/               # Feature-specific TypeScript types
├── utils/               # Feature-specific utilities (if needed)
└── index.ts             # Public exports
```

---

## 3. Database Schema (Supabase)

### Migration: 00001_initial_schema.sql

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');

CREATE TYPE organization_type AS ENUM (
  'company', 'fund', 'agency', 'non_profit', 'government', 'other'
);

CREATE TYPE role_type AS ENUM (
  'executive', 'employee', 'founder', 'board_member', 
  'advisor', 'investor', 'consultant', 'partner', 'other'
);

CREATE TYPE primary_relationship_role AS ENUM (
  'spouse', 'partner', 'child', 'parent', 'sibling'
);

CREATE TYPE secondary_relationship_type AS ENUM (
  'parent_child', 'sibling', 'colleague', 'former_colleague',
  'manager_reports_to', 'mentor_mentee', 'referral_source',
  'business_partner', 'friend', 'other'
);

CREATE TYPE business_relationship_type AS ENUM (
  'b2b_client', 'b2c_client', 'non_business_investment',
  'business_investment_external', 'internal_business_opportunity',
  'portfolio_company', 'partnership_opportunity', 
  'individual_partnership', 'investor', 'meridian_44_participant'
);

CREATE TYPE task_type AS ENUM (
  'call', 'email', 'text', 'meeting', 'send_mailer', 'other'
);

CREATE TYPE task_status AS ENUM (
  'pending', 'completed', 'triaged', 'dismissed'
);

CREATE TYPE cadence_status AS ENUM (
  'active', 'paused', 'completed', 'cleared'
);

CREATE TYPE activity_type AS ENUM (
  'call_inbound', 'call_outbound', 'email_inbound', 'email_outbound',
  'text_inbound', 'text_outbound', 'meeting_in_person', 'meeting_virtual',
  'note', 'stage_change', 'relationship_created', 'cadence_applied',
  'cadence_cleared', 'cadence_paused', 'cadence_resumed',
  'task_completed', 'task_triaged', 'task_dismissed'
);

CREATE TYPE venture AS ENUM (
  'forge', 'hearth', 'anvil', 'crucible', 'foundry', 
  'carbide', 'lucepta', 'meridian_44', 'trade_stone_group'
);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  emails JSONB DEFAULT '[]'::jsonb,          -- [{value: string, label: string, is_primary: boolean}]
  phones JSONB DEFAULT '[]'::jsonb,          -- [{value: string, label: string, is_primary: boolean}]
  addresses JSONB DEFAULT '[]'::jsonb,       -- [{street, city, state, zip, country, label}]
  job_title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(job_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED
);

CREATE INDEX contacts_search_idx ON public.contacts USING GIN(search_vector);
CREATE INDEX contacts_tags_idx ON public.contacts USING GIN(tags);
CREATE INDEX contacts_created_by_idx ON public.contacts(created_by);

-- Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type organization_type,
  industry TEXT,
  website TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  logo_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(industry, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED
);

CREATE INDEX organizations_search_idx ON public.organizations USING GIN(search_vector);
CREATE INDEX organizations_tags_idx ON public.organizations USING GIN(tags);

-- Contact-Organization Links
CREATE TABLE public.contact_organization_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role_title TEXT,
  role_type role_type,
  is_primary BOOLEAN DEFAULT false,
  is_current BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(contact_id, organization_id, role_title)
);

CREATE INDEX contact_org_links_contact_idx ON public.contact_organization_links(contact_id);
CREATE INDEX contact_org_links_org_idx ON public.contact_organization_links(organization_id);

-- =============================================================================
-- INTERPERSONAL RELATIONSHIPS
-- =============================================================================

-- Primary Relationship Groups (Households/Families)
CREATE TABLE public.primary_relationship_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary Relationship Members
CREATE TABLE public.primary_relationship_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.primary_relationship_groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role primary_relationship_role NOT NULL,
  is_adult BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, contact_id)
);

CREATE INDEX primary_rel_members_contact_idx ON public.primary_relationship_members(contact_id);
CREATE INDEX primary_rel_members_group_idx ON public.primary_relationship_members(group_id);

-- Secondary Relationships (Person-to-Person)
CREATE TABLE public.secondary_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  related_contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  relationship_type secondary_relationship_type NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(contact_id, related_contact_id),
  CHECK(contact_id != related_contact_id)
);

CREATE INDEX secondary_rel_contact_idx ON public.secondary_relationships(contact_id);
CREATE INDEX secondary_rel_related_idx ON public.secondary_relationships(related_contact_id);

-- =============================================================================
-- BUSINESS RELATIONSHIPS (PIPELINES)
-- =============================================================================

CREATE TABLE public.business_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type business_relationship_type NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  ventures venture[] DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  attributes JSONB DEFAULT '{}'::jsonb,      -- Type-specific fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- At least one of contact_id or organization_id must be set
  CHECK(contact_id IS NOT NULL OR organization_id IS NOT NULL)
);

CREATE INDEX biz_rel_type_idx ON public.business_relationships(type);
CREATE INDEX biz_rel_contact_idx ON public.business_relationships(contact_id);
CREATE INDEX biz_rel_org_idx ON public.business_relationships(organization_id);
CREATE INDEX biz_rel_owner_idx ON public.business_relationships(owner_id);
CREATE INDEX biz_rel_stage_idx ON public.business_relationships(stage);
CREATE INDEX biz_rel_ventures_idx ON public.business_relationships USING GIN(ventures);

-- =============================================================================
-- CADENCE SYSTEM
-- =============================================================================

-- Cadence Templates
CREATE TABLE public.cadence_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  relationship_types business_relationship_type[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cadence Steps
CREATE TABLE public.cadence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadence_id UUID NOT NULL REFERENCES public.cadence_templates(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  task_type task_type NOT NULL,
  day_offset INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  
  UNIQUE(cadence_id, step_number)
);

CREATE INDEX cadence_steps_cadence_idx ON public.cadence_steps(cadence_id);

-- Applied Cadences
CREATE TABLE public.applied_cadences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadence_template_id UUID NOT NULL REFERENCES public.cadence_templates(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES public.business_relationships(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  status cadence_status NOT NULL DEFAULT 'active',
  paused_at TIMESTAMPTZ,
  paused_days INTEGER DEFAULT 0,              -- Accumulated pause duration
  applied_by UUID NOT NULL REFERENCES public.profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleared_by UUID REFERENCES public.profiles(id),
  cleared_at TIMESTAMPTZ,
  clear_reason TEXT
);

CREATE INDEX applied_cadences_contact_idx ON public.applied_cadences(contact_id);
CREATE INDEX applied_cadences_status_idx ON public.applied_cadences(status);

-- Cadence Tasks
CREATE TABLE public.cadence_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applied_cadence_id UUID NOT NULL REFERENCES public.applied_cadences(id) ON DELETE CASCADE,
  cadence_step_id UUID NOT NULL REFERENCES public.cadence_steps(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX cadence_tasks_contact_idx ON public.cadence_tasks(contact_id);
CREATE INDEX cadence_tasks_assigned_idx ON public.cadence_tasks(assigned_to);
CREATE INDEX cadence_tasks_due_date_idx ON public.cadence_tasks(due_date);
CREATE INDEX cadence_tasks_status_idx ON public.cadence_tasks(status);

-- Manual Tasks
CREATE TABLE public.manual_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES public.business_relationships(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  task_type task_type,
  due_date DATE NOT NULL,
  status task_status NOT NULL DEFAULT 'pending',
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX manual_tasks_contact_idx ON public.manual_tasks(contact_id);
CREATE INDEX manual_tasks_assigned_idx ON public.manual_tasks(assigned_to);
CREATE INDEX manual_tasks_due_date_idx ON public.manual_tasks(due_date);
CREATE INDEX manual_tasks_status_idx ON public.manual_tasks(status);

-- =============================================================================
-- ACTIVITY TRACKING
-- =============================================================================

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type activity_type NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES public.business_relationships(id) ON DELETE SET NULL,
  cadence_task_id UUID REFERENCES public.cadence_tasks(id) ON DELETE SET NULL,
  manual_task_id UUID REFERENCES public.manual_tasks(id) ON DELETE SET NULL,
  subject TEXT,
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  logged_by UUID NOT NULL REFERENCES public.profiles(id),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb           -- Additional context (e.g., stage_from, stage_to)
);

CREATE INDEX activities_contact_idx ON public.activities(contact_id);
CREATE INDEX activities_org_idx ON public.activities(organization_id);
CREATE INDEX activities_occurred_at_idx ON public.activities(occurred_at DESC);
CREATE INDEX activities_type_idx ON public.activities(type);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_org_links_updated_at
  BEFORE UPDATE ON public.contact_organization_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_biz_relationships_updated_at
  BEFORE UPDATE ON public.business_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cadence_templates_updated_at
  BEFORE UPDATE ON public.cadence_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate cadence tasks when cadence is applied
CREATE OR REPLACE FUNCTION generate_cadence_tasks()
RETURNS TRIGGER AS $$
DECLARE
  step RECORD;
BEGIN
  FOR step IN 
    SELECT * FROM public.cadence_steps 
    WHERE cadence_id = NEW.cadence_template_id 
    ORDER BY step_number
  LOOP
    INSERT INTO public.cadence_tasks (
      applied_cadence_id,
      cadence_step_id,
      contact_id,
      due_date,
      assigned_to
    ) VALUES (
      NEW.id,
      step.id,
      NEW.contact_id,
      NEW.start_date + step.day_offset,
      NEW.applied_by
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_cadence_tasks_trigger
  AFTER INSERT ON public.applied_cadences
  FOR EACH ROW EXECUTE FUNCTION generate_cadence_tasks();

-- Create inverse secondary relationship
CREATE OR REPLACE FUNCTION create_inverse_relationship()
RETURNS TRIGGER AS $$
DECLARE
  inverse_type secondary_relationship_type;
BEGIN
  -- Determine inverse type
  inverse_type := CASE NEW.relationship_type
    WHEN 'parent_child' THEN 'parent_child'::secondary_relationship_type
    WHEN 'manager_reports_to' THEN 'manager_reports_to'::secondary_relationship_type
    WHEN 'mentor_mentee' THEN 'mentor_mentee'::secondary_relationship_type
    WHEN 'referral_source' THEN 'referral_source'::secondary_relationship_type
    ELSE NEW.relationship_type
  END;
  
  -- Insert inverse if it doesn't exist
  INSERT INTO public.secondary_relationships (
    contact_id,
    related_contact_id,
    relationship_type,
    notes,
    created_by
  ) VALUES (
    NEW.related_contact_id,
    NEW.contact_id,
    inverse_type,
    NEW.notes,
    NEW.created_by
  ) ON CONFLICT (contact_id, related_contact_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_inverse_relationship_trigger
  AFTER INSERT ON public.secondary_relationships
  FOR EACH ROW EXECUTE FUNCTION create_inverse_relationship();

-- Function to get all tasks (cadence + manual) for a user
CREATE OR REPLACE FUNCTION get_user_tasks(
  p_user_id UUID,
  p_status task_status[] DEFAULT ARRAY['pending']::task_status[],
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  task_source TEXT,
  title TEXT,
  task_type task_type,
  contact_id UUID,
  contact_name TEXT,
  due_date DATE,
  status task_status,
  cadence_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Cadence tasks
  SELECT 
    ct.id,
    'cadence'::TEXT as task_source,
    cs.name as title,
    cs.task_type,
    ct.contact_id,
    c.first_name || ' ' || c.last_name as contact_name,
    ct.due_date,
    ct.status,
    cadt.name as cadence_name
  FROM public.cadence_tasks ct
  JOIN public.cadence_steps cs ON ct.cadence_step_id = cs.id
  JOIN public.applied_cadences ac ON ct.applied_cadence_id = ac.id
  JOIN public.cadence_templates cadt ON ac.cadence_template_id = cadt.id
  JOIN public.contacts c ON ct.contact_id = c.id
  WHERE ct.assigned_to = p_user_id
    AND ct.status = ANY(p_status)
    AND (p_from_date IS NULL OR ct.due_date >= p_from_date)
    AND (p_to_date IS NULL OR ct.due_date <= p_to_date)
  
  UNION ALL
  
  -- Manual tasks
  SELECT 
    mt.id,
    'manual'::TEXT as task_source,
    mt.title,
    mt.task_type,
    mt.contact_id,
    CASE 
      WHEN mt.contact_id IS NOT NULL 
        THEN c.first_name || ' ' || c.last_name 
      ELSE o.name 
    END as contact_name,
    mt.due_date,
    mt.status,
    NULL::TEXT as cadence_name
  FROM public.manual_tasks mt
  LEFT JOIN public.contacts c ON mt.contact_id = c.id
  LEFT JOIN public.organizations o ON mt.organization_id = o.id
  WHERE mt.assigned_to = p_user_id
    AND mt.status = ANY(p_status)
    AND (p_from_date IS NULL OR mt.due_date >= p_from_date)
    AND (p_to_date IS NULL OR mt.due_date <= p_to_date)
    
  ORDER BY due_date ASC;
END;
$$ LANGUAGE plpgsql;
```

### Migration: 00002_rls_policies.sql

```sql
-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_organization_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_relationship_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_relationship_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondary_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- POLICIES: Transparent team model - all authenticated users can see all data
-- =============================================================================

-- Profiles
CREATE POLICY "Profiles are viewable by all authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Contacts (full visibility)
CREATE POLICY "Contacts are viewable by all authenticated users"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can delete contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (is_manager_or_admin());

-- Organizations (full visibility)
CREATE POLICY "Organizations are viewable by all authenticated users"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can delete organizations"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (is_manager_or_admin());

-- Contact-Organization Links
CREATE POLICY "Contact org links are viewable by all authenticated users"
  ON public.contact_organization_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage contact org links"
  ON public.contact_organization_links FOR ALL
  TO authenticated
  USING (true);

-- Primary Relationships
CREATE POLICY "Primary relationship groups are viewable by all"
  ON public.primary_relationship_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage primary relationship groups"
  ON public.primary_relationship_groups FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Primary relationship members are viewable by all"
  ON public.primary_relationship_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage primary relationship members"
  ON public.primary_relationship_members FOR ALL
  TO authenticated
  USING (true);

-- Secondary Relationships
CREATE POLICY "Secondary relationships are viewable by all authenticated users"
  ON public.secondary_relationships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage secondary relationships"
  ON public.secondary_relationships FOR ALL
  TO authenticated
  USING (true);

-- Business Relationships
CREATE POLICY "Business relationships are viewable by all authenticated users"
  ON public.business_relationships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create business relationships"
  ON public.business_relationships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Relationship owners and managers can update"
  ON public.business_relationships FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR is_manager_or_admin());

CREATE POLICY "Managers and admins can delete business relationships"
  ON public.business_relationships FOR DELETE
  TO authenticated
  USING (is_manager_or_admin());

-- Cadence Templates (admin only for CUD)
CREATE POLICY "Cadence templates are viewable by all authenticated users"
  ON public.cadence_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage cadence templates"
  ON public.cadence_templates FOR ALL
  TO authenticated
  USING (is_admin());

-- Cadence Steps
CREATE POLICY "Cadence steps are viewable by all authenticated users"
  ON public.cadence_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage cadence steps"
  ON public.cadence_steps FOR ALL
  TO authenticated
  USING (is_admin());

-- Applied Cadences
CREATE POLICY "Applied cadences are viewable by all authenticated users"
  ON public.applied_cadences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can apply cadences"
  ON public.applied_cadences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applied_by);

CREATE POLICY "Users can update their applied cadences, managers can update any"
  ON public.applied_cadences FOR UPDATE
  TO authenticated
  USING (applied_by = auth.uid() OR is_manager_or_admin());

-- Cadence Tasks
CREATE POLICY "Cadence tasks are viewable by all authenticated users"
  ON public.cadence_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Assigned users and managers can update cadence tasks"
  ON public.cadence_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid() OR is_manager_or_admin());

-- Manual Tasks
CREATE POLICY "Manual tasks are viewable by all authenticated users"
  ON public.manual_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create manual tasks"
  ON public.manual_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assigned users and managers can update manual tasks"
  ON public.manual_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid() OR is_manager_or_admin());

CREATE POLICY "Managers and admins can delete manual tasks"
  ON public.manual_tasks FOR DELETE
  TO authenticated
  USING (is_manager_or_admin());

-- Activities
CREATE POLICY "Activities are viewable by all authenticated users"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = logged_by);
```

### Pipeline Stages Configuration

Store pipeline stage definitions as a reference (could be in a lookup table or config):

```sql
-- Optional: Pipeline Stages Lookup Table
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_type business_relationship_type NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  is_terminal BOOLEAN DEFAULT false,
  terminal_type TEXT,  -- 'won', 'lost', 'active', 'churned', etc.
  
  UNIQUE(relationship_type, stage_name)
);

-- Insert pipeline stages
INSERT INTO public.pipeline_stages (relationship_type, stage_name, stage_order, is_terminal, terminal_type) VALUES
-- B2B Clients
('b2b_client', 'Lead', 1, false, null),
('b2b_client', 'Qualified', 2, false, null),
('b2b_client', 'Discovery', 3, false, null),
('b2b_client', 'Proposal', 4, false, null),
('b2b_client', 'Negotiation', 5, false, null),
('b2b_client', 'Won', 6, true, 'won'),
('b2b_client', 'Lost', 6, true, 'lost'),
('b2b_client', 'Active', 7, false, null),
('b2b_client', 'Churned', 8, true, 'churned'),

-- B2C Clients
('b2c_client', 'Lead', 1, false, null),
('b2c_client', 'Qualified', 2, false, null),
('b2c_client', 'Discovery', 3, false, null),
('b2c_client', 'Proposal', 4, false, null),
('b2c_client', 'Negotiation', 5, false, null),
('b2c_client', 'Won', 6, true, 'won'),
('b2c_client', 'Lost', 6, true, 'lost'),
('b2c_client', 'Active', 7, false, null),
('b2c_client', 'Churned', 8, true, 'churned'),

-- Investor Pipeline
('investor', 'Prospect', 1, false, null),
('investor', 'Contacted', 2, false, null),
('investor', 'Interested', 3, false, null),
('investor', 'Meeting', 4, false, null),
('investor', 'Due Diligence', 5, false, null),
('investor', 'Terms', 6, false, null),
('investor', 'Committed', 7, false, null),
('investor', 'Funded', 8, false, null),
('investor', 'Active', 9, false, null),
('investor', 'Passed', 6, true, 'lost'),

-- Meridian 44 Participants
('meridian_44_participant', 'Identified', 1, false, null),
('meridian_44_participant', 'Outreach', 2, false, null),
('meridian_44_participant', 'Interested', 3, false, null),
('meridian_44_participant', 'Onboarding', 4, false, null),
('meridian_44_participant', 'Active Contributor', 5, false, null),
('meridian_44_participant', 'Inactive', 6, true, 'churned'),
('meridian_44_participant', 'Declined', 3, true, 'lost');
```

---

## 4. Type Definitions

### src/types/database.ts

```typescript
// Generated types from Supabase (use `supabase gen types typescript`)
// These are the core entity types

export type UserRole = 'admin' | 'manager' | 'user';

export type OrganizationType = 
  | 'company' 
  | 'fund' 
  | 'agency' 
  | 'non_profit' 
  | 'government' 
  | 'other';

export type RoleType = 
  | 'executive' 
  | 'employee' 
  | 'founder' 
  | 'board_member'
  | 'advisor' 
  | 'investor' 
  | 'consultant' 
  | 'partner' 
  | 'other';

export type PrimaryRelationshipRole = 
  | 'spouse' 
  | 'partner' 
  | 'child' 
  | 'parent' 
  | 'sibling';

export type SecondaryRelationshipType = 
  | 'parent_child'
  | 'sibling'
  | 'colleague'
  | 'former_colleague'
  | 'manager_reports_to'
  | 'mentor_mentee'
  | 'referral_source'
  | 'business_partner'
  | 'friend'
  | 'other';

export type BusinessRelationshipType = 
  | 'b2b_client'
  | 'b2c_client'
  | 'non_business_investment'
  | 'business_investment_external'
  | 'internal_business_opportunity'
  | 'portfolio_company'
  | 'partnership_opportunity'
  | 'individual_partnership'
  | 'investor'
  | 'meridian_44_participant';

export type TaskType = 
  | 'call' 
  | 'email' 
  | 'text' 
  | 'meeting' 
  | 'send_mailer' 
  | 'other';

export type TaskStatus = 
  | 'pending' 
  | 'completed' 
  | 'triaged' 
  | 'dismissed';

export type CadenceStatus = 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'cleared';

export type ActivityType = 
  | 'call_inbound'
  | 'call_outbound'
  | 'email_inbound'
  | 'email_outbound'
  | 'text_inbound'
  | 'text_outbound'
  | 'meeting_in_person'
  | 'meeting_virtual'
  | 'note'
  | 'stage_change'
  | 'relationship_created'
  | 'cadence_applied'
  | 'cadence_cleared'
  | 'cadence_paused'
  | 'cadence_resumed'
  | 'task_completed'
  | 'task_triaged'
  | 'task_dismissed';

export type Venture = 
  | 'forge'
  | 'hearth'
  | 'anvil'
  | 'crucible'
  | 'foundry'
  | 'carbide'
  | 'lucepta'
  | 'meridian_44'
  | 'trade_stone_group';

// JSON field types
export interface EmailEntry {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface PhoneEntry {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface AddressEntry {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label: string;
}

// Core Entity Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  emails: EmailEntry[];
  phones: PhoneEntry[];
  addresses: AddressEntry[];
  job_title: string | null;
  description: string | null;
  tags: string[];
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType | null;
  industry: string | null;
  website: string | null;
  addresses: AddressEntry[];
  description: string | null;
  tags: string[];
  logo_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContactOrganizationLink {
  id: string;
  contact_id: string;
  organization_id: string;
  role_title: string | null;
  role_type: RoleType | null;
  is_primary: boolean;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  organization?: Organization;
  contact?: Contact;
}

export interface BusinessRelationship {
  id: string;
  type: BusinessRelationshipType;
  contact_id: string | null;
  organization_id: string | null;
  stage: string;
  ventures: Venture[];
  owner_id: string;
  attributes: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact?: Contact;
  organization?: Organization;
  owner?: Profile;
}

export interface CadenceTemplate {
  id: string;
  name: string;
  description: string | null;
  relationship_types: BusinessRelationshipType[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  steps?: CadenceStep[];
}

export interface CadenceStep {
  id: string;
  cadence_id: string;
  step_number: number;
  name: string;
  task_type: TaskType;
  day_offset: number;
  description: string | null;
}

export interface AppliedCadence {
  id: string;
  cadence_template_id: string;
  contact_id: string;
  relationship_id: string | null;
  start_date: string;
  status: CadenceStatus;
  paused_at: string | null;
  paused_days: number;
  applied_by: string;
  applied_at: string;
  cleared_by: string | null;
  cleared_at: string | null;
  clear_reason: string | null;
  // Joined fields
  cadence_template?: CadenceTemplate;
  contact?: Contact;
  tasks?: CadenceTask[];
}

export interface CadenceTask {
  id: string;
  applied_cadence_id: string;
  cadence_step_id: string;
  contact_id: string;
  due_date: string;
  status: TaskStatus;
  assigned_to: string;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
  // Joined fields
  cadence_step?: CadenceStep;
  contact?: Contact;
  assigned_user?: Profile;
}

export interface ManualTask {
  id: string;
  contact_id: string | null;
  organization_id: string | null;
  relationship_id: string | null;
  title: string;
  task_type: TaskType | null;
  due_date: string;
  status: TaskStatus;
  assigned_to: string;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  contact?: Contact;
  organization?: Organization;
  assigned_user?: Profile;
}

export interface Activity {
  id: string;
  type: ActivityType;
  contact_id: string | null;
  organization_id: string | null;
  relationship_id: string | null;
  cadence_task_id: string | null;
  manual_task_id: string | null;
  subject: string | null;
  notes: string | null;
  occurred_at: string;
  logged_by: string;
  logged_at: string;
  metadata: Record<string, unknown>;
  // Joined fields
  contact?: Contact;
  organization?: Organization;
  logged_by_user?: Profile;
}

// Unified Task Type (combines cadence and manual tasks)
export interface UnifiedTask {
  id: string;
  task_source: 'cadence' | 'manual';
  title: string;
  task_type: TaskType | null;
  contact_id: string | null;
  contact_name: string | null;
  due_date: string;
  status: TaskStatus;
  cadence_name: string | null;
  assigned_to: string;
}
```

### src/types/api.ts

```typescript
// API Response Types

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContactSearchParams extends SearchParams {
  tags?: string[];
  hasOrganization?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

export interface TaskSearchParams extends SearchParams {
  status?: TaskStatus[];
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  taskType?: TaskType;
  cadenceId?: string;
}

export interface RelationshipSearchParams extends SearchParams {
  type?: BusinessRelationshipType;
  stage?: string;
  ventures?: Venture[];
  ownerId?: string;
}

// Mutation payloads
export interface CreateContactPayload {
  first_name: string;
  last_name: string;
  emails?: EmailEntry[];
  phones?: PhoneEntry[];
  addresses?: AddressEntry[];
  job_title?: string;
  description?: string;
  tags?: string[];
  avatar_url?: string;
}

export interface UpdateContactPayload extends Partial<CreateContactPayload> {
  id: string;
}

export interface CreateOrganizationPayload {
  name: string;
  type?: OrganizationType;
  industry?: string;
  website?: string;
  addresses?: AddressEntry[];
  description?: string;
  tags?: string[];
  logo_url?: string;
}

export interface ApplyCadencePayload {
  cadence_template_id: string;
  contact_id: string;
  relationship_id?: string;
  start_date?: string; // Defaults to today
}

export interface CompleteTaskPayload {
  task_id: string;
  task_source: 'cadence' | 'manual';
  notes: string;
}

export interface LogActivityPayload {
  type: ActivityType;
  contact_id?: string;
  organization_id?: string;
  relationship_id?: string;
  subject?: string;
  notes?: string;
  occurred_at?: string; // Defaults to now
}
```

---

## 5. API Layer Architecture

### src/lib/supabase/client.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### Service Layer Pattern

Each feature has a service file that encapsulates Supabase queries:

```typescript
// src/features/contacts/services/contactService.ts

import { supabase } from '@/lib/supabase/client';
import type { 
  Contact, 
  CreateContactPayload, 
  UpdateContactPayload,
  ContactSearchParams,
  PaginatedResponse 
} from '@/types';

export const contactService = {
  // Get single contact with related data
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        organization_links:contact_organization_links(
          *,
          organization:organizations(*)
        ),
        primary_relationships:primary_relationship_members(
          *,
          group:primary_relationship_groups(*)
        ),
        secondary_relationships_from:secondary_relationships!contact_id(
          *,
          related_contact:contacts!related_contact_id(id, first_name, last_name)
        ),
        secondary_relationships_to:secondary_relationships!related_contact_id(
          *,
          contact:contacts!contact_id(id, first_name, last_name)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search contacts with pagination
  async search(params: ContactSearchParams): Promise<PaginatedResponse<Contact>> {
    const { 
      query, 
      page = 1, 
      pageSize = 25, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      tags,
    } = params;

    let queryBuilder = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query);
    }

    // Tag filter
    if (tags?.length) {
      queryBuilder = queryBuilder.contains('tags', tags);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  },

  // Create contact
  async create(payload: CreateContactPayload): Promise<Contact> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...payload, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update contact
  async update({ id, ...payload }: UpdateContactPayload): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete contact
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get contact activities
  async getActivities(contactId: string, limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        logged_by_user:profiles!logged_by(id, full_name, avatar_url)
      `)
      .eq('contact_id', contactId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
```

---

## 6. State Management

### React Query for Server State

```typescript
// src/features/contacts/hooks/useContact.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/contactService';
import type { UpdateContactPayload } from '@/types';

// Query keys factory
export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  activities: (id: string) => [...contactKeys.detail(id), 'activities'] as const,
};

// Get single contact
export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactService.getById(id),
    enabled: !!id,
  });
}

// Search contacts
export function useContacts(params: ContactSearchParams) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactService.search(params),
  });
}

// Get contact activities
export function useContactActivities(contactId: string) {
  return useQuery({
    queryKey: contactKeys.activities(contactId),
    queryFn: () => contactService.getActivities(contactId),
    enabled: !!contactId,
  });
}

// Mutations
export function useContactMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: contactService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: contactService.update,
    onSuccess: (data) => {
      queryClient.setQueryData(contactKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactService.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
```

### UI State with Zustand (for global UI preferences)

```typescript
// src/stores/uiStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Task view preferences
  taskViewPreferences: {
    showTriaged: boolean;
    showDismissed: boolean;
    defaultDateRange: 'all' | '7days' | '30days';
  };
  setTaskViewPreference: <K extends keyof UIState['taskViewPreferences']>(
    key: K,
    value: UIState['taskViewPreferences'][K]
  ) => void;

  // Saved filters (per view)
  savedFilters: Record<string, Record<string, unknown>>;
  setSavedFilter: (viewKey: string, filters: Record<string, unknown>) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),

      taskViewPreferences: {
        showTriaged: false,
        showDismissed: false,
        defaultDateRange: 'all',
      },
      setTaskViewPreference: (key, value) => set((state) => ({
        taskViewPreferences: {
          ...state.taskViewPreferences,
          [key]: value,
        },
      })),

      savedFilters: {},
      setSavedFilter: (viewKey, filters) => set((state) => ({
        savedFilters: {
          ...state.savedFilters,
          [viewKey]: filters,
        },
      })),
    }),
    {
      name: 'carbide-ui-preferences',
    }
  )
);
```

---

## 7. Routing Structure

### src/router.tsx

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

// Pages
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Contacts } from '@/pages/Contacts';
import { ContactDetail } from '@/pages/ContactDetail';
import { Organizations } from '@/pages/Organizations';
import { OrganizationDetail } from '@/pages/OrganizationDetail';
import { Pipelines } from '@/pages/Pipelines';
import { Tasks } from '@/pages/Tasks';
import { BatchTasks } from '@/pages/BatchTasks';
import { Cadences } from '@/pages/Cadences';
import { CadenceDetail } from '@/pages/CadenceDetail';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'contacts',
        element: <Contacts />,
      },
      {
        path: 'contacts/:contactId',
        element: <ContactDetail />,
      },
      {
        path: 'organizations',
        element: <Organizations />,
      },
      {
        path: 'organizations/:organizationId',
        element: <OrganizationDetail />,
      },
      {
        path: 'pipelines',
        element: <Pipelines />,
      },
      {
        path: 'pipelines/:type',
        element: <Pipelines />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'tasks/batch',
        element: <BatchTasks />,
      },
      {
        path: 'cadences',
        element: <Cadences />,
      },
      {
        path: 'cadences/:cadenceId',
        element: <CadenceDetail />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
```

### URL Query Parameters for Filters

Use URL params for shareable/bookmarkable filter states:

```typescript
// src/hooks/useSearchParams.ts
import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export function useFilterParams<T extends Record<string, unknown>>(
  defaultValues: T
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const params: Record<string, unknown> = { ...defaultValues };
    
    searchParams.forEach((value, key) => {
      if (key in defaultValues) {
        // Handle arrays (e.g., tags=a&tags=b)
        if (Array.isArray(defaultValues[key])) {
          params[key] = searchParams.getAll(key);
        } else if (typeof defaultValues[key] === 'number') {
          params[key] = Number(value);
        } else if (typeof defaultValues[key] === 'boolean') {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    });

    return params as T;
  }, [searchParams, defaultValues]);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          updated.delete(key);
        } else if (Array.isArray(value)) {
          updated.delete(key);
          value.forEach((v) => updated.append(key, String(v)));
        } else {
          updated.set(key, String(value));
        }
      });

      return updated;
    });
  }, [setSearchParams]);

  return [filters, setFilters] as const;
}
```

---

## 8. Component Architecture

### Layout Components

```typescript
// src/components/layout/AppShell.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### Feature Component Pattern

```typescript
// src/features/contacts/components/ContactCard.tsx

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/types';
import { getInitials, formatPhoneNumber } from '@/lib/formatters';

interface ContactCardProps {
  contact: Contact;
  showOrganization?: boolean;
}

export function ContactCard({ contact, showOrganization = true }: ContactCardProps) {
  const primaryEmail = contact.emails.find((e) => e.is_primary)?.value;
  const primaryPhone = contact.phones.find((p) => p.is_primary)?.value;

  return (
    <Card className="group hover:border-primary/50 hover:shadow-md transition-all">
      <Link to={`/contacts/${contact.id}`}>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.avatar_url ?? undefined} />
            <AvatarFallback>
              {getInitials(contact.first_name, contact.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary">
              {contact.first_name} {contact.last_name}
            </h3>
            {contact.job_title && (
              <p className="text-sm text-muted-foreground truncate">
                {contact.job_title}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {primaryEmail && (
            <p className="text-sm text-muted-foreground truncate">
              {primaryEmail}
            </p>
          )}
          {primaryPhone && (
            <p className="text-sm text-muted-foreground">
              {formatPhoneNumber(primaryPhone)}
            </p>
          )}
          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
```

### Form Components with React Hook Form + Zod

```typescript
// src/lib/validators.ts

import { z } from 'zod';

export const emailEntrySchema = z.object({
  value: z.string().email('Invalid email address'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean(),
});

export const phoneEntrySchema = z.object({
  value: z.string().min(1, 'Phone number is required'),
  label: z.string().min(1, 'Label is required'),
  is_primary: z.boolean(),
});

export const contactFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  emails: z.array(emailEntrySchema).optional().default([]),
  phones: z.array(phoneEntrySchema).optional().default([]),
  job_title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

```typescript
// src/components/forms/ContactForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { contactFormSchema, type ContactFormData } from '@/lib/validators';

interface ContactFormProps {
  defaultValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => void;
  isLoading?: boolean;
}

export function ContactForm({ 
  defaultValues, 
  onSubmit, 
  isLoading 
}: ContactFormProps) {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      emails: [],
      phones: [],
      job_title: '',
      description: '',
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="given-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="family-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="organization-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email and phone array fields would go here */}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Contact'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 9. Authentication & Authorization

### Auth Context

```typescript
// src/features/auth/context/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setIsLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signIn,
        signOut,
        isAdmin,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Protected Route

```typescript
// src/features/auth/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireManager = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isManager } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

---

## 10. Real-time Features

### Real-time Subscriptions

```typescript
// src/hooks/useRealtimeSubscription.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'contacts' | 'organizations' | 'activities' | 'cadence_tasks';

interface UseRealtimeOptions {
  table: TableName;
  queryKey: readonly unknown[];
  filter?: string; // e.g., 'contact_id=eq.123'
}

export function useRealtimeSubscription({
  table,
  queryKey,
  filter,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, queryKey, queryClient]);
}

// Usage example in a component:
// useRealtimeSubscription({
//   table: 'activities',
//   queryKey: contactKeys.activities(contactId),
//   filter: `contact_id=eq.${contactId}`,
// });
```

---

## 11. Performance Optimization

### Code Splitting

```typescript
// src/router.tsx - Lazy loading routes

import { lazy, Suspense } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const ContactDetail = lazy(() => import('@/pages/ContactDetail'));
// ... other lazy imports

// In route definition:
{
  path: 'dashboard',
  element: (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard />
    </Suspense>
  ),
}
```

### React Query Optimization

```typescript
// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Virtual Lists for Large Data

```typescript
// src/components/data-display/VirtualizedList.tsx

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 12. Testing Strategy

### Unit Testing with Vitest

```typescript
// tests/unit/formatters.test.ts

import { describe, it, expect } from 'vitest';
import { formatPhoneNumber, getInitials } from '@/lib/formatters';

describe('formatters', () => {
  describe('formatPhoneNumber', () => {
    it('formats a 10-digit number', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('handles already formatted numbers', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    });
  });

  describe('getInitials', () => {
    it('returns initials for first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
    });

    it('handles single name', () => {
      expect(getInitials('John', '')).toBe('J');
    });
  });
});
```

### Component Testing

```typescript
// tests/unit/components/ContactCard.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContactCard } from '@/features/contacts/components/ContactCard';

const mockContact = {
  id: '123',
  first_name: 'John',
  last_name: 'Doe',
  emails: [{ value: 'john@example.com', label: 'Work', is_primary: true }],
  phones: [],
  addresses: [],
  job_title: 'Engineer',
  tags: ['VIP'],
  avatar_url: null,
  description: null,
  created_by: '456',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('ContactCard', () => {
  it('renders contact name', () => {
    render(
      <BrowserRouter>
        <ContactCard contact={mockContact} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders job title', () => {
    render(
      <BrowserRouter>
        <ContactCard contact={mockContact} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <BrowserRouter>
        <ContactCard contact={mockContact} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });
});
```

### E2E Testing with Playwright

```typescript
// tests/e2e/contacts.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Contacts', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('can create a new contact', async ({ page }) => {
    await page.goto('/contacts');
    await page.click('text=Add Contact');
    
    await page.fill('[name="first_name"]', 'Jane');
    await page.fill('[name="last_name"]', 'Smith');
    await page.fill('[name="job_title"]', 'CEO');
    
    await page.click('button:has-text("Save Contact")');
    
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('can search contacts', async ({ page }) => {
    await page.goto('/contacts');
    
    await page.fill('[placeholder="Search contacts..."]', 'Smith');
    await page.waitForTimeout(500); // Debounce
    
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });
});
```

---

## 13. Accessibility Requirements

Based on WCAG 2.2 AA compliance:

### Key Implementation Requirements

```typescript
// Accessible Button with proper states
<Button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  disabled={isLoading}
>
  {isLoading ? <Spinner aria-hidden="true" /> : <XIcon aria-hidden="true" />}
  <span className="sr-only">Close</span>
</Button>

// Accessible form with error handling
<FormField>
  <FormLabel htmlFor="email">
    Email <span aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </FormLabel>
  <FormControl>
    <Input
      id="email"
      type="email"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'email-error' : undefined}
      autoComplete="email"
    />
  </FormControl>
  {errors.email && (
    <FormMessage id="email-error" role="alert">
      {errors.email.message}
    </FormMessage>
  )}
</FormField>

// Accessible data table
<table role="grid" aria-label="Contacts">
  <thead>
    <tr>
      <th scope="col" aria-sort={sortColumn === 'name' ? sortOrder : 'none'}>
        Name
      </th>
    </tr>
  </thead>
</table>

// Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Live region for notifications
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {notification}
</div>
```

### Focus Management

```typescript
// Focus trap for modals
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ isOpen, onClose, children }) {
  const ref = useFocusTrap(isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={ref}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Return focus after modal closes
const [previousFocus, setPreviousFocus] = useState<HTMLElement | null>(null);

function openModal() {
  setPreviousFocus(document.activeElement as HTMLElement);
  setIsOpen(true);
}

function closeModal() {
  setIsOpen(false);
  previousFocus?.focus();
}
```

### Color Contrast Requirements

```css
/* Minimum contrast ratios */
:root {
  /* Text colors must have 4.5:1 contrast for normal text */
  --foreground: 222.2 84% 4.9%;        /* Near black */
  --muted-foreground: 215.4 16.3% 46.9%; /* Gray - check against bg */
  
  /* Large text (18pt+) needs 3:1 contrast */
  --primary: 222.2 47.4% 11.2%;
  
  /* UI components need 3:1 contrast */
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}
```

---

## 14. Security Considerations

### Environment Variables

```bash
# .env.example
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Never commit these - server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Input Sanitization

```typescript
// Use Zod for all user input validation
const sanitizedInput = contactFormSchema.parse(userInput);

// Escape HTML in user-generated content displayed in UI
import DOMPurify from 'dompurify';

function SafeHTML({ html }: { html: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(html) 
      }} 
    />
  );
}
```

### Content Security Policy (Vercel)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 15. Deployment & Infrastructure

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id your-project-ref > src/lib/supabase/database.types.ts
```

---

## 16. Development Workflow

### Getting Started

```bash
# Clone repository
git clone https://github.com/your-org/carbide.git
cd carbide

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/lib/supabase/database.types.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

### Git Workflow

- `main` - Production branch, deployed to production
- `develop` - Development branch, deployed to staging
- `feature/*` - Feature branches, create PRs to develop
- `hotfix/*` - Hotfix branches, create PRs to main

### Code Review Checklist

- [ ] Types are properly defined (no `any`)
- [ ] Loading and error states handled
- [ ] Accessible (keyboard nav, ARIA labels, contrast)
- [ ] Tests added for new functionality
- [ ] No console.logs or commented code
- [ ] Responsive design checked
- [ ] Query invalidation correct after mutations

---

## Appendix A: shadcn/ui Components to Install

```bash
npx shadcn-ui@latest init

# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add command
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add collapsible
```

---

## Appendix B: Package.json Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-table": "^8.11.2",
    "@tanstack/react-virtual": "^3.0.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^0.2.0",
    "date-fns": "^3.2.0",
    "dompurify": "^3.0.8",
    "lucide-react": "^0.309.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "react-router-dom": "^6.21.1",
    "recharts": "^2.10.3",
    "sonner": "^1.3.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.1",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/react": "^14.1.2",
    "@types/dompurify": "^3.0.5",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.18.0",
    "@typescript-eslint/parser": "^6.18.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "postcss": "^8.4.33",
    "prettier": "^3.1.1",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "vitest": "^1.2.0"
  }
}
```

---

*This technical PRD is a living document. Update as implementation progresses.*

**Document Version History:**
- v1.0 (Dec 2024): Initial technical specification
