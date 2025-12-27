-- =============================================================================
-- PROJECTS MODULE
-- Migration: 00009_projects_module.sql
-- Purpose: Add project management tables, enums, indexes, RLS policies, 
--          triggers, and helper functions for tracking initiatives across
--          the NineOneSix ecosystem
-- =============================================================================

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

