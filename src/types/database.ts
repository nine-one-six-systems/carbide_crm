// Database entity types based on Supabase schema

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = 'admin' | 'manager' | 'user';

export type OrganizationType =
  | 'company'
  | 'fund'
  | 'agency'
  | 'non_profit'
  | 'government'
  | 'other';

export type RoleType =
  | 'executive'
  | 'employee'
  | 'founder'
  | 'board_member'
  | 'advisor'
  | 'investor'
  | 'consultant'
  | 'partner'
  | 'other';

export type PrimaryRelationshipRole =
  | 'spouse'
  | 'partner'
  | 'child'
  | 'parent'
  | 'sibling';

export type SecondaryRelationshipType =
  | 'parent_child'
  | 'sibling'
  | 'colleague'
  | 'former_colleague'
  | 'manager_reports_to'
  | 'mentor_mentee'
  | 'referral_source'
  | 'business_partner'
  | 'friend'
  | 'other';

export type BusinessRelationshipType =
  | 'b2b_client'
  | 'b2c_client'
  | 'non_business_investment'
  | 'business_investment_external'
  | 'internal_business_opportunity'
  | 'portfolio_company'
  | 'partnership_opportunity'
  | 'individual_partnership'
  | 'investor'
  | 'meridian_44_participant';

export type TaskType = 'call' | 'email' | 'text' | 'meeting' | 'send_mailer' | 'other';

export type TaskStatus = 'pending' | 'completed' | 'triaged' | 'dismissed';

export type CadenceStatus = 'active' | 'paused' | 'completed' | 'cleared';

export type ActivityType =
  | 'call_inbound'
  | 'call_outbound'
  | 'email_inbound'
  | 'email_outbound'
  | 'text_inbound'
  | 'text_outbound'
  | 'meeting_in_person'
  | 'meeting_virtual'
  | 'note'
  | 'stage_change'
  | 'relationship_created'
  | 'cadence_applied'
  | 'cadence_cleared'
  | 'cadence_paused'
  | 'cadence_resumed'
  | 'task_completed'
  | 'task_triaged'
  | 'task_dismissed';

export type Venture =
  | 'forge'
  | 'hearth'
  | 'anvil'
  | 'crucible'
  | 'foundry'
  | 'carbide'
  | 'lucepta'
  | 'meridian_44'
  | 'trade_stone_group';

// =============================================================================
// JSONB TYPES
// =============================================================================

export interface EmailEntry {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface PhoneEntry {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface AddressEntry {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label?: string;
}

// =============================================================================
// CUSTOM ATTRIBUTES TYPES
// =============================================================================

export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'url' | 'email';

export type CustomFieldEntity = 'contact' | 'organization' | 'both';

export interface PersonalAttributes {
  favorite_food?: string;
  favorite_drink?: string;
  coffee_order?: string;
  favorite_restaurant?: string;
  hobbies?: string;
  leisure_activities?: string;
  goals?: string;
  birthday?: string; // ISO 8601 date
  anniversary?: string; // ISO 8601 date
  marital_status?: string;
  dependents?: string;
}

export interface SocialAttributes {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  skype?: string;
  website?: string;
}

export interface PreferenceAttributes {
  email_opt_out?: boolean;
  sms_opt_out?: boolean;
  email_opt_out_reason?: string;
}

export interface GeoAttributes {
  lat?: number;
  lng?: number;
  created_lat?: number;
  created_lng?: number;
  created_address?: string;
}

export interface LegacyAttributes {
  description_916?: string;
  consent?: string;
  nps?: {
    score?: number;
    comment?: string;
    completed_at?: string;
  };
  salesmate_score?: number;
  pharmacy_status?: string;
}

export interface OperationsAttributes {
  vehicles?: number;
  location_count?: number;
  timezone?: string;
}

export interface IdentifierAttributes {
  site_code?: string;
}

export interface OrgContactAttributes {
  admin_poc?: string;
  onsite_poc?: string;
}

export interface CustomAttributes {
  personal?: PersonalAttributes;
  social?: SocialAttributes;
  preferences?: PreferenceAttributes;
  geo?: GeoAttributes;
  legacy?: LegacyAttributes;
  operations?: OperationsAttributes;
  identifiers?: IdentifierAttributes;
  contacts?: OrgContactAttributes;
  [key: string]: Record<string, unknown> | undefined;
}

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  field_type: CustomFieldType;
  category: string;
  entity_type: CustomFieldEntity;
  options: string[];
  is_required: boolean;
  show_on_card: boolean;
  display_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CORE ENTITIES
// =============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  emails: EmailEntry[];
  phones: PhoneEntry[];
  addresses: AddressEntry[];
  job_title: string | null;
  description: string | null;
  tags: string[];
  avatar_url: string | null;
  custom_attributes: CustomAttributes;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType | null;
  industry: string | null;
  website: string | null;
  addresses: AddressEntry[];
  description: string | null;
  tags: string[];
  logo_url: string | null;
  custom_attributes: CustomAttributes;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContactOrganizationLink {
  id: string;
  contact_id: string;
  organization_id: string;
  role_title: string | null;
  role_type: RoleType | null;
  is_primary: boolean;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// INTERPERSONAL RELATIONSHIPS
// =============================================================================

export interface PrimaryRelationshipGroup {
  id: string;
  name: string | null;
  created_at: string;
}

export interface PrimaryRelationshipMember {
  id: string;
  group_id: string;
  contact_id: string;
  role: PrimaryRelationshipRole;
  is_adult: boolean;
  created_at: string;
}

export interface SecondaryRelationship {
  id: string;
  contact_id: string;
  related_contact_id: string;
  relationship_type: SecondaryRelationshipType;
  notes: string | null;
  created_by: string;
  created_at: string;
}

// =============================================================================
// BUSINESS RELATIONSHIPS
// =============================================================================

export interface BusinessRelationship {
  id: string;
  type: BusinessRelationshipType;
  contact_id: string | null;
  organization_id: string | null;
  stage: string;
  ventures: Venture[];
  owner_id: string;
  attributes: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CADENCE SYSTEM
// =============================================================================

export interface CadenceTemplate {
  id: string;
  name: string;
  description: string | null;
  relationship_types: BusinessRelationshipType[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CadenceStep {
  id: string;
  cadence_id: string;
  step_number: number;
  name: string;
  task_type: TaskType;
  day_offset: number;
  description: string | null;
}

export interface AppliedCadence {
  id: string;
  cadence_template_id: string;
  contact_id: string;
  relationship_id: string | null;
  start_date: string;
  status: CadenceStatus;
  paused_at: string | null;
  paused_days: number;
  applied_by: string;
  applied_at: string;
  cleared_by: string | null;
  cleared_at: string | null;
  clear_reason: string | null;
}

export interface CadenceTask {
  id: string;
  applied_cadence_id: string;
  cadence_step_id: string;
  contact_id: string;
  due_date: string;
  status: TaskStatus;
  assigned_to: string;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface ManualTask {
  id: string;
  contact_id: string | null;
  organization_id: string | null;
  relationship_id: string | null;
  title: string;
  task_type: TaskType | null;
  due_date: string;
  status: TaskStatus;
  assigned_to: string;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

// =============================================================================
// ACTIVITIES
// =============================================================================

export interface Activity {
  id: string;
  type: ActivityType;
  contact_id: string | null;
  organization_id: string | null;
  relationship_id: string | null;
  cadence_task_id: string | null;
  manual_task_id: string | null;
  subject: string | null;
  notes: string | null;
  occurred_at: string;
  logged_by: string;
  logged_at: string;
  metadata: Record<string, unknown>;
}

// =============================================================================
// UNIFIED TASK (combines cadence and manual tasks)
// =============================================================================

export interface UnifiedTask {
  id: string;
  task_source: 'cadence' | 'manual';
  title: string;
  task_type: TaskType | null;
  contact_id: string | null;
  contact_name: string | null;
  due_date: string;
  status: TaskStatus;
  cadence_name: string | null;
  assigned_to: string;
}

