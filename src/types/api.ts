// API response types and utilities

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface MutationResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// Contact API types
export interface ContactSearchParams extends SearchParams {
  tags?: string[];
  createdBy?: string;
  hasOrganization?: boolean;
}

export interface ContactCreatePayload {
  first_name: string;
  last_name: string;
  emails?: Array<{ value: string; label: string; is_primary?: boolean }>;
  phones?: Array<{ value: string; label: string; is_primary?: boolean }>;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    label?: string;
  }>;
  job_title?: string;
  description?: string;
  tags?: string[];
  avatar_url?: string;
}

export interface ContactUpdatePayload extends Partial<ContactCreatePayload> {
  id: string;
}

// Organization API types
export interface OrganizationSearchParams extends SearchParams {
  type?: string;
  tags?: string[];
}

export interface OrganizationCreatePayload {
  name: string;
  type?: string;
  industry?: string;
  website?: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    label?: string;
  }>;
  description?: string;
  tags?: string[];
  logo_url?: string;
}

export interface OrganizationUpdatePayload extends Partial<OrganizationCreatePayload> {
  id: string;
}

// Task API types
export interface TaskSearchParams extends SearchParams {
  status?: string[];
  taskType?: string[];
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  contactId?: string;
  organizationId?: string;
}

export interface TaskCreatePayload {
  contact_id?: string;
  organization_id?: string;
  relationship_id?: string;
  title: string;
  task_type?: string;
  due_date: string;
  assigned_to: string;
  notes?: string;
}

export interface TaskUpdatePayload {
  id: string;
  status?: string;
  completed_by?: string;
  notes?: string;
}

// Relationship API types
export interface RelationshipSearchParams extends SearchParams {
  type?: string;
  stage?: string;
  ventures?: string[];
  ownerId?: string;
}

export interface RelationshipCreatePayload {
  type: string;
  contact_id?: string;
  organization_id?: string;
  stage: string;
  ventures?: string[];
  owner_id: string;
  attributes?: Record<string, unknown>;
}

export interface RelationshipUpdatePayload extends Partial<RelationshipCreatePayload> {
  id: string;
}

// Activity API types
export interface ActivitySearchParams extends SearchParams {
  type?: string[];
  contactId?: string;
  organizationId?: string;
  occurredFrom?: string;
  occurredTo?: string;
}

export interface ActivityCreatePayload {
  type: string;
  contact_id?: string;
  organization_id?: string;
  relationship_id?: string;
  cadence_task_id?: string;
  manual_task_id?: string;
  subject?: string;
  notes?: string;
  occurred_at: string;
  metadata?: Record<string, unknown>;
}

