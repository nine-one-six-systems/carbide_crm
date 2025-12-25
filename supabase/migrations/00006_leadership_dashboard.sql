-- =============================================================================
-- LEADERSHIP DASHBOARD FUNCTIONS
-- Migration: 00006_leadership_dashboard.sql
-- Purpose: RPC functions for the Leadership Dashboard feature
-- =============================================================================

-- Helper function to get terminal (closed) stages for each pipeline type
CREATE OR REPLACE FUNCTION get_terminal_stages(p_type business_relationship_type)
RETURNS TEXT[] AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'b2b_client' THEN ARRAY['Won', 'Lost', 'Churned', 'Disqualified']
    WHEN 'b2c_client' THEN ARRAY['Closed', 'Lost', 'Churned', 'Cancelled']
    WHEN 'business_investment_external' THEN ARRAY['Invested', 'Passed', 'Withdrawn', 'Portfolio']
    WHEN 'non_business_investment' THEN ARRAY['Exited', 'Passed', 'Written Off']
    WHEN 'internal_business_opportunity' THEN ARRAY['Launched', 'Shelved', 'Merged']
    WHEN 'portfolio_company' THEN ARRAY['Exited', 'Written Off', 'Acquired', 'Wound Down']
    WHEN 'partnership_opportunity' THEN ARRAY['Active Partnership', 'Declined', 'Dissolved', 'Inactive']
    WHEN 'individual_partnership' THEN ARRAY['Active', 'Declined', 'Inactive']
    WHEN 'investor' THEN ARRAY['Committed', 'Passed', 'Funded']
    WHEN 'meridian_44_participant' THEN ARRAY['Active Contributor', 'Declined', 'Inactive']
    ELSE ARRAY['Closed', 'Lost']::TEXT[]
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- Get summary KPIs for leadership dashboard
-- Returns: active_count, advanced_count, stuck_count, cold_count
-- =============================================================================
CREATE OR REPLACE FUNCTION get_leadership_summary(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  active_count BIGINT,
  advanced_count BIGINT,
  stuck_count BIGINT,
  cold_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH included_types AS (
    SELECT unnest(ARRAY[
      'b2b_client', 'b2c_client', 'business_investment_external',
      'internal_business_opportunity', 'portfolio_company',
      'partnership_opportunity', 'individual_partnership',
      'investor', 'meridian_44_participant'
    ]::business_relationship_type[]) as type_value
  ),
  filtered_relationships AS (
    SELECT 
      br.id,
      br.type,
      br.stage,
      br.updated_at,
      br.created_at,
      (
        SELECT MAX(a.occurred_at) 
        FROM activities a 
        WHERE a.relationship_id = br.id
      ) as last_activity,
      (
        SELECT MAX(a.occurred_at)
        FROM activities a
        WHERE a.relationship_id = br.id 
        AND a.type = 'stage_change'
      ) as last_stage_change
    FROM business_relationships br
    WHERE br.type IN (SELECT type_value FROM included_types)
    AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
    AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
    AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  )
  SELECT
    COUNT(*)::BIGINT as active_count,
    COUNT(*) FILTER (
      WHERE last_stage_change >= p_period_start AND last_stage_change <= p_period_end
    )::BIGINT as advanced_count,
    COUNT(*) FILTER (
      WHERE last_stage_change < NOW() - INTERVAL '30 days'
      OR (last_stage_change IS NULL AND created_at < NOW() - INTERVAL '30 days')
    )::BIGINT as stuck_count,
    COUNT(*) FILTER (
      WHERE last_activity < NOW() - INTERVAL '7 days'
      OR (last_activity IS NULL AND created_at < NOW() - INTERVAL '7 days')
    )::BIGINT as cold_count
  FROM filtered_relationships;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- Get activity volume metrics for the period
-- Returns: calls, emails, meetings counts
-- =============================================================================
CREATE OR REPLACE FUNCTION get_activity_volume(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  calls BIGINT,
  emails BIGINT,
  meetings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE a.type IN ('call_inbound', 'call_outbound'))::BIGINT as calls,
    COUNT(*) FILTER (WHERE a.type IN ('email_inbound', 'email_outbound'))::BIGINT as emails,
    COUNT(*) FILTER (WHERE a.type IN ('meeting_in_person', 'meeting_virtual'))::BIGINT as meetings
  FROM activities a
  LEFT JOIN business_relationships br ON a.relationship_id = br.id
  WHERE a.occurred_at BETWEEN p_period_start AND p_period_end
  AND (p_venture IS NULL OR (br.id IS NOT NULL AND p_venture = ANY(br.ventures)))
  AND (p_owner_id IS NULL OR a.logged_by = p_owner_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- Get per-pipeline summary data
-- Returns: pipeline_type, active_count, stages (jsonb), ventures (jsonb)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_pipeline_summaries(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  pipeline_type business_relationship_type,
  active_count BIGINT,
  stages JSONB,
  ventures JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH included_types AS (
    SELECT unnest(ARRAY[
      'b2b_client', 'b2c_client', 'business_investment_external',
      'internal_business_opportunity', 'portfolio_company',
      'partnership_opportunity', 'individual_partnership',
      'investor', 'meridian_44_participant'
    ]::business_relationship_type[]) as type_value
  ),
  filtered_relationships AS (
    SELECT 
      br.id,
      br.type,
      br.stage,
      br.ventures as rel_ventures
    FROM business_relationships br
    WHERE br.type IN (SELECT type_value FROM included_types)
    AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
    AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
    AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  ),
  stage_counts AS (
    SELECT 
      fr.type,
      fr.stage,
      COUNT(*) as cnt
    FROM filtered_relationships fr
    GROUP BY fr.type, fr.stage
  ),
  venture_counts AS (
    SELECT 
      fr.type,
      v as venture_name,
      COUNT(*) as cnt
    FROM filtered_relationships fr
    CROSS JOIN LATERAL unnest(fr.rel_ventures) as v
    GROUP BY fr.type, v
  )
  SELECT
    fr.type as pipeline_type,
    COUNT(DISTINCT fr.id)::BIGINT as active_count,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('stage', sc.stage, 'count', sc.cnt))
       FROM stage_counts sc WHERE sc.type = fr.type),
      '[]'::jsonb
    ) as stages,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('venture', vc.venture_name, 'count', vc.cnt))
       FROM venture_counts vc WHERE vc.type = fr.type),
      '[]'::jsonb
    ) as ventures
  FROM filtered_relationships fr
  GROUP BY fr.type;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- Get opportunities with no recent activity (going cold)
-- Returns: id, entity_name, entity_type, pipeline_type, stage, days_since_activity, owner_name, ventures
-- =============================================================================
CREATE OR REPLACE FUNCTION get_cold_opportunities(
  p_days_threshold INT DEFAULT 7,
  p_limit INT DEFAULT 10,
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entity_name TEXT,
  entity_type TEXT,
  pipeline_type business_relationship_type,
  stage TEXT,
  days_since_activity INT,
  owner_name TEXT,
  ventures venture[]
) AS $$
BEGIN
  RETURN QUERY
  WITH included_types AS (
    SELECT unnest(ARRAY[
      'b2b_client', 'b2c_client', 'business_investment_external',
      'internal_business_opportunity', 'portfolio_company',
      'partnership_opportunity', 'individual_partnership',
      'investor', 'meridian_44_participant'
    ]::business_relationship_type[]) as type_value
  )
  SELECT
    br.id,
    COALESCE(c.first_name || ' ' || c.last_name, o.name, 'Unknown') as entity_name,
    CASE WHEN br.contact_id IS NOT NULL THEN 'contact' ELSE 'organization' END as entity_type,
    br.type as pipeline_type,
    br.stage,
    EXTRACT(DAY FROM NOW() - COALESCE(
      (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = br.id),
      br.created_at
    ))::INT as days_since_activity,
    COALESCE(p.full_name, 'Unassigned') as owner_name,
    br.ventures
  FROM business_relationships br
  LEFT JOIN contacts c ON br.contact_id = c.id
  LEFT JOIN organizations o ON br.organization_id = o.id
  LEFT JOIN profiles p ON br.owner_id = p.id
  WHERE br.type IN (SELECT type_value FROM included_types)
  AND NOT (br.stage = ANY(get_terminal_stages(br.type)))
  AND (p_venture IS NULL OR p_venture = ANY(br.ventures))
  AND (p_owner_id IS NULL OR br.owner_id = p_owner_id)
  AND COALESCE(
    (SELECT MAX(a.occurred_at) FROM activities a WHERE a.relationship_id = br.id),
    br.created_at
  ) < NOW() - (p_days_threshold || ' days')::INTERVAL
  ORDER BY days_since_activity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================================
-- Get recent activity feed across pipelines
-- Returns: id, type, entity_name, entity_id, pipeline_type, description, occurred_at, user_name
-- =============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_activity(
  p_period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '14 days',
  p_period_end TIMESTAMPTZ DEFAULT NOW(),
  p_venture venture DEFAULT NULL,
  p_owner_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  activity_type activity_type,
  entity_name TEXT,
  entity_id UUID,
  pipeline_type business_relationship_type,
  description TEXT,
  occurred_at TIMESTAMPTZ,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.type as activity_type,
    COALESCE(c.first_name || ' ' || c.last_name, o.name, 'Unknown') as entity_name,
    COALESCE(a.contact_id, a.organization_id) as entity_id,
    br.type as pipeline_type,
    COALESCE(a.subject, a.notes, '') as description,
    a.occurred_at,
    COALESCE(p.full_name, 'Unknown') as user_name
  FROM activities a
  LEFT JOIN contacts c ON a.contact_id = c.id
  LEFT JOIN organizations o ON a.organization_id = o.id
  LEFT JOIN business_relationships br ON a.relationship_id = br.id
  LEFT JOIN profiles p ON a.logged_by = p.id
  WHERE a.occurred_at BETWEEN p_period_start AND p_period_end
  AND (p_venture IS NULL OR (br.id IS NOT NULL AND p_venture = ANY(br.ventures)))
  AND (p_owner_id IS NULL OR a.logged_by = p_owner_id)
  ORDER BY a.occurred_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add helpful indexes for dashboard queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_activities_relationship_occurred 
  ON activities(relationship_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_biz_rel_type_stage_not_terminal 
  ON business_relationships(type, stage) 
  WHERE stage NOT IN ('Won', 'Lost', 'Closed', 'Churned', 'Passed', 'Declined', 'Inactive');

