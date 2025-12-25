import { restClient } from '@/lib/supabase/restClient';
import type {
  RelationshipSearchParams,
  PaginatedResponse,
} from '@/types/api';
import type { BusinessRelationship } from '@/types/database';

// Select string for relationships with related data
const RELATIONSHIP_SELECT = `*, contact:contacts(id, first_name, last_name, avatar_url), organization:organizations(id, name, logo_url), owner:profiles!owner_id(id, full_name, avatar_url)`;

export const relationshipService = {
  /**
   * Get a single relationship by ID
   */
  async getById(id: string): Promise<BusinessRelationship | null> {
    const { data, error } = await restClient.querySingle<BusinessRelationship>('business_relationships', {
      select: RELATIONSHIP_SELECT,
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

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
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      type,
      stage,
      ventures,
      ownerId,
    } = params;

    const filters: Array<{ column: string; operator: 'eq' | 'cs'; value: unknown }> = [];

    // Filter by type
    if (type) {
      filters.push({ column: 'type', operator: 'eq', value: type });
    }

    // Filter by stage
    if (stage) {
      filters.push({ column: 'stage', operator: 'eq', value: stage });
    }

    // Filter by ventures (array contains)
    if (ventures && ventures.length > 0) {
      filters.push({ column: 'ventures', operator: 'cs', value: ventures });
    }

    // Filter by owner
    if (ownerId) {
      filters.push({ column: 'owner_id', operator: 'eq', value: ownerId });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await restClient.query<BusinessRelationship>('business_relationships', {
      select: RELATIONSHIP_SELECT,
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

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
    const { data, error } = await restClient.query<BusinessRelationship>('business_relationships', {
      select: RELATIONSHIP_SELECT,
      filters: [
        { column: 'type', operator: 'eq', value: type },
        { column: 'stage', operator: 'in', value: stages },
      ],
    });

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
    const { data, error } = await restClient.insert<BusinessRelationship>(
      'business_relationships',
      {
        ...payload,
        attributes: payload.attributes || {},
        ventures: payload.ventures || [],
      },
      { select: RELATIONSHIP_SELECT }
    );

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
    const { data, error } = await restClient.update<BusinessRelationship>(
      'business_relationships',
      payload,
      [{ column: 'id', operator: 'eq', value: id }],
      { select: RELATIONSHIP_SELECT }
    );

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
    const { error } = await restClient.remove(
      'business_relationships',
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  },
};
