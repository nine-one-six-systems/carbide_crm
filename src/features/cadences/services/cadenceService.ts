import { restClient, getCurrentUserId } from '@/lib/supabase/restClient';
import type {
  CadenceTemplate,
  CadenceStep,
  AppliedCadence,
  CadenceTask,
} from '@/types/database';
import type { BusinessRelationshipType } from '@/types/database';

// Select strings for cadence data with related data
const TEMPLATE_WITH_STEPS_SELECT = `*, steps:cadence_steps(*)`;

const APPLIED_CADENCE_SELECT = `*, cadence_template:cadence_templates(*), contact:contacts(id, first_name, last_name)`;

const CADENCE_TASK_SELECT = `*, cadence_step:cadence_steps(*), contact:contacts(id, first_name, last_name), assigned_user:profiles!assigned_to(id, full_name)`;

export const cadenceService = {
  /**
   * Get all cadence templates
   */
  async getTemplates(): Promise<CadenceTemplate[]> {
    const { data, error } = await restClient.query<CadenceTemplate>('cadence_templates', {
      filters: [{ column: 'is_active', operator: 'eq', value: true }],
      order: { column: 'name', ascending: true },
    });

    if (error) {
      console.error('Error fetching cadence templates:', error);
      throw error;
    }

    return (data || []) as CadenceTemplate[];
  },

  /**
   * Get a single cadence template with steps
   */
  async getTemplateById(id: string): Promise<CadenceTemplate | null> {
    const { data, error } = await restClient.querySingle<CadenceTemplate>('cadence_templates', {
      select: TEMPLATE_WITH_STEPS_SELECT,
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching cadence template:', error);
      throw error;
    }

    return data as CadenceTemplate;
  },

  /**
   * Create a cadence template
   */
  async createTemplate(payload: {
    name: string;
    description?: string;
    relationship_types?: BusinessRelationshipType[];
    is_active?: boolean;
  }): Promise<CadenceTemplate> {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.insert<CadenceTemplate>('cadence_templates', {
      ...payload,
      created_by: userId,
      relationship_types: payload.relationship_types || [],
      is_active: payload.is_active ?? true,
    });

    if (error) {
      console.error('Error creating cadence template:', error);
      throw error;
    }

    return data as CadenceTemplate;
  },

  /**
   * Update a cadence template
   */
  async updateTemplate(
    id: string,
    payload: Partial<Omit<CadenceTemplate, 'id' | 'created_at' | 'created_by'>>
  ): Promise<CadenceTemplate> {
    const { data, error } = await restClient.update<CadenceTemplate>(
      'cadence_templates',
      payload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating cadence template:', error);
      throw error;
    }

    return data as CadenceTemplate;
  },

  /**
   * Delete a cadence template
   */
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await restClient.remove(
      'cadence_templates',
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error deleting cadence template:', error);
      throw error;
    }
  },

  /**
   * Create a cadence step
   */
  async createStep(payload: {
    cadence_id: string;
    step_number: number;
    name: string;
    task_type: string;
    day_offset: number;
    description?: string;
  }): Promise<CadenceStep> {
    const { data, error } = await restClient.insert<CadenceStep>('cadence_steps', payload);

    if (error) {
      console.error('Error creating cadence step:', error);
      throw error;
    }

    return data as CadenceStep;
  },

  /**
   * Update a cadence step
   */
  async updateStep(
    id: string,
    payload: Partial<Omit<CadenceStep, 'id' | 'cadence_id'>>
  ): Promise<CadenceStep> {
    const { data, error } = await restClient.update<CadenceStep>(
      'cadence_steps',
      payload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating cadence step:', error);
      throw error;
    }

    return data as CadenceStep;
  },

  /**
   * Delete a cadence step
   */
  async deleteStep(id: string): Promise<void> {
    const { error } = await restClient.remove(
      'cadence_steps',
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error deleting cadence step:', error);
      throw error;
    }
  },

  /**
   * Get applied cadences for a contact
   */
  async getAppliedCadences(contactId: string): Promise<AppliedCadence[]> {
    const { data, error } = await restClient.query<AppliedCadence>('applied_cadences', {
      select: APPLIED_CADENCE_SELECT,
      filters: [{ column: 'contact_id', operator: 'eq', value: contactId }],
      order: { column: 'applied_at', ascending: false },
    });

    if (error) {
      console.error('Error fetching applied cadences:', error);
      throw error;
    }

    return (data || []) as AppliedCadence[];
  },

  /**
   * Apply a cadence to a contact
   */
  async applyCadence(payload: {
    cadence_template_id: string;
    contact_id: string;
    relationship_id?: string;
    start_date?: string;
  }): Promise<AppliedCadence> {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.insert<AppliedCadence>('applied_cadences', {
      ...payload,
      start_date: payload.start_date || new Date().toISOString().split('T')[0],
      applied_by: userId,
      status: 'active',
    });

    if (error) {
      console.error('Error applying cadence:', error);
      throw error;
    }

    return data as AppliedCadence;
  },

  /**
   * Pause an applied cadence
   */
  async pauseCadence(id: string): Promise<AppliedCadence> {
    // First get existing data
    const { data: existing } = await restClient.querySingle<AppliedCadence>('applied_cadences', {
      select: 'paused_days, paused_at',
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    const pausedDays = existing?.paused_days || 0;
    const pausedAt = existing?.paused_at || new Date().toISOString();

    const { data, error } = await restClient.update<AppliedCadence>(
      'applied_cadences',
      {
        status: 'paused',
        paused_at: pausedAt,
        paused_days: pausedDays,
      },
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error pausing cadence:', error);
      throw error;
    }

    return data as AppliedCadence;
  },

  /**
   * Resume an applied cadence
   */
  async resumeCadence(id: string): Promise<AppliedCadence> {
    const { data: existing, error: fetchError } = await restClient.querySingle<AppliedCadence>(
      'applied_cadences',
      {
        select: 'paused_at, paused_days',
        filters: [{ column: 'id', operator: 'eq', value: id }],
      }
    );

    if (fetchError || !existing) {
      throw new Error('Cadence not found');
    }

    const pausedAt = existing.paused_at
      ? new Date(existing.paused_at)
      : new Date();
    const now = new Date();
    const daysPaused = Math.ceil(
      (now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const newPausedDays = (existing.paused_days || 0) + daysPaused;

    const { data, error } = await restClient.update<AppliedCadence>(
      'applied_cadences',
      {
        status: 'active',
        paused_days: newPausedDays,
      },
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error resuming cadence:', error);
      throw error;
    }

    return data as AppliedCadence;
  },

  /**
   * Clear an applied cadence
   */
  async clearCadence(
    id: string,
    reason?: string
  ): Promise<AppliedCadence> {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await restClient.update<AppliedCadence>(
      'applied_cadences',
      {
        status: 'cleared',
        cleared_by: userId,
        cleared_at: new Date().toISOString(),
        clear_reason: reason,
      },
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error clearing cadence:', error);
      throw error;
    }

    return data as AppliedCadence;
  },

  /**
   * Get cadence tasks for an applied cadence
   */
  async getCadenceTasks(appliedCadenceId: string): Promise<CadenceTask[]> {
    const { data, error } = await restClient.query<CadenceTask>('cadence_tasks', {
      select: CADENCE_TASK_SELECT,
      filters: [{ column: 'applied_cadence_id', operator: 'eq', value: appliedCadenceId }],
      order: { column: 'due_date', ascending: true },
    });

    if (error) {
      console.error('Error fetching cadence tasks:', error);
      throw error;
    }

    return (data || []) as CadenceTask[];
  },
};
