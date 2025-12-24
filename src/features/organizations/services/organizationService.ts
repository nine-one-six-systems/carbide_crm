import { supabase } from '@/lib/supabase/client';
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
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

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

    let queryBuilder = supabase
      .from('organizations')
      .select('*', { count: 'exact' });

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query);
    }

    // Filter by type
    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags);
    }

    // Sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        ...payload,
        created_by: user.id,
        addresses: payload.addresses || [],
        tags: payload.tags || [],
      })
      .select()
      .single();

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

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

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
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },
};

