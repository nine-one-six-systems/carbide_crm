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
  USING (is_admin())
  WITH CHECK (is_admin());

-- Cadence Steps
CREATE POLICY "Cadence steps are viewable by all authenticated users"
  ON public.cadence_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage cadence steps"
  ON public.cadence_steps FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

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

