import { supabase } from '@/lib/supabase/client';
import { buildRawCustomAttributeFilter } from '@/lib/supabase/jsonbQuery';
import type {
  ContactSearchParams,
  ContactCreatePayload,
  ContactUpdatePayload,
  PaginatedResponse,
  CustomAttributeFilter,
} from '@/types/api';
import type { Contact, Activity } from '@/types/database';

export const contactService = {
  /**
   * Get a single contact by ID with related data
   */
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }

    return data as Contact;
  },

  /**
   * Search contacts with pagination, filtering, and sorting
   */
  async search(
    params: ContactSearchParams
  ): Promise<PaginatedResponse<Contact>> {
    const {
      query,
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      tags,
      createdBy,
      hasOrganization,
      customAttributeFilters,
    } = params;

    let queryBuilder = supabase.from('contacts').select('*', { count: 'exact' });

    // Full-text search
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.contains('tags', tags);
    }

    // Filter by creator
    if (createdBy) {
      queryBuilder = queryBuilder.eq('created_by', createdBy);
    }

    // Filter by organization link existence
    if (hasOrganization !== undefined) {
      // This would require a join or subquery - simplified for now
      // In production, you might want to use a view or function
    }

    // Apply custom attribute filters
    if (customAttributeFilters && customAttributeFilters.length > 0) {
      for (const filter of customAttributeFilters) {
        const rawFilter = buildRawCustomAttributeFilter(
          filter.category,
          filter.key,
          filter.value,
          filter.operator
        );
        queryBuilder = queryBuilder.or(rawFilter);
      }
    }

    // Sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }

    return {
      data: (data || []) as Contact[],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Search contacts by custom attribute
   */
  async searchByCustomAttribute(
    filter: CustomAttributeFilter,
    limit = 50
  ): Promise<Contact[]> {
    const rawFilter = buildRawCustomAttributeFilter(
      filter.category,
      filter.key,
      filter.value,
      filter.operator
    );

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(rawFilter)
      .limit(limit);

    if (error) {
      console.error('Error searching by custom attribute:', error);
      throw error;
    }

    return (data || []) as Contact[];
  },

  /**
   * Get contacts with upcoming birthdays
   */
  async getUpcomingBirthdays(daysAhead = 30, limit = 20): Promise<Contact[]> {
    // Use the database function or raw query for birthday filtering
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .not('custom_attributes->personal->birthday', 'is', null)
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming birthdays:', error);
      throw error;
    }

    // Filter birthdays client-side for now
    // In production, use the buildUpcomingBirthdaysFilter with rpc call
    const today = new Date();
    const endDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return ((data || []) as Contact[]).filter((contact) => {
      const birthday = contact.custom_attributes?.personal?.birthday;
      if (!birthday) return false;

      const bday = new Date(birthday);
      const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      
      // Check if birthday is in the upcoming period
      return thisYearBday >= today && thisYearBday <= endDate;
    }).sort((a, b) => {
      const aBday = new Date(a.custom_attributes?.personal?.birthday || '');
      const bBday = new Date(b.custom_attributes?.personal?.birthday || '');
      const today = new Date();
      
      const aThisYear = new Date(today.getFullYear(), aBday.getMonth(), aBday.getDate());
      const bThisYear = new Date(today.getFullYear(), bBday.getMonth(), bBday.getDate());
      
      return aThisYear.getTime() - bThisYear.getTime();
    });
  },

  /**
   * Create a new contact
   */
  async create(payload: ContactCreatePayload): Promise<Contact> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...payload,
        created_by: user.id,
        emails: payload.emails || [],
        phones: payload.phones || [],
        addresses: payload.addresses || [],
        tags: payload.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw error;
    }

    return data as Contact;
  },

  /**
   * Update an existing contact
   */
  async update(payload: ContactUpdatePayload): Promise<Contact> {
    const { id, ...updateData } = payload;

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return data as Contact;
  },

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contacts').delete().eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  /**
   * Get activities for a contact
   */
  async getActivities(
    contactId: string,
    limit = 50
  ): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contactId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching contact activities:', error);
      throw error;
    }

    return (data || []) as Activity[];
  },
};

