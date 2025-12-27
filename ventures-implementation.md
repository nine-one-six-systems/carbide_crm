# Carbide CRM — Ventures Feature Implementation

**Version:** 1.0  
**Date:** December 2024  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Migration](#2-database-migration)
3. [TypeScript Types](#3-typescript-types)
4. [Service Layer](#4-service-layer)
5. [React Hooks](#5-react-hooks)
6. [Components](#6-components)
7. [Pages](#7-pages)
8. [Router & Navigation Updates](#8-router--navigation-updates)
9. [Integration Updates](#9-integration-updates)
10. [Claude Implementation Prompt](#10-claude-implementation-prompt)

---

## 1. Overview

### Purpose

Promote Ventures from hardcoded constants to first-class database entities with full CRUD, organization linking, team management, and a dedicated UI.

### Key Features

- **Venture CRUD**: Create, read, update, archive ventures
- **Organization Linking**: Link organizations to ventures with relationship types
- **Team Management**: Assign users and contacts to ventures with roles
- **Venture Detail View**: Three-column layout with activity feed, pipeline summary
- **Backward Compatible**: Existing `business_relationships.ventures` array continues to work

### File Structure

```
src/
├── features/
│   └── ventures/
│       ├── components/
│       │   ├── VentureCard.tsx
│       │   ├── VentureForm.tsx
│       │   ├── VentureHeader.tsx
│       │   ├── VentureInfoSidebar.tsx
│       │   ├── VentureRightSidebar.tsx
│       │   ├── VentureTeamList.tsx
│       │   ├── VentureOrganizations.tsx
│       │   ├── VenturePipelineSummary.tsx
│       │   ├── LinkOrganizationModal.tsx
│       │   ├── AddTeamMemberModal.tsx
│       │   └── VentureSelect.tsx
│       ├── hooks/
│       │   ├── useVentures.ts
│       │   ├── useVenture.ts
│       │   ├── useVentureStats.ts
│       │   ├── useVentureActivity.ts
│       │   ├── useVentureTeam.ts
│       │   ├── useVentureOrganizations.ts
│       │   ├── useCreateVenture.ts
│       │   ├── useUpdateVenture.ts
│       │   └── useDeleteVenture.ts
│       ├── services/
│       │   └── ventureService.ts
│       └── types/
│           └── venture.types.ts
├── pages/
│   ├── VentureList.tsx
│   └── VentureDetail.tsx
```

---

## 2. Database Migration

**File:** `supabase/migrations/00007_ventures.sql`

```sql
-- =============================================================================
-- VENTURES FEATURE MIGRATION
-- Promotes ventures from hardcoded constants to first-class database entities
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

-- Status for ventures
CREATE TYPE venture_status AS ENUM ('active', 'incubating', 'sunset', 'archived');

-- Relationship type between ventures and organizations
CREATE TYPE venture_organization_relationship AS ENUM (
  'owns',        -- The org IS the venture (legal entity)
  'subsidiary',  -- The org is a subsidiary of the venture
  'client',      -- The org is a client of the venture
  'partner',     -- The org is a partner of the venture
  'vendor',      -- The org is a vendor to the venture
  'other'        -- Other relationship
);

-- -----------------------------------------------------------------------------
-- VENTURES TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  primary_color VARCHAR(7), -- Hex color like #3B82F6
  status venture_status NOT NULL DEFAULT 'active',
  founded_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ventures_slug_format CHECK (slug ~ '^[a-z0-9_]+$'),
  CONSTRAINT ventures_color_format CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Indexes
CREATE INDEX idx_ventures_status ON ventures(status);
CREATE INDEX idx_ventures_slug ON ventures(slug);

-- Updated at trigger
CREATE TRIGGER set_ventures_updated_at
  BEFORE UPDATE ON ventures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- VENTURE-ORGANIZATION JUNCTION TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE venture_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  relationship_type venture_organization_relationship NOT NULL DEFAULT 'other',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  CONSTRAINT venture_organizations_unique UNIQUE (venture_id, organization_id)
);

-- Indexes
CREATE INDEX idx_venture_organizations_venture ON venture_organizations(venture_id);
CREATE INDEX idx_venture_organizations_org ON venture_organizations(organization_id);

-- Ensure only one primary org per venture
CREATE UNIQUE INDEX idx_venture_organizations_primary 
  ON venture_organizations(venture_id) 
  WHERE is_primary = TRUE;

-- -----------------------------------------------------------------------------
-- VENTURE TEAM MEMBERS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE venture_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  -- Must have either user_id or contact_id, not both, not neither
  CONSTRAINT venture_team_member_type CHECK (
    (user_id IS NOT NULL AND contact_id IS NULL) OR
    (user_id IS NULL AND contact_id IS NOT NULL)
  ),
  -- Unique constraint per venture per person
  CONSTRAINT venture_team_unique_user UNIQUE (venture_id, user_id),
  CONSTRAINT venture_team_unique_contact UNIQUE (venture_id, contact_id)
);

-- Indexes
CREATE INDEX idx_venture_team_venture ON venture_team_members(venture_id);
CREATE INDEX idx_venture_team_user ON venture_team_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_venture_team_contact ON venture_team_members(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_venture_team_active ON venture_team_members(venture_id, is_active) WHERE is_active = TRUE;

-- -----------------------------------------------------------------------------
-- SEED EXISTING VENTURES
-- Migrate from hardcoded constants to database records
-- -----------------------------------------------------------------------------

INSERT INTO ventures (name, slug, status, primary_color, description) VALUES
  ('Forge', 'forge', 'active', '#3B82F6', 'Business development and growth consulting'),
  ('Hearth', 'hearth', 'active', '#EF4444', 'Home and lifestyle services'),
  ('Anvil', 'anvil', 'active', '#6B7280', 'Manufacturing and industrial solutions'),
  ('Crucible', 'crucible', 'active', '#8B5CF6', 'Innovation lab and R&D'),
  ('Foundry', 'foundry', 'active', '#10B981', 'Startup accelerator and incubator'),
  ('Carbide', 'carbide', 'active', '#F97316', 'CRM and business tools'),
  ('Lucepta', 'lucepta', 'active', '#EC4899', 'Healthcare and wellness'),
  ('Meridian 44', 'meridian_44', 'active', '#6366F1', 'Expert network platform'),
  ('Trade Stone Group', 'trade_stone_group', 'active', '#EAB308', 'Investment and holdings')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_team_members ENABLE ROW LEVEL SECURITY;

-- Ventures: All authenticated users can read, all can modify (per requirements)
CREATE POLICY "ventures_select" ON ventures
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ventures_insert" ON ventures
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ventures_update" ON ventures
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ventures_delete" ON ventures
  FOR DELETE TO authenticated USING (true);

-- Venture Organizations: All authenticated users can CRUD
CREATE POLICY "venture_organizations_select" ON venture_organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "venture_organizations_insert" ON venture_organizations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "venture_organizations_update" ON venture_organizations
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "venture_organizations_delete" ON venture_organizations
  FOR DELETE TO authenticated USING (true);

-- Venture Team Members: All authenticated users can CRUD
CREATE POLICY "venture_team_select" ON venture_team_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "venture_team_insert" ON venture_team_members
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "venture_team_update" ON venture_team_members
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "venture_team_delete" ON venture_team_members
  FOR DELETE TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Get venture stats (relationship counts, org counts, team counts)
CREATE OR REPLACE FUNCTION get_venture_stats(p_venture_slug TEXT)
RETURNS TABLE (
  relationship_count BIGINT,
  organization_count BIGINT,
  team_member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM business_relationships br 
     WHERE p_venture_slug = ANY(br.ventures::text[]))::BIGINT as relationship_count,
    (SELECT COUNT(*) FROM venture_organizations vo 
     JOIN ventures v ON vo.venture_id = v.id 
     WHERE v.slug = p_venture_slug)::BIGINT as organization_count,
    (SELECT COUNT(*) FROM venture_team_members vtm 
     JOIN ventures v ON vtm.venture_id = v.id 
     WHERE v.slug = p_venture_slug AND vtm.is_active = TRUE)::BIGINT as team_member_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get pipeline breakdown for a venture
CREATE OR REPLACE FUNCTION get_venture_pipeline_breakdown(p_venture_slug TEXT)
RETURNS TABLE (
  pipeline_type business_relationship_type,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    br.type as pipeline_type,
    COUNT(*)::BIGINT as count
  FROM business_relationships br
  WHERE p_venture_slug = ANY(br.ventures::text[])
    AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
  GROUP BY br.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get all ventures for select dropdown (excluding archived)
CREATE OR REPLACE FUNCTION get_active_ventures()
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  slug VARCHAR(50),
  status venture_status,
  primary_color VARCHAR(7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.name, v.slug, v.status, v.primary_color
  FROM ventures v
  WHERE v.status != 'archived'
  ORDER BY v.name;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 3. TypeScript Types

**File:** `src/features/ventures/types/venture.types.ts`

```typescript
import type { Database } from '@/types/supabase';

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type VentureStatus = 'active' | 'incubating' | 'sunset' | 'archived';

export type VentureOrganizationRelationship = 
  | 'owns'
  | 'subsidiary'
  | 'client'
  | 'partner'
  | 'vendor'
  | 'other';

// =============================================================================
// VENTURE TYPES
// =============================================================================

export interface Venture {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  primary_color: string | null;
  status: VentureStatus;
  founded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VentureWithStats extends Venture {
  relationship_count: number;
  organization_count: number;
  team_member_count: number;
}

export interface VentureFormValues {
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  primary_color?: string | null;
  status: VentureStatus;
  founded_date?: string | null;
}

// =============================================================================
// VENTURE ORGANIZATION TYPES
// =============================================================================

export interface VentureOrganization {
  id: string;
  venture_id: string;
  organization_id: string;
  relationship_type: VentureOrganizationRelationship;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  // Joined fields
  organization?: {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
  };
}

export interface LinkOrganizationFormValues {
  organization_id: string;
  relationship_type: VentureOrganizationRelationship;
  is_primary: boolean;
  notes?: string | null;
}

// =============================================================================
// VENTURE TEAM TYPES
// =============================================================================

export interface VentureTeamMember {
  id: string;
  venture_id: string;
  user_id: string | null;
  contact_id: string | null;
  role: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string | null;
  // Joined fields
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    primary_email: string | null;
  };
}

export interface AddTeamMemberFormValues {
  member_type: 'user' | 'contact';
  user_id?: string | null;
  contact_id?: string | null;
  role: string;
  start_date?: string | null;
}

// =============================================================================
// VENTURE STATS TYPES
// =============================================================================

export interface VenturePipelineBreakdown {
  pipeline_type: string;
  count: number;
}

export interface VentureStats {
  relationship_count: number;
  organization_count: number;
  team_member_count: number;
  pipeline_breakdown: VenturePipelineBreakdown[];
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface VentureFilters {
  status?: VentureStatus | 'all';
  search?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const VENTURE_STATUS_OPTIONS: { value: VentureStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'incubating', label: 'Incubating' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'archived', label: 'Archived' },
];

export const VENTURE_ORG_RELATIONSHIP_OPTIONS: { 
  value: VentureOrganizationRelationship; 
  label: string;
  description: string;
}[] = [
  { value: 'owns', label: 'Owns', description: 'This organization IS the venture (legal entity)' },
  { value: 'subsidiary', label: 'Subsidiary', description: 'A subsidiary of the venture' },
  { value: 'client', label: 'Client', description: 'A client of the venture' },
  { value: 'partner', label: 'Partner', description: 'A partner of the venture' },
  { value: 'vendor', label: 'Vendor', description: 'A vendor to the venture' },
  { value: 'other', label: 'Other', description: 'Other relationship' },
];

export const VENTURE_STATUS_COLORS: Record<VentureStatus, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  incubating: 'bg-blue-100 text-blue-700 border-blue-200',
  sunset: 'bg-orange-100 text-orange-700 border-orange-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};
```

---

## 4. Service Layer

**File:** `src/features/ventures/services/ventureService.ts`

```typescript
import { supabase } from '@/lib/supabase';
import type {
  Venture,
  VentureWithStats,
  VentureFormValues,
  VentureOrganization,
  LinkOrganizationFormValues,
  VentureTeamMember,
  AddTeamMemberFormValues,
  VentureFilters,
  VenturePipelineBreakdown,
} from '../types/venture.types';

// =============================================================================
// VENTURE CRUD
// =============================================================================

export const ventureService = {
  /**
   * Get all ventures with optional filters
   */
  async getVentures(filters?: VentureFilters): Promise<VentureWithStats[]> {
    let query = supabase
      .from('ventures')
      .select('*')
      .order('name');

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Fetch stats for each venture
    const venturesWithStats = await Promise.all(
      (data || []).map(async (venture) => {
        const stats = await this.getVentureStats(venture.slug);
        return {
          ...venture,
          relationship_count: stats.relationship_count,
          organization_count: stats.organization_count,
          team_member_count: stats.team_member_count,
        };
      })
    );

    return venturesWithStats;
  },

  /**
   * Get a single venture by slug
   */
  async getVentureBySlug(slug: string): Promise<Venture | null> {
    const { data, error } = await supabase
      .from('ventures')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Get venture stats
   */
  async getVentureStats(slug: string): Promise<{
    relationship_count: number;
    organization_count: number;
    team_member_count: number;
  }> {
    const { data, error } = await supabase
      .rpc('get_venture_stats', { p_venture_slug: slug });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      relationship_count: row?.relationship_count ?? 0,
      organization_count: row?.organization_count ?? 0,
      team_member_count: row?.team_member_count ?? 0,
    };
  },

  /**
   * Get pipeline breakdown for a venture
   */
  async getVenturePipelineBreakdown(slug: string): Promise<VenturePipelineBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_venture_pipeline_breakdown', { p_venture_slug: slug });

    if (error) throw error;

    return data || [];
  },

  /**
   * Get active ventures for select dropdown (excludes archived)
   */
  async getActiveVentures(): Promise<Pick<Venture, 'id' | 'name' | 'slug' | 'status' | 'primary_color'>[]> {
    const { data, error } = await supabase
      .rpc('get_active_ventures');

    if (error) throw error;

    return data || [];
  },

  /**
   * Create a new venture
   */
  async createVenture(values: VentureFormValues): Promise<Venture> {
    const { data, error } = await supabase
      .from('ventures')
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a venture
   */
  async updateVenture(id: string, values: Partial<VentureFormValues>): Promise<Venture> {
    const { data, error } = await supabase
      .from('ventures')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Delete (archive) a venture
   */
  async archiveVenture(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Permanently delete a venture (admin only, use with caution)
   */
  async deleteVenture(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // VENTURE ORGANIZATIONS
  // ===========================================================================

  /**
   * Get organizations linked to a venture
   */
  async getVentureOrganizations(ventureId: string): Promise<VentureOrganization[]> {
    const { data, error } = await supabase
      .from('venture_organizations')
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .eq('venture_id', ventureId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  /**
   * Link an organization to a venture
   */
  async linkOrganization(
    ventureId: string,
    values: LinkOrganizationFormValues,
    userId: string
  ): Promise<VentureOrganization> {
    // If setting as primary, first unset any existing primary
    if (values.is_primary) {
      await supabase
        .from('venture_organizations')
        .update({ is_primary: false })
        .eq('venture_id', ventureId)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('venture_organizations')
      .insert({
        venture_id: ventureId,
        organization_id: values.organization_id,
        relationship_type: values.relationship_type,
        is_primary: values.is_primary,
        notes: values.notes,
        created_by: userId,
      })
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a venture-organization link
   */
  async updateVentureOrganization(
    id: string,
    ventureId: string,
    values: Partial<LinkOrganizationFormValues>
  ): Promise<VentureOrganization> {
    // If setting as primary, first unset any existing primary
    if (values.is_primary) {
      await supabase
        .from('venture_organizations')
        .update({ is_primary: false })
        .eq('venture_id', ventureId)
        .eq('is_primary', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('venture_organizations')
      .update(values)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Unlink an organization from a venture
   */
  async unlinkOrganization(id: string): Promise<void> {
    const { error } = await supabase
      .from('venture_organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // VENTURE TEAM MEMBERS
  // ===========================================================================

  /**
   * Get team members for a venture
   */
  async getVentureTeam(ventureId: string, includeInactive = false): Promise<VentureTeamMember[]> {
    let query = supabase
      .from('venture_team_members')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .eq('venture_id', ventureId)
      .order('is_active', { ascending: false })
      .order('role');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  /**
   * Add a team member to a venture
   */
  async addTeamMember(
    ventureId: string,
    values: AddTeamMemberFormValues,
    userId: string
  ): Promise<VentureTeamMember> {
    const { data, error } = await supabase
      .from('venture_team_members')
      .insert({
        venture_id: ventureId,
        user_id: values.member_type === 'user' ? values.user_id : null,
        contact_id: values.member_type === 'contact' ? values.contact_id : null,
        role: values.role,
        start_date: values.start_date,
        is_active: true,
        created_by: userId,
      })
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a team member
   */
  async updateTeamMember(
    id: string,
    values: Partial<{ role: string; is_active: boolean; end_date: string | null }>
  ): Promise<VentureTeamMember> {
    const { data, error } = await supabase
      .from('venture_team_members')
      .update(values)
      .eq('id', id)
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Remove a team member from a venture
   */
  async removeTeamMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('venture_team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // ACTIVITY (delegates to existing activity service)
  // ===========================================================================

  /**
   * Get activities for all relationships tagged with a venture
   */
  async getVentureActivity(slug: string, limit = 20): Promise<any[]> {
    // First get all relationship IDs tagged with this venture
    const { data: relationships, error: relError } = await supabase
      .from('business_relationships')
      .select('id')
      .contains('ventures', [slug]);

    if (relError) throw relError;

    if (!relationships || relationships.length === 0) {
      return [];
    }

    const relationshipIds = relationships.map((r) => r.id);

    // Get activities for these relationships
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        organization:organizations(id, name),
        created_by_user:profiles(id, full_name)
      `)
      .in('relationship_id', relationshipIds)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  },
};
```

---

## 5. React Hooks

### 5.1 useVentures

**File:** `src/features/ventures/hooks/useVentures.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import type { VentureFilters } from '../types/venture.types';

export const ventureKeys = {
  all: ['ventures'] as const,
  lists: () => [...ventureKeys.all, 'list'] as const,
  list: (filters?: VentureFilters) => [...ventureKeys.lists(), filters] as const,
  details: () => [...ventureKeys.all, 'detail'] as const,
  detail: (slug: string) => [...ventureKeys.details(), slug] as const,
  stats: (slug: string) => [...ventureKeys.detail(slug), 'stats'] as const,
  pipeline: (slug: string) => [...ventureKeys.detail(slug), 'pipeline'] as const,
  organizations: (id: string) => [...ventureKeys.all, 'organizations', id] as const,
  team: (id: string) => [...ventureKeys.all, 'team', id] as const,
  activity: (slug: string) => [...ventureKeys.detail(slug), 'activity'] as const,
  active: () => [...ventureKeys.all, 'active'] as const,
};

export function useVentures(filters?: VentureFilters) {
  return useQuery({
    queryKey: ventureKeys.list(filters),
    queryFn: () => ventureService.getVentures(filters),
  });
}

export function useActiveVentures() {
  return useQuery({
    queryKey: ventureKeys.active(),
    queryFn: () => ventureService.getActiveVentures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 5.2 useVenture

**File:** `src/features/ventures/hooks/useVenture.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVenture(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.detail(slug!),
    queryFn: () => ventureService.getVentureBySlug(slug!),
    enabled: !!slug,
  });
}
```

### 5.3 useVentureStats

**File:** `src/features/ventures/hooks/useVentureStats.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVentureStats(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.stats(slug!),
    queryFn: () => ventureService.getVentureStats(slug!),
    enabled: !!slug,
  });
}

export function useVenturePipelineBreakdown(slug: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.pipeline(slug!),
    queryFn: () => ventureService.getVenturePipelineBreakdown(slug!),
    enabled: !!slug,
  });
}
```

### 5.4 useVentureOrganizations

**File:** `src/features/ventures/hooks/useVentureOrganizations.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { LinkOrganizationFormValues } from '../types/venture.types';

export function useVentureOrganizations(ventureId: string | undefined) {
  return useQuery({
    queryKey: ventureKeys.organizations(ventureId!),
    queryFn: () => ventureService.getVentureOrganizations(ventureId!),
    enabled: !!ventureId,
  });
}

export function useLinkOrganization(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, userId }: { values: LinkOrganizationFormValues; userId: string }) =>
      ventureService.linkOrganization(ventureId, values, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.organizations(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

export function useUnlinkOrganization(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.unlinkOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.organizations(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}
```

### 5.5 useVentureTeam

**File:** `src/features/ventures/hooks/useVentureTeam.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { AddTeamMemberFormValues } from '../types/venture.types';

export function useVentureTeam(ventureId: string | undefined, includeInactive = false) {
  return useQuery({
    queryKey: [...ventureKeys.team(ventureId!), includeInactive],
    queryFn: () => ventureService.getVentureTeam(ventureId!, includeInactive),
    enabled: !!ventureId,
  });
}

export function useAddTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, userId }: { values: AddTeamMemberFormValues; userId: string }) =>
      ventureService.addTeamMember(ventureId, values, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}

export function useUpdateTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<{ role: string; is_active: boolean; end_date: string | null }> }) =>
      ventureService.updateTeamMember(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
    },
  });
}

export function useRemoveTeamMember(ventureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.team(ventureId) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
    },
  });
}
```

### 5.6 useVentureActivity

**File:** `src/features/ventures/hooks/useVentureActivity.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useVentureActivity(slug: string | undefined, limit = 20) {
  return useQuery({
    queryKey: [...ventureKeys.activity(slug!), limit],
    queryFn: () => ventureService.getVentureActivity(slug!, limit),
    enabled: !!slug,
  });
}
```

### 5.7 useCreateVenture

**File:** `src/features/ventures/hooks/useCreateVenture.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { VentureFormValues } from '../types/venture.types';

export function useCreateVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VentureFormValues) => ventureService.createVenture(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}
```

### 5.8 useUpdateVenture

**File:** `src/features/ventures/hooks/useUpdateVenture.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';
import type { VentureFormValues } from '../types/venture.types';

export function useUpdateVenture(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<VentureFormValues> }) =>
      ventureService.updateVenture(id, values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
      // If slug changed, also invalidate new slug
      if (data.slug !== slug) {
        queryClient.invalidateQueries({ queryKey: ventureKeys.detail(data.slug) });
      }
    },
  });
}
```

### 5.9 useDeleteVenture

**File:** `src/features/ventures/hooks/useDeleteVenture.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ventureService } from '../services/ventureService';
import { ventureKeys } from './useVentures';

export function useArchiveVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.archiveVenture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}

export function useDeleteVenture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventureService.deleteVenture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ventureKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ventureKeys.active() });
    },
  });
}
```

---

## 6. Components

### 6.1 VentureCard

**File:** `src/features/ventures/components/VentureCard.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Building2, Users, GitBranch } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { VentureWithStats } from '../types/venture.types';
import { VENTURE_STATUS_COLORS } from '../types/venture.types';

interface VentureCardProps {
  venture: VentureWithStats;
}

export function VentureCard({ venture }: VentureCardProps) {
  return (
    <Link to={`/ventures/${venture.slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {venture.logo_url ? (
                <img
                  src={venture.logo_url}
                  alt={`${venture.name} logo`}
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                  style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                >
                  {venture.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{venture.name}</h3>
                {venture.website && (
                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {venture.website.replace(/^https?:\/\//, '')}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn('shrink-0', VENTURE_STATUS_COLORS[venture.status])}
            >
              {venture.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {venture.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {venture.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              <span>{venture.relationship_count} Relationships</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{venture.organization_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{venture.team_member_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

### 6.2 VentureForm

**File:** `src/features/ventures/components/VentureForm.tsx`

```tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Venture, VentureFormValues, VentureStatus } from '../types/venture.types';
import { VENTURE_STATUS_OPTIONS } from '../types/venture.types';

const ventureFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Slug must be lowercase letters, numbers, and underscores only'),
  description: z.string().nullable().optional(),
  logo_url: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .nullable()
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'incubating', 'sunset', 'archived'] as const),
  founded_date: z.string().nullable().optional(),
});

interface VentureFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venture?: Venture | null;
  onSubmit: (values: VentureFormValues) => void;
  isLoading?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function VentureForm({
  open,
  onOpenChange,
  venture,
  onSubmit,
  isLoading = false,
}: VentureFormProps) {
  const isEditing = !!venture;

  const form = useForm<VentureFormValues>({
    resolver: zodResolver(ventureFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      website: '',
      primary_color: '#3B82F6',
      status: 'active' as VentureStatus,
      founded_date: '',
    },
  });

  // Reset form when venture changes
  useEffect(() => {
    if (venture) {
      form.reset({
        name: venture.name,
        slug: venture.slug,
        description: venture.description || '',
        logo_url: venture.logo_url || '',
        website: venture.website || '',
        primary_color: venture.primary_color || '#3B82F6',
        status: venture.status,
        founded_date: venture.founded_date || '',
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        website: '',
        primary_color: '#3B82F6',
        status: 'active',
        founded_date: '',
      });
    }
  }, [venture, form]);

  // Auto-generate slug from name (only for new ventures)
  const watchName = form.watch('name');
  useEffect(() => {
    if (!isEditing && watchName) {
      const currentSlug = form.getValues('slug');
      const generatedSlug = generateSlug(watchName);
      // Only auto-update if slug hasn't been manually edited
      if (!currentSlug || currentSlug === generateSlug(form.getValues('name').slice(0, -1))) {
        form.setValue('slug', generatedSlug);
      }
    }
  }, [watchName, isEditing, form]);

  const handleSubmit = (values: VentureFormValues) => {
    // Clean up empty strings to null
    const cleanedValues: VentureFormValues = {
      ...values,
      description: values.description || null,
      logo_url: values.logo_url || null,
      website: values.website || null,
      primary_color: values.primary_color || null,
      founded_date: values.founded_date || null,
    };
    onSubmit(cleanedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Venture' : 'Create Venture'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the venture details below.'
              : 'Add a new venture to the NineOneSix ecosystem.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Forge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="forge" {...field} />
                    </FormControl>
                    <FormDescription>URL identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does this venture do?"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VENTURE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="founded_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://forge.example.com"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="#3B82F6"
                          {...field}
                          value={field.value || ''}
                          className="flex-1"
                        />
                      </FormControl>
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: field.value || '#6B7280' }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Venture'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 6.3 VentureSelect

**File:** `src/features/ventures/components/VentureSelect.tsx`

```tsx
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useActiveVentures } from '../hooks/useVentures';

interface VentureSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VentureSelect({
  value,
  onChange,
  placeholder = 'Select ventures...',
  disabled = false,
  className,
}: VentureSelectProps) {
  const { data: ventures, isLoading } = useActiveVentures();

  const selectedVentures = ventures?.filter((v) => value.includes(v.slug)) || [];

  const toggleVenture = (slug: string) => {
    if (value.includes(slug)) {
      onChange(value.filter((v) => v !== slug));
    } else {
      onChange([...value, slug]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled || isLoading}
          className={cn('w-full justify-between', className)}
        >
          {selectedVentures.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedVentures.map((venture) => (
                <Badge
                  key={venture.slug}
                  variant="secondary"
                  className="mr-1"
                  style={{
                    backgroundColor: venture.primary_color
                      ? `${venture.primary_color}20`
                      : undefined,
                    borderColor: venture.primary_color || undefined,
                  }}
                >
                  {venture.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search ventures..." />
          <CommandList>
            <CommandEmpty>No ventures found.</CommandEmpty>
            <CommandGroup>
              {ventures?.map((venture) => (
                <CommandItem
                  key={venture.slug}
                  value={venture.name}
                  onSelect={() => toggleVenture(venture.slug)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(venture.slug) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                  />
                  {venture.name}
                  {venture.status !== 'active' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {venture.status}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### 6.4 VentureHeader

**File:** `src/features/ventures/components/VentureHeader.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Archive, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

import type { Venture } from '../types/venture.types';
import { VENTURE_STATUS_COLORS } from '../types/venture.types';
import { VentureForm } from './VentureForm';
import { useUpdateVenture } from '../hooks/useUpdateVenture';
import { useArchiveVenture } from '../hooks/useDeleteVenture';

interface VentureHeaderProps {
  venture: Venture;
}

export function VentureHeader({ venture }: VentureHeaderProps) {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const updateVenture = useUpdateVenture(venture.slug);
  const archiveVenture = useArchiveVenture();

  const handleUpdate = (values: any) => {
    updateVenture.mutate(
      { id: venture.id, values },
      {
        onSuccess: (data) => {
          setShowEditForm(false);
          // If slug changed, navigate to new URL
          if (data.slug !== venture.slug) {
            navigate(`/ventures/${data.slug}`, { replace: true });
          }
        },
      }
    );
  };

  const handleArchive = () => {
    archiveVenture.mutate(venture.id, {
      onSuccess: () => {
        navigate('/ventures');
      },
    });
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ventures')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              {venture.logo_url ? (
                <img
                  src={venture.logo_url}
                  alt={`${venture.name} logo`}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold text-xl"
                  style={{ backgroundColor: venture.primary_color || '#6B7280' }}
                >
                  {venture.name.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{venture.name}</h1>
                  <Badge
                    variant="outline"
                    className={cn(VENTURE_STATUS_COLORS[venture.status])}
                  >
                    {venture.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {venture.website && (
                    <a
                      href={venture.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline"
                    >
                      {venture.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {venture.website && venture.founded_date && <span>·</span>}
                  {venture.founded_date && (
                    <span>
                      Founded {new Date(venture.founded_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Venture
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowArchiveDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <VentureForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        venture={venture}
        onSubmit={handleUpdate}
        isLoading={updateVenture.isPending}
      />

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {venture.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the venture from active lists and prevent new relationships from being
              tagged with it. Existing relationships will retain their tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### 6.5 VentureInfoSidebar

**File:** `src/features/ventures/components/VentureInfoSidebar.tsx`

```tsx
import { Calendar, Globe, FileText } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Venture } from '../types/venture.types';
import { VentureTeamList } from './VentureTeamList';
import { VentureOrganizations } from './VentureOrganizations';

interface VentureInfoSidebarProps {
  venture: Venture;
}

export function VentureInfoSidebar({ venture }: VentureInfoSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Description */}
        {venture.description && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              About
            </h3>
            <p className="text-sm">{venture.description}</p>
          </div>
        )}

        {/* Details */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Details</h3>
          <div className="space-y-2 text-sm">
            {venture.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={venture.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {venture.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {venture.founded_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Founded{' '}
                  {new Date(venture.founded_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Team Members */}
        <VentureTeamList ventureId={venture.id} />

        <Separator />

        {/* Organizations */}
        <VentureOrganizations ventureId={venture.id} />
      </div>
    </ScrollArea>
  );
}
```

### 6.6 VentureTeamList

**File:** `src/features/ventures/components/VentureTeamList.tsx`

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, MoreHorizontal, UserMinus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentureTeam, useRemoveTeamMember } from '../hooks/useVentureTeam';
import { AddTeamMemberModal } from './AddTeamMemberModal';

interface VentureTeamListProps {
  ventureId: string;
}

export function VentureTeamList({ ventureId }: VentureTeamListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: team, isLoading } = useVentureTeam(ventureId);
  const removeTeamMember = useRemoveTeamMember(ventureId);

  const getInitials = (member: any) => {
    if (member.user) {
      return member.user.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U';
    }
    if (member.contact) {
      return `${member.contact.first_name?.[0] || ''}${member.contact.last_name?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const getName = (member: any) => {
    if (member.user) return member.user.full_name || member.user.email;
    if (member.contact) return `${member.contact.first_name} ${member.contact.last_name}`;
    return 'Unknown';
  };

  const getAvatarUrl = (member: any) => {
    return member.user?.avatar_url || member.contact?.avatar_url;
  };

  const getProfileLink = (member: any) => {
    if (member.contact_id) return `/contacts/${member.contact_id}`;
    return null;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Team
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" />
          Team ({team?.length || 0})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {team?.map((member) => {
          const profileLink = getProfileLink(member);
          const content = (
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(member)} />
                  <AvatarFallback className="text-xs">{getInitials(member)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{getName(member)}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => removeTeamMember.mutate(member.id)}
                    className="text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove from Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );

          return profileLink ? (
            <Link key={member.id} to={profileLink}>
              {content}
            </Link>
          ) : (
            <div key={member.id}>{content}</div>
          );
        })}

        {(!team || team.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">No team members yet</p>
        )}
      </div>

      <AddTeamMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        ventureId={ventureId}
      />
    </div>
  );
}
```

### 6.7 VentureOrganizations

**File:** `src/features/ventures/components/VentureOrganizations.tsx`

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, MoreHorizontal, Unlink, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentureOrganizations, useUnlinkOrganization } from '../hooks/useVentureOrganizations';
import { VENTURE_ORG_RELATIONSHIP_OPTIONS } from '../types/venture.types';
import { LinkOrganizationModal } from './LinkOrganizationModal';

interface VentureOrganizationsProps {
  ventureId: string;
}

export function VentureOrganizations({ ventureId }: VentureOrganizationsProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { data: organizations, isLoading } = useVentureOrganizations(ventureId);
  const unlinkOrganization = useUnlinkOrganization(ventureId);

  const getRelationshipLabel = (type: string) => {
    return VENTURE_ORG_RELATIONSHIP_OPTIONS.find((o) => o.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organizations
        </h3>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organizations ({organizations?.length || 0})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowLinkModal(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {organizations?.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
          >
            <Link
              to={`/organizations/${link.organization_id}`}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{link.organization?.name}</p>
                  {link.is_primary && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getRelationshipLabel(link.relationship_type)}
                </Badge>
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => unlinkOrganization.mutate(link.id)}
                  className="text-destructive"
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Unlink Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {(!organizations || organizations.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No organizations linked yet
          </p>
        )}
      </div>

      <LinkOrganizationModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        ventureId={ventureId}
      />
    </div>
  );
}
```

### 6.8 VenturePipelineSummary

**File:** `src/features/ventures/components/VenturePipelineSummary.tsx`

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getPipelineTypeLabel } from '@/lib/constants';

import { useVenturePipelineBreakdown, useVentureStats } from '../hooks/useVentureStats';

interface VenturePipelineSummaryProps {
  ventureSlug: string;
}

export function VenturePipelineSummary({ ventureSlug }: VenturePipelineSummaryProps) {
  const { data: breakdown, isLoading: breakdownLoading } = useVenturePipelineBreakdown(ventureSlug);
  const { data: stats, isLoading: statsLoading } = useVentureStats(ventureSlug);

  const isLoading = breakdownLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalActive = stats?.relationship_count || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Pipeline Summary
        </h3>
        <span className="text-sm font-medium">{totalActive} active</span>
      </div>

      <div className="space-y-2">
        {breakdown?.map((item) => (
          <div key={item.pipeline_type} className="flex items-center justify-between text-sm">
            <span>{getPipelineTypeLabel(item.pipeline_type as any)}</span>
            <span className="font-medium">{item.count}</span>
          </div>
        ))}

        {(!breakdown || breakdown.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No active relationships
          </p>
        )}
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to={`/leadership?venture=${ventureSlug}`}>
          View in Leadership Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
```

### 6.9 VentureRightSidebar

**File:** `src/features/ventures/components/VentureRightSidebar.tsx`

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Venture } from '../types/venture.types';
import { VenturePipelineSummary } from './VenturePipelineSummary';

interface VentureRightSidebarProps {
  venture: Venture;
}

export function VentureRightSidebar({ venture }: VentureRightSidebarProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <VenturePipelineSummary ventureSlug={venture.slug} />

        <Separator />

        {/* Additional sections can be added here */}
        {/* - Needs Attention */}
        {/* - Recent Wins */}
        {/* - Quick Actions */}
      </div>
    </ScrollArea>
  );
}
```

### 6.10 LinkOrganizationModal

**File:** `src/features/ventures/components/LinkOrganizationModal.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { OrganizationCombobox } from '@/features/organizations/components/OrganizationCombobox';
import { useAuth } from '@/features/auth/context/AuthContext';

import { useLinkOrganization } from '../hooks/useVentureOrganizations';
import { VENTURE_ORG_RELATIONSHIP_OPTIONS } from '../types/venture.types';

const linkOrganizationSchema = z.object({
  organization_id: z.string().min(1, 'Organization is required'),
  relationship_type: z.enum(['owns', 'subsidiary', 'client', 'partner', 'vendor', 'other']),
  is_primary: z.boolean(),
  notes: z.string().nullable().optional(),
});

type LinkOrganizationFormValues = z.infer<typeof linkOrganizationSchema>;

interface LinkOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventureId: string;
}

export function LinkOrganizationModal({
  open,
  onOpenChange,
  ventureId,
}: LinkOrganizationModalProps) {
  const { user } = useAuth();
  const linkOrganization = useLinkOrganization(ventureId);

  const form = useForm<LinkOrganizationFormValues>({
    resolver: zodResolver(linkOrganizationSchema),
    defaultValues: {
      organization_id: '',
      relationship_type: 'other',
      is_primary: false,
      notes: '',
    },
  });

  const handleSubmit = (values: LinkOrganizationFormValues) => {
    if (!user?.id) return;

    linkOrganization.mutate(
      { values, userId: user.id },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Organization</DialogTitle>
          <DialogDescription>
            Connect an organization to this venture with a specific relationship type.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <FormControl>
                    <OrganizationCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VENTURE_ORG_RELATIONSHIP_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Primary Organization</FormLabel>
                    <FormDescription>
                      This is the legal entity for this venture
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional context..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={linkOrganization.isPending}>
                {linkOrganization.isPending ? 'Linking...' : 'Link Organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 6.11 AddTeamMemberModal

**File:** `src/features/ventures/components/AddTeamMemberModal.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserCombobox } from '@/features/users/components/UserCombobox';
import { ContactCombobox } from '@/features/contacts/components/ContactCombobox';
import { useAuth } from '@/features/auth/context/AuthContext';

import { useAddTeamMember } from '../hooks/useVentureTeam';

const addTeamMemberSchema = z
  .object({
    member_type: z.enum(['user', 'contact']),
    user_id: z.string().nullable().optional(),
    contact_id: z.string().nullable().optional(),
    role: z.string().min(1, 'Role is required'),
    start_date: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.member_type === 'user') return !!data.user_id;
      if (data.member_type === 'contact') return !!data.contact_id;
      return false;
    },
    { message: 'Please select a team member', path: ['user_id'] }
  );

type AddTeamMemberFormValues = z.infer<typeof addTeamMemberSchema>;

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventureId: string;
}

export function AddTeamMemberModal({ open, onOpenChange, ventureId }: AddTeamMemberModalProps) {
  const { user } = useAuth();
  const addTeamMember = useAddTeamMember(ventureId);

  const form = useForm<AddTeamMemberFormValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      member_type: 'user',
      user_id: null,
      contact_id: null,
      role: '',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const memberType = form.watch('member_type');

  const handleSubmit = (values: AddTeamMemberFormValues) => {
    if (!user?.id) return;

    addTeamMember.mutate(
      { values, userId: user.id },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add an internal user or external contact to this venture's team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user">Internal User</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="contact" id="contact" />
                        <Label htmlFor="contact">External Contact</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {memberType === 'user' ? (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User *</FormLabel>
                    <FormControl>
                      <UserCombobox value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact *</FormLabel>
                    <FormControl>
                      <ContactCombobox value={field.value || ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO, Lead Developer, Advisor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addTeamMember.isPending}>
                {addTeamMember.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Pages

### 7.1 VentureList

**File:** `src/pages/VentureList.tsx`

```tsx
import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';

import { useVentures } from '@/features/ventures/hooks/useVentures';
import { useCreateVenture } from '@/features/ventures/hooks/useCreateVenture';
import { VentureCard } from '@/features/ventures/components/VentureCard';
import { VentureForm } from '@/features/ventures/components/VentureForm';
import type { VentureFilters, VentureFormValues, VentureStatus } from '@/features/ventures/types/venture.types';

export function VentureList() {
  const [filters, setFilters] = useState<VentureFilters>({
    status: 'all',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: ventures, isLoading } = useVentures(filters);
  const createVenture = useCreateVenture();

  const handleCreateVenture = (values: VentureFormValues) => {
    createVenture.mutate(values, {
      onSuccess: () => {
        setShowCreateForm(false);
      },
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventures</h1>
          <p className="text-muted-foreground">
            Manage the NineOneSix venture portfolio
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Venture
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ventures..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value as VentureStatus | 'all' })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="incubating">Incubating</SelectItem>
            <SelectItem value="sunset">Sunset</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as 'cards' | 'table')}
        >
          <ToggleGroupItem value="cards" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ventures?.map((venture) => (
            <VentureCard key={venture.id} venture={venture} />
          ))}
          {ventures?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No ventures found. Create your first venture to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          {/* Table view - simplified for now */}
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Relationships</th>
                <th className="p-3 text-left font-medium">Organizations</th>
                <th className="p-3 text-left font-medium">Team</th>
              </tr>
            </thead>
            <tbody>
              {ventures?.map((venture) => (
                <tr key={venture.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{venture.name}</td>
                  <td className="p-3">{venture.status}</td>
                  <td className="p-3">{venture.relationship_count}</td>
                  <td className="p-3">{venture.organization_count}</td>
                  <td className="p-3">{venture.team_member_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Form Modal */}
      <VentureForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateVenture}
        isLoading={createVenture.isPending}
      />
    </div>
  );
}

export default VentureList;
```

### 7.2 VentureDetail

**File:** `src/pages/VentureDetail.tsx`

```tsx
import { useParams } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityFeed } from '@/features/activities/components/ActivityFeed';

import { useVenture } from '@/features/ventures/hooks/useVenture';
import { useVentureActivity } from '@/features/ventures/hooks/useVentureActivity';
import { VentureHeader } from '@/features/ventures/components/VentureHeader';
import { VentureInfoSidebar } from '@/features/ventures/components/VentureInfoSidebar';
import { VentureRightSidebar } from '@/features/ventures/components/VentureRightSidebar';

export function VentureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: venture, isLoading: ventureLoading } = useVenture(slug);
  const { data: activities, isLoading: activitiesLoading } = useVentureActivity(slug);

  if (ventureLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="flex flex-1">
          <div className="w-72 border-r p-4">
            <Skeleton className="h-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full" />
          </div>
          <div className="w-80 border-l p-4">
            <Skeleton className="h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Venture not found</h2>
          <p className="text-muted-foreground">
            The venture you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <VentureHeader venture={venture} />

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Info */}
        <div className="w-72 border-r bg-background">
          <VentureInfoSidebar venture={venture} />
        </div>

        {/* Center - Activity Feed */}
        <div className="flex-1 bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Activity</h2>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <ActivityFeed activities={activities} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No activity yet for this venture
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Pipeline Summary */}
        <div className="w-80 border-l bg-background">
          <VentureRightSidebar venture={venture} />
        </div>
      </div>
    </div>
  );
}

export default VentureDetail;
```

---

## 8. Router & Navigation Updates

### 8.1 Router Update

**File:** `src/router.tsx` — Add these routes:

```tsx
import { VentureList } from '@/pages/VentureList';
import { VentureDetail } from '@/pages/VentureDetail';

// Add to protected routes:
{
  path: 'ventures',
  element: <VentureList />,
},
{
  path: 'ventures/:slug',
  element: <VentureDetail />,
},
```

### 8.2 Sidebar Navigation Update

**File:** `src/components/layout/Sidebar.tsx` — Add to navItems array:

```tsx
import { Rocket } from 'lucide-react'; // Or another appropriate icon

// Add after Organizations:
{ title: 'Ventures', href: '/ventures', icon: Rocket },
```

### 8.3 Header Navigation Update

**File:** `src/components/layout/HeaderNav.tsx` — Add to navItems array:

```tsx
import { Rocket } from 'lucide-react';

// Add after Organizations:
{ title: 'Ventures', href: '/ventures', icon: Rocket },
```

---

## 9. Integration Updates

### 9.1 Update RelationshipForm to Use VentureSelect

**File:** `src/features/relationships/components/RelationshipForm.tsx`

Replace the hardcoded venture multi-select with the new `VentureSelect` component:

```tsx
import { VentureSelect } from '@/features/ventures/components/VentureSelect';

// In the form, replace the ventures field with:
<FormField
  control={form.control}
  name="ventures"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Ventures</FormLabel>
      <FormControl>
        <VentureSelect
          value={field.value || []}
          onChange={field.onChange}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 9.2 Update Leadership Dashboard

**File:** `src/features/dashboard/components/DashboardFilters.tsx`

Replace the hardcoded venture filter with the new `VentureSelect`:

```tsx
import { useActiveVentures } from '@/features/ventures/hooks/useVentures';

// Use the hook instead of VENTURES constant
const { data: ventures } = useActiveVentures();
```

### 9.3 Deprecate Hardcoded Constants

**File:** `src/lib/constants.ts`

Add deprecation comments and export from database:

```typescript
/**
 * @deprecated Use useActiveVentures() hook instead
 * These are kept for backward compatibility only
 */
export const VENTURES: Array<{ value: string; label: string }> = [
  // ... existing values
];

// Add helper that warns about deprecation
export function getVentureLabel(value: string): string {
  console.warn('getVentureLabel is deprecated. Use venture data from database instead.');
  const venture = VENTURES.find((v) => v.value === value);
  return venture?.label ?? value;
}
```

---

## 10. Claude Implementation Prompt

Copy and paste the following prompt when working with Claude to implement this feature:

---

### CLAUDE IMPLEMENTATION PROMPT

```
I need you to implement the Ventures feature for Carbide CRM. This feature promotes Ventures from hardcoded constants to first-class database entities with full CRUD, organization linking, team management, and a dedicated UI.

## Context

The codebase is a React + TypeScript application using:
- Supabase for database and auth
- TanStack Query for data fetching
- React Hook Form + Zod for forms
- Tailwind CSS + shadcn/ui for styling
- React Router for navigation

The existing patterns to follow can be found in:
- `src/features/contacts/` - for hooks, services, components patterns
- `src/features/organizations/` - for similar entity patterns
- `src/features/dashboard/` - for dashboard components
- `src/components/ui/` - for UI components

## Implementation Order

Please implement in this order:

### Phase 1: Database (Start Here)
1. Create `supabase/migrations/00007_ventures.sql` with the full migration
2. Run the migration locally to verify

### Phase 2: Types
1. Create `src/features/ventures/types/venture.types.ts`

### Phase 3: Service Layer
1. Create `src/features/ventures/services/ventureService.ts`

### Phase 4: Hooks
Create these files in `src/features/ventures/hooks/`:
1. `useVentures.ts` (with query keys)
2. `useVenture.ts`
3. `useVentureStats.ts`
4. `useVentureOrganizations.ts`
5. `useVentureTeam.ts`
6. `useVentureActivity.ts`
7. `useCreateVenture.ts`
8. `useUpdateVenture.ts`
9. `useDeleteVenture.ts`

### Phase 5: Core Components
Create these in `src/features/ventures/components/`:
1. `VentureCard.tsx`
2. `VentureForm.tsx`
3. `VentureSelect.tsx` (this replaces hardcoded venture selects)

### Phase 6: Detail Page Components
1. `VentureHeader.tsx`
2. `VentureInfoSidebar.tsx`
3. `VentureTeamList.tsx`
4. `VentureOrganizations.tsx`
5. `VenturePipelineSummary.tsx`
6. `VentureRightSidebar.tsx`

### Phase 7: Modals
1. `LinkOrganizationModal.tsx`
2. `AddTeamMemberModal.tsx`

### Phase 8: Pages
1. `src/pages/VentureList.tsx`
2. `src/pages/VentureDetail.tsx`

### Phase 9: Router & Navigation
1. Add routes to `src/router.tsx`
2. Add nav item to `src/components/layout/Sidebar.tsx`
3. Add nav item to `src/components/layout/HeaderNav.tsx`

### Phase 10: Integration
1. Update `RelationshipForm.tsx` to use `VentureSelect`
2. Update Leadership Dashboard filters to use database ventures
3. Add deprecation notices to `src/lib/constants.ts`

## Key Requirements

1. **Backward Compatibility**: The existing `business_relationships.ventures` array column must continue to work. The venture slugs in the database must match the existing enum values.

2. **Status Visibility**:
   - `archived` ventures should NOT appear in VentureSelect
   - `sunset` ventures SHOULD appear in VentureSelect (allow new relationships)

3. **Team Member Roles**: Use freeform text, not an enum

4. **Organization Links**: Support multiple relationship types (owns, subsidiary, client, partner, vendor, other)

5. **Primary Organization**: Only one org per venture can be marked as primary

## Reference

The complete implementation code is provided in the attached markdown document. Use it as a reference for the exact code to implement, but adapt as needed based on existing patterns in the codebase.

Please start with Phase 1 (Database Migration) and confirm it works before proceeding.
```

---

## Appendix: Component Dependencies

This feature requires these existing components that may need to be created if they don't exist:

| Component | Location | Purpose |
|-----------|----------|---------|
| `OrganizationCombobox` | `src/features/organizations/components/` | Select an organization |
| `ContactCombobox` | `src/features/contacts/components/` | Select a contact |
| `UserCombobox` | `src/features/users/components/` | Select a user |
| `ActivityFeed` | `src/features/activities/components/` | Display activities |

If these don't exist, they can be created following the pattern of the `VentureSelect` component with appropriate data sources.

---

*End of Implementation Document*
