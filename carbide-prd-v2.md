# Carbide CRM - Product Requirements Document

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Development  
**Tech Stack:** Vite + React + TypeScript + Supabase

---

## 1. Executive Summary

Carbide is the internal CRM for the NineOneSix Systems ecosystem. It serves as the relationship management layer across all six ventures (Forge, Hearth, Anvil, Crucible, Foundry, and Carbide itself), handling the complexity of contacts and organizations that exist in multiple relationship contexts simultaneously.

### Core Design Principle
A single contact or organization can wear multiple hats: a B2B client today might become an investor tomorrow, a Meridian 44 participant might also be a portfolio company founder. Carbide models these as **multiple typed relationships on the same entity**, not duplicate records.

### The NineOneSix Ecosystem

| Venture | Function |
|---------|----------|
| **Forge** | Production software development |
| **Hearth** | Business architecture & advisory |
| **Anvil** | Operations management systems |
| **Crucible** | Peer network for founders |
| **Foundry** | Venture incubation & investment |
| **Carbide** | Sales & marketing solutions |

Adjacent entities: **Lucepta** (healthcare technology), **Meridian 44** (expert-owned AI platforms), **Trade Stone Group** (financial engine & investor network)

---

## 2. Core Entities

### 2.1 Contacts (People)

Individual humans you interact with.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `first_name` | String | Yes | |
| `last_name` | String | Yes | |
| `email` | String[] | No | Multiple supported |
| `phone` | Object[] | No | Multiple with labels (mobile, work, etc.) |
| `address` | Object[] | No | Multiple with labels |
| `job_title` | String | No | Current role/position |
| `description` | Text | No | Free-form bio/notes |
| `tags` | String[] | No | Flexible categorization |
| `avatar_url` | String | No | Profile image |
| `created_at` | Timestamp | Yes | |
| `updated_at` | Timestamp | Yes | |
| `created_by` | UUID | Yes | User who created |

### 2.2 Organizations (Companies/Entities)

Companies, firms, funds, or formal entities.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | String | Yes | Organization name |
| `type` | Enum | No | Company, Fund, Agency, Non-Profit, etc. |
| `industry` | String | No | Sector/industry |
| `website` | String | No | Primary URL |
| `address` | Object[] | No | Multiple locations |
| `description` | Text | No | Free-form notes |
| `tags` | String[] | No | Flexible categorization |
| `logo_url` | String | No | Organization logo |
| `created_at` | Timestamp | Yes | |
| `updated_at` | Timestamp | Yes | |
| `created_by` | UUID | Yes | User who created |

### 2.3 Contact-Organization Links

Many-to-many relationship between contacts and organizations. A single contact can hold multiple positions across different organizations simultaneously.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `contact_id` | UUID | Yes | FK to Contacts |
| `organization_id` | UUID | Yes | FK to Organizations |
| `role_title` | String | No | Specific title (CEO, Executive Director, etc.) |
| `role_type` | Enum | No | Category of involvement (see below) |
| `is_primary` | Boolean | No | Primary org for this contact |
| `is_current` | Boolean | Yes | Currently active role (default: true) |
| `start_date` | Date | No | When they started |
| `end_date` | Date | No | When they left (null = current) |
| `notes` | Text | No | Context about this role |

**Role Types:**
- Executive (C-suite, Director-level)
- Employee (Staff, Manager)
- Founder (Founder, Co-Founder)
- Board Member
- Advisor
- Investor
- Consultant/Contractor
- Partner
- Other

**Example: Meredith Lauderdale**
```
┌─────────────────────────────────────────────────────────────┐
│  Meredith Lauderdale                                        │
│  ─────────────────────────────────────────────────────────  │
│  🏢 Organizations                                           │
│                                                             │
│  Empirian                        Executive Director         │
│  └─ Executive · Current          [Primary]                  │
│                                                             │
│  Relevant Pharmacy Solutions     CEO                        │
│  └─ Founder · Current                                       │
│                                                             │
│  eBoxChain                       Board Member               │
│  └─ Board Member · Current                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Visualization Requirements:**
- All organization links shown at-a-glance on contact card left sidebar
- Each shows: Org name (clickable), Role title, Role type badge, Current/Former indicator
- Primary org marked distinctly
- Clicking org navigates to organization record
- From Organization view, show all linked contacts with their roles
- Former roles shown collapsed/grayed with option to expand

---

## 3. Interpersonal Relationships

Relationships between contacts (how people relate to each other as humans).

### 3.1 Primary Relationships (Household/Family Unit)

For closely connected people where you want to see combined activity.

**Primary Relationship Groups Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | String | No | Optional group name ("The Edwards Family") |
| `created_at` | Timestamp | Yes | |

**Primary Relationship Members Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `group_id` | UUID | Yes | FK to Primary Relationship Groups |
| `contact_id` | UUID | Yes | FK to Contacts |
| `role` | Enum | Yes | See predefined types below |
| `is_adult` | Boolean | Yes | Determines if shown as peer or contextual |

**Predefined Primary Relationship Types:**
- Spouse (exclusive - only one per contact)
- Partner (exclusive - only one per contact)
- Child
- Parent
- Sibling

**Behavior:**
- Contacts can belong to multiple primary groups (system warns when adding)
- Spouses/Partners are "adult peers" - shown prominently
- Children shown contextually until manually promoted
- "Household View" toggle shows combined timeline for all group members
- Cadence tasks remain assigned to individual but appear (grayed) in household view
- Disassociation creates audit record with timestamps

### 3.2 Secondary Relationships (Contextual/Professional)

For professional or extended connections that provide context but don't need combined views.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `contact_id` | UUID | Yes | FK to Contacts (source) |
| `related_contact_id` | UUID | Yes | FK to Contacts (target) |
| `relationship_type` | Enum | Yes | See predefined types below |
| `notes` | Text | No | Additional context |
| `created_at` | Timestamp | Yes | |
| `created_by` | UUID | Yes | |

**Predefined Secondary Relationship Types:**
- Parent / Child
- Sibling
- Colleague
- Former Colleague
- Manager / Reports To
- Mentor / Mentee
- Referral Source / Referred By
- Business Partner
- Friend
- Other (with notes)

**Behavior:**
- Relationships are **mutual** - creating A→B automatically creates B→A with inverse type
- Purely informational - no combined views or roll-ups
- Displays as clickable link on contact card
- Disassociation tracked in history

---

## 4. Business Relationships (Pipelines)

How contacts/organizations relate to NineOneSix. Each type has its own pipeline stages and attributes.

### 4.1 Relationship Base Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `type` | Enum | Yes | See relationship types below |
| `contact_id` | UUID | Conditional | FK to Contacts (required if no org) |
| `organization_id` | UUID | Conditional | FK to Organizations (optional) |
| `stage` | String | Yes | Current pipeline stage |
| `ventures` | String[] | No | Which ventures this relates to |
| `owner_id` | UUID | Yes | User who owns this relationship |
| `created_at` | Timestamp | Yes | |
| `updated_at` | Timestamp | Yes | |
| `attributes` | JSONB | No | Type-specific fields |

### 4.2 Relationship Types & Pipelines

#### B2B Clients
Organizations paying for services from any NineOneSix venture.

**Pipeline:**
```
Lead → Qualified → Discovery → Proposal → Negotiation → Won → Active → Churned
                                                      → Lost
```

**Attributes:**
- `service_type`: Which service(s)
- `contract_value`: Annual/total value
- `contract_start`: Date
- `contract_end`: Date
- `primary_contact_id`: Main POC at the org

---

#### B2C Clients
Individuals paying for services.

**Pipeline:**
```
Lead → Qualified → Discovery → Proposal → Negotiation → Won → Active → Churned
                                                      → Lost
```

**Attributes:**
- `service_type`: Which service(s)
- `value`: Total/recurring value
- `start_date`: Date

---

#### Non-Business Investment Opportunities
Assets that aren't operating companies (real estate, securities, crypto, funds, etc.).

**Pipeline:**
```
Identified → Research → Due Diligence → Decision → Committed → Funded → Monitoring → Exited
                                      → Passed
```

**Attributes:**
- `asset_type`: Real Estate, Securities, Crypto, Fund, Other
- `investment_amount`: Committed/actual
- `projected_return`: Expected ROI
- `timeline`: Investment horizon
- `risk_level`: Low/Medium/High
- `source`: How we found it

---

#### Business Investment Opportunities (External)
Outside founders bringing their ideas to Foundry accelerator/incubator.

**Pipeline:**
```
Applied → Screening → Interview → Due Diligence → Decision → Invested → Portfolio
                                               → Declined
```

**Attributes:**
- `company_name`: Business name
- `founder_contact_id`: Primary founder
- `industry`: Sector
- `stage`: Pre-seed, Seed, Series A, etc.
- `ask_amount`: What they're seeking
- `equity_offered`: Percentage
- `pitch_deck_url`: Link to materials

---

#### Internal Business Opportunities
NineOneSix-originated ideas seeking operators.

**Pipeline:**
```
Concept → Research → Validation → Operator Search → Matched → Formation → Active
                               → Shelved
```

**Attributes:**
- `concept_name`: Working title
- `thesis`: Why this opportunity
- `required_investment`: Capital needed
- `operator_contact_id`: Matched operator (when found)
- `target_industry`: Sector
- `originator_id`: Who conceived it

---

#### Portfolio Companies
Post-investment tracking for businesses you've invested in.

**Pipeline:**
```
Due Diligence Complete → Invested → Active → Scaling → Exit
                                          → Struggling → Wound Down
```

**Attributes:**
- `ownership_percentage`: Equity held
- `investment_amount`: Total invested
- `investment_date`: When invested
- `board_seats`: Number held
- `key_metrics`: JSONB of tracked KPIs
- `next_funding_round`: Upcoming raise info
- `valuation_current`: Latest valuation

---

#### Partnership Opportunities
Org-to-org strategic partnerships.

**Pipeline:**
```
Identified → Outreach → Discovery → Negotiation → Terms → Active → Inactive
                                              → Declined
```

**Attributes:**
- `partnership_type`: Co-marketing, Referral, Integration, JV, etc.
- `terms_summary`: Key deal points
- `start_date`: When activated
- `review_date`: Next review
- `primary_contact_id`: Main POC

---

#### Individual Partnerships
Solopreneurs, collaborators, contractors (non-employee capacity).

**Pipeline:**
```
Identified → Outreach → Discussion → Evaluation → Terms → Active → Inactive
                                              → Declined
```

**Attributes:**
- `partnership_type`: Collaborator, Contractor, Advisor, Affiliate, etc.
- `expertise`: Their specialty
- `terms_summary`: Arrangement details
- `start_date`: When started

---

#### Investor Pipeline
External investors to invest in your companies or opportunities.

**Pipeline:**
```
Prospect → Contacted → Interested → Meeting → Due Diligence → Terms → Committed → Funded → Active
                                                           → Passed
```

**Attributes:**
- `investor_type`: Angel, VC, Family Office, Institutional, etc.
- `typical_check_size`: Their usual range
- `investment_focus`: Sectors/stages they prefer
- `committed_amount`: What they've committed
- `invested_amount`: What they've funded
- `target_opportunity`: Which deal they're in on

---

#### Meridian 44 Participants
Experts contributing to the M44 platform.

**Pipeline:**
```
Identified → Outreach → Interested → Onboarding → Active Contributor → Inactive
                                  → Declined
```

**Attributes:**
- `vertical`: Which of the 44 verticals
- `specialty`: Specific expertise
- `contribution_status`: Not Started, In Progress, Contributing, Paused
- `agreement_status`: None, Sent, Signed
- `agreement_date`: When signed

---

### 4.3 Venture Tagging

Every relationship can be tagged with one or more ventures it relates to:
- Forge
- Hearth
- Anvil
- Crucible
- Foundry
- Carbide
- Lucepta
- Meridian 44
- Trade Stone Group

This enables filtering ("Show me all Forge clients") and reporting by venture.

---

## 5. Prospecting & Cadence System

Automated task sequences triggered by interactions or relationship stage changes.

### 5.1 Cadence Templates

Admin-defined sequences of tasks.

**Cadence Template Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | String | Yes | e.g., "New B2B Lead" |
| `description` | Text | No | When to use this cadence |
| `relationship_types` | String[] | No | Which relationship types this applies to |
| `is_active` | Boolean | Yes | Can be applied |
| `created_by` | UUID | Yes | Admin who created |
| `created_at` | Timestamp | Yes | |

**Cadence Step Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `cadence_id` | UUID | Yes | FK to Cadence Template |
| `step_number` | Integer | Yes | Order in sequence |
| `name` | String | Yes | e.g., "Enthusiastic Tour 1" |
| `task_type` | Enum | Yes | Call, Email, Text, Meeting, Send Mailer, Other |
| `day_offset` | Integer | Yes | Days from cadence start (0 = same day) |
| `description` | Text | No | Instructions for this step |

### 5.2 Applied Cadences

When a cadence is applied to a contact.

**Applied Cadence Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `cadence_template_id` | UUID | Yes | FK to Cadence Template |
| `contact_id` | UUID | Yes | FK to Contacts |
| `relationship_id` | UUID | No | FK to Relationship (if context-specific) |
| `start_date` | Date | Yes | Day 0 of the cadence |
| `status` | Enum | Yes | Active, Paused, Completed, Cleared |
| `paused_at` | Timestamp | No | When paused (for resume calculation) |
| `applied_by` | UUID | Yes | User who applied |
| `applied_at` | Timestamp | Yes | |
| `cleared_by` | UUID | No | User who cleared |
| `cleared_at` | Timestamp | No | |
| `clear_reason` | String | No | Why cleared (e.g., "Joined", "Not Interested") |

### 5.3 Cadence Tasks

Individual tasks generated from cadence steps.

**Cadence Task Table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `applied_cadence_id` | UUID | Yes | FK to Applied Cadence |
| `cadence_step_id` | UUID | Yes | FK to Cadence Step |
| `contact_id` | UUID | Yes | FK to Contacts |
| `due_date` | Date | Yes | When task is due |
| `status` | Enum | Yes | Pending, Completed, Triaged, Dismissed |
| `assigned_to` | UUID | Yes | User responsible |
| `completed_by` | UUID | No | User who completed |
| `completed_at` | Timestamp | No | |
| `notes` | Text | No | Required on completion/triage |

**Task Status Definitions:**
- **Pending**: Not yet actioned
- **Completed**: Task was performed, notes capture outcome
- **Triaged**: Intentionally skipped, notes explain why (tracked in history, visible in timeline)
- **Dismissed**: Cleared and hidden from default views (for backlog cleanup)

**Visibility Controls:**
- Default view shows: Pending, Completed tasks
- Toggle to show/hide Triaged tasks (default: visible in history, hidden in task lists)
- Toggle to show/hide Dismissed tasks (default: hidden everywhere)
- Contact timeline always shows Triaged with visual indicator (grayed/strikethrough)
- Dismissed only visible when explicitly toggled on

**Overdue Visual Indicators:**
- 1-3 days overdue: Yellow/Orange indicator
- 4-7 days overdue: Red indicator
- 8-30 days overdue: Red + "Needs Attention" badge
- 30+ days overdue: Red + "Stale" badge (candidate for triage/dismiss)

### 5.4 Cadence Behaviors

**Timing:**
- Day 0 = date cadence is applied
- Day 1 = following day
- Tasks generate for all steps when cadence is applied

**Multiple Cadences:**
- Same cadence can be applied multiple times to same contact
- Multiple different cadences can be active simultaneously
- Tasks from all cadences interleave chronologically in task views

**Pause/Resume:**
- Pausing freezes the timeline
- On resume, remaining tasks shift forward by pause duration
- Example: Paused on Day 10 for 14 days → Day 11 task becomes due on what would have been Day 25

**Clearing Cadences:**
- Manual action to clear all pending tasks from a cadence
- Cleared tasks marked with reason and tracked in history
- Phase 2: Configurable rules (e.g., "Applying 'New Client' clears 'Lead Nurture'")

**Task Assignment:**
- Tasks assigned to user who applied the cadence
- Admin can reassign individual tasks or bulk reassign

**Visibility:**
- All users can see all tasks (transparent team model)
- Tasks filterable by assigned user

### 5.5 Manual Tasks

One-off tasks not tied to a cadence.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `contact_id` | UUID | No | FK to Contacts |
| `organization_id` | UUID | No | FK to Organizations |
| `relationship_id` | UUID | No | FK to Relationship |
| `title` | String | Yes | Task description |
| `task_type` | Enum | No | Call, Email, Text, Meeting, Other |
| `due_date` | Date | Yes | |
| `status` | Enum | Yes | Pending, Completed, Dismissed |
| `assigned_to` | UUID | Yes | |
| `completed_by` | UUID | No | |
| `completed_at` | Timestamp | No | |
| `notes` | Text | No | |

---

## 6. Activity Tracking

All interactions logged for complete history.

### 6.1 Activity Log Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `type` | Enum | Yes | See activity types below |
| `contact_id` | UUID | No | FK to Contacts |
| `organization_id` | UUID | No | FK to Organizations |
| `relationship_id` | UUID | No | FK to Relationship |
| `cadence_task_id` | UUID | No | FK to Cadence Task (if from cadence) |
| `manual_task_id` | UUID | No | FK to Manual Task |
| `subject` | String | No | Brief description |
| `notes` | Text | No | Details |
| `occurred_at` | Timestamp | Yes | When it happened |
| `logged_by` | UUID | Yes | User who logged |
| `logged_at` | Timestamp | Yes | When it was logged |

**Activity Types:**
- Call (Inbound)
- Call (Outbound)
- Email (Inbound)
- Email (Outbound)
- Text (Inbound)
- Text (Outbound)
- Meeting (In Person)
- Meeting (Virtual)
- Note
- Stage Change
- Relationship Created
- Cadence Applied
- Cadence Cleared
- Cadence Paused
- Cadence Resumed
- Task Completed
- Task Triaged
- Task Dismissed

---

## 7. User Interface Specifications

### 7.1 Unified Contact View

Primary interface for viewing and working with a contact.

**Layout (inspired by Follow Up Boss):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Avatar]  Contact Name                                              [Actions ▼] │
│           Last communication: 4 minutes ago                                     │
├─────────────────┬───────────────────────────────────────┬───────────────────────┤
│                 │                                       │                       │
│  CONTACT INFO   │  ACTIVITY FEED                        │  RIGHT SIDEBAR        │
│                 │                                       │                       │
│  📞 Phone(s)    │  [Create Note] [Email] [Text] [Call]  │  📋 Tasks (3)         │
│  ✉️ Email(s)    │  ┌─────────────────────────────────┐  │    ☐ Follow Up Call   │
│  📍 Address     │  │ Note input area                 │  │      Due: Today       │
│  💼 Job Title   │  │ @mention to notify              │  │    ☐ Send Proposal    │
│                 │  └─────────────────────────────────┘  │      Due: Tomorrow    │
│  ───────────    │                                       │                       │
│                 │  [All] [Emails] [Calls] [Notes] ...  │  📅 Appointments      │
│  🏢 ORGS        │  ┌─────────────────────────────────┐  │                       │
│                 │  │ ○ Call with Contact             │  │  🎯 Active Cadences   │
│  Empirian       │  │   Dec 24 · by Dan               │  │    New B2B Lead (Day 5)│
│  Exec Director  │  │   Notes from the call...        │  │    [Pause] [Clear]    │
│  └ Executive ✓  │  │                                 │  │                       │
│    [Primary]    │  │ ○ Email received                │  │  💼 Biz Relationships │
│                 │  │   Dec 23 · Inbound              │  │    B2B Client (Active)│
│  Relevant Pharm │  │   Re: Proposal questions        │  │    └ via Empirian     │
│  CEO            │  └─────────────────────────────────┘  │    Investor (Prospect)│
│  └ Founder ✓    │                                       │    └ via TSG          │
│                 │  [Load More]                          │                       │
│  eBoxChain      │                                       │  🏷️ Tags              │
│  Board Member   │  ──────────────────────────────────   │    VIP, Healthcare    │
│  └ Board ✓      │                                       │                       │
│                 │  [Household View Toggle]              │  📁 Ventures          │
│  [+ Add Org]    │                                       │    Forge, Foundry     │
│                 │                                       │                       │
│  ───────────    │                                       │                       │
│                 │                                       │                       │
│  👫 PRIMARY REL │                                       │                       │
│    Sam Edwards  │                                       │                       │
│    (Spouse)     │                                       │                       │
│                 │                                       │                       │
│  🔗 SECONDARY   │                                       │                       │
│    S. Sweeney   │                                       │                       │
│    (Daughter)   │                                       │                       │
│                 │                                       │                       │
│  ───────────    │                                       │                       │
│                 │                                       │                       │
│  DETAILS        │                                       │                       │
│  Source: Referral                                       │                       │
│  Created: Jan 24│                                       │                       │
│  [+ Add Tag]    │                                       │                       │
└─────────────────┴───────────────────────────────────────┴───────────────────────┘
```

**Key Features:**
- **Contact details** at-a-glance in left column
- **Organizations section**: All org links with role title, role type badge, current indicator
  - Primary org marked distinctly
  - Click org name to navigate to org record
  - Shows role type (Executive, Founder, Board, etc.) with checkmark for current roles
- **Primary & Secondary relationships** clickable to navigate to those contacts
- **Unified activity timeline** in center (filterable by type)
- **Household View toggle** merges family members' timelines when enabled
- **Right sidebar**: Tasks (with due dates), Active Cadences (with pause/clear), Business Relationships (with linked org context), Tags, Ventures
- **Quick actions**: Log Call, Send Email, Create Task, Add Cadence, Add to Org

### 7.2 Batch Task View

For working through tasks of the same type efficiently.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Batch Tasks: Enthusiastic Tour 2                             [Filter ▼] [⚙️]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Task Type: 📞 Call                                                              │
│ Date Range: [All Time ▼]  (Options: All Time, Next 7 Days, Next 30 Days, Custom)│
│ Showing: [✓] Overdue [✓] Due Today [✓] Upcoming  [ ] Triaged  [ ] Dismissed    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 23 tasks (5 overdue, 8 due today, 10 upcoming)               [Triage Selected]  │
├────┬─────────────────┬───────────────┬──────────────┬───────────┬───────────────┤
│ ☐  │ Contact Name    │ Phone         │ Email        │ Due Date  │ Notes/Action  │
├────┼─────────────────┼───────────────┼──────────────┼───────────┼───────────────┤
│ ☐  │ John Smith      │ 555-123-4567  │ j@email.com  │ Dec 20 🔴 │ [Complete ▼]  │
│    │                 │               │              │ (Stale)   │               │
│ ☐  │ Jane Doe        │ 555-234-5678  │ jane@co.com  │ Dec 22 🟠 │ [Complete ▼]  │
│ ☐  │ Bob Johnson     │ 555-345-6789  │ bob@org.com  │ Today 🟡  │ [Complete ▼]  │
│ ☑  │ Alice Williams  │ 555-456-7890  │ alice@biz.com│ Today     │ [Complete ▼]  │
│ ☐  │ Charlie Brown   │ 555-567-8901  │ charlie@x.com│ Dec 26    │ [Complete ▼]  │
└────┴─────────────────┴───────────────┴──────────────┴───────────┴───────────────┘

[Selected: 1]  [Bulk Complete...] [Bulk Triage...] [Bulk Dismiss...]

┌─ Bulk Complete Dialog ──────────────────────────────────────────────────────────┐
│ Completing 4 tasks                                                              │
│                                                                                 │
│ Notes (required): ________________________________________________________      │
│                   ________________________________________________________      │
│                                                                                 │
│ This note will be added to each task individually.                              │
│                                                                    [Cancel] [Complete] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Filter by**: Task type, Cadence, Date range, Assigned user, Status visibility toggles
- **Date Window**: All Time (default), Next 7 Days, Next 30 Days, or Custom range
- **Task Type Display**: Icon showing task type (📞 Call, ✉️ Email, 💬 Text, 📅 Meeting, 📬 Mailer, 📝 Other)
- **Overdue Indicators**: Color-coded by severity (Yellow → Orange → Red → Red+Stale badge)
- **Sort by**: Due date (default), Contact name, Days overdue
- **Individual completion**: Click Complete, add notes inline, submit
- **Multi-select**: Checkbox to select multiple tasks
- **Bulk Complete**: Single note applied to all selected tasks
- **Bulk Triage**: Mark all selected as triaged with shared reason
- **Bulk Dismiss**: Clear all selected from view (with confirmation)
- **Click contact name**: Opens contact view in new tab/panel

### 7.3 Salesperson Home Dashboard

Daily working view for individual contributors.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Good morning, Dan                                              Dec 24, 2024     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TODAY'S FOCUS                          QUICK ACTIONS                           │
│  ┌─────────────────────────────────┐    [+ New Contact]                         │
│  │  🔴 12 Overdue Tasks            │    [+ Log Activity]                        │
│  │  🟡 8 Due Today                 │    [+ Add Cadence]                         │
│  │  🟢 15 Upcoming (7 days)        │    [🔍 Search...]                          │
│  └─────────────────────────────────┘                                            │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  TODAY'S TASKS                                                    [View All →]  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ Call - John Smith - New B2B Lead Step 3                    Due: Today  │   │
│  │ ☐ Email - Jane Doe - Investor Follow Up Step 2               Due: Today  │   │
│  │ ☐ Meeting - Acme Corp - Proposal Review                      Due: Today  │   │
│  │ ☐ Call - Bob Johnson - Partnership Outreach Step 1           Due: Today  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  OVERDUE (Oldest First)                                           [View All →]  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ Call - Alice Williams - New B2B Lead Step 2          5 days overdue 🔴 │   │
│  │ ☐ Email - Charlie Brown - M44 Outreach Step 1          3 days overdue 🔴 │   │
│  │ ☐ Call - David Lee - Enthusiastic Tour 4               2 days overdue 🟠 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ACTIVE PIPELINES                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ B2B Clients │ │ Investors   │ │ Partnerships│ │ M44         │               │
│  │ 12 active   │ │ 5 active    │ │ 3 active    │ │ 8 active    │               │
│  │ 2 need attn │ │ 1 need attn │ │ 0 need attn │ │ 2 need attn │               │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Manager Dashboard

Oversight view for team leads and managers.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Team Overview                                    [Date Range: Last 30 Days ▼]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TEAM HEALTH                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Team Member    │ Overdue │ Due Today │ Completed (30d) │ Cadences Added   │  │
│  ├────────────────┼─────────┼───────────┼─────────────────┼──────────────────┤  │
│  │ Dan Corkill    │ 12 🔴   │ 8         │ 145             │ 23               │  │
│  │ Sarah Jones    │ 3 🟡    │ 12        │ 198             │ 31               │  │
│  │ Mike Chen      │ 0 🟢    │ 6         │ 167             │ 28               │  │
│  │ Lisa Park      │ 28 🔴   │ 15        │ 89              │ 12               │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  PIPELINE OVERVIEW                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ [Chart: Relationships by Stage across all pipeline types]                 │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  CADENCE PERFORMANCE                                                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Cadence Type         │ Applied │ Completed │ Conversion │ Avg Days to Win │  │
│  ├──────────────────────┼─────────┼───────────┼────────────┼─────────────────┤  │
│  │ New B2B Lead         │ 45      │ 12        │ 18%        │ 34              │  │
│  │ Investor Outreach    │ 23      │ 5         │ 22%        │ 45              │  │
│  │ Partnership Intro    │ 18      │ 8         │ 28%        │ 21              │  │
│  │ M44 Recruitment      │ 67      │ 23        │ 31%        │ 14              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ACTIVITY TRENDS                                                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ [Chart: Tasks completed, Cadences added, Calls made - over time]          │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ALERTS                                                                         │
│  ⚠️ Lisa Park has 28 overdue tasks - may need support                          │
│  ⚠️ 3 relationships stuck in "Proposal" stage for 30+ days                     │
│  ℹ️ New B2B Lead cadence has lowest conversion - review steps?                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.5 Pipeline Kanban View

Visual pipeline management per relationship type.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ B2B Clients Pipeline                      [+ Add] [Filter ▼] [View: Kanban | List] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ Lead (5)      Qualified (3)   Discovery (4)   Proposal (2)   Active (12)       │
│ ┌─────────┐   ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌─────────┐       │
│ │ Acme Co │   │ Beta Inc│     │ Gamma   │     │ Delta   │    │ Epsilon │       │
│ │ $50K    │   │ $120K   │     │ $80K    │     │ $200K   │    │ $150K   │       │
│ │ Forge   │   │ Anvil   │     │ Forge   │     │ Hearth  │    │ Forge   │       │
│ │ Dan     │   │ Sarah   │     │ Mike    │     │ Dan     │    │ Lisa    │       │
│ └─────────┘   └─────────┘     └─────────┘     └─────────┘    └─────────┘       │
│ ┌─────────┐   ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌─────────┐       │
│ │ Zeta LLC│   │ Eta Corp│     │ Theta   │     │ Iota    │    │ Kappa   │       │
│ │ $30K    │   │ $90K    │     │ $60K    │     │ $175K   │    │ $200K   │       │
│ │ ...     │   │ ...     │     │ ...     │     │ ...     │    │ ...     │       │
│ └─────────┘   └─────────┘     └─────────┘     └─────────┘    └─────────┘       │
│ ┌─────────┐                   ┌─────────┐                    ...               │
│ │ ...     │                   │ ...     │                                      │
│ └─────────┘                   └─────────┘                                      │
│                                                                                 │
│ [Drag cards to move between stages]                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Organization View

View for organization records showing all linked contacts and relationships.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Empirian                                                    [Actions ▼] │
│         Healthcare Technology                                                   │
├─────────────────┬───────────────────────────────────────┬───────────────────────┤
│                 │                                       │                       │
│  ORG INFO       │  ACTIVITY FEED                        │  RIGHT SIDEBAR        │
│                 │                                       │                       │
│  🌐 empirian.com│  [Create Note] [Log Call] [Log Email] │  💼 Relationships     │
│  📍 Address     │  ┌─────────────────────────────────┐  │    B2B Client (Active)│
│  🏭 Healthcare  │  │ Combined activity for this org  │  │    └ Forge, Anvil     │
│                 │  │ across all contacts             │  │    Partnership        │
│  ───────────    │  └─────────────────────────────────┘  │    └ (Negotiation)    │
│                 │                                       │                       │
│  👥 CONTACTS    │  [All] [Calls] [Emails] [Notes]...   │  🎯 Active Cadences   │
│                 │  ┌─────────────────────────────────┐  │    (across contacts)  │
│  M. Lauderdale  │  │ Activities from all linked      │  │    2 active           │
│  Exec Director  │  │ contacts aggregated here        │  │                       │
│  └ Executive ✓  │  │                                 │  │  🏷️ Tags              │
│    [Primary POC]│  └─────────────────────────────────┘  │    Enterprise, VIP    │
│                 │                                       │                       │
│  S. Sweeney     │                                       │  📁 Ventures          │
│  Marketing Dir  │                                       │    Forge, Anvil       │
│  └ Employee ✓   │                                       │                       │
│                 │                                       │  📋 Open Tasks        │
│  J. Roberts     │                                       │    5 across contacts  │
│  Former CTO     │                                       │                       │
│  └ Executive ✗  │                                       │                       │
│    (2022-2024)  │                                       │                       │
│                 │                                       │                       │
│  [+ Add Contact]│                                       │                       │
│                 │                                       │                       │
│  ───────────    │                                       │                       │
│                 │                                       │                       │
│  DETAILS        │                                       │                       │
│  Type: Company  │                                       │                       │
│  Created: Mar 23│                                       │                       │
│                 │                                       │                       │
└─────────────────┴───────────────────────────────────────┴───────────────────────┘
```

**Key Features:**
- All linked contacts shown with role, type, and current/former status
- Primary POC marked distinctly
- Former contacts shown grayed with date range
- Activity feed aggregates all contact activities for this org
- Business relationships shown in sidebar with venture tags
- Open tasks count across all linked contacts
- Click contact name to navigate to contact record

---

## 8. Requirements Verification Checklist

Comprehensive checklist confirming all discussed requirements are captured.

### Core Entities
- [x] Contacts with multiple emails, phones, addresses
- [x] Organizations with type, industry, multiple locations
- [x] Many-to-many Contact-Organization linking
- [x] Multiple roles per contact across different orgs
- [x] Role types (Executive, Founder, Board, Employee, etc.)
- [x] Current/Former role tracking with dates
- [x] Primary organization designation

### Interpersonal Relationships
- [x] Primary relationships (household/family groups)
- [x] Spouse/Partner exclusivity (only one allowed)
- [x] Children as contextual until promoted
- [x] Household View toggle for combined timeline
- [x] Secondary relationships (contextual/professional)
- [x] Mutual relationship creation (A→B creates B→A)
- [x] Predefined relationship types
- [x] Disassociation with audit trail
- [x] Clickable navigation between related contacts

### Business Relationships (Pipelines)
- [x] B2B Clients pipeline
- [x] B2C Clients pipeline
- [x] Non-Business Investment Opportunities pipeline
- [x] Business Investment Opportunities (External) pipeline
- [x] Internal Business Opportunities pipeline
- [x] Portfolio Companies pipeline (post-investment)
- [x] Partnership Opportunities pipeline
- [x] Individual Partnerships pipeline
- [x] Investor Pipeline
- [x] Meridian 44 Participants pipeline
- [x] Multiple relationship types per contact/org
- [x] Venture tagging on relationships
- [x] Pipeline-specific attributes (JSONB)

### Prospecting & Cadences
- [x] Admin-defined cadence templates
- [x] Cadence steps with day offsets (Day 0 = today)
- [x] Task types (Call, Email, Text, Meeting, Mailer, Other)
- [x] Apply same cadence multiple times to same contact
- [x] Multiple different cadences simultaneously
- [x] Tasks interleave chronologically
- [x] Pause/Resume cadences with timeline shift
- [x] Manual cadence clearing with reason
- [x] Task assignment to applying user
- [x] Admin task reassignment
- [x] Transparent team visibility (all see all)

### Task Management
- [x] Task statuses: Pending, Completed, Triaged, Dismissed
- [x] Notes required on completion
- [x] Triage as explicit state (not just a note)
- [x] Visibility toggles for Triaged/Dismissed
- [x] Overdue visual indicators (color-coded by severity)
- [x] Stale task badges (30+ days overdue)
- [x] Manual one-off tasks (not from cadences)
- [x] Tasks linked to Contact, Org, or Relationship

### Batch Task View
- [x] Filter by task type, cadence, assigned user
- [x] Date window options (All, 7 days, 30 days, custom)
- [x] Show/hide Overdue, Due Today, Upcoming
- [x] Show/hide Triaged, Dismissed
- [x] Individual task completion with notes
- [x] Bulk select multiple tasks
- [x] Bulk Complete with shared note
- [x] Bulk Triage with shared reason
- [x] Bulk Dismiss with confirmation
- [x] Click-through to contact record

### Activity Tracking
- [x] Log calls (inbound/outbound)
- [x] Log emails (inbound/outbound)
- [x] Log texts (inbound/outbound)
- [x] Log meetings (in-person/virtual)
- [x] Notes
- [x] System events (stage changes, cadence events)
- [x] Activities linked to contacts, orgs, relationships
- [x] Unified timeline on contact record
- [x] Filterable activity feed
- [x] Household view merges family timelines

### User Interface
- [x] Unified Contact View (Follow Up Boss inspired)
- [x] Multi-org display at a glance
- [x] Organization View with linked contacts
- [x] Batch Task View for efficient prospecting
- [x] Salesperson Home Dashboard
- [x] Manager Dashboard with team oversight
- [x] Pipeline Kanban View
- [x] Global search across all entities
- [x] Saved filter views
- [x] In-app notifications only (no email/push)

### User Roles
- [x] Admin (full access, cadence management)
- [x] Manager (view all, reassign, manager dashboard)
- [x] User (full CRM access, transparent team model)

### Phase 2 (Explicitly Deferred)
- [x] Protected client timelines
- [x] Commission calculation
- [x] Auto-clear cadence rules
- [x] Recruiting/Hiring module
- [x] Branch/Division ownership
- [x] Staleness auto-archiving
- [x] Email integration
- [x] Calendar integration
- [x] Automated workflows
- [x] Document storage (uploads)
- [x] Mobile app

---

## 9. Search & Filtering

### 9.1 Global Search

Accessible from anywhere in the app.

**Searches across:**
- Contact names, emails, phones
- Organization names
- Relationship notes
- Activity notes
- Tags

**Results grouped by type with quick navigation.**

### 9.2 List Filters

Available on all list/table views:

- **By Relationship Type**: B2B, B2C, Investor, etc.
- **By Stage**: Any pipeline stage
- **By Venture**: Forge, Hearth, Anvil, etc.
- **By Owner**: Assigned user
- **By Tags**: Any applied tags
- **By Date Range**: Created, updated, last activity
- **By Cadence Status**: Has active cadence, no cadence, specific cadence type

**Saved Views**: Users can save filter combinations for quick access.

---

## 10. User Roles & Permissions

### 10.1 Roles (Phase 1 - Simple)

| Role | Capabilities |
|------|--------------|
| **Admin** | Full access: manage users, create cadences, system settings |
| **Manager** | View all data, reassign tasks, access manager dashboard |
| **User** | Full CRM access, create/edit own data, transparent view of team data |

### 10.2 Data Visibility

**Transparent Team Model:**
- All users can see all contacts, organizations, relationships
- All users can see all tasks (for coverage when teammates are out)
- Activity history shows who did what for accountability

---

## 11. Phase 2 Roadmap

Features explicitly deferred to Phase 2:

| Feature | Description |
|---------|-------------|
| **Protected Client Timelines** | Track who "owns" a lead for commission purposes based on task completion |
| **Commission Calculation** | Calculate commissions based on protected client rules |
| **Auto-Clear Cadence Rules** | Configurable rules like "Applying 'New Client' auto-clears 'Lead Nurture'" |
| **Recruiting/Hiring Module** | Track job candidates and hiring pipeline |
| **Branch/Division Ownership** | Assign pipelines and relationships to specific branches |
| **Staleness Auto-Handling** | Auto-archive or flag tasks overdue beyond threshold |
| **Email Integration** | Send/receive email from within app |
| **Calendar Integration** | Sync with Google/Outlook calendars |
| **Automated Workflows** | Trigger actions based on events |
| **Document Storage** | Upload and attach files (vs. links only) |
| **Mobile App** | Native iOS/Android (responsive web only in Phase 1) |

---

## 12. Data Model Summary (Conceptual ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌──────────┐         ┌──────────────────┐         ┌──────────────┐            │
│  │ Contact  │────────▶│ Contact_Org_Link │◀────────│ Organization │            │
│  └────┬─────┘         └──────────────────┘         └──────┬───────┘            │
│       │                                                    │                    │
│       │  ┌─────────────────────────────────────────────────┘                    │
│       │  │                                                                      │
│       ▼  ▼                                                                      │
│  ┌────────────────┐                                                             │
│  │  Relationship  │◀──────────────────────────────────────────────┐             │
│  │                │                                               │             │
│  │  - type        │         ┌─────────────────┐                   │             │
│  │  - stage       │         │ Primary_Rel_Grp │                   │             │
│  │  - ventures[]  │         └────────┬────────┘                   │             │
│  │  - attributes  │                  │                            │             │
│  └───────┬────────┘                  ▼                            │             │
│          │                  ┌─────────────────┐                   │             │
│          │                  │ Primary_Rel_Mbr │                   │             │
│          │                  │                 │◀──────────────────┤             │
│          │                  │ - role          │     Contact       │             │
│          │                  └─────────────────┘                   │             │
│          │                                                        │             │
│          │                  ┌─────────────────┐                   │             │
│          │                  │  Secondary_Rel  │                   │             │
│          │                  │                 │◀──────────────────┤             │
│          │                  │ - rel_type      │     Contact       │             │
│          │                  └─────────────────┘                   │             │
│          │                                                                      │
│          ▼                                                                      │
│  ┌────────────────┐        ┌───────────────────┐                               │
│  │    Activity    │        │  Cadence_Template │                               │
│  │                │        └─────────┬─────────┘                               │
│  │  - type        │                  │                                          │
│  │  - notes       │                  ▼                                          │
│  │  - occurred_at │        ┌───────────────────┐                               │
│  └────────────────┘        │   Cadence_Step    │                               │
│          ▲                 └─────────┬─────────┘                               │
│          │                           │                                          │
│          │                           ▼                                          │
│          │                 ┌───────────────────┐       ┌───────────────┐        │
│          │                 │  Applied_Cadence  │──────▶│ Cadence_Task  │        │
│          │                 └───────────────────┘       └───────┬───────┘        │
│          │                                                     │                │
│          └─────────────────────────────────────────────────────┘                │
│                                                                                 │
│                            ┌───────────────────┐                               │
│                            │    Manual_Task    │                               │
│                            └───────────────────┘                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **User Adoption** | 100% of team active weekly | Login frequency |
| **Data Completeness** | 90%+ relationships have required fields | Field completion audit |
| **Pipeline Hygiene** | Stages updated within 48 hours | Stage timestamp analysis |
| **Task Completion Rate** | 80%+ tasks completed (not triaged) | Task status distribution |
| **Search Efficiency** | Find any record in <30 seconds | User testing |
| **Cadence Effectiveness** | Track conversion rates by cadence type | Cadence → Won correlation |

---

## 13. Appendix: Example Cadences

### New B2B Lead
| Step | Day | Type | Description |
|------|-----|------|-------------|
| 1 | 0 | Email | Welcome/intro email |
| 2 | 2 | Call | Discovery call attempt |
| 3 | 4 | Email | Value proposition follow-up |
| 4 | 7 | Call | Second call attempt |
| 5 | 10 | Email | Case study share |
| 6 | 14 | Call | Check-in |
| 7 | 21 | Email | "Checking in" touch |
| 8 | 30 | Call | Monthly follow-up |
| 9 | 60 | Email | Quarterly touch |
| 10 | 90 | Call | Quarterly call |

### Investor Outreach
| Step | Day | Type | Description |
|------|-----|------|-------------|
| 1 | 0 | Email | Intro with deck |
| 2 | 3 | Call | Follow-up call |
| 3 | 7 | Email | Additional materials |
| 4 | 14 | Call | Meeting request |
| 5 | 21 | Email | Update/momentum share |
| 6 | 30 | Call | Monthly touch |
| 7 | 60 | Email | Portfolio update |
| 8 | 90 | Call | Quarterly relationship maintenance |

### Meridian 44 Recruitment
| Step | Day | Type | Description |
|------|-----|------|-------------|
| 1 | 0 | Email | Introduction to M44 concept |
| 2 | 2 | Call | Exploratory call |
| 3 | 5 | Email | Detailed overview + FAQ |
| 4 | 7 | Meeting | Deep dive presentation |
| 5 | 10 | Email | Agreement + next steps |
| 6 | 14 | Call | Follow-up on agreement |
| 7 | 21 | Email | Gentle nudge |
| 8 | 30 | Call | Decision check-in |

---

*This is a living document. Version history tracked in repository.*

**Document Version History:**
- v1.0 (Dec 2024): Initial comprehensive PRD
