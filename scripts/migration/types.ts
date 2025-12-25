/**
 * Migration types for transforming legacy CRM data to Carbide format
 */

// =============================================================================
// LEGACY CRM TYPES (Input format)
// =============================================================================

export interface LegacyContact {
  // Core fields
  'First Name'?: string;
  'Last Name'?: string;
  'Job Title'?: string;
  'Description'?: string;
  'Tags'?: string;
  'Created At'?: string;
  'Last Modified Date'?: string;
  
  // Emails
  'Email'?: string;
  'Email 2'?: string;
  'Email 3'?: string;
  
  // Phones
  'Mobile'?: string;
  'Phone'?: string;
  'Phone (work)'?: string;
  'Phone (other)'?: string;
  'Phone (Emergency)'?: string;
  
  // Address
  'Address Line 1'?: string;
  'Address Line 2'?: string;
  'City'?: string;
  'State'?: string;
  'ZipCode'?: string;
  'Country'?: string;
  
  // Personal Touch Fields
  'Favorite Food'?: string;
  'Favorite Drink'?: string;
  'Coffee/Starbucks Order'?: string;
  'Favorite Restaurant'?: string;
  'Hobbies'?: string;
  'Leisure Activities'?: string;
  'Personal Goals'?: string;
  'Birthday'?: string;
  'DOB'?: string;
  'Anniversary Date'?: string;
  'Marital Status'?: string;
  'Dependents'?: string;
  
  // Social Media
  'LinkedIn'?: string;
  'Twitter'?: string;
  'Facebook'?: string;
  'Instagram'?: string;
  'Skype'?: string;
  'Website'?: string;
  
  // Preferences
  'Email Opt Out'?: string | boolean;
  'SMS Opt Out'?: string | boolean;
  'Email Opt Out Reason'?: string;
  
  // Geolocation
  'Latitude'?: string | number;
  'Longitude'?: string | number;
  'Created Latitude'?: string | number;
  'Created Longitude'?: string | number;
  'Created Address'?: string;
  
  // Legacy/Historical
  '916 Description'?: string;
  'Consent'?: string;
  'Survey Score'?: string | number;
  'Survey Comment'?: string;
  'Survey Completed Date'?: string;
  'Salesmate Score'?: string | number;
  
  // Owner/Relationship
  'Owner'?: string;
  'Employer'?: string;
  
  // Allow additional legacy fields
  [key: string]: string | number | boolean | undefined;
}

export interface LegacyOrganization {
  // Core fields
  'Name - Company'?: string;
  'Type - Company'?: string;
  'Industry'?: string;
  'Website - Company'?: string;
  'Description - Company'?: string;
  'Tags - Company'?: string;
  'Created At - Company'?: string;
  'Last Modified Date - Company'?: string;
  
  // Address
  'Address Line 1 - Company'?: string;
  'Address Line 2 - Company'?: string;
  'City - Company'?: string;
  'State - Company'?: string;
  'ZipCode - Company'?: string;
  'Country - Company'?: string;
  
  // Social Media
  'LinkedIn - Company'?: string;
  'Twitter - Company'?: string;
  'Facebook - Company'?: string;
  'Instagram - Company'?: string;
  'Skype - Company'?: string;
  
  // Operations
  'Vehicles - Company'?: string | number;
  'Number of Locations - Company'?: string | number;
  'Time Zone - Company'?: string;
  
  // Identifiers
  'Site Code - Company'?: string;
  
  // Points of Contact
  'Admin POC - Company'?: string;
  'On Site POC - Company'?: string;
  
  // Geolocation
  'Latitude - Company'?: string | number;
  'Longitude - Company'?: string | number;
  'Created Latitude - Company'?: string | number;
  'Created Longitude - Company'?: string | number;
  'Created Address - Company'?: string;
  
  // Legacy
  'Pharmacy Status - Company'?: string;
  'Owner - Company'?: string;
  
  // Allow additional legacy fields
  [key: string]: string | number | boolean | undefined;
}

export interface LegacyActivity {
  'Contact First Name'?: string;
  'Contact Last Name'?: string;
  'Contact Email'?: string;
  'Activity Type'?: string;
  'Activity Date'?: string;
  'Subject'?: string;
  'Notes'?: string;
  'Performed By'?: string;
  [key: string]: string | undefined;
}

// =============================================================================
// CARBIDE TYPES (Output format)
// =============================================================================

export interface CarbideEmail {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface CarbidePhone {
  value: string;
  label: string;
  is_primary: boolean;
}

export interface CarbideAddress {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label: string;
}

export interface PersonalAttributes {
  favorite_food?: string;
  favorite_drink?: string;
  coffee_order?: string;
  favorite_restaurant?: string;
  hobbies?: string;
  leisure_activities?: string;
  goals?: string;
  birthday?: string;
  anniversary?: string;
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

export interface ContactCustomAttributes {
  personal?: PersonalAttributes;
  social?: SocialAttributes;
  preferences?: PreferenceAttributes;
  geo?: GeoAttributes;
  legacy?: LegacyAttributes;
}

export interface OrgCustomAttributes {
  social?: SocialAttributes;
  geo?: GeoAttributes;
  operations?: OperationsAttributes;
  identifiers?: IdentifierAttributes;
  contacts?: OrgContactAttributes;
  legacy?: LegacyAttributes;
}

export interface CarbideContact {
  first_name: string;
  last_name: string;
  emails: CarbideEmail[];
  phones: CarbidePhone[];
  addresses: CarbideAddress[];
  job_title?: string;
  description?: string;
  tags: string[];
  avatar_url?: string;
  custom_attributes: ContactCustomAttributes;
  // Preserved for linking
  _legacy_owner?: string;
  _legacy_employer?: string;
  _legacy_id?: string;
}

export interface CarbideOrganization {
  name: string;
  type?: 'company' | 'fund' | 'agency' | 'non_profit' | 'government' | 'other';
  industry?: string;
  website?: string;
  addresses: CarbideAddress[];
  description?: string;
  tags: string[];
  logo_url?: string;
  custom_attributes: OrgCustomAttributes;
  // Preserved for linking
  _legacy_owner?: string;
  _legacy_id?: string;
}

export interface CarbideActivity {
  type: string;
  contact_id?: string;
  organization_id?: string;
  subject?: string;
  notes?: string;
  occurred_at: string;
  // For matching during import
  _contact_email?: string;
  _contact_name?: string;
}

// =============================================================================
// MIGRATION RESULT TYPES
// =============================================================================

export interface TransformResult<T> {
  data: T[];
  errors: TransformError[];
  stats: TransformStats;
}

export interface TransformError {
  row: number;
  field: string;
  value: unknown;
  message: string;
  severity: 'error' | 'warning';
}

export interface TransformStats {
  totalRows: number;
  successfulRows: number;
  errorRows: number;
  warningCount: number;
  fieldsTransformed: Record<string, number>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  index: number;
  field: string;
  message: string;
  value: unknown;
}

export interface ValidationWarning {
  index: number;
  field: string;
  message: string;
  value: unknown;
}

export interface LoadResult {
  success: boolean;
  inserted: number;
  failed: number;
  errors: LoadError[];
}

export interface LoadError {
  index: number;
  record: unknown;
  error: string;
}

