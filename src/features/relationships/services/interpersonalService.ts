import { supabase } from '@/lib/supabase/client';
import type {
  PrimaryRelationshipGroup,
  PrimaryRelationshipMember,
  SecondaryRelationship,
} from '@/types/database';

export const interpersonalService = {
  /**
   * Get primary relationship groups for a contact
   */
  async getPrimaryGroups(contactId: string): Promise<PrimaryRelationshipGroup[]> {
    const { data, error } = await supabase
      .from('primary_relationship_members')
      .select(
        `
        group:primary_relationship_groups(*)
      `
      )
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error fetching primary groups:', error);
      throw error;
    }

    return (data || [])
      .map((item: any) => item.group)
      .filter(Boolean) as PrimaryRelationshipGroup[];
  },

  /**
   * Get members of a primary relationship group
   */
  async getGroupMembers(groupId: string): Promise<PrimaryRelationshipMember[]> {
    const { data, error } = await supabase
      .from('primary_relationship_members')
      .select(
        `
        *,
        contact:contacts(id, first_name, last_name, avatar_url)
      `
      )
      .eq('group_id', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }

    return (data || []) as PrimaryRelationshipMember[];
  },

  /**
   * Create a primary relationship group
   */
  async createPrimaryGroup(name?: string): Promise<PrimaryRelationshipGroup> {
    const { data, error } = await supabase
      .from('primary_relationship_groups')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating primary group:', error);
      throw error;
    }

    return data as PrimaryRelationshipGroup;
  },

  /**
   * Add a contact to a primary relationship group
   */
  async addToPrimaryGroup(payload: {
    group_id: string;
    contact_id: string;
    role: string;
    is_adult?: boolean;
  }): Promise<PrimaryRelationshipMember> {
    const { data, error } = await supabase
      .from('primary_relationship_members')
      .insert({
        ...payload,
        is_adult: payload.is_adult ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to primary group:', error);
      throw error;
    }

    return data as PrimaryRelationshipMember;
  },

  /**
   * Remove a contact from a primary relationship group
   */
  async removeFromPrimaryGroup(
    groupId: string,
    contactId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('primary_relationship_members')
      .delete()
      .eq('group_id', groupId)
      .eq('contact_id', contactId);

    if (error) {
      console.error('Error removing from primary group:', error);
      throw error;
    }
  },

  /**
   * Get secondary relationships for a contact
   */
  async getSecondaryRelationships(
    contactId: string
  ): Promise<SecondaryRelationship[]> {
    const { data, error } = await supabase
      .from('secondary_relationships')
      .select(
        `
        *,
        related_contact:contacts!related_contact_id(id, first_name, last_name, avatar_url)
      `
      )
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching secondary relationships:', error);
      throw error;
    }

    return (data || []) as SecondaryRelationship[];
  },

  /**
   * Create a secondary relationship (mutual creation handled by trigger)
   */
  async createSecondaryRelationship(payload: {
    contact_id: string;
    related_contact_id: string;
    relationship_type: string;
    notes?: string;
  }): Promise<SecondaryRelationship> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('secondary_relationships')
      .insert({
        ...payload,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating secondary relationship:', error);
      throw error;
    }

    return data as SecondaryRelationship;
  },

  /**
   * Delete a secondary relationship
   */
  async deleteSecondaryRelationship(id: string): Promise<void> {
    const { error } = await supabase
      .from('secondary_relationships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting secondary relationship:', error);
      throw error;
    }
  },
};

