import { supabase } from '@/lib/supabase/client';
import type {
  RelationshipSearchParams,
  PaginatedResponse,
} from '@/types/api';
import type { BusinessRelationship } from '@/types/database';

export const relationshipService = {
  /**
   * Get a single relationship by ID
   */
  async getById(id: string): Promise<BusinessRelationship | null> {
    const { data, error } = await supabase
      .from('business_relationships')
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching relationship:', error);
      throw error;
    }

    return data as BusinessRelationship;
  },

  /**
   * Search relationships with pagination, filtering, and sorting
   */
  async search(
    params: RelationshipSearchParams
  ): Promise<PaginatedResponse<BusinessRelationship>> {
    const {
      query,
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      type,
      stage,
      ventures,
      ownerId,
    } = params;

    let queryBuilder = supabase
      .from('business_relationships')
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `,
        { count: 'exact' }
      );

    // Filter by type
    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }

    // Filter by stage
    if (stage) {
      queryBuilder = queryBuilder.eq('stage', stage);
    }

    // Filter by ventures
    if (ventures && ventures.length > 0) {
      queryBuilder = queryBuilder.contains('ventures', ventures);
    }

    // Filter by owner
    if (ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', ownerId);
    }

    // Sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error searching relationships:', error);
      throw error;
    }

    return {
      data: (data || []) as BusinessRelationship[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Get relationships grouped by stage (for pipeline view)
   */
  async getByStages(
    type: string,
    stages: string[]
  ): Promise<Record<string, BusinessRelationship[]>> {
    const { data, error } = await supabase
      .from('business_relationships')
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .eq('type', type)
      .in('stage', stages);

    if (error) {
      console.error('Error fetching relationships by stages:', error);
      throw error;
    }

    const grouped = (data || []).reduce(
      (acc, rel) => {
        if (!acc[rel.stage]) {
          acc[rel.stage] = [];
        }
        acc[rel.stage].push(rel as BusinessRelationship);
        return acc;
      },
      {} as Record<string, BusinessRelationship[]>
    );

    return grouped;
  },

  /**
   * Create a new relationship
   */
  async create(payload: {
    type: string;
    contact_id?: string;
    organization_id?: string;
    stage: string;
    ventures?: string[];
    owner_id: string;
    attributes?: Record<string, unknown>;
  }): Promise<BusinessRelationship> {
    const { data, error } = await supabase
      .from('business_relationships')
      .insert({
        ...payload,
        attributes: payload.attributes || {},
        ventures: payload.ventures || [],
      })
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }

    return data as BusinessRelationship;
  },

  /**
   * Update an existing relationship
   */
  async update(
    id: string,
    payload: Partial<Omit<BusinessRelationship, 'id' | 'created_at'>>
  ): Promise<BusinessRelationship> {
    const { data, error } = await supabase
      .from('business_relationships')
      .update(payload)
      .eq('id', id)
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url),
        organization:organizations(id, name, logo_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error('Error updating relationship:', error);
      throw error;
    }

    return data as BusinessRelationship;
  },

  /**
   * Update relationship stage
   */
  async updateStage(
    id: string,
    stage: string,
    metadata?: Record<string, unknown>
  ): Promise<BusinessRelationship> {
    return this.update(id, {
      stage,
      attributes: metadata,
    } as Partial<BusinessRelationship>);
  },

  /**
   * Delete a relationship
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_relationships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  },
};

