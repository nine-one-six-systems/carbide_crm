import { supabase } from '@/lib/supabase/client';
import type { ActivitySearchParams, PaginatedResponse } from '@/types/api';
import type { Activity } from '@/types/database';

export const activityService = {
  /**
   * Get activities with pagination and filtering
   */
  async search(
    params: ActivitySearchParams
  ): Promise<PaginatedResponse<Activity>> {
    const {
      page = 1,
      pageSize = 50,
      sortBy = 'occurred_at',
      sortOrder = 'desc',
      type,
      contactId,
      organizationId,
      occurredFrom,
      occurredTo,
    } = params;

    let queryBuilder = supabase
      .from('activities')
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        logged_by_user:profiles!logged_by(id, full_name, avatar_url)
      `,
        { count: 'exact' }
      );

    // Filter by type
    if (type && type.length > 0) {
      queryBuilder = queryBuilder.in('type', type);
    }

    // Filter by contact
    if (contactId) {
      queryBuilder = queryBuilder.eq('contact_id', contactId);
    }

    // Filter by organization
    if (organizationId) {
      queryBuilder = queryBuilder.eq('organization_id', organizationId);
    }

    // Filter by date range
    if (occurredFrom) {
      queryBuilder = queryBuilder.gte('occurred_at', occurredFrom);
    }
    if (occurredTo) {
      queryBuilder = queryBuilder.lte('occurred_at', occurredTo);
    }

    // Sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error searching activities:', error);
      throw error;
    }

    return {
      data: (data || []) as Activity[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Create a new activity
   */
  async create(payload: {
    type: string;
    contact_id?: string;
    organization_id?: string;
    relationship_id?: string;
    cadence_task_id?: string;
    manual_task_id?: string;
    subject?: string;
    notes?: string;
    occurred_at?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Activity> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...payload,
        logged_by: user.id,
        occurred_at: payload.occurred_at || new Date().toISOString(),
        metadata: payload.metadata || {},
      })
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        logged_by_user:profiles!logged_by(id, full_name, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }

    return data as Activity;
  },
};

