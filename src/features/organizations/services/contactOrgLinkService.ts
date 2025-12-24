import { supabase } from '@/lib/supabase/client';
import type { ContactOrganizationLink } from '@/types/database';

export const contactOrgLinkService = {
  /**
   * Create a contact-organization link
   */
  async create(payload: {
    contact_id: string;
    organization_id: string;
    role_title?: string;
    role_type?: string;
    is_primary?: boolean;
    is_current?: boolean;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }): Promise<ContactOrganizationLink> {
    const { data, error } = await supabase
      .from('contact_organization_links')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating contact-organization link:', error);
      throw error;
    }

    return data as ContactOrganizationLink;
  },

  /**
   * Update a contact-organization link
   */
  async update(
    id: string,
    payload: Partial<Omit<ContactOrganizationLink, 'id' | 'created_at'>>
  ): Promise<ContactOrganizationLink> {
    const { data, error } = await supabase
      .from('contact_organization_links')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact-organization link:', error);
      throw error;
    }

    return data as ContactOrganizationLink;
  },

  /**
   * Delete a contact-organization link
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_organization_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact-organization link:', error);
      throw error;
    }
  },

  /**
   * Get links for a contact
   */
  async getByContact(contactId: string): Promise<ContactOrganizationLink[]> {
    const { data, error } = await supabase
      .from('contact_organization_links')
      .select('*, organization:organizations(*)')
      .eq('contact_id', contactId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact-organization links:', error);
      throw error;
    }

    return (data || []) as ContactOrganizationLink[];
  },

  /**
   * Get links for an organization
   */
  async getByOrganization(
    organizationId: string
  ): Promise<ContactOrganizationLink[]> {
    const { data, error } = await supabase
      .from('contact_organization_links')
      .select('*, contact:contacts(*)')
      .eq('organization_id', organizationId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organization-contact links:', error);
      throw error;
    }

    return (data || []) as ContactOrganizationLink[];
  },
};

