import { supabase } from '@/lib/supabase';
import type {
  Venture,
  VentureWithStats,
  VentureFormValues,
  VentureOrganization,
  LinkOrganizationFormValues,
  VentureTeamMember,
  AddTeamMemberFormValues,
  VentureFilters,
  VenturePipelineBreakdown,
} from '../types/venture.types';

// =============================================================================
// VENTURE CRUD
// =============================================================================

export const ventureService = {
  /**
   * Get all ventures with optional filters
   */
  async getVentures(filters?: VentureFilters): Promise<VentureWithStats[]> {
    let query = supabase
      .from('ventures')
      .select('*')
      .order('name');

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Fetch stats for each venture
    const venturesWithStats = await Promise.all(
      (data || []).map(async (venture) => {
        const stats = await this.getVentureStats(venture.slug);
        return {
          ...venture,
          relationship_count: stats.relationship_count,
          organization_count: stats.organization_count,
          team_member_count: stats.team_member_count,
        };
      })
    );

    return venturesWithStats;
  },

  /**
   * Get a single venture by slug
   */
  async getVentureBySlug(slug: string): Promise<Venture | null> {
    const { data, error } = await supabase
      .from('ventures')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Get venture stats
   */
  async getVentureStats(slug: string): Promise<{
    relationship_count: number;
    organization_count: number;
    team_member_count: number;
  }> {
    const { data, error } = await supabase
      .rpc('get_venture_stats', { p_venture_slug: slug });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      relationship_count: row?.relationship_count ?? 0,
      organization_count: row?.organization_count ?? 0,
      team_member_count: row?.team_member_count ?? 0,
    };
  },

  /**
   * Get pipeline breakdown for a venture
   */
  async getVenturePipelineBreakdown(slug: string): Promise<VenturePipelineBreakdown[]> {
    const { data, error } = await supabase
      .rpc('get_venture_pipeline_breakdown', { p_venture_slug: slug });

    if (error) throw error;

    return data || [];
  },

  /**
   * Get active ventures for select dropdown (excludes archived)
   */
  async getActiveVentures(): Promise<Pick<Venture, 'id' | 'name' | 'slug' | 'status' | 'primary_color'>[]> {
    const { data, error } = await supabase
      .rpc('get_active_ventures');

    if (error) throw error;

    return data || [];
  },

  /**
   * Create a new venture
   */
  async createVenture(values: VentureFormValues): Promise<Venture> {
    const { data, error } = await supabase
      .from('ventures')
      .insert(values)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a venture
   */
  async updateVenture(id: string, values: Partial<VentureFormValues>): Promise<Venture> {
    const { data, error } = await supabase
      .from('ventures')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Delete (archive) a venture
   */
  async archiveVenture(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Permanently delete a venture (admin only, use with caution)
   */
  async deleteVenture(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // VENTURE ORGANIZATIONS
  // ===========================================================================

  /**
   * Get organizations linked to a venture
   */
  async getVentureOrganizations(ventureId: string): Promise<VentureOrganization[]> {
    const { data, error } = await supabase
      .from('venture_organizations')
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .eq('venture_id', ventureId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  /**
   * Link an organization to a venture
   */
  async linkOrganization(
    ventureId: string,
    values: LinkOrganizationFormValues,
    userId: string
  ): Promise<VentureOrganization> {
    // If setting as primary, first unset any existing primary
    if (values.is_primary) {
      await supabase
        .from('venture_organizations')
        .update({ is_primary: false })
        .eq('venture_id', ventureId)
        .eq('is_primary', true);
    }

    const { data, error } = await supabase
      .from('venture_organizations')
      .insert({
        venture_id: ventureId,
        organization_id: values.organization_id,
        relationship_type: values.relationship_type,
        is_primary: values.is_primary,
        notes: values.notes,
        created_by: userId,
      })
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a venture-organization link
   */
  async updateVentureOrganization(
    id: string,
    ventureId: string,
    values: Partial<LinkOrganizationFormValues>
  ): Promise<VentureOrganization> {
    // If setting as primary, first unset any existing primary
    if (values.is_primary) {
      await supabase
        .from('venture_organizations')
        .update({ is_primary: false })
        .eq('venture_id', ventureId)
        .eq('is_primary', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('venture_organizations')
      .update(values)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(id, name, website, industry)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Unlink an organization from a venture
   */
  async unlinkOrganization(id: string): Promise<void> {
    const { error } = await supabase
      .from('venture_organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // VENTURE TEAM MEMBERS
  // ===========================================================================

  /**
   * Get team members for a venture
   */
  async getVentureTeam(ventureId: string, includeInactive = false): Promise<VentureTeamMember[]> {
    let query = supabase
      .from('venture_team_members')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .eq('venture_id', ventureId)
      .order('is_active', { ascending: false })
      .order('role');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  /**
   * Add a team member to a venture
   */
  async addTeamMember(
    ventureId: string,
    values: AddTeamMemberFormValues,
    userId: string
  ): Promise<VentureTeamMember> {
    const { data, error } = await supabase
      .from('venture_team_members')
      .insert({
        venture_id: ventureId,
        user_id: values.member_type === 'user' ? values.user_id : null,
        contact_id: values.member_type === 'contact' ? values.contact_id : null,
        role: values.role,
        start_date: values.start_date,
        is_active: true,
        created_by: userId,
      })
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Update a team member
   */
  async updateTeamMember(
    id: string,
    values: Partial<{ role: string; is_active: boolean; end_date: string | null }>
  ): Promise<VentureTeamMember> {
    const { data, error } = await supabase
      .from('venture_team_members')
      .update(values)
      .eq('id', id)
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, email),
        contact:contacts(id, first_name, last_name, avatar_url, primary_email)
      `)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Remove a team member from a venture
   */
  async removeTeamMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('venture_team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===========================================================================
  // ACTIVITY (delegates to existing activity service)
  // ===========================================================================

  /**
   * Get activities for all relationships tagged with a venture
   */
  async getVentureActivity(slug: string, limit = 20): Promise<any[]> {
    // First get all relationship IDs tagged with this venture
    const { data: relationships, error: relError } = await supabase
      .from('business_relationships')
      .select('id')
      .contains('ventures', [slug]);

    if (relError) throw relError;

    if (!relationships || relationships.length === 0) {
      return [];
    }

    const relationshipIds = relationships.map((r) => r.id);

    // Get activities for these relationships
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contact:contacts(id, first_name, last_name),
        organization:organizations(id, name),
        created_by_user:profiles(id, full_name)
      `)
      .in('relationship_id', relationshipIds)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  },
};

