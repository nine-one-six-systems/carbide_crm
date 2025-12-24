-- Seed data for development
-- Note: This assumes you have at least one user in auth.users
-- Run this after migrations and after creating a user

-- Insert sample organizations
INSERT INTO public.organizations (name, type, industry, website, description, tags, created_by)
SELECT 
  'Acme Corporation',
  'company'::organization_type,
  'Technology',
  'https://acme.com',
  'A leading technology company',
  ARRAY['enterprise', 'saas'],
  id
FROM public.profiles
LIMIT 1;

INSERT INTO public.organizations (name, type, industry, website, description, tags, created_by)
SELECT 
  'Venture Capital Partners',
  'fund'::organization_type,
  'Finance',
  'https://vcp.com',
  'Early stage venture capital fund',
  ARRAY['vc', 'seed'],
  id
FROM public.profiles
LIMIT 1;

-- Insert sample contacts
INSERT INTO public.contacts (
  first_name,
  last_name,
  emails,
  phones,
  job_title,
  description,
  tags,
  created_by
)
SELECT 
  'John',
  'Doe',
  '[{"value": "john.doe@acme.com", "label": "Work", "is_primary": true}]'::jsonb,
  '[{"value": "+1-555-0100", "label": "Mobile", "is_primary": true}]'::jsonb,
  'CEO',
  'Chief Executive Officer at Acme Corporation',
  ARRAY['executive', 'decision-maker'],
  id
FROM public.profiles
LIMIT 1;

INSERT INTO public.contacts (
  first_name,
  last_name,
  emails,
  phones,
  job_title,
  description,
  tags,
  created_by
)
SELECT 
  'Jane',
  'Smith',
  '[{"value": "jane.smith@vcp.com", "label": "Work", "is_primary": true}]'::jsonb,
  '[{"value": "+1-555-0101", "label": "Mobile", "is_primary": true}]'::jsonb,
  'Partner',
  'Investment Partner at Venture Capital Partners',
  ARRAY['investor', 'partner'],
  id
FROM public.profiles
LIMIT 1;

-- Link contacts to organizations
INSERT INTO public.contact_organization_links (
  contact_id,
  organization_id,
  role_title,
  role_type,
  is_primary,
  is_current
)
SELECT 
  c.id,
  o.id,
  'CEO',
  'executive'::role_type,
  true,
  true
FROM public.contacts c
CROSS JOIN public.organizations o
WHERE c.first_name = 'John' AND c.last_name = 'Doe'
  AND o.name = 'Acme Corporation'
LIMIT 1;

INSERT INTO public.contact_organization_links (
  contact_id,
  organization_id,
  role_title,
  role_type,
  is_primary,
  is_current
)
SELECT 
  c.id,
  o.id,
  'Partner',
  'executive'::role_type,
  true,
  true
FROM public.contacts c
CROSS JOIN public.organizations o
WHERE c.first_name = 'Jane' AND c.last_name = 'Smith'
  AND o.name = 'Venture Capital Partners'
LIMIT 1;

