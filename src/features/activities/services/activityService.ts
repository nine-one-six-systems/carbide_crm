import { restClient, getCurrentUserId } from '@/lib/supabase/restClient';
import type { ActivitySearchParams, PaginatedResponse } from '@/types/api';
import type { Activity } from '@/types/database';

// Select string for activities with related data
const ACTIVITY_SELECT = `*, contact:contacts(id, first_name, last_name, avatar_url), organization:organizations(id, name, logo_url), logged_by_user:profiles!logged_by(id, full_name, avatar_url)`;

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

    const filters: Array<{ column: string; operator: 'eq' | 'in' | 'gte' | 'lte'; value: unknown }> = [];

    // Filter by type
    if (type && type.length > 0) {
      filters.push({ column: 'type', operator: 'in', value: type });
    }

    // Filter by contact
    if (contactId) {
      filters.push({ column: 'contact_id', operator: 'eq', value: contactId });
    }

    // Filter by organization
    if (organizationId) {
      filters.push({ column: 'organization_id', operator: 'eq', value: organizationId });
    }

    // Filter by date range
    if (occurredFrom) {
      filters.push({ column: 'occurred_at', operator: 'gte', value: occurredFrom });
    }
    if (occurredTo) {
      filters.push({ column: 'occurred_at', operator: 'lte', value: occurredTo });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await restClient.query<Activity>('activities', {
      select: ACTIVITY_SELECT,
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

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
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.insert<Activity>(
      'activities',
      {
        ...payload,
        logged_by: userId,
        occurred_at: payload.occurred_at || new Date().toISOString(),
        metadata: payload.metadata || {},
      },
      { select: ACTIVITY_SELECT }
    );

    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }

    return data as Activity;
  },
};
