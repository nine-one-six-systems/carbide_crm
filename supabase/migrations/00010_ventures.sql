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

