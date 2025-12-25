---
name: FollowUpBoss-Inspired UI/UX Improvements
overview: Transform Carbide CRM's UI/UX by adopting proven patterns from FollowUpBoss, focusing on activity-centric design, improved contact detail layout, enhanced list views, and better information hierarchy.
todos:
  - id: contact-detail-layout
    content: Implement three-column layout for contact detail page (left sidebar, center activity feed, right sidebar)
    status: completed
  - id: activity-feed-tabs
    content: Add tabbed activity feed with filters (All, Notes, Files, Starred)
    status: completed
    dependencies:
      - contact-detail-layout
  - id: quick-actions
    content: "Note: Call/Text/Email action buttons removed - integrations not yet built"
    status: cancelled
    dependencies:
      - contact-detail-layout
  - id: smart-lists-sidebar
    content: Implement Smart Lists sidebar for People list view with saved filters
    status: completed
  - id: contact-table-view
    content: Convert contact list from cards to table view with customizable columns
    status: completed
    dependencies:
      - smart-lists-sidebar
  - id: dashboard-widgets
    content: Reorganize dashboard into widget-based layout with time period and user filters
    status: completed
  - id: recent-activity-table
    content: Add Recent Activity table to dashboard showing last 10-20 activities
    status: completed
    dependencies:
      - dashboard-widgets
  - id: keyboard-shortcuts
    content: Add keyboard navigation (arrow keys) and shortcuts for common actions
    status: completed
    dependencies:
      - contact-detail-layout
  - id: visual-polish
    content: Improve visual hierarchy, spacing, colors, and transitions throughout the app
    status: completed
  - id: documentation
    content: Create comprehensive markdown document analyzing FollowUpBoss patterns and implementation
    status: completed
---

# FollowUpBoss-Inspired UI/UX Improvements Plan

## Overview

This plan implements key UI/UX patterns observed in FollowUpBoss to enhance Carbide CRM's user experience. The focus areas include: activity-centric contact detail pages, improved list views with smart filters, enhanced dashboard widgets, and better information hierarchy.

## Key Patterns Identified from FollowUpBoss

### 1. Contact Detail Page - Three-Column Layout

- **Left Sidebar**: Contact info, relationships, details, tags
- **Center Column**: Activity feed with prominent note creation, tabbed activity views
- **Right Sidebar**: Tasks, appointments, deals, files, collaborators, action plans
- **Note Creation**: Prominent note creation bar at top of activity feed
- **Activity Tabs**: Filter by All, Notes, Files, Starred (Call/Text/Email filters removed - integrations not yet built)

### 2. People List View

- **Smart Lists Sidebar**: Pre-configured filtered views (Today's Leads, Clients, etc.)
- **Table Layout**: Rich rows with avatars, contact info, last activity details
- **Customizable Columns**: User can show/hide columns
- **Bulk Actions**: Row selection with bulk operations
- **Activity Preview**: Show last activity type and details in list

### 3. Dashboard

- **Widget-Based**: Multiple metric widgets with charts
- **Recent Activity Table**: Quick view of recent interactions
- **Time Period Filters**: "Last 30 days", "Everyone" dropdowns
- **Actionable Metrics**: Click-through to detailed views

### 4. General Patterns

- **Activity-Centric**: Everything revolves around activity feed
- **Keyboard Shortcuts**: Navigation hints (e.g., "Press → to view next")
- **Persistent Navigation**: Top bar with search always visible
- **Contextual Actions**: Actions appear where they're needed
- **Progressive Disclosure**: Collapsible sections for related data

## Implementation Plan

### Phase 1: Contact Detail Page Redesign

#### 1.1 Three-Column Layout Structure with Sticky Header

**New Files:**

- `src/features/contacts/components/ContactHeader.tsx` - Sticky header component
- `src/features/contacts/components/ContactInfoSidebar.tsx` - Left sidebar component
- `src/features/contacts/components/ContactRightSidebar.tsx` - Right sidebar component

**Files to Modify:**

- [`src/features/contacts/components/ContactDetail.tsx`](src/features/contacts/components/ContactDetail.tsx) - Refactor to use new layout
- [`src/components/layout/PageContainer.tsx`](src/components/layout/PageContainer.tsx) - Add full-width variant for contact detail

**Layout Structure (based on provided implementation):**

```javascript
<div className="h-screen flex flex-col bg-gray-50">
  {/* Sticky Header */}
  <ContactHeader /> {/* Sticky top-0 z-10, border-b bg-white */}
  
  {/* Three Column Layout */}
  <div className="flex-1 flex overflow-hidden">
    {/* Left Sidebar - Fixed width 288px (w-72) */}
    <aside className="w-72 border-r bg-white flex-shrink-0">
      <ContactInfoSidebar />
    </aside>
    
    {/* Center - Flexible width */}
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <ActivityFeed />
    </main>
    
    {/* Right Sidebar - Fixed width 320px (w-80) */}
    <aside className="w-80 border-l bg-white flex-shrink-0">
      <ContactRightSidebar />
    </aside>
  </div>
</div>
```

**ContactHeader Component:**

- Avatar with ring decoration (ring-2 ring-offset-2 ring-emerald-500/20)
- Contact name with star/favorite button
- "Last Communication" timestamp with clock icon
- "Person X of Y" navigation indicator
- Actions dropdown menu (Edit, Add to Household, Apply Cadence, Delete)

**Changes:**

- Convert current grid layout to three-column structure with full-height layout
- Left sidebar: Fixed width 288px (w-72), scrollable, white background
- Center: Flexible width, gray-50 background for activity feed
- Right sidebar: Fixed width 320px (w-80), scrollable, white background
- Sticky header at top with contact info and actions
- Make layout responsive (stack on mobile, two-column on tablet)

#### 1.2 Enhanced Activity Feed

**New Files:**

- `src/features/activities/components/ActivityFeedTabs.tsx` - Tabbed activity view
- `src/features/activities/components/ActivityFeedHeader.tsx` - Note creation bar with quick actions

**Files to Modify:**

- [`src/features/activities/components/ActivityFeed.tsx`](src/features/activities/components/ActivityFeed.tsx) - Refactor to match new structure

**Activity Feed Structure (based on provided implementation):**

```javascript
<div className="flex flex-col h-full">
  {/* Note Creation Bar */}
  <div className="p-4 border-b bg-white">
    {/* Note Input Area */}
    <div className="relative">
      <Textarea
        placeholder="Add notes or type @name to notify"
        className="min-h-[80px] resize-none pr-24"
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <AtSign /> {/* Mention team member */}
        </Button>
        <Button size="sm" className="bg-emerald-500">
          Create Note
        </Button>
      </div>
    </div>
  </div>
  
  {/* Activity Filters */}
  <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
    <div className="flex items-center gap-1">
      {/* Filter pills with counts */}
    </div>
    <Button variant="ghost" size="sm">
      <Filter /> Filters
    </Button>
  </div>
  
  {/* Activity Timeline */}
  <ScrollArea className="flex-1">
    {/* Timeline with icons, avatars, relative time */}
  </ScrollArea>
</div>
```

**Changes:**

- Add prominent note creation bar at top with large textarea
- Large textarea with "Add notes or type @name to notify" placeholder
- @mention button and Create Note button positioned absolutely in bottom-right of textarea
- Implement pill-style filter buttons: All, Notes (with icons and counts)
- Note: Call, Text, and Email action buttons and filters removed as integrations are not yet built
- Activity timeline with colored icon circles, avatars, relative timestamps
- Timeline connector lines between activities
- Hover states showing more actions (edit, delete)
- Activity type-specific styling (colors and icons for notes and other activity types)

#### 1.3 Contact Info Sidebar (Left)

**New Files:**

- `src/features/contacts/components/ContactInfoSidebar.tsx` - Complete left sidebar implementation

**Component Structure:**

- **Primary Contact Methods** (always visible):
- Phone numbers with labels (primary highlighted in emerald-600)
- Email addresses (primary highlighted)
- Address (if available)
- "Add phone/email/address" buttons
- **Collapsible Sections** (using Collapsible component):
- **Relationships**: Shows primary and secondary relationships with avatars, badges, "Add relationship" button
- **Organizations**: Shows organizations with role titles, primary/current indicators, "Add to organization" button
- **Details**: Stage, Source, Created date, Tags (with emerald-50 background, hover to remove)
- **Background**: Description text (collapsed by default)
- **Social Profile**: LinkedIn, Twitter links, "Search [name]" button (collapsed by default)
- **Delete Contact**: Red text button at bottom

**Styling Details:**

- Separators between sections (Separator component)
- Hover states on all interactive elements
- Emerald-600 accent color for primary items and actions
- ScrollArea wrapper for scrollable content
- Consistent spacing with p-4 padding

#### 1.4 Right Sidebar Sections

**New Files:**

- `src/features/contacts/components/ContactRightSidebar.tsx` - Complete right sidebar implementation

**Component Structure:**

- **Tasks Card**: 
- Header with count badge and overdue indicator
- Task items with checkboxes, icons, due dates (color-coded: red for overdue, amber for today, blue for tomorrow)
- "View all X tasks" link if more than 5
- **Appointments Card**:
- Header with count badge
- "No upcoming appointments, view past" message
- **Deals Card**:
- Header with count badge
- Deal items showing name, value, status badge, venture tags
- **Action Plans Card** (Cadences):
- Header with count badge
- Active/paused indicators with play/pause icons
- Step progress (current/total)
- **Activity Card**:
- "Seen X hours ago" timestamp
- Marketing Source badge
- "At A Glance" metrics with icons (Eye, etc.) and tooltips
- Note: Call/Text metrics removed as integrations not yet built
- **Recent Activity Card**:
- Website activity items (Globe icon, clickable links)
- "SEE ALL" link
- **Keyboard Navigation Hint**:
- "Press ← to view next lead or → to view previous lead" with styled kbd elements

**Styling Details:**

- All sections in Card components with CardHeader and CardContent
- Consistent spacing (space-y-4)
- Emerald-600 accent for add buttons and links
- ScrollArea wrapper
- Tooltips for activity metrics

#### 1.5 Integration and Data Flow

**Files to Modify:**

- [`src/features/contacts/components/ContactDetail.tsx`](src/features/contacts/components/ContactDetail.tsx)
- [`src/features/contacts/hooks/useContact.ts`](src/features/contacts/hooks/useContact.ts) - Ensure data structure matches
- [`src/features/activities/hooks/useContactActivities.ts`](src/features/activities/hooks/useContactActivities.ts)

**Data Requirements:**

- Contact data with phone/email arrays (primary flags)
- Relationships (primary/secondary)
- Organizations with role information
- Tasks with due dates and status
- Activities with type, subject, notes, occurred_at, logged_by
- Deals/Business Relationships
- Cadences/Action Plans

**Integration Points:**

- Connect ContactHeader to contact data
- Connect ContactInfoSidebar to contact, relationships, organizations
- Connect ActivityFeed to activities with filtering
- Connect ContactRightSidebar to tasks, deals, cadences, activity metrics
- Implement keyboard navigation (← → keys) between contacts
- Add loading states and error handling

### Phase 2: People List View Enhancement

#### 2.1 Smart Lists Sidebar

**New Files:**

- `src/features/contacts/components/SmartListsSidebar.tsx`
- `src/features/contacts/hooks/useSmartLists.ts`
- `src/features/contacts/types/smartLists.ts`

**Files to Modify:**

- [`src/pages/Contacts.tsx`](src/pages/Contacts.tsx)
- [`src/components/layout/Sidebar.tsx`](src/components/layout/Sidebar.tsx) - Consider context-aware sidebar

**Changes:**

- Add left sidebar with Smart Lists (Today's Leads, Clients, Stale Leads, etc.)
- Implement saved filter system (already have `SavedFiltersDropdown.tsx`, extend it)
- Show counts next to each list
- Allow users to create custom smart lists
- Make lists clickable to filter the main view

#### 2.2 Enhanced Table View

**New Files:**

- `src/features/contacts/components/ContactTable.tsx` - Replace card grid with table
- `src/features/contacts/components/ContactTableRow.tsx`
- `src/features/contacts/components/ColumnSelector.tsx`

**Files to Modify:**

- [`src/features/contacts/components/ContactList.tsx`](src/features/contacts/components/ContactList.tsx)
- [`src/components/data-display/DataTable.tsx`](src/components/data-display/DataTable.tsx) - Enhance with column customization

**Changes:**

- Convert card grid to table view (with option to toggle)
- Add columns: Name (with avatar), Phone, Email, Last Activity, Stage, Agent, Created
- Show activity preview in Last Activity column (e.g., "Last activity 2 hours ago")
- Add column customization dropdown
- Implement row selection for bulk actions
- Add bulk action toolbar (Assign, Tag, etc.) - Note: Email/Call actions removed as integrations not yet built

#### 2.3 List View Controls

**Files to Modify:**

- [`src/pages/Contacts.tsx`](src/pages/Contacts.tsx)

**Changes:**

- Add "Columns" dropdown for customization
- Add "Filters" button (enhance existing filter system)
- Add "Everyone" / user filter dropdown
- Add view toggle (Table/Cards)
- Improve filter UI visibility

### Phase 3: Dashboard Improvements

#### 3.1 Widget-Based Layout

**Files to Modify:**

- [`src/features/dashboard/components/SalespersonDashboard.tsx`](src/features/dashboard/components/SalespersonDashboard.tsx)
- [`src/features/dashboard/components/ManagerDashboard.tsx`](src/features/dashboard/components/ManagerDashboard.tsx)

**Changes:**

- Reorganize dashboard into widget cards
- Add time period filter dropdown ("Last 7 days", "Last 30 days", etc.)
- Add user filter dropdown ("Me", "Everyone", "Team")
- Make widgets collapsible/resizable
- Add more metric widgets (similar to FollowUpBoss: New Leads, Avg Contact Attempts, Speed to Action, etc.)

#### 3.2 Recent Activity Table

**New Files:**

- `src/features/dashboard/components/RecentActivityTable.tsx`

**Changes:**

- Add prominent "Recent Activity" section to dashboard
- Show columns: Name, Email, Phone, Last Activity, Time, Stage, Assigned
- Make rows clickable to navigate to contact
- Add "Filter Activity" button
- Limit to last 10-20 activities with "View all" link

### Phase 4: General UX Enhancements

#### 4.1 Keyboard Shortcuts

**New Files:**

- `src/hooks/useContactNavigation.ts` - Navigate between contacts with arrow keys
- `src/components/contacts/KeyboardShortcuts.tsx` - Show hints

**Files to Modify:**

- [`src/features/contacts/components/ContactDetail.tsx`](src/features/contacts/components/ContactDetail.tsx)
- [`src/hooks/useKeyboardShortcut.ts`](src/hooks/useKeyboardShortcut.ts)

**Changes:**

- Add keyboard navigation: Arrow keys to navigate between contacts
- Show hint text: "Press → to view next contact"
- Add keyboard shortcuts for common actions (N for new note, etc.) - Note: Email shortcuts removed as integration not yet built

#### 4.2 Enhanced Search

**Files to Modify:**

- [`src/components/search/GlobalSearch.tsx`](src/components/search/GlobalSearch.tsx)
- [`src/components/layout/Header.tsx`](src/components/layout/Header.tsx)

**Changes:**

- Make search more prominent in header
- Add search result previews with contact info
- Show recent searches
- Add search filters (People, Organizations, Tasks, etc.)

#### 4.3 Activity-Centric Improvements

**Files to Modify:**

- [`src/features/activities/components/ActivityFeed.tsx`](src/features/activities/components/ActivityFeed.tsx)

**Changes:**

- Improve activity item rendering with better icons
- Add activity type badges
- Show relative time more prominently
- Add inline actions (Star, Delete, Edit)
- Improve note rendering with preview
- Note: Email/Text/Call activity types will be supported when integrations are added

#### 4.4 Visual Polish

**Files to Modify:**

- [`src/index.css`](src/index.css)
- Component styling files

**Changes:**

- Improve spacing and visual hierarchy
- Add subtle shadows and borders for depth
- Improve color contrast
- Add hover states for interactive elements
- Improve loading states and skeletons
- Add smooth transitions

### Phase 5: Documentation

#### 5.1 Markdown Overview Document

**New Files:**

- `markdown_prompts/followupboss-ui-ux-analysis.md`

**Content:**

- Detailed analysis of FollowUpBoss UI/UX patterns
- Before/after comparisons
- Implementation notes
- Design decisions and rationale
- Future improvements

## Implementation Order

1. **Phase 1.1** - Three-column layout structure with ContactHeader (foundation)
2. **Phase 1.3** - ContactInfoSidebar (left sidebar) with collapsible sections
3. **Phase 1.2** - Enhanced ActivityFeed with quick actions and filters
4. **Phase 1.4** - ContactRightSidebar (right sidebar) with all sections
5. **Phase 1.5** - Integration, data flow, and keyboard navigation
6. **Phase 2.1 & 2.2** - Smart lists and table view (list improvements)
7. **Phase 3** - Dashboard widgets (dashboard improvements)
8. **Phase 4** - General UX enhancements (polish)
9. **Phase 5** - Documentation (knowledge capture)

## Reference Implementation

The plan incorporates the detailed layout structure from `/Users/samueledwards/Downloads/files (27)/ContactDetailPage.tsx`, which provides:

- Complete component structure and styling
- Specific Tailwind classes and design tokens
- Collapsible section patterns
- Activity feed timeline implementation
- Right sidebar card layouts
- Keyboard navigation hints

This reference implementation should be used as the foundation for the actual implementation, adapted to work with Carbide CRM's existing data structures and hooks.

## Technical Considerations

- **Responsive Design**: Ensure three-column layout works on mobile/tablet
- **Performance**: Virtualize long lists, optimize activity feed rendering
- **Accessibility**: Maintain WCAG compliance, add ARIA labels
- **State Management**: Consider if additional state management needed for filters/views