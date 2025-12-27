import type { Venture } from '@/types/database';

// =============================================================================
// ENUMS
// =============================================================================

export type ProjectScope = 'internal' | 'external';

export type ProjectCategory =
  | 'product_development'
  | 'client_delivery'
  | 'strategic_initiative'
  | 'operations_infrastructure'
  | 'investment_portfolio';

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectHealth = 'not_started' | 'on_track' | 'at_risk' | 'blocked';

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

// =============================================================================
// CORE ENTITIES
// =============================================================================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  scope: ProjectScope;
  category: ProjectCategory;
  status: ProjectStatus;
  health: ProjectHealth;
  ventures: Venture[];
  ownerId: string;
  ownerName?: string;
  startDate: Date | null;
  targetDate: Date | null;
  completedDate: Date | null;
  githubProjectUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectWithStats extends Project {
  totalMilestones: number;
  completedMilestones: number;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  order: number;
  startDate: Date | null;
  targetDate: Date | null;
  status: PhaseStatus;
  createdAt: Date;
  updatedAt: Date;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  phaseId: string;
  name: string;
  description: string | null;
  order: number;
  targetDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// LINKED ENTITIES
// =============================================================================

export interface ProjectContact {
  id: string;
  projectId: string;
  contactId: string;
  role: string | null;
  createdAt: Date;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string[];
  };
}

export interface ProjectOrganization {
  id: string;
  projectId: string;
  organizationId: string;
  role: string | null;
  createdAt: Date;
  organization?: {
    id: string;
    name: string;
  };
}

export interface ProjectRelationship {
  id: string;
  projectId: string;
  relationshipId: string;
  createdAt: Date;
  relationship?: {
    id: string;
    type: string;
    stage: string;
  };
}

// =============================================================================
// ACTIVITY
// =============================================================================

export type ProjectActivityType =
  | 'created'
  | 'status_change'
  | 'health_change'
  | 'phase_status_change'
  | 'milestone_completed'
  | 'milestone_uncompleted'
  | 'phase_added'
  | 'milestone_added'
  | 'link_added'
  | 'link_removed'
  | 'updated';

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  activityType: ProjectActivityType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// =============================================================================
// FILTERS & PARAMS
// =============================================================================

export interface ProjectFilters {
  scope?: ProjectScope;
  category?: ProjectCategory;
  status?: ProjectStatus;
  health?: ProjectHealth;
  venture?: Venture;
  ownerId?: string;
}

export interface ProjectListParams extends ProjectFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'updated_at' | 'target_date' | 'health';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// PAYLOADS
// =============================================================================

export interface CreateProjectPayload {
  name: string;
  description?: string;
  scope: ProjectScope;
  category: ProjectCategory;
  ventures: Venture[];
  ownerId: string;
  startDate?: string;
  targetDate?: string;
  githubProjectUrl?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  scope?: ProjectScope;
  category?: ProjectCategory;
  status?: ProjectStatus;
  health?: ProjectHealth;
  ventures?: Venture[];
  ownerId?: string;
  startDate?: string | null;
  targetDate?: string | null;
  completedDate?: string | null;
  githubProjectUrl?: string | null;
}

export interface CreatePhasePayload {
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdatePhasePayload {
  name?: string;
  description?: string;
  startDate?: string | null;
  targetDate?: string | null;
  status?: PhaseStatus;
}

export interface CreateMilestonePayload {
  phaseId: string;
  name: string;
  description?: string;
  targetDate?: string;
}

export interface UpdateMilestonePayload {
  name?: string;
  description?: string;
  targetDate?: string | null;
  completed?: boolean;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export const PROJECT_SCOPE_LABELS: Record<ProjectScope, string> = {
  internal: 'Internal',
  external: 'External',
};

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  product_development: 'Product Development',
  client_delivery: 'Client Delivery',
  strategic_initiative: 'Strategic Initiative',
  operations_infrastructure: 'Operations/Infrastructure',
  investment_portfolio: 'Investment/Portfolio',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  not_started: 'Not Started',
  on_track: 'On Track',
  at_risk: 'At Risk',
  blocked: 'Blocked',
};

export const PROJECT_HEALTH_COLORS: Record<ProjectHealth, string> = {
  not_started: 'gray',
  on_track: 'green',
  at_risk: 'yellow',
  blocked: 'red',
};

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

