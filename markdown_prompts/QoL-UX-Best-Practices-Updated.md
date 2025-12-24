# Quality of Life UI/UX Best Practices

A comprehensive guide for implementing quality of life improvements in websites and applications (CRMs, dashboards, admin panels, etc.).

---

## 🤖 Key Rules for AI-Assisted Development

**When generating UI/UX code, always apply these rules:**

1. **Scroll to top on route change** - Automatically scroll to top when navigating to a new page using `window.scrollTo(0, 0)` or router events.

2. **Always show loading states** - Every async operation needs a loading indicator. Use skeletons for content, spinners for actions.

3. **Handle all error states** - Display user-friendly error messages with recovery actions ("Try again", "Go back").

4. **Provide visible focus indicators** - Never remove focus outlines without a visible replacement. Use `:focus-visible` for keyboard users.

5. **Minimum touch targets of 44×44px** - All clickable elements should be at least 44×44px on touch devices.

6. **Include confirmation for destructive actions** - Delete, remove, and cancel operations need confirmation dialogs.

7. **Show form validation inline** - Display errors below fields on blur, not just on submit.

8. **Announce dynamic content** - Use `aria-live` regions for toasts, status updates, and search results.

9. **Respect motion preferences** - Always include `@media (prefers-reduced-motion: reduce)` to disable animations.

10. **Provide empty states with guidance** - Never show a blank screen. Include helpful messaging and next actions.

**Always include these CSS utilities:**

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Safe area padding for notched devices */
.safe-area-padding {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Visually hidden but accessible */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Table of Contents

1. [Navigation & Wayfinding](#1-navigation--wayfinding)
2. [Visual Hierarchy](#2-visual-hierarchy)
3. [Interactive Elements](#3-interactive-elements)
4. [Forms & Data Entry](#4-forms--data-entry)
5. [Data Tables & Lists](#5-data-tables--lists)
6. [Feedback & Notifications](#6-feedback--notifications)
7. [Loading & Empty States](#7-loading--empty-states)
8. [Error Handling](#8-error-handling)
9. [Keyboard & Accessibility](#9-keyboard--accessibility)
10. [Responsive & Mobile Patterns](#10-responsive--mobile-patterns)
11. [Performance Perception](#11-performance-perception)
12. [Dark Mode & Theming](#12-dark-mode--theming)
13. [Animation & Motion](#13-animation--motion)

---

## 1. Navigation & Wayfinding

### Scroll Behavior

**Scroll-to-Top on Route Change**

- Automatically scroll to top when navigating to a new page
- Use smooth scrolling for a polished feel: `behavior: "smooth"`
- Consider preserving scroll position for browser back/forward navigation

```javascript
// React Router example
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}
```

**Scroll Position Restoration**

- For applications: Remember scroll position in long lists when users navigate away and return
- Store scroll position in session storage or state management
- Restore position when returning to the same view

```javascript
// Save scroll position before navigation
const saveScrollPosition = (key: string) => {
  sessionStorage.setItem(`scroll-${key}`, String(window.scrollY));
};

// Restore scroll position on return
const restoreScrollPosition = (key: string) => {
  const saved = sessionStorage.getItem(`scroll-${key}`);
  if (saved) {
    window.scrollTo(0, parseInt(saved, 10));
  }
};
```

**Scroll-to-Top Button**

- Show a "back to top" button when users scroll past a threshold (e.g., 400px)
- Use smooth scroll animation
- Position in bottom-right corner, away from primary actions
- Respect safe areas on notched devices

```css
.scroll-to-top {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  right: calc(24px + env(safe-area-inset-right));
}
```

### Breadcrumbs & Location Awareness

**For Applications:**

```
Dashboard > Contacts > John Smith > Edit
```

- Always show current location in complex hierarchies
- Make each level clickable for quick navigation
- Truncate long paths on mobile with "..." and dropdown

**For Websites:**

- Use breadcrumbs on content-heavy sites (documentation, e-commerce)
- Keep breadcrumbs above the main content area

### Navigation Persistence

**Sticky Navigation**

- Keep primary navigation visible while scrolling
- Use `position: sticky` with appropriate `top` value
- Consider hiding on scroll-down, showing on scroll-up for mobile
- Account for safe areas on notched devices

```css
.sticky-nav {
  position: sticky;
  top: env(safe-area-inset-top, 0);
}
```

**Active State Indicators**

- Clearly highlight the current page/section in navigation
- Use multiple visual cues: color, background, border, or icon
- Maintain active states in nested navigation

### Deep Linking

- Support direct URLs to specific states, tabs, or modal content
- Use URL parameters or hash fragments for filters, tabs, and pagination
- Enable sharing of specific views: `/contacts?status=active&sort=name`

---

## 2. Visual Hierarchy

### Typography Scale

| Level | Use Case | Size (Mobile → Desktop) |
|-------|----------|------------------------|
| Display | Hero headlines | 2.5rem → 4.5rem |
| H1 | Page titles | 2rem → 3rem |
| H2 | Section headings | 1.5rem → 2rem |
| H3 | Subsection headings | 1.25rem → 1.5rem |
| Body | Primary content | 1rem |
| Small | Metadata, captions | 0.875rem |
| Tiny | Labels, badges | 0.75rem |

**Best Practices:**

- Limit to 3-4 font sizes per page for clarity
- Use `font-weight` variations (400, 500, 600, 700) to create emphasis
- Apply `text-wrap: balance` on headings to prevent awkward line breaks
- Maintain consistent line-height: 1.5 for body, 1.2-1.3 for headings

### Spacing System

**Vertical Rhythm:**

- Use a consistent spacing scale (4px or 8px base unit)
- Common values: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Maintain proportional spacing between related elements

**Section Spacing:**

| Context | Spacing |
|---------|---------|
| Between sections | 64-96px |
| Between subsections | 32-48px |
| Between elements | 16-24px |
| Between related items | 8-12px |

**Application-Specific:**

- Compact views: Reduce spacing by 25-50% for data-dense interfaces
- Use consistent padding in cards: 16-24px for applications, 24-32px for marketing

### Color Hierarchy

**Text Colors:**

- Primary text: High contrast for main content
- Secondary text: Reduced contrast (60-70% opacity) for supporting info
- Disabled text: Low contrast (40% opacity) for inactive elements
- Link text: Distinct color with underline or hover state

**Background Layers:**

```
Base → Card → Elevated → Modal
(darkest to lightest in light mode)
```

**Emphasis Techniques:**

- Use background color for callouts and highlights
- Apply borders sparingly for separation
- Reserve bold/color combinations for critical information

### Content Width

| Content Type | Max Width |
|--------------|-----------|
| Marketing hero | Full width or 1400px |
| Content sections | 1200px |
| Readable text | 65-75 characters (~700px) |
| Forms | 400-600px |
| Dialogs/Modals | 400-800px depending on content |

---

## 3. Interactive Elements

### Hover & Focus States

**Essential States:**

1. **Default** - Resting state
2. **Hover** - Mouse over (desktop)
3. **Focus** - Keyboard focus (accessibility critical)
4. **Active** - Being clicked/pressed
5. **Disabled** - Non-interactive

**Hover Patterns (CSS):**

```css
/* Cards */
.card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.button:hover {
  background-color: var(--color-primary-dark);
  transform: scale(1.02);
}

/* Links */
a:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}

/* Icon buttons */
.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}
```

**Group Hover (Tailwind):**

```html
<div class="group">
  <div class="group-hover:border-primary"></div>
  <div class="group-hover:shadow-lg"></div>
  <icon class="group-hover:bg-primary/20"></icon>
  <arrow class="group-hover:translate-x-1"></arrow>
</div>
```

**Group Hover (Vanilla CSS):**

```css
.card-group:hover .card-border {
  border-color: var(--color-primary);
}

.card-group:hover .card-shadow {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-group:hover .card-icon {
  background-color: rgba(var(--color-primary-rgb), 0.2);
}

.card-group:hover .card-arrow {
  transform: translateX(4px);
}
```

**Transition Timing:**

- Fast interactions (hover, focus): 150-200ms
- Medium transitions (expand, slide): 200-300ms
- Slow animations (page transitions): 300-500ms
- Use `ease-out` for entering, `ease-in` for exiting

### Button Design

**Hierarchy:**

1. **Primary** - One per view, main action (filled, high contrast)
2. **Secondary** - Supporting actions (outlined or subtle fill)
3. **Tertiary/Ghost** - Minor actions (text only with hover state)
4. **Destructive** - Delete, remove (red/danger color)

**Size Guidelines:**

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| Small | 32px | 12px | Inline, tables |
| Medium | 40px | 16px | Default |
| Large | 48px | 24px | CTAs, marketing |

**Best Practices:**

- Include loading state with spinner for async actions
- Disable button during submission to prevent double-clicks
- Use icons with labels for clarity; icon-only for space-constrained areas
- Right-align primary actions in forms and dialogs

### Click Targets

- Minimum touch target: 44×44px (iOS), 48×48px (Android/Material)
- Add padding to small interactive elements to expand hit area
- For icon buttons, ensure clickable area extends beyond visible icon

```css
/* Expand click target beyond visible element */
.small-link {
  position: relative;
}

.small-link::after {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -8px;
}
```

---

## 4. Forms & Data Entry

### Input Design

**Visual States:**

- Default: Subtle border
- Focus: Prominent border (primary color) + optional ring/glow
- Error: Red border + error message below
- Success: Green border/checkmark (use sparingly)
- Disabled: Reduced opacity, cursor: not-allowed

**Labeling:**

- Always use visible labels (not just placeholders)
- Place labels above inputs for better scannability
- Mark required fields with asterisk (*) or "(required)"
- Use helper text below inputs for format hints

### Validation

**Real-Time Validation:**

- Validate on blur (when leaving field), not on every keystroke
- Show success state only after user has finished typing
- Format inputs automatically where possible (phone, credit card)

**Error Handling:**

- Display errors inline, directly below the relevant field
- Use clear, actionable language: "Enter a valid email" not "Invalid input"
- Summarize errors at top of form for long forms
- Scroll to first error and focus the field
- Announce errors to screen readers

```html
<div class="form-field">
  <label for="email">Email address</label>
  <input 
    type="email" 
    id="email" 
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <span id="email-error" class="error" role="alert">
    Please enter a valid email address (e.g., name@company.com)
  </span>
</div>
```

### Auto-Save & Drafts

**For Applications:**

- Auto-save form progress at regular intervals (every 30-60 seconds)
- Show "Saving..." / "Saved" indicator
- Warn users before navigating away from unsaved changes
- Store drafts locally (localStorage) as backup

**Implementation:**

```
Last saved: 2 minutes ago  [Saving...]  [All changes saved ✓]
```

### Input Enhancements

**Smart Defaults:**

- Pre-fill known information (user profile data, previous selections)
- Set sensible default values for optional fields
- Remember user preferences for recurring forms

**Input Assistance:**

- Add copy/paste buttons for long values
- Include clear/reset buttons for search fields
- Show password visibility toggle
- Provide date pickers for date fields (don't rely on text input)
- Use appropriate input types: `email`, `tel`, `url`, `number`

**Character Limits:**

- Show character count for limited fields: "45/280"
- Use progress indicator approaching limit
- Prevent over-typing or warn at limit

---

## 5. Data Tables & Lists

### Table Design

**Essential Features:**

- Sticky header row when scrolling vertically
- Sticky first column (ID, name) when scrolling horizontally
- Alternating row backgrounds or subtle borders for scannability
- Adequate row height: 48-56px minimum for clickable rows

**Column Behavior:**

- Sortable columns with clear indicators (▲▼)
- Resizable columns for user customization
- Show/hide columns based on user preference
- Sensible default column widths

### Selection & Bulk Actions

**Row Selection:**

- Checkbox column for multi-select
- "Select all" in header (select visible vs. select all)
- Selection count: "3 of 150 selected"
- Persist selection across pagination (with warning)

**Bulk Action Bar:**

- Sticky bar appears when items selected
- Show selection count and available actions
- Include "Deselect all" option
- Position at top or bottom of table

### Pagination & Infinite Scroll

**Pagination (preferred for applications):**

- Show items per page selector: 10, 25, 50, 100
- Display range: "Showing 1-25 of 342"
- Include first/last page buttons for large datasets
- Remember user's page size preference

**Infinite Scroll (use judiciously):**

- Show loading indicator at bottom
- Provide "Load more" button as alternative
- Display item count: "Showing 50 of 342 items"
- Include "scroll to top" button

### Filtering & Search

**Filter Patterns:**

- Instant search with debouncing (300ms delay)
- Filter chips for active filters with clear (×) buttons
- "Clear all filters" option
- Save/load filter presets for complex applications

**Search:**

- Search icon inside input or as button
- Placeholder text indicating searchable fields
- Keyboard shortcut (⌘K or /) to focus search
- Show result count: "23 results for 'smith'"
- Announce results to screen readers

```html
<div role="status" aria-live="polite" aria-atomic="true">
  23 results found for "smith"
</div>
```

### Empty & Zero States

**No Results:**

- Friendly illustration or icon
- Clear message: "No contacts match your filters"
- Actionable suggestion: "Try adjusting your filters or search terms"
- Quick actions: "Clear filters" button

---

## 6. Feedback & Notifications

### Toast Notifications

**Types:**

- **Success** (green): Confirmation of completed action
- **Error** (red): Something went wrong
- **Warning** (yellow/orange): Caution needed
- **Info** (blue): Neutral information

**Behavior:**

- Position: Top-right or bottom-right (consistent throughout app)
- Auto-dismiss: 4-6 seconds for success/info, persist for errors
- Allow manual dismissal with × button
- Stack multiple toasts with spacing
- Pause auto-dismiss on hover

**Accessibility Requirements:**

```html
<!-- Toast container with live region -->
<div 
  class="toast-container" 
  role="region" 
  aria-label="Notifications"
  aria-live="polite"
  aria-atomic="false"
>
  <!-- Individual toasts -->
  <div role="status" class="toast toast-success">
    Contact saved successfully
    <button aria-label="Dismiss notification">×</button>
  </div>
</div>

<!-- For error toasts, use role="alert" -->
<div role="alert" class="toast toast-error">
  Failed to save contact. Please try again.
</div>
```

**Focus Management:**

- Don't steal focus when toast appears
- Keep focus on current element
- If toast has actions, allow Tab to reach them
- Return focus appropriately when toast dismisses

**Content:**

- Keep messages concise (under 100 characters)
- Include action when relevant: "Contact saved. [View contact]"
- Avoid technical jargon in user-facing messages

### Confirmation Dialogs

**When to Use:**

- Destructive actions (delete, remove, cancel)
- Irreversible operations
- Actions affecting multiple items
- Significant state changes

**Dialog Design:**

- Clear title stating the action: "Delete this contact?"
- Concise description of consequences
- Primary action button matches intent (red for delete)
- Secondary "Cancel" option always available
- Don't use confirmation for easily reversible actions

**Example:**

```
┌─────────────────────────────────────────┐
│  Delete 3 contacts?                     │
│                                         │
│  This action cannot be undone. The      │
│  contacts will be permanently removed.  │
│                                         │
│              [Cancel]  [Delete]         │
└─────────────────────────────────────────┘
```

### Progress Indication

**Determinate Progress:**

- Use progress bar when duration is known
- Show percentage: "Uploading... 67%"
- Estimated time remaining for long operations

**Indeterminate Progress:**

- Spinner for unknown duration (under 10 seconds expected)
- Skeleton screens for content loading
- Progress with stages: "Step 2 of 4: Processing data..."

### Inline Feedback

**Success Feedback:**

- Brief flash of green/checkmark on successful action
- Update UI immediately (optimistic updates)
- Subtle animation to draw attention to change

**Live Regions (Accessibility):**

- Use `aria-live="polite"` for non-urgent updates
- Use `aria-live="assertive"` for critical alerts
- Announce loading states and results to screen readers

```html
<!-- Search results announcement -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  Loading search results...
</div>

<!-- After results load -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  Found 23 contacts matching "smith"
</div>
```

---

## 7. Loading & Empty States

### Loading Patterns

**Skeleton Screens (Preferred):**

- Match the layout of actual content
- Use subtle animation (shimmer effect)
- Replace with real content smoothly (fade transition)

**Spinner Usage:**

- Small inline spinners for buttons and small areas
- Page-level spinner only for initial app load
- Include text for operations over 2 seconds: "Loading contacts..."

**Progressive Loading:**

- Load and show critical content first
- Lazy load below-the-fold content
- Use blur-up technique for images

### Empty States

**First-Run (Onboarding):**

- Welcoming illustration
- Explain the feature's value
- Clear call-to-action to get started
- Optional: Skip/dismiss option

**No Data Yet:**

```
┌─────────────────────────────────────────┐
│         [Illustration]                  │
│                                         │
│    No contacts yet                      │
│    Add your first contact to get        │
│    started with your CRM.               │
│                                         │
│         [+ Add Contact]                 │
└─────────────────────────────────────────┘
```

**No Results (After Action):**

- Acknowledge the filter/search attempt
- Provide suggestions to find results
- Quick action to reset or try again

**Error State:**

- Explain what went wrong (user-friendly language)
- Provide recovery action: "Try again" or "Contact support"
- Include error code for support reference (small, secondary)

---

## 8. Error Handling

### Error Prevention

**Input Constraints:**

- Use appropriate input types (number, date, email)
- Set min/max values and lengths
- Disable invalid options rather than showing error after selection

**Confirmation for Risky Actions:**

- Require typing confirmation for critical deletes: "Type DELETE to confirm"
- Show preview of what will be affected
- Add brief delay before irreversible actions

**Undo Support:**

- Offer undo for destructive actions when possible
- "Contact deleted. [Undo]" (with 5-10 second window)
- Store recent deletions in trash/archive

### Error Display

**Form Errors:**

- Inline errors below each field
- Summary at top for multiple errors
- Scroll to and focus first error field
- Maintain entered data (don't clear form)
- Announce to screen readers

**API/System Errors:**

- User-friendly message (not technical errors)
- Actionable guidance when possible
- Retry option for transient failures
- Support contact for persistent issues

**404/Not Found:**

- Helpful message explaining the page wasn't found
- Search functionality or navigation options
- Link back to home or dashboard

### Offline Handling

**For Applications:**

- Detect offline status and notify user
- Queue actions for later sync when possible
- Show what's available offline
- Indicate when data may be stale

**Implementation:**

```
┌─────────────────────────────────────────┐
│  ⚠️ You're offline                       │
│  Changes will sync when you reconnect.  │
│                                    [×]  │
└─────────────────────────────────────────┘
```

```javascript
// Detect online/offline status
window.addEventListener('online', () => {
  showToast('Back online. Syncing changes...');
});

window.addEventListener('offline', () => {
  showToast('You\'re offline. Changes will sync when you reconnect.', {
    persistent: true
  });
});
```

---

## 9. Keyboard & Accessibility

### Keyboard Navigation

**Essential Shortcuts (Applications):**

| Shortcut | Action |
|----------|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate button/link |
| `Escape` | Close modal/dropdown |
| `Arrow keys` | Navigate within components |
| `/` or `⌘K` | Focus search |
| `?` | Show keyboard shortcuts |

**Focus Management:**

- Visible focus indicator (ring/outline) on all interactive elements
- Logical tab order following visual layout
- Trap focus within modals
- Return focus to trigger element when closing modal
- Skip links to main content

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <!-- Navigation -->
  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

### Screen Reader Support

**Semantic HTML:**

- Use proper heading hierarchy (h1 → h2 → h3)
- Landmark regions: `<nav>`, `<main>`, `<aside>`, `<footer>`
- Button for actions, links for navigation
- Tables for tabular data with proper headers

**ARIA When Needed:**

- `aria-label` for icon-only buttons
- `aria-expanded` for collapsible sections
- `aria-selected` for tabs
- `aria-live` for dynamic content updates
- `role="alert"` for error messages

**Content Accessibility:**

- Alt text for informative images
- Captions/transcripts for video/audio
- Color not the only indicator (add icons/text)
- Sufficient color contrast (4.5:1 for text, 3:1 for large text)

### Motion & Animation

**Respect User Preferences:**

- Honor `prefers-reduced-motion` media query
- Provide option to disable animations in settings
- Avoid auto-playing videos/animations

```css
/* Always include this */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Safe Animation:**

- Avoid flashing content (epilepsy risk)
- Keep animations under 5 seconds
- Provide pause controls for moving content

---

## 10. Responsive & Mobile Patterns

### Breakpoint Strategy

| Breakpoint | Width | Target Devices |
|------------|-------|----------------|
| xs | < 640px | Mobile phones |
| sm | ≥ 640px | Large phones, small tablets |
| md | ≥ 768px | Tablets |
| lg | ≥ 1024px | Small laptops |
| xl | ≥ 1280px | Desktops |
| 2xl | ≥ 1536px | Large displays |

### Safe Areas for Notched Devices

Handle iPhone notch, home indicator, and similar device features:

```css
/* Full-bleed layouts need safe area handling */
.header {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Fixed elements need extra care */
.fixed-bottom-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Modal/dialog safe areas */
.modal {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) 
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Required viewport meta tag:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Mobile Adaptations

**Navigation:**

- Hamburger menu or bottom navigation bar
- Full-screen navigation overlay on mobile
- Sticky bottom bar for primary actions

**Tables:**

- Horizontal scroll with sticky first column
- OR collapse to card/list layout
- OR show/hide columns based on priority

**Forms:**

- Full-width inputs on mobile
- Larger touch targets (48px minimum)
- Appropriate keyboard types (numeric, email)
- Move labels above inputs (not inline)

**Buttons:**

- Stack buttons vertically when needed
- Primary action at bottom (thumb-friendly)
- Full-width buttons in constrained spaces

### Touch Interactions

**Gestures (Mobile Apps):**

- Swipe to reveal actions (with visual hint)
- Pull to refresh (with loading indicator)
- Long press for context menu

**Touch Considerations:**

- Adequate spacing between tap targets
- No hover-dependent functionality
- Touch feedback (ripple, highlight)
- Avoid small close buttons on modals

### Responsive Content

**Images:**

- Use responsive images (`srcset`)
- Lazy load off-screen images
- Provide appropriate sizes for each breakpoint

**Text:**

- Increase base font size on mobile if needed
- Reduce heading sizes proportionally
- Ensure readable line length (45-75 characters)

---

## 11. Performance Perception

### Optimistic Updates

**Pattern:**

- Update UI immediately on user action
- Send request to server in background
- Revert if request fails (with notification)

**When to Use:**

- Toggle states (like, follow, favorite)
- Adding items to lists
- Simple updates (rename, reorder)

```javascript
// Example: Optimistic toggle
const toggleFavorite = async (item) => {
  // Update UI immediately
  setItems(prev => prev.map(i => 
    i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i
  ));

  try {
    await api.toggleFavorite(item.id);
  } catch (error) {
    // Revert on failure
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, isFavorite: item.isFavorite } : i
    ));
    showToast('Failed to update. Please try again.');
  }
};
```

### Perceived Performance

**Instant Feedback:**

- Button state change on click (before response)
- Skeleton screens instead of spinners
- Progressive image loading (blur-up, LQIP)

**Chunked Operations:**

- Break large operations into visible steps
- Show progress through stages
- Allow background processing with notification on completion

### Caching & Prefetching

**Data Caching:**

- Cache frequently accessed data locally
- Show stale data immediately, refresh in background
- Indicate when data may be outdated

**Prefetching:**

- Prefetch likely next pages on hover (links)
- Preload critical resources
- Lazy load non-critical features

---

## 12. Dark Mode & Theming

### Implementation Strategy

```css
/* Define CSS custom properties */
:root {
  /* Light mode (default) */
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-primary: #0066cc;
  --color-border: #e0e0e0;
  --color-shadow: rgba(0, 0, 0, 0.1);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-bg-secondary: #2d2d2d;
    --color-text: #ffffff;
    --color-text-secondary: #a0a0a0;
    --color-primary: #66b3ff;
    --color-border: #404040;
    --color-shadow: rgba(0, 0, 0, 0.3);
  }
}

/* Manual toggle override */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  /* ... light values */
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
  /* ... dark values */
}
```

### Theme Toggle

```javascript
// Respect system preference, allow manual override
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('theme', theme);
};

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
```

### Dark Mode Considerations

- Don't just invert colors—design intentionally for dark mode
- Reduce brightness of images in dark mode
- Use softer whites (#e0e0e0 instead of #ffffff) for text
- Increase contrast for UI elements
- Test with actual dark mode users

```css
/* Dim images in dark mode */
@media (prefers-color-scheme: dark) {
  img:not([src*=".svg"]) {
    filter: brightness(0.9);
  }
}
```

---

## 13. Animation & Motion

### Animation Principles

**Purpose-Driven Animation:**

- Guide attention to changes
- Provide feedback on actions
- Create spatial relationships
- Add personality (sparingly)

**Timing Guidelines:**

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions (hover, click) | 100-150ms | ease-out |
| Small transitions (dropdown, tooltip) | 150-200ms | ease-out |
| Medium transitions (modal, slide) | 200-300ms | ease-out |
| Large transitions (page, route) | 300-500ms | ease-in-out |

### Reduced Motion Support

**Always include:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Alternative for essential animations:**

```css
.notification {
  animation: slideIn 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .notification {
    /* Replace motion with opacity fade */
    animation: fadeIn 150ms ease-out;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Common Animation Patterns

**Entrance/Exit:**

```css
/* Fade + slide for modals */
.modal-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.modal-exit {
  opacity: 1;
}

.modal-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
```

**Loading States:**

```css
/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-bg-secondary);
  }
}
```

**Micro-interactions:**

```css
/* Button press effect */
.button:active {
  transform: scale(0.98);
}

/* Icon rotation */
.accordion-icon {
  transition: transform 200ms ease-out;
}

.accordion[open] .accordion-icon {
  transform: rotate(180deg);
}
```

---

## Implementation Checklist

### Essential (Must Have)

- [ ] Scroll to top on route change
- [ ] Visible focus states for all interactive elements
- [ ] Loading states for async operations
- [ ] Error messages for form validation
- [ ] Mobile-responsive layout
- [ ] Consistent spacing and typography
- [ ] Clear button hierarchy
- [ ] Safe area handling for notched devices
- [ ] `prefers-reduced-motion` media query

### Important (Should Have)

- [ ] Toast notifications for user feedback
- [ ] Confirmation dialogs for destructive actions
- [ ] Keyboard shortcuts for common actions
- [ ] Empty states with guidance
- [ ] Skeleton loading screens
- [ ] Auto-save for forms
- [ ] Unsaved changes warning
- [ ] Dark mode support
- [ ] Accessible live regions for dynamic content

### Nice to Have (Enhancements)

- [ ] Undo functionality
- [ ] Offline support
- [ ] Customizable table columns
- [ ] Saved filter presets
- [ ] Keyboard shortcut help modal
- [ ] Animation preferences in settings
- [ ] Deep linking to views/filters
- [ ] Theme customization beyond dark/light

---

## Resources

**Design Systems:**

- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)

**Accessibility:**

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

**Patterns:**

- [Nielsen Norman Group](https://www.nngroup.com/)
- [Baymard Institute (E-commerce)](https://baymard.com/)

**Animation:**

- [Framer Motion](https://www.framer.com/motion/)
- [GSAP](https://greensock.com/gsap/)
