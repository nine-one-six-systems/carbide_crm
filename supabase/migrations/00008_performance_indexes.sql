-- =============================================================================
-- PERFORMANCE INDEXES
-- Migration: 00008_performance_indexes.sql
-- Purpose: Add composite indexes to optimize common query patterns for
--          dashboard filters, timeline queries, relationship activity, and task lists
-- =============================================================================

-- NOTE: CREATE INDEX CONCURRENTLY cannot run inside a transaction block.
-- Supabase migrations typically run in transactions. If this migration fails
-- due to transaction constraints, you may need to:
-- 1. Run these indexes manually outside a transaction, OR
-- 2. Use regular CREATE INDEX IF NOT EXISTS instead of CONCURRENTLY
-- 
-- For production deployments, consider running CONCURRENTLY indexes manually
-- during a maintenance window to avoid locking tables.

-- =============================================================================
-- BUSINESS RELATIONSHIPS INDEXES
-- =============================================================================

-- Composite index for dashboard filtering queries
-- Optimizes queries that filter business_relationships by type, stage, and owner_id
-- Common use case: Dashboard views showing pipelines filtered by type/stage/owner
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_biz_rel_type_stage_owner 
ON public.business_relationships(type, stage, owner_id);

-- =============================================================================
-- ACTIVITIES INDEXES
-- =============================================================================

-- Composite index for contact timeline queries
-- Optimizes queries that fetch activities for a specific contact ordered by date
-- Common use case: Contact detail page showing activity timeline in reverse chronological order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_contact_occurred 
ON public.activities(contact_id, occurred_at DESC);

-- Composite index for relationship activity queries
-- Optimizes queries that filter activities by relationship and type, ordered by date
-- Common use case: Relationship detail pages showing filtered activity history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_relationship_type_occurred 
ON public.activities(relationship_id, type, occurred_at);

-- =============================================================================
-- TASK INDEXES
-- =============================================================================

-- Composite index for cadence task list queries
-- Optimizes queries that filter cadence tasks by assignee and status, ordered by due date
-- Common use case: Task list views showing pending/completed tasks for a user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cadence_tasks_assigned_status_due 
ON public.cadence_tasks(assigned_to, status, due_date);

-- Composite index for manual task list queries
-- Optimizes queries that filter manual tasks by assignee and status, ordered by due date
-- Common use case: Task list views showing pending/completed manual tasks for a user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_manual_tasks_assigned_status_due 
ON public.manual_tasks(assigned_to, status, due_date);

