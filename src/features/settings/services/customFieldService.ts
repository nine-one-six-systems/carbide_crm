import { supabase } from '@/lib/supabase';
import type { CustomFieldDefinition } from '@/types/database';
import type {
  CustomFieldDefinitionCreatePayload,
  CustomFieldDefinitionUpdatePayload,
} from '@/types/api';

export const customFieldService = {
  async getAll(entityType?: 'contact' | 'organization' | 'both'): Promise<CustomFieldDefinition[]> {
    let query = supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('display_order');

    if (entityType) {
      query = query.or(`entity_type.eq.${entityType},entity_type.eq.both`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getByCategory(
    category: string,
    entityType?: 'contact' | 'organization' | 'both'
  ): Promise<CustomFieldDefinition[]> {
    let query = supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('display_order');

    if (entityType) {
      query = query.or(`entity_type.eq.${entityType},entity_type.eq.both`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<CustomFieldDefinition | null> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(payload: CustomFieldDefinitionCreatePayload): Promise<CustomFieldDefinition> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .insert({
        key: payload.key,
        label: payload.label,
        field_type: payload.field_type,
        category: payload.category,
        entity_type: payload.entity_type,
        options: payload.options || [],
        is_required: payload.is_required || false,
        show_on_card: payload.show_on_card || false,
        display_order: payload.display_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(payload: CustomFieldDefinitionUpdatePayload): Promise<CustomFieldDefinition> {
    const { id, ...updates } = payload;

    const { data, error } = await supabase
      .from('custom_field_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('custom_field_definitions')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = new Set(data?.map((d) => d.category) || []);
    return Array.from(categories).sort();
  },
};

