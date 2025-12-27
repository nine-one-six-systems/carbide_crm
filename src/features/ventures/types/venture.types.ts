import type { Database } from '@/types/supabase';

// =============================================================================
// DATABASE TYPES
// =============================================================================

export type VentureStatus = 'active' | 'incubating' | 'sunset' | 'archived';

export type VentureOrganizationRelationship = 
  | 'owns'
  | 'subsidiary'
  | 'client'
  | 'partner'
  | 'vendor'
  | 'other';

// =============================================================================
// VENTURE TYPES
// =============================================================================

export interface Venture {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  primary_color: string | null;
  status: VentureStatus;
  founded_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface VentureWithStats extends Venture {
  relationship_count: number;
  organization_count: number;
  team_member_count: number;
}

export interface VentureFormValues {
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  primary_color?: string | null;
  status: VentureStatus;
  founded_date?: string | null;
}

// =============================================================================
// VENTURE ORGANIZATION TYPES
// =============================================================================

export interface VentureOrganization {
  id: string;
  venture_id: string;
  organization_id: string;
  relationship_type: VentureOrganizationRelationship;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  // Joined fields
  organization?: {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
  };
}

export interface LinkOrganizationFormValues {
  organization_id: string;
  relationship_type: VentureOrganizationRelationship;
  is_primary: boolean;
  notes?: string | null;
}

// =============================================================================
// VENTURE TEAM TYPES
// =============================================================================

export interface VentureTeamMember {
  id: string;
  venture_id: string;
  user_id: string | null;
  contact_id: string | null;
  role: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string | null;
  // Joined fields
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    primary_email: string | null;
  };
}

export interface AddTeamMemberFormValues {
  member_type: 'user' | 'contact';
  user_id?: string | null;
  contact_id?: string | null;
  role: string;
  start_date?: string | null;
}

// =============================================================================
// VENTURE STATS TYPES
// =============================================================================

export interface VenturePipelineBreakdown {
  pipeline_type: string;
  count: number;
}

export interface VentureStats {
  relationship_count: number;
  organization_count: number;
  team_member_count: number;
  pipeline_breakdown: VenturePipelineBreakdown[];
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface VentureFilters {
  status?: VentureStatus | 'all';
  search?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const VENTURE_STATUS_OPTIONS: { value: VentureStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'incubating', label: 'Incubating' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'archived', label: 'Archived' },
];

export const VENTURE_ORG_RELATIONSHIP_OPTIONS: { 
  value: VentureOrganizationRelationship; 
  label: string;
  description: string;
}[] = [
  { value: 'owns', label: 'Owns', description: 'This organization IS the venture (legal entity)' },
  { value: 'subsidiary', label: 'Subsidiary', description: 'A subsidiary of the venture' },
  { value: 'client', label: 'Client', description: 'A client of the venture' },
  { value: 'partner', label: 'Partner', description: 'A partner of the venture' },
  { value: 'vendor', label: 'Vendor', description: 'A vendor to the venture' },
  { value: 'other', label: 'Other', description: 'Other relationship' },
];

export const VENTURE_STATUS_COLORS: Record<VentureStatus, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  incubating: 'bg-blue-100 text-blue-700 border-blue-200',
  sunset: 'bg-orange-100 text-orange-700 border-orange-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

