import { restClient, getCurrentUserId } from '@/lib/supabase/restClient';
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
    const { data, error } = await restClient.querySingle<Contact>('contacts', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

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
    } = params;

    const filters: Array<{ column: string; operator: 'eq' | 'cs' | 'fts'; value: unknown }> = [];

    // Full-text search
    if (query) {
      filters.push({ column: 'search_vector', operator: 'fts', value: query });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filters.push({ column: 'tags', operator: 'cs', value: tags });
    }

    // Filter by creator
    if (createdBy) {
      filters.push({ column: 'created_by', operator: 'eq', value: createdBy });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await restClient.query<Contact>('contacts', {
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

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
    // Build the raw filter for custom attributes in JSONB
    const jsonPath = `custom_attributes->${filter.category}->${filter.key}`;
    const rawFilter = `${jsonPath}.eq.${filter.value}`;

    const { data, error } = await restClient.query<Contact>('contacts', {
      filters: [{ column: 'or', operator: 'or', value: rawFilter }],
      limit,
    });

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
    // Fetch contacts that have a birthday set
    const { data, error } = await restClient.query<Contact>('contacts', {
      filters: [
        { column: 'custom_attributes->personal->birthday', operator: 'neq' as 'eq', value: null },
      ],
      limit,
    });

    if (error) {
      console.error('Error fetching upcoming birthdays:', error);
      throw error;
    }

    // Filter birthdays client-side
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
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.insert<Contact>('contacts', {
      ...payload,
      created_by: userId,
      emails: payload.emails || [],
      phones: payload.phones || [],
      addresses: payload.addresses || [],
      tags: payload.tags || [],
    });

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

    const { data, error } = await restClient.update<Contact>(
      'contacts',
      updateData,
      [{ column: 'id', operator: 'eq', value: id }]
    );

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
    const { error } = await restClient.remove(
      'contacts',
      [{ column: 'id', operator: 'eq', value: id }]
    );

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
    const { data, error } = await restClient.query<Activity>('activities', {
      filters: [{ column: 'contact_id', operator: 'eq', value: contactId }],
      order: { column: 'occurred_at', ascending: false },
      limit,
    });

    if (error) {
      console.error('Error fetching contact activities:', error);
      throw error;
    }

    return (data || []) as Activity[];
  },

  /**
   * Search contacts with task/cadence filtering
   */
  async searchWithTasks(
    params: ContactSearchParams & {
      hasPendingCadenceTasks?: boolean;
      hasActiveCadences?: boolean;
    }
  ): Promise<PaginatedResponse<Contact>> {
    const {
      hasPendingCadenceTasks,
      hasActiveCadences,
      ...searchParams
    } = params;

    // If no task/cadence filters, use regular search
    if (!hasPendingCadenceTasks && !hasActiveCadences) {
      return this.search(searchParams);
    }

    // Get contact IDs that match task/cadence criteria
    let contactIds: string[] = [];

    if (hasPendingCadenceTasks) {
      const { data: tasks, error: tasksError } = await restClient.query<{ contact_id: string }>(
        'cadence_tasks',
        {
          select: 'contact_id',
          filters: [{ column: 'status', operator: 'eq', value: 'pending' }],
        }
      );

      if (tasksError) {
        console.error('Error fetching contacts with pending tasks:', tasksError);
        throw tasksError;
      }

      const taskContactIds = new Set((tasks || []).map((t) => t.contact_id));
      contactIds = Array.from(taskContactIds);
    }

    if (hasActiveCadences) {
      const { data: cadences, error: cadencesError } = await restClient.query<{ contact_id: string }>(
        'applied_cadences',
        {
          select: 'contact_id',
          filters: [
            { column: 'status', operator: 'in', value: ['active', 'paused'] },
          ],
        }
      );

      if (cadencesError) {
        console.error('Error fetching contacts with active cadences:', cadencesError);
        throw cadencesError;
      }

      const cadenceContactIds = new Set((cadences || []).map((c) => c.contact_id));
      
      if (hasPendingCadenceTasks) {
        // Intersect both sets
        contactIds = contactIds.filter((id) => cadenceContactIds.has(id));
      } else {
        contactIds = Array.from(cadenceContactIds);
      }
    }

    if (contactIds.length === 0) {
      return {
        data: [],
        count: 0,
        page: searchParams.page || 1,
        pageSize: searchParams.pageSize || 20,
        totalPages: 0,
      };
    }

    // Now search contacts with the filtered IDs
    const {
      query,
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      tags,
      createdBy,
    } = searchParams;

    const filters: Array<{ column: string; operator: 'eq' | 'cs' | 'fts' | 'in'; value: unknown }> = [];

    // Filter by contact IDs
    filters.push({ column: 'id', operator: 'in', value: contactIds });

    // Full-text search
    if (query) {
      filters.push({ column: 'search_vector', operator: 'fts', value: query });
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filters.push({ column: 'tags', operator: 'cs', value: tags });
    }

    // Filter by creator
    if (createdBy) {
      filters.push({ column: 'created_by', operator: 'eq', value: createdBy });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await restClient.query<Contact>('contacts', {
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

    if (error) {
      console.error('Error searching contacts with tasks:', error);
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
};
