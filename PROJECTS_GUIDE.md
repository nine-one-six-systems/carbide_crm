# Projects Module Guide

## Overview

The Projects module provides executive oversight of initiatives across the NineOneSix ecosystem. It's designed for high-level initiative tracking—answering "What are we working on?" rather than detailed task management (which is handled by GitHub Projects).

## Key Concepts

### Projects
A project represents a high-level initiative or workstream. Each project has:
- **Scope**: Internal (NineOneSix-owned ventures) or External (client/portfolio work)
- **Category**: Product Development, Client Delivery, Strategic Initiative, Operations/Infrastructure, or Investment/Portfolio
- **Status**: Draft, Planning, Active, On Hold, Completed, or Cancelled
- **Health**: Not Started, On Track, At Risk, or Blocked
- **Ventures**: One or more NineOneSix ventures associated with the project
- **Owner**: The person responsible for the project

### Phases
Projects are broken down into phases (e.g., "Foundation", "Features", "Polish & Launch"). Each phase has:
- A name and description
- Start and target dates
- A status: Not Started, In Progress, or Completed
- An order (display sequence)

### Milestones
Phases contain milestones—specific deliverables or checkpoints. Milestones can be marked as complete, and progress is tracked automatically.

### Linked Entities
Projects can be linked to:
- **Contacts**: Stakeholders, team members, or client contacts
- **Organizations**: Client companies, partners, or vendors
- **Business Relationships**: Existing CRM relationships

## Navigation

Access Projects from the main navigation:
- **Sidebar**: Click "Projects" (FolderKanban icon)
- **Header Navigation**: Click "Projects" in the top nav bar
- **Direct URL**: Navigate to `/projects`

## Using Projects

### Viewing All Projects

The Projects list page shows:
- **Summary Cards**: Quick stats for Active projects, On Track, At Risk, and Blocked
- **Project Cards**: Each card displays:
  - Health indicator (🟢 On Track, 🟡 At Risk, 🔴 Blocked, ⚪ Not Started)
  - Project name and status
  - Scope and category badges
  - Associated ventures
  - Owner name
  - Target date
  - Milestone progress bar
  - Link to GitHub Projects (if configured)

### Filtering Projects

Use the filter bar to narrow down projects by:
- **Scope**: Internal or External
- **Category**: Product Development, Client Delivery, etc.
- **Status**: Draft, Planning, Active, etc.
- **Health**: On Track, At Risk, Blocked
- **Venture**: Filter by specific venture
- **Owner**: Filter by project owner

Filters persist in the URL, so you can bookmark filtered views or share links.

### Creating a New Project

1. Click the **"New Project"** button on the Projects page
2. Fill in the required fields:
   - **Project Name**: A clear, descriptive name
   - **Scope**: Internal or External
   - **Category**: Select the appropriate category
   - **Ventures**: Select one or more ventures (required)
   - **Owner**: Select the project owner (required)
3. Optionally add:
   - Description
   - Start Date and Target Date
   - GitHub Project URL
4. Click **"Create Project"**

The project will be created with status "Draft" and health "Not Started".

### Viewing Project Details

Click any project card to view its detail page. The detail page shows:

#### Header Section
- Project name with health indicator
- Status and Health dropdowns (editable)
- Owner information
- Start and target dates
- Scope, category, and venture badges
- GitHub link (if configured)
- Edit button

#### Description
Full project description (if provided)

#### Phases & Milestones
- Expandable list of all phases
- Each phase shows:
  - Status badge
  - Start and target dates
  - Milestone completion count
  - List of milestones with checkboxes
- Click a milestone checkbox to mark it complete
- Use **"Add Phase"** to create new phases
- Use **"Add Milestone"** within a phase to add milestones

#### Linked Entities
- **Organizations**: Linked client companies or partners
- **Contacts**: Linked stakeholders or team members
- **Business Relationships**: Linked CRM relationships
- Use the **"Link"** buttons to add new links

#### Activity Feed
Chronological log of all project activities:
- Project created
- Status changes
- Health changes
- Phase status changes
- Milestone completions
- Entity linking/unlinking

### Editing a Project

1. Click **"Edit"** in the project header
2. Modify any fields in the form
3. Click **"Update Project"**

Changes are saved immediately and logged in the activity feed.

### Managing Phases

#### Adding a Phase
1. On the project detail page, click **"Add Phase"**
2. Enter:
   - Phase name (required)
   - Description (optional)
   - Start Date and Target Date (optional)
   - Status (defaults to "Not Started")
3. Click **"Create Phase"**

Phases are automatically ordered sequentially.

#### Editing a Phase
1. Expand the phase you want to edit
2. Click **"Edit"** (if available) or use the phase form
3. Update fields and save

#### Changing Phase Status
- Use the status dropdown in the phase header
- Status changes are logged in the activity feed

### Managing Milestones

#### Adding a Milestone
1. Expand the phase where you want to add a milestone
2. Click **"Add Milestone"**
3. Enter:
   - Milestone name (required)
   - Description (optional)
   - Target Date (optional)
4. Click **"Create Milestone"**

#### Completing a Milestone
- Click the checkbox next to the milestone name
- The milestone is marked complete with timestamp
- Activity is logged automatically

#### Editing a Milestone
- Use the milestone form to update name, description, or target date
- Toggle completion status as needed

### Linking Entities

#### Linking a Contact
1. In the Linked Entities section, click **"Link Contact"**
2. Search for and select a contact
3. Optionally specify a role (e.g., "Stakeholder", "Technical Lead")
4. Click **"Link"**

#### Linking an Organization
1. Click **"Link Org"**
2. Search for and select an organization
3. Optionally specify a role (e.g., "Client", "Partner")
4. Click **"Link"**

#### Linking a Business Relationship
1. Click **"Link Relationship"**
2. Select from available business relationships
3. The relationship is linked immediately

#### Unlinking Entities
- Click the **X** button next to any linked entity to remove the link

### Updating Project Status

Projects follow this lifecycle:

```
Draft → Planning → Active → Completed
              ↓
          On Hold
              ↓
          Cancelled
```

1. Use the **Status** dropdown in the project header
2. Select the new status
3. Changes are saved automatically and logged

### Updating Project Health

Health indicators help identify projects needing attention:
- **🟢 On Track**: Progressing as expected
- **🟡 At Risk**: Potential issues, needs attention
- **🔴 Blocked**: Cannot progress, intervention needed
- **⚪ Not Started**: No health assessment yet (typically Draft status)

1. Use the **Health** dropdown in the project header
2. Select the appropriate health status
3. Changes are saved automatically and logged

## Integration with GitHub Projects

Projects can link to GitHub Projects boards for detailed task tracking:

1. When creating or editing a project, add the GitHub Project URL
2. The URL appears as a clickable link in the project header
3. Clicking opens the GitHub Projects board in a new tab

**Note**: This is a simple link—there's no API integration. Use GitHub Projects for detailed task management, and Carbide Projects for executive oversight.

## Integration with CRM

### Linking to Contacts
- Link project stakeholders, team members, or client contacts
- View linked contacts from the project detail page
- Navigate to contact detail pages via links

### Linking to Organizations
- Link client companies, partners, or vendors
- Useful for tracking which organizations are involved in projects
- Navigate to organization detail pages via links

### Linking to Business Relationships
- Link existing CRM relationships (B2B clients, investments, etc.)
- Provides context about the business relationship driving the project

## Activity Logging

All significant project changes are automatically logged:
- Project created
- Status changes (with old → new values)
- Health changes (with old → new values)
- Phase status changes
- Milestone completed/uncompleted
- Entity linked/unlinked
- Project updates

The activity feed shows:
- Who made the change
- What changed
- When it changed
- Additional metadata (old/new values, milestone IDs, etc.)

## Best Practices

### Project Naming
- Use clear, descriptive names
- Include key identifiers (e.g., "Carbide CRM v2 Launch")
- Avoid abbreviations unless widely understood

### Health Management
- Update health status regularly (at least weekly)
- Use "At Risk" proactively—don't wait until blocked
- Review "At Risk" and "Blocked" projects frequently

### Milestone Tracking
- Keep milestones focused and achievable
- Use descriptive milestone names
- Set realistic target dates
- Mark milestones complete promptly

### Phase Organization
- Organize phases logically (e.g., Foundation → Features → Polish)
- Keep phases at a high level (not too granular)
- Use phases to represent major project stages

### Entity Linking
- Link all relevant stakeholders as contacts
- Link client organizations for external projects
- Link business relationships for context

## Quick Reference

### Keyboard Shortcuts
- None currently—all interactions are mouse/touch-based

### Status Transitions
- **Draft** → **Planning**: Project is being scoped
- **Planning** → **Active**: Work has begun
- **Active** → **On Hold**: Paused temporarily
- **Active** → **Completed**: Successfully finished
- **Any** → **Cancelled**: Abandoned

### Health Indicators
- **On Track**: Green (🟢) - Everything going well
- **At Risk**: Yellow (🟡) - Needs attention
- **Blocked**: Red (🔴) - Cannot proceed
- **Not Started**: Gray (⚪) - No assessment yet

## Troubleshooting

### Can't see Projects in navigation?
- Ensure you're logged in as an authenticated user
- Projects are visible to all authenticated users

### Can't create a project?
- Ensure you've selected at least one venture
- Ensure you've selected an owner
- Check that all required fields are filled

### Milestones not updating?
- Refresh the page
- Check that you have permission to edit the project
- Verify the milestone wasn't deleted

### Activity feed not showing?
- Activities are created automatically when changes occur
- If activities aren't appearing, check browser console for errors
- Ensure you're viewing the correct project

## Technical Details

### Database Schema
- Projects are stored in the `projects` table
- Phases in `project_phases` table
- Milestones in `project_milestones` table
- Linkage tables: `project_contacts`, `project_organizations`, `project_relationships`
- Activity log: `project_activities` table

### Permissions
- All authenticated users have full access (create, read, update, delete)
- Row Level Security (RLS) is enabled but allows all authenticated users

### Performance
- Projects list uses pagination (20 per page by default)
- Milestone counts are calculated efficiently using database functions
- Filters are optimized with database indexes

## Support

For questions or issues:
1. Check this guide first
2. Review the activity feed for recent changes
3. Contact your system administrator

---

**Last Updated**: December 2024  
**Module Version**: 1.0

