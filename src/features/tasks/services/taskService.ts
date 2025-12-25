import { restClient, getCurrentUserId } from '@/lib/supabase/restClient';
import type { TaskSearchParams } from '@/types/api';
import type { ManualTask, CadenceTask, UnifiedTask } from '@/types/database';

// Select strings for tasks with related data
const MANUAL_TASK_SELECT = `*, contact:contacts(id, first_name, last_name), organization:organizations(id, name), assigned_user:profiles!assigned_to(id, full_name)`;

const CADENCE_TASK_SELECT = `*, cadence_step:cadence_steps(*), contact:contacts(id, first_name, last_name), assigned_user:profiles!assigned_to(id, full_name)`;

export const taskService = {
  /**
   * Get unified tasks (cadence + manual) for a user
   */
  async getUserTasks(
    userId: string,
    params: TaskSearchParams = {}
  ): Promise<UnifiedTask[]> {
    const {
      status = ['pending'],
      dueDateFrom,
      dueDateTo,
      taskType,
      contactId,
    } = params;

    const statusArray = Array.isArray(status) ? status : [status];

    const { data, error } = await restClient.rpc<UnifiedTask[]>('get_user_tasks', {
      args: {
        p_user_id: userId,
        p_status: statusArray,
        p_from_date: dueDateFrom || null,
        p_to_date: dueDateTo || null,
      },
    });

    if (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }

    let tasks = (data || []) as UnifiedTask[];

    // Filter by task type if provided
    if (taskType) {
      tasks = tasks.filter((t) => t.task_type === taskType);
    }

    // Filter by contact if provided
    if (contactId) {
      tasks = tasks.filter((t) => t.contact_id === contactId);
    }

    return tasks;
  },

  /**
   * Get a single manual task by ID
   */
  async getManualTaskById(id: string): Promise<ManualTask | null> {
    const { data, error } = await restClient.querySingle<ManualTask>('manual_tasks', {
      select: MANUAL_TASK_SELECT,
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching manual task:', error);
      throw error;
    }

    return data as ManualTask;
  },

  /**
   * Get a single cadence task by ID
   */
  async getCadenceTaskById(id: string): Promise<CadenceTask | null> {
    const { data, error } = await restClient.querySingle<CadenceTask>('cadence_tasks', {
      select: CADENCE_TASK_SELECT,
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching cadence task:', error);
      throw error;
    }

    return data as CadenceTask;
  },

  /**
   * Create a manual task
   */
  async createManualTask(payload: {
    contact_id?: string;
    organization_id?: string;
    relationship_id?: string;
    title: string;
    task_type?: string;
    due_date: string;
    assigned_to: string;
    notes?: string;
  }): Promise<ManualTask> {
    const { data, error } = await restClient.insert<ManualTask>('manual_tasks', payload);

    if (error) {
      console.error('Error creating manual task:', error);
      throw error;
    }

    return data as ManualTask;
  },

  /**
   * Update a manual task
   */
  async updateManualTask(
    id: string,
    payload: Partial<Omit<ManualTask, 'id' | 'created_at'>>
  ): Promise<ManualTask> {
    const { data, error } = await restClient.update<ManualTask>(
      'manual_tasks',
      payload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating manual task:', error);
      throw error;
    }

    return data as ManualTask;
  },

  /**
   * Update a cadence task
   */
  async updateCadenceTask(
    id: string,
    payload: Partial<Omit<CadenceTask, 'id' | 'applied_cadence_id' | 'cadence_step_id' | 'contact_id'>>
  ): Promise<CadenceTask> {
    const { data, error } = await restClient.update<CadenceTask>(
      'cadence_tasks',
      payload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating cadence task:', error);
      throw error;
    }

    return data as CadenceTask;
  },

  /**
   * Complete a task (cadence or manual)
   */
  async completeTask(
    taskId: string,
    taskSource: 'cadence' | 'manual',
    notes: string
  ): Promise<void> {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const updatePayload = {
      status: 'completed' as const,
      completed_by: userId,
      completed_at: new Date().toISOString(),
      notes,
    };

    if (taskSource === 'cadence') {
      await this.updateCadenceTask(taskId, updatePayload);
    } else {
      await this.updateManualTask(taskId, updatePayload);
    }
  },

  /**
   * Triage a task
   */
  async triageTask(
    taskId: string,
    taskSource: 'cadence' | 'manual'
  ): Promise<void> {
    const updatePayload = {
      status: 'triaged' as const,
    };

    if (taskSource === 'cadence') {
      await this.updateCadenceTask(taskId, updatePayload);
    } else {
      await this.updateManualTask(taskId, updatePayload);
    }
  },

  /**
   * Dismiss a task
   */
  async dismissTask(
    taskId: string,
    taskSource: 'cadence' | 'manual'
  ): Promise<void> {
    const updatePayload = {
      status: 'dismissed' as const,
    };

    if (taskSource === 'cadence') {
      await this.updateCadenceTask(taskId, updatePayload);
    } else {
      await this.updateManualTask(taskId, updatePayload);
    }
  },

  /**
   * Delete a manual task
   */
  async deleteManualTask(id: string): Promise<void> {
    const { error } = await restClient.remove(
      'manual_tasks',
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error deleting manual task:', error);
      throw error;
    }
  },
};
