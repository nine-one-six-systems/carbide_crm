-- =============================================================================
-- ENABLE REALTIME FOR TABLES
-- =============================================================================
-- Enable Realtime for tables that need live updates
-- Note: In Supabase, tables are added to the supabase_realtime publication

-- Enable Realtime for cadence_tasks (for task updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.cadence_tasks;

-- Enable Realtime for manual_tasks (for task updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.manual_tasks;

-- Enable Realtime for activities (for activity feeds)
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Enable Realtime for contacts (for contact updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;

-- Enable Realtime for organizations (for organization updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;

-- Enable Realtime for business_relationships (for relationship updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_relationships;

-- Enable Realtime for applied_cadences (for cadence status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.applied_cadences;

