# Carbide CRM Migration Mapping

**Legacy CRM → Carbide Data Migration Specification**  
*Generated: December 2024*

---

## Executive Summary

This document provides a comprehensive mapping between your legacy CRM fields and the Carbide CRM data model. It includes direct mappings, transformations required, schema extensions for custom attributes, and fields to deprecate.

### Key Architectural Differences

- **Multi-value fields:** Carbide uses arrays for emails, phones, and addresses instead of separate numbered fields
- **Relationships over Deals:** Carbide tracks business relationships with pipeline stages rather than separate deal records
- **Activity-derived metrics:** Last communication dates are computed from the activity log, not stored as static fields
- **Custom attributes via JSONB:** Personal preferences and custom fields stored in flexible JSON structure

---

## 1. Contact Field Mapping

### 1.1 Core Contact Fields (Direct Mapping)

| Legacy Field | Carbide Field | Notes |
|--------------|---------------|-------|
| `First Name` | `first_name` | Required |
| `Last Name` | `last_name` | Required |
| `Job Title` | `job_title` | Direct map |
| `Description` | `description` | Free-form notes/bio |
| `Tags` | `tags[]` | Parse comma-separated → array |
| `Created At` | `created_at` | Preserve original timestamp |
| `Last Modified Date` | `updated_at` | Direct map |

### 1.2 Multi-Value Fields (Transformation Required)

#### Email Addresses

| Legacy Fields | Carbide Structure | Transformation |
|---------------|-------------------|----------------|
| `Email`, `Email 2`, `Email 3` | `email: String[]` | Combine non-null values into array |

**Example output:** `["john@work.com", "john@personal.com"]`

#### Phone Numbers

| Legacy Field | Carbide Object | Label |
|--------------|----------------|-------|
| `Mobile` | `{ number, label }` | `"mobile"` |
| `Phone` | `{ number, label }` | `"main"` |
| `Phone (work)` | `{ number, label }` | `"work"` |
| `Phone (other)` | `{ number, label }` | `"other"` |
| `Phone (Emergency)` | `{ number, label }` | `"emergency"` |

**Example output:**
```json
[
  { "number": "555-123-4567", "label": "mobile", "primary": true },
  { "number": "555-987-6543", "label": "work", "primary": false }
]
```

#### Addresses

| Legacy Fields | Carbide Structure |
|---------------|-------------------|
| `Address Line 1`, `Address Line 2`, `City`, `State`, `ZipCode`, `Country` | `address[]` object array |

**Example output:**
```json
[
  {
    "street1": "123 Main St",
    "street2": "Suite 100",
    "city": "Austin",
    "state": "TX",
    "postal_code": "78701",
    "country": "USA",
    "label": "primary"
  }
]
```

---

## 2. Custom Attributes Schema Extension

Carbide will be extended with a `custom_attributes` JSONB field on both Contacts and Organizations.

### 2.1 Database Schema Addition

```sql
-- Add to contacts table
ALTER TABLE contacts 
ADD COLUMN custom_attributes JSONB DEFAULT '{}';

-- Add to organizations table
ALTER TABLE organizations 
ADD COLUMN custom_attributes JSONB DEFAULT '{}';

-- Create GIN index for querying
CREATE INDEX idx_contacts_custom_attrs ON contacts USING GIN (custom_attributes);
CREATE INDEX idx_orgs_custom_attrs ON organizations USING GIN (custom_attributes);
```

### 2.2 Personal Touch Fields Migration

These legacy fields map into `custom_attributes.personal`:

| Legacy Field | Custom Attribute Path | Type |
|--------------|----------------------|------|
| `Favorite Food` | `custom_attributes.personal.favorite_food` | string |
| `Favorite Drink` | `custom_attributes.personal.favorite_drink` | string |
| `Coffee/Starbucks Order` | `custom_attributes.personal.coffee_order` | string |
| `Favorite Restaurant` | `custom_attributes.personal.favorite_restaurant` | string |
| `Hobbies` | `custom_attributes.personal.hobbies` | string |
| `Leisure Activities` | `custom_attributes.personal.leisure_activities` | string |
| `Personal Goals` | `custom_attributes.personal.goals` | string |
| `Birthday` / `DOB` | `custom_attributes.personal.birthday` | date (ISO 8601) |
| `Anniversary Date` | `custom_attributes.personal.anniversary` | date (ISO 8601) |
| `Marital Status` | `custom_attributes.personal.marital_status` | string |
| `Dependents` | `custom_attributes.personal.dependents` | string |

**Example output:**
```json
{
  "personal": {
    "favorite_food": "Italian",
    "favorite_drink": "Bourbon",
    "coffee_order": "Venti Oat Milk Latte",
    "favorite_restaurant": "Uchi",
    "hobbies": "Golf, Reading",
    "birthday": "1985-03-15",
    "marital_status": "Married"
  }
}
```

### 2.3 Social Media Fields Migration

| Legacy Field | Custom Attribute Path |
|--------------|----------------------|
| `LinkedIn` | `custom_attributes.social.linkedin` |
| `Twitter` | `custom_attributes.social.twitter` |
| `Facebook` | `custom_attributes.social.facebook` |
| `Instagram` | `custom_attributes.social.instagram` |
| `Skype` | `custom_attributes.social.skype` |
| `Website` | `custom_attributes.social.website` |

### 2.4 Communication Preferences

| Legacy Field | Custom Attribute Path | Type |
|--------------|----------------------|------|
| `Email Opt Out` | `custom_attributes.preferences.email_opt_out` | boolean |
| `SMS Opt Out` | `custom_attributes.preferences.sms_opt_out` | boolean |
| `Email Opt Out Reason` | `custom_attributes.preferences.email_opt_out_reason` | string |

### 2.5 Geolocation (Google Maps API Integration)

These fields are preserved for future Google Maps API integration:

| Legacy Field | Custom Attribute Path | Type | Notes |
|--------------|----------------------|------|-------|
| `Latitude` | `custom_attributes.geo.lat` | number | Current/primary location |
| `Longitude` | `custom_attributes.geo.lng` | number | Current/primary location |
| `Created Latitude` | `custom_attributes.geo.created_lat` | number | Location at record creation |
| `Created Longitude` | `custom_attributes.geo.created_lng` | number | Location at record creation |
| `Created Address` | `custom_attributes.geo.created_address` | string | Address at record creation |

**Example output:**
```json
{
  "geo": {
    "lat": 30.2672,
    "lng": -97.7431,
    "created_lat": 30.2672,
    "created_lng": -97.7431,
    "created_address": "Austin, TX"
  }
}
```

**Future use cases:**
- Map visualization of contacts/clients
- Proximity-based search ("contacts within 50 miles")
- Territory management
- Route optimization for field sales

### 2.6 Legacy/Historical Data

| Legacy Field | Custom Attribute Path | Notes |
|--------------|----------------------|-------|
| `916 Description` | `custom_attributes.legacy.description_916` | Preserve for reference |
| `Consent` | `custom_attributes.legacy.consent` | Historical consent record |
| `Survey Score` | `custom_attributes.legacy.nps.score` | Historical NPS |
| `Survey Comment` | `custom_attributes.legacy.nps.comment` | Historical feedback |
| `Survey Completed Date` | `custom_attributes.legacy.nps.completed_at` | Timestamp |
| `Salesmate Score` | `custom_attributes.legacy.salesmate_score` | For reference only |

---

## 3. Organization Field Mapping

### 3.1 Core Organization Fields

| Legacy Field | Carbide Field | Notes |
|--------------|---------------|-------|
| `Name - Company` | `name` | Required |
| `Type - Company` | `type` | Map to enum: Company, Fund, Agency, Non-Profit |
| `Industry` | `industry` | Direct map |
| `Website - Company` | `website` | Direct map |
| `Description - Company` | `description` | Free-form notes |
| `Tags - Company` | `tags[]` | Parse comma-separated → array |
| `Created At - Company` | `created_at` | Preserve timestamp |
| `Last Modified Date - Company` | `updated_at` | Direct map |

### 3.2 Organization Address

| Legacy Fields | Carbide Structure |
|---------------|-------------------|
| `Address Line 1 - Company`, `Address Line 2 - Company`, `City - Company`, `State - Company`, `ZipCode - Company`, `Country - Company` | `address[]` object array |

### 3.3 Organization Custom Attributes

| Legacy Field | Custom Attribute Path |
|--------------|----------------------|
| `Vehicles - Company` | `custom_attributes.operations.vehicles` |
| `Number of Locations - Company` | `custom_attributes.operations.location_count` |
| `Time Zone - Company` | `custom_attributes.operations.timezone` |
| `Site Code - Company` | `custom_attributes.identifiers.site_code` |
| `Pharmacy Status - Company` | `custom_attributes.legacy.pharmacy_status` |
| `Admin POC - Company` | `custom_attributes.contacts.admin_poc` |
| `On Site POC - Company` | `custom_attributes.contacts.onsite_poc` |

### 3.4 Organization Geolocation

| Legacy Field | Custom Attribute Path | Type |
|--------------|----------------------|------|
| `Latitude - Company` | `custom_attributes.geo.lat` | number |
| `Longitude - Company` | `custom_attributes.geo.lng` | number |
| `Created Latitude - Company` | `custom_attributes.geo.created_lat` | number |
| `Created Longitude - Company` | `custom_attributes.geo.created_lng` | number |
| `Created Address - Company` | `custom_attributes.geo.created_address` | string |

### 3.5 Organization Social Media

| Legacy Field | Custom Attribute Path |
|--------------|----------------------|
| `LinkedIn - Company` | `custom_attributes.social.linkedin` |
| `Twitter - Company` | `custom_attributes.social.twitter` |
| `Facebook - Company` | `custom_attributes.social.facebook` |
| `Instagram - Company` | `custom_attributes.social.instagram` |
| `Skype - Company` | `custom_attributes.social.skype` |

---

## 4. Contact-Organization Linking

### 4.1 Employment Relationship

| Legacy Field | Carbide Structure | Notes |
|--------------|-------------------|-------|
| `Employer` / `Name - Company` | `contact_organization_links` table | Many-to-many relationship |
| `Job Title` | `role_title` on link | Position at the org |
| `Primary Contact` | `is_primary` boolean on link | POC designation |

**Link table structure:**
```sql
contact_organization_links (
  id UUID PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  organization_id UUID REFERENCES organizations(id),
  role_title VARCHAR,
  role_type VARCHAR,  -- 'employee', 'founder', 'board', etc.
  is_primary BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP
)
```

---

## 5. Activity Data Migration

### 5.1 Derived Fields (Do Not Migrate Directly)

These fields will be **computed from the activity log** in Carbide rather than stored statically:

| Legacy Field | Carbide Approach |
|--------------|------------------|
| `Last Communication Date` | Computed from `activities` table |
| `Last Communication Mode` | Derived from most recent activity type |
| `Last Communication By` | Derived from most recent activity `logged_by` |
| `Last Call Done Date` | Query: `WHERE type = 'call_outbound'` |
| `Last Call Received Date` | Query: `WHERE type = 'call_inbound'` |
| `Last Text Sent Date` | Query: `WHERE type = 'text_outbound'` |
| `Last Text Received Date` | Query: `WHERE type = 'text_inbound'` |
| `Last Email Sent Date` | Query: `WHERE type = 'email_outbound'` |
| `Last Email Received Date` | Query: `WHERE type = 'email_inbound'` |
| `Last Note Added` | Query: `WHERE type = 'note'` |
| `Last Note Added At` | Timestamp from note activity |
| `Last Note Added By` | User from note activity |

### 5.2 Historical Activity Import (Optional)

If you want to preserve historical communication records, import them as activities:

```sql
INSERT INTO activities (type, contact_id, occurred_at, notes, logged_by, logged_at)
SELECT 
  'note',  -- or appropriate type
  contact_id,
  last_communication_date,
  'Migrated from legacy CRM',
  migrated_by_user_id,
  NOW()
FROM legacy_contacts
WHERE last_communication_date IS NOT NULL;
```

---

## 6. Fields to Deprecate (Do Not Migrate)

### 6.1 Web Analytics Fields

These are not part of Carbide's scope (use dedicated marketing automation tools):

| Deprecated Fields |
|-------------------|
| `Device`, `Search Engine`, `OS`, `Browser`, `Browser Version` |
| `Current URL`, `Host`, `IP Address`, `Path Name` |
| `Country Code`, `Region`, `Screen Width`, `Screen Height` |
| `Library`, `Library Version`, `User ID` |
| `Initial Referral URL`, `Initial Referral Domain` |
| `Referral URL`, `Referral Domain`, `Event Type` |
| `UTM Source`, `UTM Campaign`, `UTM Term`, `UTM Medium`, `UTM Content` |
| `Total Sessions`, `Last Seen`, `Last Chat Date`, `Last Chat Received Date` |
| `Continent Code`, `Browser Language` |
| `IOS App Version`, `IOS Device`, `IOS OS Version` |
| `Android App Version`, `Android Device`, `Android OS Version` |



### 6.3 Pharmacy-Specific Legacy Fields

| Deprecated Fields | Recommendation |
|-------------------|----------------|
| `Pharmacy Name` | Migrate to Organization if active client |
| `Pharmacy Point of Contact` | Link as Contact if active |
| `Pharmacy Contact Phone` | Include in Organization record |

---

## 7. Owner/Assignment Migration

### 7.1 Understanding the Difference

| Legacy Model | Carbide Model |
|--------------|---------------|
| `Owner` on Contact | No direct owner on Contact |
| `Owner - Company` on Organization | No direct owner on Organization |
| — | `owner_id` on **Relationship** record |

### 7.2 Migration Strategy

1. For each Contact with an active deal/relationship, create a Relationship record with the legacy Owner as `owner_id`
2. For Contacts without deals, you may optionally create a "General" relationship type to preserve ownership, or rely on task assignment

---

## 8. Custom Attributes UI Specification

### 8.1 Admin Configuration

Admins should be able to define custom attribute schemas:

```typescript
interface CustomFieldDefinition {
  key: string;           // e.g., "favorite_food"
  label: string;         // e.g., "Favorite Food"
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  category: string;      // e.g., "personal", "social", "legacy"
  options?: string[];    // For select/multiselect types
  required?: boolean;
  showOnCard?: boolean;  // Display on contact card summary
  entityType: 'contact' | 'organization' | 'both';
}
```

### 8.2 Querying Custom Attributes

```sql
-- Find contacts who like Italian food
SELECT * FROM contacts 
WHERE custom_attributes->'personal'->>'favorite_food' ILIKE '%italian%';

-- Find contacts with birthdays in March
SELECT * FROM contacts 
WHERE EXTRACT(MONTH FROM (custom_attributes->'personal'->>'birthday')::date) = 3;

-- Find all LinkedIn profiles
SELECT id, first_name, last_name, 
       custom_attributes->'social'->>'linkedin' AS linkedin
FROM contacts 
WHERE custom_attributes->'social'->>'linkedin' IS NOT NULL;

-- Find contacts within ~50 miles of Austin (30.2672, -97.7431)
-- Uses bounding box approximation; 1 degree ≈ 69 miles
SELECT id, first_name, last_name,
       custom_attributes->'geo'->>'lat' AS lat,
       custom_attributes->'geo'->>'lng' AS lng
FROM contacts 
WHERE (custom_attributes->'geo'->>'lat')::numeric BETWEEN 29.5 AND 31.0
  AND (custom_attributes->'geo'->>'lng')::numeric BETWEEN -98.5 AND -97.0;

-- Find organizations by geolocation for territory mapping
SELECT id, name,
       custom_attributes->'geo'->>'lat' AS lat,
       custom_attributes->'geo'->>'lng' AS lng
FROM organizations 
WHERE custom_attributes->'geo'->>'lat' IS NOT NULL;
```

---

## 9. Migration Script Outline

### 9.1 Suggested Order

1. **Organizations** — Create all company records first
2. **Contacts** — Create contact records with custom_attributes
3. **Contact-Org Links** — Establish employment relationships
4. **Relationships** — Create business relationships (B2B clients, etc.)
5. **Activities** — Import historical communication logs (optional)
6. **Tasks** — Migrate open activities to tasks (if applicable)

### 9.2 Data Validation Checklist

- [ ] All required fields populated (first_name, last_name, org name)
- [ ] Email arrays contain valid email formats
- [ ] Phone numbers normalized to consistent format
- [ ] Dates converted to ISO 8601 format
- [ ] Tags split from comma-separated strings to arrays
- [ ] Custom attributes structured per schema
- [ ] Organization links created with proper role_title
- [ ] Duplicate contacts/orgs identified and merged

---

## 10. Post-Migration Verification

### 10.1 Record Counts

```sql
-- Verify migration completeness
SELECT 'contacts' AS entity, COUNT(*) FROM contacts
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'contact_org_links', COUNT(*) FROM contact_organization_links
UNION ALL
SELECT 'relationships', COUNT(*) FROM relationships;
```

### 10.2 Data Integrity Checks

```sql
-- Orphaned links
SELECT * FROM contact_organization_links col
WHERE NOT EXISTS (SELECT 1 FROM contacts c WHERE c.id = col.contact_id)
   OR NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = col.organization_id);

-- Contacts without any phone or email
SELECT * FROM contacts 
WHERE (email IS NULL OR email = '[]') 
  AND (phone IS NULL OR phone = '[]');
```

---

## Appendix A: Complete Field Reference

### Contact Fields Summary

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Direct Map | 7 | Core fields that map 1:1 |
| 🔄 Transform | 8 | Fields requiring structure change |
| 📦 Custom Attr | 25+ | Moving to custom_attributes JSONB (incl. geo) |
| ⏳ Derived | 15 | Computed from activity log |
| ❌ Deprecated | 30+ | Not migrating (web analytics) |

### Organization Fields Summary

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Direct Map | 8 | Core org fields |
| 🔄 Transform | 6 | Address, phones |
| 📦 Custom Attr | 17 | Ops, identifiers, social, geo |
| ⏳ Derived | 10 | From activity log |
| ❌ Deprecated | 5 | Redundant fields |
