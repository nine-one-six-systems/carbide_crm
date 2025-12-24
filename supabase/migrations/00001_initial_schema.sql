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
  emails JSONB DEFAULT '[]'::jsonb,
  phones JSONB DEFAULT '[]'::jsonb,
  addresses JSONB DEFAULT '[]'::jsonb,
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
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
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
  paused_days INTEGER DEFAULT 0,
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
  metadata JSONB DEFAULT '{}'::jsonb
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

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
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
      NEW.start_date + (step.day_offset || ' days')::INTERVAL,
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
  inverse_type := CASE NEW.relationship_type
    WHEN 'parent_child' THEN 'parent_child'::secondary_relationship_type
    WHEN 'manager_reports_to' THEN 'manager_reports_to'::secondary_relationship_type
    WHEN 'mentor_mentee' THEN 'mentor_mentee'::secondary_relationship_type
    WHEN 'referral_source' THEN 'referral_source'::secondary_relationship_type
    ELSE NEW.relationship_type
  END;
  
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

