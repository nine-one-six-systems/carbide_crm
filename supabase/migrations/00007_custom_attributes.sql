-- =============================================================================
-- CUSTOM ATTRIBUTES SCHEMA EXTENSION
-- Adds JSONB custom_attributes to contacts and organizations for flexible
-- data storage per the migration mapping specification.
-- =============================================================================

-- Add custom_attributes JSONB column to contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}'::jsonb;

-- Add custom_attributes JSONB column to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}'::jsonb;

-- Create GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_contacts_custom_attrs 
ON public.contacts USING GIN (custom_attributes);

CREATE INDEX IF NOT EXISTS idx_organizations_custom_attrs 
ON public.organizations USING GIN (custom_attributes);

-- Create indexes for common nested paths
CREATE INDEX IF NOT EXISTS idx_contacts_custom_attrs_personal 
ON public.contacts USING GIN ((custom_attributes->'personal'));

CREATE INDEX IF NOT EXISTS idx_contacts_custom_attrs_social 
ON public.contacts USING GIN ((custom_attributes->'social'));

CREATE INDEX IF NOT EXISTS idx_contacts_custom_attrs_geo 
ON public.contacts USING GIN ((custom_attributes->'geo'));

CREATE INDEX IF NOT EXISTS idx_organizations_custom_attrs_geo 
ON public.organizations USING GIN ((custom_attributes->'geo'));

-- =============================================================================
-- CUSTOM FIELD DEFINITIONS TABLE
-- Stores admin-configurable field schemas for dynamic form generation
-- =============================================================================

CREATE TYPE custom_field_type AS ENUM (
  'text', 'number', 'date', 'boolean', 'select', 'multiselect', 'url', 'email'
);

CREATE TYPE custom_field_entity AS ENUM (
  'contact', 'organization', 'both'
);

CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type custom_field_type NOT NULL DEFAULT 'text',
  category TEXT NOT NULL DEFAULT 'custom',
  entity_type custom_field_entity NOT NULL DEFAULT 'both',
  options JSONB DEFAULT '[]'::jsonb,  -- For select/multiselect types
  is_required BOOLEAN NOT NULL DEFAULT false,
  show_on_card BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique keys within entity type
  UNIQUE(key, entity_type)
);

CREATE INDEX idx_custom_field_defs_entity ON public.custom_field_definitions(entity_type);
CREATE INDEX idx_custom_field_defs_category ON public.custom_field_definitions(category);
CREATE INDEX idx_custom_field_defs_active ON public.custom_field_definitions(is_active);

-- Auto-update updated_at trigger
CREATE TRIGGER update_custom_field_definitions_updated_at
  BEFORE UPDATE ON public.custom_field_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DEFAULT FIELD DEFINITIONS
-- Pre-populate with fields from migration mapping
-- =============================================================================

INSERT INTO public.custom_field_definitions (key, label, field_type, category, entity_type, show_on_card, display_order)
VALUES
  -- Personal fields (contacts only)
  ('favorite_food', 'Favorite Food', 'text', 'personal', 'contact', false, 1),
  ('favorite_drink', 'Favorite Drink', 'text', 'personal', 'contact', false, 2),
  ('coffee_order', 'Coffee/Starbucks Order', 'text', 'personal', 'contact', false, 3),
  ('favorite_restaurant', 'Favorite Restaurant', 'text', 'personal', 'contact', false, 4),
  ('hobbies', 'Hobbies', 'text', 'personal', 'contact', false, 5),
  ('leisure_activities', 'Leisure Activities', 'text', 'personal', 'contact', false, 6),
  ('goals', 'Personal Goals', 'text', 'personal', 'contact', false, 7),
  ('birthday', 'Birthday', 'date', 'personal', 'contact', true, 8),
  ('anniversary', 'Anniversary Date', 'date', 'personal', 'contact', false, 9),
  ('marital_status', 'Marital Status', 'select', 'personal', 'contact', false, 10),
  ('dependents', 'Dependents', 'text', 'personal', 'contact', false, 11),
  
  -- Social fields (contacts)
  ('linkedin', 'LinkedIn', 'url', 'social', 'contact', false, 1),
  ('twitter', 'Twitter/X', 'url', 'social', 'contact', false, 2),
  ('facebook', 'Facebook', 'url', 'social', 'contact', false, 3),
  ('instagram', 'Instagram', 'url', 'social', 'contact', false, 4),
  ('skype', 'Skype', 'text', 'social', 'contact', false, 5),
  ('website', 'Personal Website', 'url', 'social', 'contact', false, 6),
  
  -- Social fields (organizations)
  ('linkedin', 'LinkedIn', 'url', 'social', 'organization', false, 1),
  ('twitter', 'Twitter/X', 'url', 'social', 'organization', false, 2),
  ('facebook', 'Facebook', 'url', 'social', 'organization', false, 3),
  ('instagram', 'Instagram', 'url', 'social', 'organization', false, 4),
  ('skype', 'Skype', 'text', 'social', 'organization', false, 5),
  
  -- Preferences (contacts only)
  ('email_opt_out', 'Email Opt Out', 'boolean', 'preferences', 'contact', false, 1),
  ('sms_opt_out', 'SMS Opt Out', 'boolean', 'preferences', 'contact', false, 2),
  ('email_opt_out_reason', 'Email Opt Out Reason', 'text', 'preferences', 'contact', false, 3),
  
  -- Geo fields (both)
  ('lat', 'Latitude', 'number', 'geo', 'both', false, 1),
  ('lng', 'Longitude', 'number', 'geo', 'both', false, 2),
  ('created_lat', 'Created Latitude', 'number', 'geo', 'both', false, 3),
  ('created_lng', 'Created Longitude', 'number', 'geo', 'both', false, 4),
  ('created_address', 'Created Address', 'text', 'geo', 'both', false, 5),
  
  -- Organization operations fields
  ('vehicles', 'Vehicles', 'number', 'operations', 'organization', false, 1),
  ('location_count', 'Number of Locations', 'number', 'operations', 'organization', false, 2),
  ('timezone', 'Time Zone', 'text', 'operations', 'organization', false, 3),
  ('site_code', 'Site Code', 'text', 'identifiers', 'organization', false, 1),
  ('admin_poc', 'Admin Point of Contact', 'text', 'contacts', 'organization', false, 1),
  ('onsite_poc', 'On-Site Point of Contact', 'text', 'contacts', 'organization', false, 2)
ON CONFLICT (key, entity_type) DO NOTHING;

-- Update marital_status field with options
UPDATE public.custom_field_definitions 
SET options = '["Single", "Married", "Divorced", "Widowed", "Partnered", "Other"]'::jsonb
WHERE key = 'marital_status' AND entity_type = 'contact';

-- =============================================================================
-- HELPER FUNCTIONS FOR JSONB QUERIES
-- =============================================================================

-- Function to get a nested custom attribute value
CREATE OR REPLACE FUNCTION get_custom_attr(
  p_custom_attributes JSONB,
  p_category TEXT,
  p_key TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN p_custom_attributes->p_category->>p_key;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if a custom attribute exists and matches a value
CREATE OR REPLACE FUNCTION custom_attr_matches(
  p_custom_attributes JSONB,
  p_category TEXT,
  p_key TEXT,
  p_value TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_custom_attributes->p_category->>p_key ILIKE '%' || p_value || '%';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search contacts by custom attribute
CREATE OR REPLACE FUNCTION search_contacts_by_custom_attr(
  p_category TEXT,
  p_key TEXT,
  p_value TEXT
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  custom_attributes JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.first_name, c.last_name, c.custom_attributes
  FROM public.contacts c
  WHERE c.custom_attributes->p_category->>p_key ILIKE '%' || p_value || '%';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS POLICIES FOR CUSTOM FIELD DEFINITIONS
-- =============================================================================

ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view field definitions
CREATE POLICY "Users can view custom field definitions"
  ON public.custom_field_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage field definitions
CREATE POLICY "Admins can manage custom field definitions"
  ON public.custom_field_definitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- UPDATE SEARCH VECTORS TO INCLUDE CUSTOM ATTRIBUTES
-- =============================================================================

-- Update contacts search vector to include custom attribute text values
-- Note: This is a simplified version; full implementation would extract all text values
ALTER TABLE public.contacts 
DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.contacts 
ADD COLUMN search_vector TSVECTOR GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(job_title, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(custom_attributes->>'personal', '')), 'D')
) STORED;

-- Recreate the search index
DROP INDEX IF EXISTS contacts_search_idx;
CREATE INDEX contacts_search_idx ON public.contacts USING GIN(search_vector);

