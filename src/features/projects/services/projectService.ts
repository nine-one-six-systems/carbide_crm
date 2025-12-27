import { restClient, getCurrentUserId, getAccessToken } from '@/lib/supabase/restClient';
import type { PaginatedResponse } from '@/types/api';
import type {
  Project,
  ProjectWithStats,
  Phase,
  Milestone,
  ProjectContact,
  ProjectOrganization,
  ProjectRelationship,
  ProjectActivity,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreatePhasePayload,
  UpdatePhasePayload,
  CreateMilestonePayload,
  UpdateMilestonePayload,
  ProjectListParams,
} from '../types/project.types';

// =============================================================================
// DATABASE TYPES (snake_case)
// =============================================================================

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  scope: string;
  category: string;
  status: string;
  health: string;
  ventures: string[];
  owner_id: string;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  github_project_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface ProjectWithStatsRow extends ProjectRow {
  owner_name?: string;
  total_milestones?: number;
  completed_milestones?: number;
}

interface PhaseRow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  order: number;
  start_date: string | null;
  target_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MilestoneRow {
  id: string;
  phase_id: string;
  name: string;
  description: string | null;
  order: number;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectActivityRow {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get current user ID from access token
 */
async function getCurrentUserIdFromToken(): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payloadPart = parts[1];
    const decoded = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub || null;
  } catch {
    return null;
  }
}

// =============================================================================
// TRANSFORMATION HELPERS
// =============================================================================

function transformProjectRow(row: ProjectWithStatsRow): ProjectWithStats {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scope: row.scope as Project['scope'],
    category: row.category as Project['category'],
    status: row.status as Project['status'],
    health: row.health as Project['health'],
    ventures: row.ventures as Project['ventures'],
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    startDate: row.start_date ? new Date(row.start_date) : null,
    targetDate: row.target_date ? new Date(row.target_date) : null,
    completedDate: row.completed_date ? new Date(row.completed_date) : null,
    githubProjectUrl: row.github_project_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
    totalMilestones: row.total_milestones ?? 0,
    completedMilestones: row.completed_milestones ?? 0,
  };
}

function transformProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scope: row.scope as Project['scope'],
    category: row.category as Project['category'],
    status: row.status as Project['status'],
    health: row.health as Project['health'],
    ventures: row.ventures as Project['ventures'],
    ownerId: row.owner_id,
    startDate: row.start_date ? new Date(row.start_date) : null,
    targetDate: row.target_date ? new Date(row.target_date) : null,
    completedDate: row.completed_date ? new Date(row.completed_date) : null,
    githubProjectUrl: row.github_project_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
  };
}

function transformPhaseRow(row: PhaseRow): Phase {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    order: row.order,
    startDate: row.start_date ? new Date(row.start_date) : null,
    targetDate: row.target_date ? new Date(row.target_date) : null,
    status: row.status as Phase['status'],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function transformMilestoneRow(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    phaseId: row.phase_id,
    name: row.name,
    description: row.description,
    order: row.order,
    targetDate: row.target_date ? new Date(row.target_date) : null,
    completed: row.completed,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
    completedBy: row.completed_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function transformActivityRow(row: ProjectActivityRow, userName?: string): ProjectActivity {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    userName,
    activityType: row.activity_type as ProjectActivity['activityType'],
    description: row.description,
    metadata: row.metadata,
    createdAt: new Date(row.created_at),
  };
}

// =============================================================================
// PROJECT SERVICE
// =============================================================================

export const projectService = {
  /**
   * Get a single project by ID with related data
   */
  async getById(id: string): Promise<Project> {
    const { data, error } = await restClient.querySingle<ProjectRow>('projects', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
      select: '*',
    });

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Project not found');
    }

    return transformProject(data);
  },

  /**
   * Search projects with pagination, filtering, and sorting
   */
  async search(params: ProjectListParams): Promise<PaginatedResponse<ProjectWithStats>> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      scope,
      category,
      status,
      health,
      venture,
      ownerId,
    } = params;

    const filters: Array<{ column: string; operator: string; value: unknown }> = [];

    if (scope) {
      filters.push({ column: 'scope', operator: 'eq', value: scope });
    }
    if (category) {
      filters.push({ column: 'category', operator: 'eq', value: category });
    }
    if (status) {
      filters.push({ column: 'status', operator: 'eq', value: status });
    }
    if (health) {
      filters.push({ column: 'health', operator: 'eq', value: health });
    }
    if (venture) {
      filters.push({ column: 'ventures', operator: 'cs', value: [venture] });
    }
    if (ownerId) {
      filters.push({ column: 'owner_id', operator: 'eq', value: ownerId });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query projects with owner name
    const { data, error, count } = await restClient.query<ProjectWithStatsRow>('projects', {
      filters,
      order: { column: sortBy, ascending: sortOrder === 'asc' },
      range: { from, to },
      count: 'exact',
    });

    if (error) {
      console.error('Error searching projects:', error);
      throw error;
    }

    // Transform and fetch owner names and milestone stats
    const transformed = await Promise.all(
      (data || []).map(async (row) => {
        const project = transformProjectRow(row);

        // Fetch owner name
        const { data: ownerData } = await restClient.querySingle<{ full_name: string }>(
          'profiles',
          {
            filters: [{ column: 'id', operator: 'eq', value: row.owner_id }],
            select: 'full_name',
          }
        );
        if (ownerData) {
          project.ownerName = ownerData.full_name;
        }

        // Calculate milestone stats
        const phases = await this.getPhases(row.id);
        let totalMilestones = 0;
        let completedMilestones = 0;

        for (const phase of phases) {
          if (phase.milestones) {
            totalMilestones += phase.milestones.length;
            completedMilestones += phase.milestones.filter((m) => m.completed).length;
          }
        }

        project.totalMilestones = totalMilestones;
        project.completedMilestones = completedMilestones;

        return project;
      })
    );

    return {
      data: transformed,
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  },

  /**
   * Create a new project
   */
  async create(payload: CreateProjectPayload): Promise<Project> {
    // Get user ID from session (more reliable than localStorage)
    const userId = await getCurrentUserIdFromToken();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Verify profile exists before creating project
    const { data: profileData, error: profileError } = await restClient.querySingle<{ id: string }>(
      'profiles',
      {
        filters: [{ column: 'id', operator: 'eq', value: userId }],
        select: 'id',
      }
    );

    if (profileError || !profileData) {
      throw new Error('User profile not found. Please ensure your profile exists in the system.');
    }

    const dbPayload = {
      name: payload.name,
      description: payload.description || null,
      scope: payload.scope,
      category: payload.category,
      status: 'draft' as const,
      health: 'not_started' as const,
      ventures: payload.ventures,
      owner_id: payload.ownerId,
      start_date: payload.startDate || null,
      target_date: payload.targetDate || null,
      github_project_url: payload.githubProjectUrl || null,
      created_by: userId,
    };

    const { data, error } = await restClient.insert<ProjectRow>('projects', dbPayload);

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    // Log activity
    await this.logActivity(data.id, 'created', `Project "${payload.name}" created`, {});

    return transformProject(data);
  },

  /**
   * Update an existing project
   */
  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const currentProject = await this.getById(id);

    const dbPayload: Record<string, unknown> = {};

    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.scope !== undefined) dbPayload.scope = payload.scope;
    if (payload.category !== undefined) dbPayload.category = payload.category;
    if (payload.status !== undefined) {
      dbPayload.status = payload.status;
      if (payload.status !== currentProject.status) {
        await this.logActivity(id, 'status_change', `Status changed from ${currentProject.status} to ${payload.status}`, {
          oldStatus: currentProject.status,
          newStatus: payload.status,
        });
      }
    }
    if (payload.health !== undefined) {
      dbPayload.health = payload.health;
      if (payload.health !== currentProject.health) {
        await this.logActivity(id, 'health_change', `Health changed from ${currentProject.health} to ${payload.health}`, {
          oldHealth: currentProject.health,
          newHealth: payload.health,
        });
      }
    }
    if (payload.ventures !== undefined) dbPayload.ventures = payload.ventures;
    if (payload.ownerId !== undefined) dbPayload.owner_id = payload.ownerId;
    if (payload.startDate !== undefined) dbPayload.start_date = payload.startDate;
    if (payload.targetDate !== undefined) dbPayload.target_date = payload.targetDate;
    if (payload.completedDate !== undefined) dbPayload.completed_date = payload.completedDate;
    if (payload.githubProjectUrl !== undefined) dbPayload.github_project_url = payload.githubProjectUrl;

    const { data, error } = await restClient.update<ProjectRow>(
      'projects',
      dbPayload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return transformProject(data);
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    const { error } = await restClient.remove('projects', [
      { column: 'id', operator: 'eq', value: id },
    ]);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  /**
   * Get phases for a project
   */
  async getPhases(projectId: string): Promise<Phase[]> {
    const { data, error } = await restClient.query<PhaseRow>('project_phases', {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      order: { column: 'order', ascending: true },
    });

    if (error) {
      console.error('Error fetching phases:', error);
      throw error;
    }

    const phases = (data || []).map(transformPhaseRow);

    // Fetch milestones for each phase
    for (const phase of phases) {
      phase.milestones = await this.getMilestones(phase.id);
    }

    return phases;
  },

  /**
   * Create a new phase
   */
  async createPhase(payload: CreatePhasePayload): Promise<Phase> {
    // Get the next order number
    const existingPhases = await this.getPhases(payload.projectId);
    const nextOrder = existingPhases.length > 0 ? Math.max(...existingPhases.map((p) => p.order)) + 1 : 1;

    const dbPayload = {
      project_id: payload.projectId,
      name: payload.name,
      description: payload.description || null,
      order: nextOrder,
      start_date: payload.startDate || null,
      target_date: payload.targetDate || null,
      status: 'not_started' as const,
    };

    const { data, error } = await restClient.insert<PhaseRow>('project_phases', dbPayload);

    if (error) {
      console.error('Error creating phase:', error);
      throw error;
    }

    // Log activity
    await this.logActivity(payload.projectId, 'phase_added', `Phase "${payload.name}" added`, {
      phaseId: data.id,
    });

    return transformPhaseRow(data);
  },

  /**
   * Update an existing phase
   */
  async updatePhase(id: string, payload: UpdatePhasePayload): Promise<Phase> {
    const currentPhase = await this.getPhaseById(id);

    const dbPayload: Record<string, unknown> = {};

    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.startDate !== undefined) dbPayload.start_date = payload.startDate;
    if (payload.targetDate !== undefined) dbPayload.target_date = payload.targetDate;
    if (payload.status !== undefined) {
      dbPayload.status = payload.status;
      if (payload.status !== currentPhase.status) {
        await this.logActivity(currentPhase.projectId, 'phase_status_change', `Phase "${currentPhase.name}" status changed from ${currentPhase.status} to ${payload.status}`, {
          phaseId: id,
          oldStatus: currentPhase.status,
          newStatus: payload.status,
        });
      }
    }

    const { data, error } = await restClient.update<PhaseRow>(
      'project_phases',
      dbPayload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating phase:', error);
      throw error;
    }

    return transformPhaseRow(data);
  },

  /**
   * Get a single phase by ID
   */
  async getPhaseById(id: string): Promise<Phase> {
    const { data, error } = await restClient.querySingle<PhaseRow>('project_phases', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching phase:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Phase not found');
    }

    return transformPhaseRow(data);
  },

  /**
   * Delete a phase
   */
  async deletePhase(id: string): Promise<void> {
    const phase = await this.getPhaseById(id);

    const { error } = await restClient.remove('project_phases', [
      { column: 'id', operator: 'eq', value: id },
    ]);

    if (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }

    // Log activity
    await this.logActivity(phase.projectId, 'updated', `Phase "${phase.name}" deleted`, {
      phaseId: id,
    });
  },

  /**
   * Get milestones for a phase
   */
  async getMilestones(phaseId: string): Promise<Milestone[]> {
    const { data, error } = await restClient.query<MilestoneRow>('project_milestones', {
      filters: [{ column: 'phase_id', operator: 'eq', value: phaseId }],
      order: { column: 'order', ascending: true },
    });

    if (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }

    return (data || []).map(transformMilestoneRow);
  },

  /**
   * Create a new milestone
   */
  async createMilestone(payload: CreateMilestonePayload): Promise<Milestone> {
    // Get the next order number
    const existingMilestones = await this.getMilestones(payload.phaseId);
    const nextOrder =
      existingMilestones.length > 0
        ? Math.max(...existingMilestones.map((m) => m.order)) + 1
        : 1;

    const phase = await this.getPhaseById(payload.phaseId);

    const dbPayload = {
      phase_id: payload.phaseId,
      name: payload.name,
      description: payload.description || null,
      order: nextOrder,
      target_date: payload.targetDate || null,
      completed: false,
    };

    const { data, error } = await restClient.insert<MilestoneRow>('project_milestones', dbPayload);

    if (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }

    // Log activity
    await this.logActivity(phase.projectId, 'milestone_added', `Milestone "${payload.name}" added`, {
      milestoneId: data.id,
      phaseId: payload.phaseId,
    });

    return transformMilestoneRow(data);
  },

  /**
   * Update an existing milestone
   */
  async updateMilestone(id: string, payload: UpdateMilestonePayload): Promise<Milestone> {
    // Get user ID from session for completed_by field
    const userId = await getCurrentUserIdFromToken();

    const currentMilestone = await this.getMilestoneById(id);
    const phase = await this.getPhaseById(currentMilestone.phaseId);

    const dbPayload: Record<string, unknown> = {};

    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.targetDate !== undefined) dbPayload.target_date = payload.targetDate;
    if (payload.completed !== undefined) {
      dbPayload.completed = payload.completed;
      dbPayload.completed_at = payload.completed ? new Date().toISOString() : null;
      dbPayload.completed_by = payload.completed ? userId : null;

      // Log activity
      const activityType = payload.completed ? 'milestone_completed' : 'milestone_uncompleted';
      await this.logActivity(phase.projectId, activityType, `Milestone "${currentMilestone.name}" ${payload.completed ? 'completed' : 'uncompleted'}`, {
        milestoneId: id,
        phaseId: currentMilestone.phaseId,
      });
    }

    const { data, error } = await restClient.update<MilestoneRow>(
      'project_milestones',
      dbPayload,
      [{ column: 'id', operator: 'eq', value: id }]
    );

    if (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }

    return transformMilestoneRow(data);
  },

  /**
   * Get a single milestone by ID
   */
  async getMilestoneById(id: string): Promise<Milestone> {
    const { data, error } = await restClient.querySingle<MilestoneRow>('project_milestones', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
    });

    if (error) {
      console.error('Error fetching milestone:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Milestone not found');
    }

    return transformMilestoneRow(data);
  },

  /**
   * Delete a milestone
   */
  async deleteMilestone(id: string): Promise<void> {
    const milestone = await this.getMilestoneById(id);
    const phase = await this.getPhaseById(milestone.phaseId);

    const { error } = await restClient.remove('project_milestones', [
      { column: 'id', operator: 'eq', value: id },
    ]);

    if (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }

    // Log activity
    await this.logActivity(phase.projectId, 'updated', `Milestone "${milestone.name}" deleted`, {
      milestoneId: id,
    });
  },

  /**
   * Get linked entities for a project
   */
  async getLinkedEntities(projectId: string): Promise<{
    contacts: ProjectContact[];
    organizations: ProjectOrganization[];
    relationships: ProjectRelationship[];
  }> {
    // Fetch contacts
    const { data: contactsData, error: contactsError } = await restClient.query<{
      id: string;
      project_id: string;
      contact_id: string;
      role: string | null;
      created_at: string;
    }>('project_contacts', {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
    });

    if (contactsError) {
      console.error('Error fetching linked contacts:', contactsError);
      throw contactsError;
    }

    // Fetch organizations
    const { data: orgsData, error: orgsError } = await restClient.query<{
      id: string;
      project_id: string;
      organization_id: string;
      role: string | null;
      created_at: string;
    }>('project_organizations', {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
    });

    if (orgsError) {
      console.error('Error fetching linked organizations:', orgsError);
      throw orgsError;
    }

    // Fetch relationships
    const { data: relsData, error: relsError } = await restClient.query<{
      id: string;
      project_id: string;
      relationship_id: string;
      created_at: string;
    }>('project_relationships', {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
    });

    if (relsError) {
      console.error('Error fetching linked relationships:', relsError);
      throw relsError;
    }

    // Fetch contact details
    const contacts = await Promise.all(
      (contactsData || []).map(async (row) => {
        const { data: contactData } = await restClient.querySingle<{
          id: string;
          first_name: string;
          last_name: string;
          emails: Array<{ value: string }>;
        }>('contacts', {
          filters: [{ column: 'id', operator: 'eq', value: row.contact_id }],
          select: 'id,first_name,last_name,emails',
        });

        return {
          id: row.id,
          projectId: row.project_id,
          contactId: row.contact_id,
          role: row.role,
          createdAt: new Date(row.created_at),
          contact: contactData
            ? {
                id: contactData.id,
                firstName: contactData.first_name,
                lastName: contactData.last_name,
                email: contactData.emails?.map((e) => e.value) || [],
              }
            : undefined,
        };
      })
    );

    // Fetch organization details
    const organizations = await Promise.all(
      (orgsData || []).map(async (row) => {
        const { data: orgData } = await restClient.querySingle<{
          id: string;
          name: string;
        }>('organizations', {
          filters: [{ column: 'id', operator: 'eq', value: row.organization_id }],
          select: 'id,name',
        });

        return {
          id: row.id,
          projectId: row.project_id,
          organizationId: row.organization_id,
          role: row.role,
          createdAt: new Date(row.created_at),
          organization: orgData
            ? {
                id: orgData.id,
                name: orgData.name,
              }
            : undefined,
        };
      })
    );

    // Fetch relationship details
    const relationships = await Promise.all(
      (relsData || []).map(async (row) => {
        const { data: relData } = await restClient.querySingle<{
          id: string;
          type: string;
          stage: string;
        }>('business_relationships', {
          filters: [{ column: 'id', operator: 'eq', value: row.relationship_id }],
          select: 'id,type,stage',
        });

        return {
          id: row.id,
          projectId: row.project_id,
          relationshipId: row.relationship_id,
          createdAt: new Date(row.created_at),
          relationship: relData
            ? {
                id: relData.id,
                type: relData.type,
                stage: relData.stage,
              }
            : undefined,
        };
      })
    );

    return {
      contacts,
      organizations,
      relationships,
    };
  },

  /**
   * Link a contact to a project
   */
  async linkContact(projectId: string, contactId: string, role?: string): Promise<void> {
    const { error } = await restClient.insert('project_contacts', {
      project_id: projectId,
      contact_id: contactId,
      role: role || null,
    });

    if (error) {
      console.error('Error linking contact:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_added', 'Contact linked to project', {
      contactId,
      role,
    });
  },

  /**
   * Unlink a contact from a project
   */
  async unlinkContact(projectId: string, contactId: string): Promise<void> {
    const { error } = await restClient.remove('project_contacts', [
      { column: 'project_id', operator: 'eq', value: projectId },
      { column: 'contact_id', operator: 'eq', value: contactId },
    ]);

    if (error) {
      console.error('Error unlinking contact:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_removed', 'Contact unlinked from project', {
      contactId,
    });
  },

  /**
   * Link an organization to a project
   */
  async linkOrganization(projectId: string, organizationId: string, role?: string): Promise<void> {
    const { error } = await restClient.insert('project_organizations', {
      project_id: projectId,
      organization_id: organizationId,
      role: role || null,
    });

    if (error) {
      console.error('Error linking organization:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_added', 'Organization linked to project', {
      organizationId,
      role,
    });
  },

  /**
   * Unlink an organization from a project
   */
  async unlinkOrganization(projectId: string, organizationId: string): Promise<void> {
    const { error } = await restClient.remove('project_organizations', [
      { column: 'project_id', operator: 'eq', value: projectId },
      { column: 'organization_id', operator: 'eq', value: organizationId },
    ]);

    if (error) {
      console.error('Error unlinking organization:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_removed', 'Organization unlinked from project', {
      organizationId,
    });
  },

  /**
   * Link a relationship to a project
   */
  async linkRelationship(projectId: string, relationshipId: string): Promise<void> {
    const { error } = await restClient.insert('project_relationships', {
      project_id: projectId,
      relationship_id: relationshipId,
    });

    if (error) {
      console.error('Error linking relationship:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_added', 'Business relationship linked to project', {
      relationshipId,
    });
  },

  /**
   * Unlink a relationship from a project
   */
  async unlinkRelationship(projectId: string, relationshipId: string): Promise<void> {
    const { error } = await restClient.remove('project_relationships', [
      { column: 'project_id', operator: 'eq', value: projectId },
      { column: 'relationship_id', operator: 'eq', value: relationshipId },
    ]);

    if (error) {
      console.error('Error unlinking relationship:', error);
      throw error;
    }

    await this.logActivity(projectId, 'link_removed', 'Business relationship unlinked from project', {
      relationshipId,
    });
  },

  /**
   * Get activities for a project
   */
  async getActivities(projectId: string): Promise<ProjectActivity[]> {
    const { data, error } = await restClient.query<ProjectActivityRow>('project_activities', {
      filters: [{ column: 'project_id', operator: 'eq', value: projectId }],
      order: { column: 'created_at', ascending: false },
    });

    if (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }

    // Fetch user names for activities
    const activities = await Promise.all(
      (data || []).map(async (row) => {
        const { data: userData } = await restClient.querySingle<{ full_name: string }>(
          'profiles',
          {
            filters: [{ column: 'id', operator: 'eq', value: row.user_id }],
            select: 'full_name',
          }
        );

        return transformActivityRow(row, userData?.full_name);
      })
    );

    return activities;
  },

  /**
   * Log an activity for a project
   */
  async logActivity(
    projectId: string,
    activityType: ProjectActivity['activityType'],
    description: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const userId = await getCurrentUserIdFromToken();

    if (!userId) {
      console.warn('Cannot log activity: user not authenticated');
      return;
    }

    const { error } = await restClient.insert('project_activities', {
      project_id: projectId,
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
    });

    if (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break the main operation
    }
  },
};

