import { restClient, getCurrentUserIdFromToken } from '@/lib/supabase/restClient';
import type {
  OrganizationSearchParams,
  OrganizationCreatePayload,
  OrganizationUpdatePayload,
  PaginatedResponse,
} from '@/types/api';
import type { Organization } from '@/types/database';

export const organizationService = {
  /**
   * Get a single organization by ID
   */
  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await restClient.querySingle<Organization>('organizations', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }

    return data as Organization;
  },

  /**
   * Search organizations with pagination, filtering, and sorting
   */
  async search(
    params: OrganizationSearchParams
  ): Promise<PaginatedResponse<Organization>> {
    const {
      query,
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      type,
      tags,
    } = params;

    const filters: Array<{ column: string; operator: 'eq' | 'cs' | 'fts'; value: unknown }> = [];

    // Full-text search
    if (query) {
      filters.push({ column: 'search_vector', operator: 'fts', value: query });
    }

    // Filter by type
    if (type) {
      filters.push({ column: 'type', operator: 'eq', value: type });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filters.push({ column: 'tags', operator: 'cs', value: tags });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await restClient.query<Organization>('organizations', {
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

    if (error) {
      console.error('Error searching organizations:', error);
      throw error;
    }

    return {
      data: (data || []) as Organization[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Create a new organization
   */
  async create(payload: OrganizationCreatePayload): Promise<Organization> {
    // Use getCurrentUserIdFromToken to get user ID from JWT token
    // This ensures it matches what RLS policies use (auth.uid())
    const userId = await getCurrentUserIdFromToken();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.insert<Organization>('organizations', {
      ...payload,
      created_by: userId,
      addresses: payload.addresses || [],
      tags: payload.tags || [],
    });

    if (error) {
      console.error('Error creating organization:', error);
      throw error;
    }

    return data as Organization;
  },

  /**
   * Update an existing organization
   */
  async update(payload: OrganizationUpdatePayload): Promise<Organization> {
    const { id, ...updateData } = payload;

    const { data, error } = await restClient.update<Organization>(
      'organizations',
      updateData,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating organization:', error);
      throw error;
    }

    return data as Organization;
  },

  /**
   * Delete an organization
   */
  async delete(id: string): Promise<void> {
    const { error } = await restClient.remove(
      'organizations',
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },
};
