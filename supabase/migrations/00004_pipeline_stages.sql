-- Pipeline Stages Lookup Table
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_type business_relationship_type NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  is_terminal BOOLEAN DEFAULT false,
  terminal_type TEXT,
  
  UNIQUE(relationship_type, stage_name)
);

CREATE INDEX pipeline_stages_type_idx ON public.pipeline_stages(relationship_type);
CREATE INDEX pipeline_stages_order_idx ON public.pipeline_stages(relationship_type, stage_order);

-- Enable RLS
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pipeline stages are viewable by all authenticated users"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage pipeline stages"
  ON public.pipeline_stages FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

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

