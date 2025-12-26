# Carbide CRM - GitHub Issues

Generated from Codebase Review (December 26, 2025)

---

## 📋 Issue Summary

| Priority | Count | Total Hours |
|----------|-------|-------------|
| 🔴 Critical | 5 | 142-182h |
| 🟠 High | 7 | 73-93h |
| **Total** | **12** | **215-275h** |

---

# 🔴 CRITICAL ISSUES

---

## Epic: Leadership Dashboard

### Issue #1: Implement Leadership Dashboard

**Labels:** `epic` `feature` `priority: critical` `frontend` `backend`

**Description:**
Implement the Leadership Dashboard as specified in `carbide-leadership-dashboard-addendum.md`. This is a major new feature providing executive oversight across all pipelines and ventures with dual view modes (Pipeline/Venture), KPI summary cards, activity metrics, and attention lists.

**User Story:**
As an executive, I want a single dashboard view to see what's happening across our businesses so that I can identify stuck opportunities, track activity, and prioritize leadership support.

**Acceptance Criteria:**
- [ ] Database migrations created with all 7 RPC functions:
  - `get_terminal_stages()`
  - `get_leadership_summary()`
  - `get_activity_volume()`
  - `get_pipeline_summaries()`
  - `get_venture_summaries()`
  - `get_dashboard_activity()`
  - `get_cold_opportunities()`
- [ ] Dashboard loads in < 2 seconds
- [ ] Dual view toggle (Pipeline/Venture) works correctly
- [ ] Summary KPIs display: Active, Advanced, Stuck (14d+), Cold (7d+)
- [ ] Activity volume card shows calls, emails, meetings
- [ ] Pipeline sections are collapsible with stage distribution bars
- [ ] Venture sections show cross-pipeline aggregation
- [ ] Attention lists highlight stuck/cold opportunities
- [ ] Recent activity feed displays cross-pipeline activities
- [ ] Filters persist to URL and localStorage
- [ ] Data refreshes every 5 minutes automatically
- [ ] Accessible via keyboard and screen reader
- [ ] Only visible to managers and admins
- [ ] Unit tests for hooks and service (80%+ coverage)
- [ ] E2E tests for critical flows

**Technical Notes:**
- Reference: `carbide-leadership-dashboard-addendum.md`
- See implementation plan: `leadership-dashboard-implementation-plan.md`
- Consider materialized view for performance optimization

**Estimated Hours:** 80-100h

**Sub-tasks:**
- [ ] #1a: Database migrations and RPC functions (4h)
- [ ] #1b: TypeScript types and service layer (3.5h)
- [ ] #1c: Filter and data fetching hooks (3.5h)
- [ ] #1d: Core UI components (toggle, cards, filters) (6h)
- [ ] #1e: Pipeline section components (2.5h)
- [ ] #1f: Venture section and list components (2.5h)
- [ ] #1g: Activity feed and cold opportunities (2h)
- [ ] #1h: Routing and navigation integration (1.5h)
- [ ] #1i: Unit and E2E tests (4h)

---

## Epic: Error Handling & Resilience

### Issue #2: Implement Error Boundaries Across All Routes

**Labels:** `bug` `priority: critical` `frontend` `reliability`

**Description:**
Verify and implement React Error Boundaries around all route-level components and major feature sections. Currently, it's unclear if error boundaries exist, which means unhandled errors could crash the entire application.

**User Story:**
As a user, I want the application to gracefully handle errors so that a problem in one section doesn't crash the entire app.

**Acceptance Criteria:**
- [ ] `ErrorBoundary` component exists in `src/components/error/ErrorBoundary.tsx`
- [ ] Error boundary wraps each route in `router.tsx`
- [ ] Error boundary wraps major dashboard sections
- [ ] Error state UI includes:
  - Friendly error message
  - "Try Again" button that resets the error
  - "Go Back" navigation option
  - Option to report the error
- [ ] Errors are logged to console with full stack trace
- [ ] Error boundary catches both sync and async errors
- [ ] Fallback UI matches application design system
- [ ] Unit tests verify error boundary behavior

**Technical Notes:**
```tsx
// Required implementation pattern
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    // TODO: Send to error tracking service
  }
}
```

**Estimated Hours:** 8-12h

**Sub-tasks:**
- [ ] Audit existing error boundary implementation
- [ ] Create/update ErrorBoundary component with proper UI
- [ ] Wrap all routes in router.tsx
- [ ] Add error boundaries to dashboard sections
- [ ] Create error fallback UI components
- [ ] Write unit tests

---

### Issue #3: Implement Centralized Error Logging Service

**Labels:** `enhancement` `priority: critical` `infrastructure` `observability`

**Description:**
Implement centralized error logging and tracking. Currently, errors are not consistently logged or tracked, making debugging production issues difficult.

**User Story:**
As a developer, I want all application errors logged to a central service so that I can monitor, debug, and fix issues quickly.

**Acceptance Criteria:**
- [ ] Error logging service created at `src/lib/errorLogger.ts`
- [ ] All API errors from Supabase are logged with context
- [ ] React error boundaries log to the service
- [ ] Unhandled promise rejections are captured
- [ ] Error logs include:
  - Error message and stack trace
  - User ID (if authenticated)
  - Current route/page
  - Timestamp
  - Browser/device info
- [ ] React Query `onError` callback configured globally
- [ ] Service methods transform Supabase errors to user-friendly messages
- [ ] Console logging in development, external service in production
- [ ] Integration with error tracking service (Sentry recommended)

**Technical Notes:**
```typescript
// src/lib/errorLogger.ts
export const errorLogger = {
  log(error: Error, context?: Record<string, unknown>) {
    console.error('[Carbide Error]', error, context);
    // Production: send to Sentry/LogRocket
  },
  
  captureException(error: Error) {
    // Sentry.captureException(error);
  }
};

// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => errorLogger.log(error),
    },
    mutations: {
      onError: (error) => errorLogger.log(error),
    },
  },
});
```

**Estimated Hours:** 6-8h

---

## Epic: Accessibility (WCAG 2.2 AA)

### Issue #4: Accessibility Audit and Remediation

**Labels:** `accessibility` `priority: critical` `frontend` `compliance`

**Description:**
Conduct comprehensive accessibility audit and fix all WCAG 2.2 AA violations. The application must be fully accessible via keyboard and screen reader.

**User Story:**
As a user with disabilities, I want to use the CRM with assistive technologies so that I can perform my job effectively.

**Acceptance Criteria:**

**Focus Management:**
- [ ] All interactive elements have visible focus indicators
- [ ] Never use `outline: none` without visible replacement
- [ ] `:focus-visible` styles implemented consistently
- [ ] Focus trapped in modals/dialogs
- [ ] Focus returns to trigger element when modal closes

**Keyboard Navigation:**
- [ ] All functionality accessible via keyboard
- [ ] Tab order follows logical visual order
- [ ] No keyboard traps
- [ ] Escape closes modals/popovers
- [ ] Arrow keys work for composite widgets (tabs, menus)

**Screen Reader Support:**
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Buttons and links have clear accessible names
- [ ] ARIA live regions for dynamic content (toasts, search results)
- [ ] Status messages announced without focus change

**Visual:**
- [ ] Color contrast meets 4.5:1 for normal text
- [ ] Color contrast meets 3:1 for large text and UI components
- [ ] Information not conveyed by color alone
- [ ] Content visible at 200% zoom
- [ ] Content reflows at 400% zoom (320px)

**Structure:**
- [ ] Skip link to main content
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmarks used correctly (main, nav, aside)
- [ ] Page titles are descriptive and unique

**Testing:**
- [ ] Automated tests with jest-axe
- [ ] Manual testing with NVDA or VoiceOver
- [ ] Keyboard-only navigation testing
- [ ] Color contrast verification

**Technical Notes:**
```tsx
// Add to test setup
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Required CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
}
.skip-link:focus {
  top: 0;
}
```

**Estimated Hours:** 24-32h

**Sub-tasks:**
- [ ] #4a: Audit all components with axe-core (4h)
- [ ] #4b: Fix focus indicator styles (4h)
- [ ] #4c: Add skip links and landmarks (2h)
- [ ] #4d: Implement ARIA live regions (4h)
- [ ] #4e: Fix form label associations (3h)
- [ ] #4f: Add keyboard navigation to complex widgets (4h)
- [ ] #4g: Color contrast fixes (2h)
- [ ] #4h: Screen reader testing and fixes (4h)
- [ ] #4i: Add jest-axe tests (3h)

---

## Epic: Testing

### Issue #5: E2E Test Coverage for Critical User Flows

**Labels:** `testing` `priority: critical` `quality`

**Description:**
Implement comprehensive Playwright E2E tests for all critical user flows. Currently, test infrastructure exists but coverage for critical paths is incomplete.

**User Story:**
As a developer, I want automated E2E tests for critical flows so that I can confidently deploy changes without breaking core functionality.

**Acceptance Criteria:**

**Authentication Flows:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Session expiry handling

**Contact CRUD:**
- [ ] Create new contact with required fields
- [ ] View contact detail page
- [ ] Edit contact information
- [ ] Search contacts by name
- [ ] Delete contact (with confirmation)

**Organization CRUD:**
- [ ] Create new organization
- [ ] Link contact to organization
- [ ] View organization detail
- [ ] Edit organization
- [ ] Delete organization

**Pipeline Management:**
- [ ] View pipeline Kanban board
- [ ] Drag deal to new stage
- [ ] Create new deal/opportunity
- [ ] View deal detail
- [ ] Update deal stage

**Task Workflow:**
- [ ] View task list
- [ ] Create manual task
- [ ] Complete task with notes
- [ ] Batch complete multiple tasks
- [ ] Task triage flow

**Cadence Workflow:**
- [ ] Apply cadence to contact
- [ ] View cadence tasks
- [ ] Complete cadence step
- [ ] Pause/resume cadence

**Role-Based Access:**
- [ ] Verify admin-only features hidden from users
- [ ] Verify manager features hidden from regular users
- [ ] Admin can manage users
- [ ] Manager can reassign tasks

**Technical Notes:**
```typescript
// tests/e2e/auth.spec.ts
test.describe('Authentication', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
});
```

**Estimated Hours:** 24-30h

**Sub-tasks:**
- [ ] #5a: Auth flows (3h)
- [ ] #5b: Contact CRUD (4h)
- [ ] #5c: Organization CRUD (3h)
- [ ] #5d: Pipeline management (4h)
- [ ] #5e: Task workflow (4h)
- [ ] #5f: Cadence workflow (4h)
- [ ] #5g: Role-based access (4h)
- [ ] #5h: CI integration (2h)

---

# 🟠 HIGH PRIORITY ISSUES

---

## Epic: Dashboard Features

### Issue #6: Complete Manager Dashboard Implementation

**Labels:** `feature` `priority: high` `frontend` `backend`

**Description:**
Verify and complete the Manager Dashboard implementation per PRD Section 7.4. The dashboard may be partially implemented but needs verification and completion of remaining features.

**User Story:**
As a team manager, I want to see my team's performance and workload so that I can identify issues and redistribute work effectively.

**Acceptance Criteria:**
- [ ] Team overview cards showing tasks by assignee
- [ ] Cadence performance table with conversion rates
- [ ] Activity trends chart (tasks completed over time)
- [ ] Alert system for overdue tasks and stuck relationships
- [ ] Task reassignment functionality (bulk)
- [ ] Workload distribution visualization
- [ ] Database RPCs implemented:
  - `get_team_task_summary()`
  - `get_cadence_performance()`

**Technical Notes:**
```sql
CREATE OR REPLACE FUNCTION get_team_task_summary(
  p_team_user_ids UUID[],
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  pending_count INT,
  overdue_count INT,
  completed_today INT,
  completed_week INT
);
```

**Estimated Hours:** 16-24h

---

### Issue #7: Implement Admin User Management

**Labels:** `feature` `priority: high` `frontend` `backend` `admin`

**Description:**
Implement complete user management functionality for admin users. This allows administrators to manage team members, assign roles, and control access.

**User Story:**
As an admin, I want to manage user accounts and roles so that I can control who has access to the system and what they can do.

**Acceptance Criteria:**
- [ ] User list view with table showing all users
- [ ] Create user form (invite by email)
- [ ] Edit user role (admin/manager/user)
- [ ] Deactivate user (soft delete)
- [ ] Reactivate deactivated user
- [ ] Admin can edit any user's profile
- [ ] Audit log of user changes
- [ ] Email notification on invite
- [ ] Only admin role can access user management

**File Structure:**
```
src/features/admin/
├── components/
│   ├── UserManagement.tsx
│   ├── UserTable.tsx
│   ├── UserFormDialog.tsx
│   └── RoleSelector.tsx
├── hooks/
│   └── useUsers.ts
└── services/
    └── userService.ts
```

**Estimated Hours:** 12-16h

---

## Epic: Data Integrity

### Issue #8: Form Validation Audit and Remediation

**Labels:** `bug` `priority: high` `frontend` `security`

**Description:**
Audit all forms in the application to ensure they have proper Zod validation schemas integrated with React Hook Form. Inconsistent validation could lead to bad data or security issues.

**User Story:**
As a user, I want clear validation feedback when entering data so that I can fix errors before submission.

**Acceptance Criteria:**
- [ ] All forms use React Hook Form + Zod
- [ ] Validation schemas defined for all entities:
  - Contact form
  - Organization form
  - Task form
  - Cadence form
  - Relationship form
  - User profile form
- [ ] Client-side validation matches database constraints
- [ ] Error messages are user-friendly (not technical)
- [ ] Errors display inline below fields
- [ ] Errors shown on blur, not just submit
- [ ] Required fields clearly marked
- [ ] Email, phone, URL fields have format validation
- [ ] Custom field validation respects field type

**Technical Notes:**
```typescript
// Example: src/features/contacts/schemas/contactSchema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

**Estimated Hours:** 8-12h

---

## Epic: Performance

### Issue #9: Add Missing Database Indexes

**Labels:** `performance` `priority: high` `backend` `database`

**Description:**
Add missing composite indexes to improve query performance, especially for dashboard queries and common filter patterns.

**User Story:**
As a user, I want pages to load quickly so that I can work efficiently.

**Acceptance Criteria:**
- [ ] Analyze slow queries with `EXPLAIN ANALYZE`
- [ ] Create migration for new indexes
- [ ] Indexes added:
  - `business_relationships(type, stage, owner_id)`
  - `activities(contact_id, occurred_at DESC)`
  - `activities(relationship_id, type, occurred_at)`
  - `cadence_tasks(assigned_to, status, due_date)`
  - `manual_tasks(assigned_to, status, due_date)`
  - `contacts(search_vector)` - GIN index
  - `organizations(search_vector)` - GIN index
- [ ] Leadership dashboard materialized view indexes:
  - `leadership_dashboard_cache(type)`
  - `leadership_dashboard_cache(owner_id)`
  - `leadership_dashboard_cache(ventures)` - GIN
- [ ] Verify indexes are used with query plans
- [ ] Document index strategy

**Technical Notes:**
```sql
-- Migration: 00007_performance_indexes.sql

CREATE INDEX CONCURRENTLY idx_br_type_stage_owner 
  ON business_relationships(type, stage, owner_id);

CREATE INDEX CONCURRENTLY idx_activities_contact_time 
  ON activities(contact_id, occurred_at DESC);

CREATE INDEX CONCURRENTLY idx_cadence_tasks_assignment 
  ON cadence_tasks(assigned_to, status, due_date);
```

**Estimated Hours:** 4-6h

---

## Epic: Security

### Issue #10: Implement Role-Based Route Guards

**Labels:** `security` `priority: high` `frontend` `authentication`

**Description:**
Verify and implement role-based access control on all protected routes. Ensure admin-only and manager-only features are properly guarded.

**User Story:**
As a system administrator, I want sensitive features protected by role checks so that unauthorized users cannot access them.

**Acceptance Criteria:**
- [ ] `ProtectedRoute` component exists and works correctly
- [ ] Route guards check user role from auth context
- [ ] Admin-only routes:
  - `/admin/*` (user management)
  - `/settings/system`
  - Cadence template management
- [ ] Manager-only routes:
  - `/leadership` (dashboard)
  - `/manager/*` (team dashboard)
  - Task reassignment
- [ ] Unauthorized access shows 403 page or redirects
- [ ] Role checks happen on mount and auth state change
- [ ] API calls include role verification (RLS backup)
- [ ] Navigation items hidden for insufficient roles

**Technical Notes:**
```tsx
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin, 
  requireManager 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  if (requireManager && !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

**Estimated Hours:** 6-8h

---

## Epic: UX Consistency

### Issue #11: Standardize Loading, Empty, and Error States

**Labels:** `enhancement` `priority: high` `frontend` `ux`

**Description:**
Create and implement consistent loading, empty, and error states across all data views. Currently, these states may be inconsistent or missing.

**User Story:**
As a user, I want clear feedback about data loading status so that I know whether to wait or take action.

**Acceptance Criteria:**

**Loading States:**
- [ ] Create reusable skeleton components:
  - `TableSkeleton`
  - `CardSkeleton`
  - `ListSkeleton`
  - `FormSkeleton`
- [ ] All data fetching shows skeletons (not spinners)
- [ ] Skeletons match actual content layout
- [ ] Shimmer animation on skeletons
- [ ] Respect `prefers-reduced-motion`

**Empty States:**
- [ ] Create `EmptyState` component with props:
  - `icon`
  - `title`
  - `description`
  - `action` (button/link)
- [ ] All list views show empty state when no data
- [ ] Empty states include call-to-action
- [ ] Different messages for:
  - First-time (onboarding)
  - No results (filtered)
  - No data yet

**Error States:**
- [ ] Create `ErrorState` component with:
  - Error icon
  - User-friendly message
  - "Try Again" button
  - Technical details (collapsible, dev only)
- [ ] All async operations show error state on failure
- [ ] Error states don't break layout

**Technical Notes:**
```tsx
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
<EmptyState
  icon={<Users className="h-12 w-12" />}
  title="No contacts yet"
  description="Add your first contact to get started."
  action={{ label: "Add Contact", onClick: openAddContact }}
/>
```

**Estimated Hours:** 12-16h

---

## Epic: Data Management

### Issue #12: Implement Data Import/Export Feature

**Labels:** `feature` `priority: high` `frontend` `backend`

**Description:**
Implement CSV import and export functionality for contacts and organizations. This is critical for initial data migration and ongoing data management.

**User Story:**
As a user, I want to import contacts from a CSV file so that I can quickly populate the CRM with existing data.

**Acceptance Criteria:**

**Import:**
- [ ] CSV file upload with drag-and-drop
- [ ] File validation (format, size, encoding)
- [ ] Column mapping UI (map CSV columns to fields)
- [ ] Preview of first 10 rows
- [ ] Duplicate detection with options:
  - Skip duplicates
  - Update existing
  - Create new anyway
- [ ] Validation errors shown per row
- [ ] Progress indicator for large imports
- [ ] Import summary (created, updated, skipped, errors)
- [ ] Rollback capability for failed imports

**Export:**
- [ ] Export contacts to CSV
- [ ] Export organizations to CSV
- [ ] Include/exclude fields selection
- [ ] Apply current filters to export
- [ ] Export all or selected rows
- [ ] Download as file

**File Structure:**
```
src/features/import-export/
├── components/
│   ├── ImportWizard.tsx
│   ├── FieldMapper.tsx
│   ├── ImportPreview.tsx
│   ├── ExportDialog.tsx
│   └── DuplicateWarning.tsx
├── hooks/
│   ├── useImport.ts
│   └── useExport.ts
└── services/
    ├── importService.ts
    └── exportService.ts
```

**Estimated Hours:** 20-24h

**Sub-tasks:**
- [ ] #12a: Import wizard UI (6h)
- [ ] #12b: Field mapping logic (4h)
- [ ] #12c: Duplicate detection (4h)
- [ ] #12d: Import processing with progress (4h)
- [ ] #12e: Export functionality (4h)
- [ ] #12f: Tests (2h)

---

# 📊 Issue Board Setup

## Recommended Labels

```
# Priority
priority: critical    #FF0000
priority: high        #FF6600
priority: medium      #FFCC00
priority: low         #00CC00

# Type
bug                   #D73A4A
feature               #0075CA
enhancement           #A2EEEF
documentation         #0075CA

# Area
frontend              #7057FF
backend               #008672
database              #FBCA04
infrastructure        #B60205

# Category
accessibility         #D4C5F9
security              #EE0701
performance           #FBCA04
testing               #BFD4F2
ux                    #C5DEF5

# Status
blocked               #B60205
needs-review          #FBCA04
in-progress           #0E8A16
```

## Milestones

```
v1.1.0 - Leadership Dashboard
  - Issue #1 (Leadership Dashboard)
  - Issue #6 (Manager Dashboard)

v1.1.1 - Stability & Security
  - Issue #2 (Error Boundaries)
  - Issue #3 (Error Logging)
  - Issue #10 (Route Guards)

v1.1.2 - Quality & Accessibility
  - Issue #4 (Accessibility)
  - Issue #5 (E2E Tests)
  - Issue #11 (Loading/Error States)

v1.2.0 - Admin & Data Features
  - Issue #7 (User Management)
  - Issue #12 (Import/Export)

v1.2.1 - Performance & Polish
  - Issue #8 (Form Validation)
  - Issue #9 (Database Indexes)
```

---

# 📈 Sprint Planning Recommendation

## Sprint 1: Foundation & Critical Fixes (2 weeks)
- Issue #2: Error Boundaries (8-12h)
- Issue #3: Error Logging (6-8h)
- Issue #10: Route Guards (6-8h)
- Issue #9: Database Indexes (4-6h)
- **Total: 24-34h**

## Sprint 2: Leadership Dashboard Part 1 (2 weeks)
- Issue #1a-1d: Database + Types + Hooks + Core UI
- **Total: 17h**

## Sprint 3: Leadership Dashboard Part 2 (2 weeks)
- Issue #1e-1i: Pipeline/Venture sections + Integration + Tests
- Issue #6: Manager Dashboard Completion
- **Total: 28-36h**

## Sprint 4: Accessibility & Testing (2 weeks)
- Issue #4: Accessibility Audit (24-32h)
- Issue #5: E2E Tests (start)
- **Total: 28-36h**

## Sprint 5: Testing & UX (2 weeks)
- Issue #5: E2E Tests (complete)
- Issue #11: Loading/Error States
- **Total: 28-36h**

## Sprint 6: Admin & Data Features (2 weeks)
- Issue #7: Admin User Management
- Issue #8: Form Validation Audit
- **Total: 20-28h**

## Sprint 7: Import/Export (2 weeks)
- Issue #12: Data Import/Export
- **Total: 20-24h**

---

*Generated: December 26, 2025*
*Based on: Carbide CRM Codebase Review*
