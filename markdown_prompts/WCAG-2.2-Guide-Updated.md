# WCAG 2.2 Accessibility Guide for AI-Assisted Development

> **Purpose**: This guide serves as a reference for Claude, Cursor, and other AI coding assistants when building accessible web applications. Use this document to ensure code suggestions and implementations meet WCAG 2.2 compliance.

---

## 🤖 Key Rules for AI-Assisted Development

**When generating any UI code, always apply these rules:**

1. **Every interactive element must be keyboard accessible** - Use native `<button>`, `<a>`, `<input>` elements. If using `<div>` or `<span>`, add `role`, `tabindex="0"`, and keyboard event handlers.

2. **Every image needs alt text** - Informative images get descriptive alt; decorative images get `alt=""`. Never omit the alt attribute.

3. **Every form input needs a label** - Use `<label for="id">` or `aria-label`. Placeholder text is NOT a label.

4. **Color alone must never convey meaning** - Always pair color with text, icons, or patterns (errors, status, links).

5. **Minimum contrast ratios are non-negotiable** - 4.5:1 for normal text, 3:1 for large text (18px+) and UI components.

6. **Focus indicators must be visible** - Never use `outline: none` without a visible replacement. Use `:focus-visible` for keyboard-only focus.

7. **Touch targets must be at least 24×24px** - Prefer 44×44px for comfortable touch interaction.

8. **Always include skip links** - Add "Skip to main content" link as first focusable element.

9. **Use semantic HTML first** - `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, proper heading hierarchy (h1→h2→h3).

10. **Announce dynamic content** - Use `aria-live="polite"` for status updates, `role="alert"` for errors.

**Always include in every project:**
```css
/* Visually hidden utility - use for screen reader only text */
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

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Quick Reference: Conformance Levels

| Level | Description | Common Use |
|-------|-------------|------------|
| **A** | Minimum accessibility | Legal baseline in many jurisdictions |
| **AA** | Standard accessibility | Most common compliance target (ADA, Section 508, EN 301 549) |
| **AAA** | Enhanced accessibility | Specialized contexts, not typically required |

---

## The Four Principles (POUR)

All WCAG criteria fall under these four foundational principles:

1. **Perceivable** - Information must be presentable in ways users can perceive
2. **Operable** - Interface components must be operable by all users
3. **Understandable** - Information and UI operation must be understandable
4. **Robust** - Content must be robust enough for diverse user agents and assistive technologies

---

# PRINCIPLE 1: PERCEIVABLE

## 1.1 Text Alternatives

### 1.1.1 Non-text Content (Level A)

**Requirement**: All non-text content must have text alternatives that serve equivalent purpose.

#### ✅ Correct Implementation

```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2 2024">

<!-- Decorative image - use empty alt -->
<img src="decorative-border.png" alt="">

<!-- Complex image with extended description -->
<figure>
  <img src="organization-chart.png" alt="Company organization structure">
  <figcaption>
    Detailed description: The CEO reports to the Board. Three VPs 
    (Engineering, Sales, Operations) report to the CEO...
  </figcaption>
</figure>

<!-- Icon button -->
<button aria-label="Close dialog">
  <svg aria-hidden="true"><!-- icon SVG --></svg>
</button>

<!-- Image used as link -->
<a href="/home">
  <img src="logo.png" alt="Acme Corp - Return to homepage">
</a>

<!-- Form control with image -->
<input type="image" src="submit.png" alt="Submit form">

<!-- Background images carrying meaning - use visually hidden text -->
<div class="hero-banner">
  <span class="visually-hidden">Award-winning customer service since 2010</span>
</div>
```

```css
/* Visually hidden but accessible to screen readers */
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

#### ❌ Common Failures

```html
<!-- Missing alt attribute -->
<img src="important-chart.png">

<!-- Non-descriptive alt text -->
<img src="graph.png" alt="image">
<img src="photo.jpg" alt="photo123.jpg">

<!-- Alt text on decorative images -->
<img src="decorative-line.png" alt="horizontal line decoration">

<!-- CSS background images with important content and no text alternative -->
<div class="hero" style="background-image: url('sale-50-percent-off.jpg')"></div>
```

---

## 1.2 Time-based Media

### 1.2.1 Audio-only and Video-only (Level A)

**Requirement**: Provide alternatives for prerecorded audio-only and video-only content.

```html
<!-- Audio with transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg">
</audio>
<a href="podcast-transcript.html">Read transcript</a>

<!-- Video-only with audio description or text alternative -->
<video controls>
  <source src="animation.mp4" type="video/mp4">
  <track kind="descriptions" src="animation-descriptions.vtt" srclang="en">
</video>
```

### 1.2.2 Captions - Prerecorded (Level A)

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions-en.vtt" srclang="en" label="English" default>
  <track kind="captions" src="captions-es.vtt" srclang="es" label="Spanish">
</video>
```

### 1.2.3 Audio Description or Media Alternative (Level A)

```html
<!-- Option 1: Audio description track -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Audio Descriptions">
</video>

<!-- Option 2: Link to full text alternative -->
<video controls src="video.mp4"></video>
<a href="video-transcript.html">Full video transcript with visual descriptions</a>
```

### 1.2.4 Captions - Live (Level AA)

For live video, integrate real-time captioning services (CART, automatic speech recognition with human correction).

### 1.2.5 Audio Description - Prerecorded (Level AA)

Provide audio descriptions for all prerecorded video content.

---

## 1.3 Adaptable

### 1.3.1 Info and Relationships (Level A)

**Requirement**: Information, structure, and relationships conveyed through presentation must be programmatically determinable.

#### ✅ Correct Implementation

```html
<!-- Proper heading hierarchy -->
<h1>Main Page Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection Title</h3>
</section>

<!-- Semantic lists -->
<ul>
  <li>Unordered item</li>
</ul>
<ol>
  <li>Ordered item</li>
</ol>
<dl>
  <dt>Term</dt>
  <dd>Definition</dd>
</dl>

<!-- Data tables with proper headers -->
<table>
  <caption>Quarterly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Widget A</th>
      <td>$10,000</td>
      <td>$12,000</td>
    </tr>
  </tbody>
</table>

<!-- Complex table with headers attribute -->
<table>
  <tr>
    <td></td>
    <th id="q1" scope="col">Q1</th>
    <th id="q2" scope="col">Q2</th>
  </tr>
  <tr>
    <th id="widgets" scope="row">Widgets</th>
    <td headers="widgets q1">100</td>
    <td headers="widgets q2">150</td>
  </tr>
</table>

<!-- Form with proper labels -->
<form>
  <div>
    <label for="email">Email address</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <fieldset>
    <legend>Shipping Address</legend>
    <label for="street">Street</label>
    <input type="text" id="street" name="street">
  </fieldset>
  
  <!-- Radio button group -->
  <fieldset>
    <legend>Preferred contact method</legend>
    <input type="radio" id="contact-email" name="contact" value="email">
    <label for="contact-email">Email</label>
    <input type="radio" id="contact-phone" name="contact" value="phone">
    <label for="contact-phone">Phone</label>
  </fieldset>
</form>

<!-- Landmarks -->
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer role="contentinfo">...</footer>
```

#### ❌ Common Failures

```html
<!-- Using visual styling instead of semantic markup -->
<span style="font-size: 24px; font-weight: bold;">Not a real heading</span>

<!-- Table used for layout -->
<table>
  <tr><td>Column 1</td><td>Column 2</td></tr>
</table>

<!-- Missing form labels -->
<input type="text" placeholder="Enter name">

<!-- Fake lists using line breaks -->
<p>• Item 1<br>• Item 2<br>• Item 3</p>
```

### 1.3.2 Meaningful Sequence (Level A)

**Requirement**: Reading sequence must be programmatically determinable.

```html
<!-- Correct: DOM order matches visual order -->
<article>
  <h1>Article Title</h1>
  <p class="byline">By Author Name</p>
  <p>First paragraph...</p>
  <p>Second paragraph...</p>
</article>
```

```css
/* Avoid CSS that creates different visual order than DOM order */
/* If visual reordering is necessary, ensure it doesn't affect meaning */
.sidebar { order: 2; }  /* Be cautious with flexbox/grid order */
```

### 1.3.3 Sensory Characteristics (Level A)

**Requirement**: Instructions must not rely solely on shape, color, size, location, orientation, or sound.

#### ✅ Correct Implementation

```html
<!-- Don't rely on position alone -->
<p>Click the <strong>"Submit"</strong> button below to continue.</p>
<button>Submit</button>

<!-- Don't rely on color alone -->
<p>Required fields are marked with an asterisk (*) and have a red border.</p>
<label for="name">Name <span class="required">*</span></label>
```

#### ❌ Common Failures

```html
<!-- Relying on position -->
<p>Click the button on the right to submit.</p>

<!-- Relying on color alone -->
<p>Fields in red are required.</p>

<!-- Relying on shape -->
<p>Click the round button to continue.</p>
```

### 1.3.4 Orientation (Level AA) - *Added in 2.1*

**Requirement**: Content must not restrict view to single display orientation unless essential.

```css
/* Don't do this */
@media (orientation: portrait) {
  .app-content { display: none; }
  .rotate-message { display: block; }
}

/* Allow both orientations */
@media (orientation: landscape) {
  .content { flex-direction: row; }
}
@media (orientation: portrait) {
  .content { flex-direction: column; }
}
```

### 1.3.5 Identify Input Purpose (Level AA) - *Added in 2.1*

**Requirement**: Use autocomplete attributes for user information fields.

```html
<form>
  <label for="name">Full Name</label>
  <input type="text" id="name" name="name" autocomplete="name">
  
  <label for="email">Email</label>
  <input type="email" id="email" name="email" autocomplete="email">
  
  <label for="tel">Phone</label>
  <input type="tel" id="tel" name="tel" autocomplete="tel">
  
  <label for="street">Street Address</label>
  <input type="text" id="street" name="street" autocomplete="street-address">
  
  <label for="city">City</label>
  <input type="text" id="city" name="city" autocomplete="address-level2">
  
  <label for="cc-number">Credit Card Number</label>
  <input type="text" id="cc-number" name="ccnum" autocomplete="cc-number">
  
  <label for="bday">Birthday</label>
  <input type="date" id="bday" name="bday" autocomplete="bday">
</form>
```

#### Valid Autocomplete Values

| Category | Values |
|----------|--------|
| **Name** | `name`, `given-name`, `family-name`, `nickname`, `honorific-prefix`, `honorific-suffix` |
| **Contact** | `email`, `tel`, `tel-country-code`, `tel-national`, `url` |
| **Address** | `street-address`, `address-line1`, `address-line2`, `address-level1` (state), `address-level2` (city), `postal-code`, `country`, `country-name` |
| **Payment** | `cc-name`, `cc-number`, `cc-exp`, `cc-exp-month`, `cc-exp-year`, `cc-csc`, `cc-type` |
| **Account** | `username`, `new-password`, `current-password`, `one-time-code` |
| **Personal** | `bday`, `bday-day`, `bday-month`, `bday-year`, `sex`, `language` |
| **Organization** | `organization`, `organization-title` |

---

## 1.4 Distinguishable

### 1.4.1 Use of Color (Level A)

**Requirement**: Color must not be the only visual means of conveying information.

#### ✅ Correct Implementation

```html
<!-- Links distinguished by more than color -->
<p>Read our <a href="/terms" class="link">terms and conditions</a> for details.</p>

<!-- Error states with icon + color + text -->
<div class="error" role="alert">
  <svg aria-hidden="true" class="error-icon"><!-- error icon --></svg>
  <span>Error: Please enter a valid email address</span>
</div>

<!-- Form validation with multiple indicators -->
<label for="email">
  Email <span class="required" aria-label="required">*</span>
</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
<span id="email-error" class="error-message">
  <svg aria-hidden="true"><!-- icon --></svg>
  Please enter a valid email
</span>

<!-- Chart/graph with patterns -->
<p>Sales data shows growth (blue solid line) outpacing costs (red dashed line).</p>
```

```css
/* Links - use underline or other visual indicator beyond color */
a {
  color: #0066cc;
  text-decoration: underline;
}

/* Or provide sufficient contrast + visual indicator on hover/focus */
a {
  color: #0066cc;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}
a:hover, a:focus {
  text-decoration: underline;
}
```

### 1.4.2 Audio Control (Level A)

**Requirement**: Auto-playing audio longer than 3 seconds must have pause/stop mechanism or volume control.

```html
<!-- Don't autoplay, or provide controls -->
<audio controls>
  <source src="background-music.mp3" type="audio/mpeg">
</audio>

<!-- If autoplay is necessary -->
<audio id="bg-audio" autoplay>
  <source src="ambient.mp3" type="audio/mpeg">
</audio>
<button onclick="document.getElementById('bg-audio').pause()">
  Pause background audio
</button>
```

### 1.4.3 Contrast (Minimum) (Level AA)

**Requirement**: 
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio minimum

#### Contrast Requirements Table

| Text Type | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|-----------|-------------------|---------------------|
| Normal text (<18pt) | 4.5:1 | 7:1 |
| Large text (≥18pt or ≥14pt bold) | 3:1 | 4.5:1 |
| UI components & graphics | 3:1 | 3:1 |

#### ✅ Safe Color Combinations

```css
/* High contrast combinations */
.safe-text {
  color: #1a1a1a;        /* Near black */
  background: #ffffff;   /* White - 16.1:1 ratio */
}

.safe-link {
  color: #0056b3;        /* Dark blue on white - 7.5:1 ratio */
}

/* For large text (18pt+) */
.large-text-safe {
  color: #767676;        /* Gray on white - 4.54:1 - OK for large text */
  font-size: 24px;
}
```

#### ❌ Insufficient Contrast

```css
/* These fail AA requirements */
.fail {
  color: #999999;        /* Light gray on white - 2.85:1 */
  background: #ffffff;
}

.fail-link {
  color: #73b5e7;        /* Light blue on white - 2.33:1 */
}
```

#### Checking Contrast in All States

**Important**: Verify contrast ratios for ALL interactive states, not just default:

```css
/* Check contrast for each state */
.button {
  background: #0056b3;  /* Default - check against button text */
  color: white;
}

.button:hover {
  background: #004494;  /* Hover - must also meet contrast */
}

.button:focus {
  background: #004494;
  outline: 3px solid #0056b3;  /* Focus ring must have 3:1 contrast against adjacent colors */
}

.button:disabled {
  background: #cccccc;
  color: #666666;  /* Disabled can have lower contrast but should still be readable - aim for 3:1 minimum */
}
```

### 1.4.4 Resize Text (Level AA)

**Requirement**: Text must be resizable up to 200% without loss of content or functionality.

```css
/* Use relative units */
body {
  font-size: 100%;  /* or 16px base */
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
p { font-size: 1rem; }

/* Avoid fixed heights on text containers */
.content {
  min-height: 100px;  /* NOT height: 100px */
}

/* Allow text containers to grow */
.card {
  padding: 1em;
  /* Don't use overflow: hidden on text containers */
}
```

### 1.4.5 Images of Text (Level AA)

**Requirement**: Use actual text instead of images of text, except for logos or when essential.

```html
<!-- Don't do this -->
<img src="welcome-heading.png" alt="Welcome to our site">

<!-- Do this instead -->
<h1 class="styled-heading">Welcome to our site</h1>
```

```css
/* Style text with CSS instead of using images */
.styled-heading {
  font-family: 'Decorative Font', serif;
  font-size: 3rem;
  background: linear-gradient(to right, #833ab4, #fd1d1d, #fcb045);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 1.4.10 Reflow (Level AA) - *Added in 2.1*

**Requirement**: Content must reflow without horizontal scrolling at 320px width (equivalent to 400% zoom on 1280px viewport).

```css
/* Responsive design that reflows */
.container {
  max-width: 100%;
  padding: 0 1rem;
}

/* Flexible grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

/* Flexible images */
img {
  max-width: 100%;
  height: auto;
}

/* Avoid horizontal scroll triggers */
.content {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Handle long URLs/text */
.break-word {
  word-break: break-word;
  hyphens: auto;
}

/* Media query for narrow viewports */
@media (max-width: 320px) {
  .sidebar {
    display: none; /* or stack vertically */
  }
  
  table {
    display: block;
    overflow-x: auto; /* Tables are exempt */
  }
}
```

### 1.4.11 Non-text Contrast (Level AA) - *Added in 2.1*

**Requirement**: UI components and meaningful graphics need 3:1 contrast ratio.

```css
/* Form controls */
input, select, textarea {
  border: 2px solid #767676;  /* 4.54:1 against white */
}

input:focus {
  border-color: #0056b3;
  outline: 2px solid #0056b3;
}

/* Buttons */
.button {
  background: #0056b3;
  color: white;
  border: none;
}

/* Icons */
.icon {
  color: #595959;  /* 7:1 against white */
}

/* Custom checkboxes */
.checkbox-custom {
  border: 2px solid #595959;
}
.checkbox-custom:checked {
  background: #0056b3;
  border-color: #0056b3;
}
```

### 1.4.12 Text Spacing (Level AA) - *Added in 2.1*

**Requirement**: No loss of content when users override text spacing with these values:
- Line height: 1.5× font size
- Paragraph spacing: 2× font size  
- Letter spacing: 0.12× font size
- Word spacing: 0.16× font size

```css
/* Allow text spacing to be overridden - don't use fixed heights */
.card {
  padding: 1em;
  /* Don't set fixed height */
}

/* Use min-height instead of height */
.text-container {
  min-height: 100px;
  overflow: visible; /* Not hidden */
}

/* Test with this CSS override (bookmarklet) */
* {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p {
  margin-bottom: 2em !important;
}
```

### 1.4.13 Content on Hover or Focus (Level AA) - *Added in 2.1*

**Requirement**: Hover/focus content must be dismissible, hoverable, and persistent.

```css
/* Tooltip that meets requirements */
.tooltip-trigger {
  position: relative;
}

.tooltip {
  position: absolute;
  visibility: hidden;
  opacity: 0;
  /* Allow pointer to move to tooltip */
  transition: opacity 0.2s;
}

.tooltip-trigger:hover .tooltip,
.tooltip-trigger:focus-within .tooltip {
  visibility: visible;
  opacity: 1;
}

/* Tooltip stays visible when hovered */
.tooltip:hover {
  visibility: visible;
  opacity: 1;
}
```

```html
<!-- Dismissible tooltip with Escape key -->
<div class="tooltip-trigger" tabindex="0">
  Hover me
  <div class="tooltip" role="tooltip">
    Tooltip content
    <button class="tooltip-close" aria-label="Close tooltip">×</button>
  </div>
</div>

<script>
// Allow Escape to dismiss
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.tooltip').forEach(t => {
      t.style.visibility = 'hidden';
    });
  }
});
</script>
```

---

# PRINCIPLE 2: OPERABLE

## 2.1 Keyboard Accessible

### 2.1.1 Keyboard (Level A)

**Requirement**: All functionality must be operable via keyboard.

#### ✅ Correct Implementation

```html
<!-- Use native interactive elements -->
<button onclick="doAction()">Click me</button>
<a href="/page">Link</a>
<input type="text">
<select>...</select>

<!-- Custom interactive element with keyboard support -->
<div 
  role="button" 
  tabindex="0"
  onclick="handleClick()"
  onkeydown="handleKeydown(event)"
>
  Custom Button
</div>

<script>
function handleKeydown(event) {
  // Activate on Enter or Space
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}
</script>
```

#### ❌ Common Failures

```html
<!-- Non-keyboard accessible -->
<div onclick="doAction()">Click me</div>
<span class="link" onclick="navigate()">Fake link</span>

<!-- Mouse-only events -->
<div onmouseover="showMenu()">Hover for menu</div>
```

### 2.1.2 No Keyboard Trap (Level A)

**Requirement**: Keyboard focus must never be trapped. Users must be able to navigate away.

```html
<!-- Modal with proper focus management -->
<dialog id="modal">
  <h2>Modal Title</h2>
  <p>Content...</p>
  <button onclick="closeModal()">Close</button>
</dialog>

<script>
const modal = document.getElementById('modal');
let previousFocus;

function openModal() {
  previousFocus = document.activeElement;
  modal.showModal();
  modal.querySelector('button').focus();
}

function closeModal() {
  modal.close();
  previousFocus.focus(); // Return focus
}

// Allow Escape to close
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Trap focus within modal while open
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
</script>
```

### 2.1.4 Character Key Shortcuts (Level A) - *Added in 2.1*

**Requirement**: Single character shortcuts must be remappable, turnable off, or only active when component has focus.

```javascript
// Allow users to disable or remap shortcuts
const shortcuts = {
  's': searchFocus,
  'n': nextItem,
  'p': previousItem
};

let shortcutsEnabled = true;

function handleKeydown(e) {
  // Only trigger if not in an input field
  if (e.target.matches('input, textarea, select')) return;
  
  // Check if shortcuts are enabled
  if (!shortcutsEnabled) return;
  
  // Check for modifier keys (Ctrl+S is fine, just 'S' needs options)
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  
  const handler = shortcuts[e.key.toLowerCase()];
  if (handler) {
    e.preventDefault();
    handler();
  }
}

// Provide UI to disable
function toggleShortcuts() {
  shortcutsEnabled = !shortcutsEnabled;
}
```

---

## 2.2 Enough Time

### 2.2.1 Timing Adjustable (Level A)

**Requirement**: Users must be able to turn off, adjust, or extend time limits.

```html
<!-- Session timeout warning -->
<dialog id="timeout-warning" role="alertdialog" aria-labelledby="timeout-title">
  <h2 id="timeout-title">Session Expiring</h2>
  <p>Your session will expire in <span id="countdown">60</span> seconds.</p>
  <button onclick="extendSession()">Extend Session</button>
  <button onclick="logout()">Log Out</button>
</dialog>

<script>
let timeoutId;
let warningTimeout;

function startSessionTimer() {
  // Show warning 60 seconds before timeout
  warningTimeout = setTimeout(showWarning, (SESSION_LENGTH - 60) * 1000);
  timeoutId = setTimeout(sessionExpired, SESSION_LENGTH * 1000);
}

function showWarning() {
  document.getElementById('timeout-warning').showModal();
  startCountdown();
}

function extendSession() {
  clearTimeout(timeoutId);
  clearTimeout(warningTimeout);
  document.getElementById('timeout-warning').close();
  startSessionTimer(); // Restart timer
}
</script>
```

### 2.2.2 Pause, Stop, Hide (Level A)

**Requirement**: Moving, blinking, or auto-updating content must be pausable.

```html
<!-- Carousel with pause control -->
<div class="carousel" aria-roledescription="carousel" aria-label="Featured products">
  <button id="pause-btn" aria-pressed="false" onclick="togglePause()">
    <span class="pause-icon">⏸</span>
    <span class="visually-hidden">Pause carousel</span>
  </button>
  <div class="slides">...</div>
</div>

<script>
let isPaused = false;
let slideInterval;

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById('pause-btn');
  btn.setAttribute('aria-pressed', isPaused);
  
  if (isPaused) {
    clearInterval(slideInterval);
  } else {
    startSlideshow();
  }
}

// Also pause on hover/focus
carousel.addEventListener('mouseenter', () => !isPaused && clearInterval(slideInterval));
carousel.addEventListener('mouseleave', () => !isPaused && startSlideshow());
carousel.addEventListener('focusin', () => !isPaused && clearInterval(slideInterval));
carousel.addEventListener('focusout', () => !isPaused && startSlideshow());
</script>
```

---

## 2.3 Seizures and Physical Reactions

### 2.3.1 Three Flashes or Below Threshold (Level A)

**Requirement**: No content flashes more than 3 times per second.

```css
/* Safe animation - no rapid flashing */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.notification {
  /* Duration ensures fewer than 3 flashes per second */
  animation: pulse 2s ease-in-out infinite;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .notification {
    animation: none;
  }
}
```

### 2.3.3 Animation from Interactions (Level AAA) - *Added in 2.1*

```css
/* Honor reduced motion preference - ALWAYS INCLUDE THIS */
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

---

## 2.4 Navigable

### 2.4.1 Bypass Blocks (Level A)

**Requirement**: Provide mechanism to skip repeated content blocks.

```html
<!-- Skip links -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#navigation" class="skip-link">Skip to navigation</a>
  
  <header>
    <nav id="navigation">...</nav>
  </header>
  
  <main id="main-content">
    <!-- Main content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 2.4.2 Page Titled (Level A)

**Requirement**: Pages must have descriptive titles.

```html
<!-- Good titles -->
<title>Shopping Cart - Acme Store</title>
<title>Search Results for "blue shoes" - Acme Store</title>
<title>Contact Us - Acme Store</title>

<!-- Bad titles -->
<title>Page</title>
<title>Acme Store</title> <!-- Same for every page -->
<title>Untitled Document</title>
```

### 2.4.3 Focus Order (Level A)

**Requirement**: Focus order must be logical and meaningful.

```html
<!-- Logical tab order follows visual order -->
<form>
  <label for="first">First Name</label>
  <input type="text" id="first" name="first">
  
  <label for="last">Last Name</label>
  <input type="text" id="last" name="last">
  
  <button type="submit">Submit</button>
</form>

<!-- Don't use positive tabindex values -->
<!-- Bad: -->
<input tabindex="3">
<input tabindex="1">
<input tabindex="2">

<!-- Good: Use DOM order or tabindex="0" -->
<input tabindex="0">
```

### 2.4.4 Link Purpose in Context (Level A)

**Requirement**: Link purpose must be determinable from link text or context.

#### ✅ Correct Implementation

```html
<!-- Descriptive link text -->
<a href="/products/widget">View Widget Pro specifications</a>

<!-- Link purpose clear from context -->
<article>
  <h2>Widget Pro Review</h2>
  <p>The Widget Pro offers excellent value...</p>
  <a href="/products/widget">Read more<span class="visually-hidden"> about Widget Pro</span></a>
</article>

<!-- With aria-label for additional context -->
<a href="/products/widget" aria-label="Read more about Widget Pro">Read more</a>

<!-- Or aria-describedby -->
<h2 id="widget-title">Widget Pro</h2>
<a href="/products/widget" aria-describedby="widget-title">Read more</a>
```

#### ❌ Common Failures

```html
<a href="/page1">Click here</a>
<a href="/page2">Read more</a>
<a href="/page3">Link</a>
<a href="doc.pdf">Download</a>
```

### 2.4.6 Headings and Labels (Level AA)

**Requirement**: Headings and labels must describe topic or purpose.

```html
<!-- Descriptive headings -->
<h1>Complete Guide to Accessible Forms</h1>
<h2>Text Input Best Practices</h2>
<h2>Checkbox and Radio Button Guidelines</h2>

<!-- Descriptive labels -->
<label for="search">Search products</label>
<input type="search" id="search" name="search">

<label for="email">Email address (required)</label>
<input type="email" id="email" name="email" required>
```

### 2.4.7 Focus Visible (Level AA)

**Requirement**: Keyboard focus indicator must be visible.

```css
/* Never remove focus outlines without replacement */
/* Bad: */
*:focus { outline: none; }

/* Good: Custom visible focus styles */
:focus {
  outline: 2px solid #0056b3;
  outline-offset: 2px;
}

/* Or use focus-visible for keyboard-only focus */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid #0056b3;
  outline-offset: 2px;
}

/* High visibility focus for all elements */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 95, 204, 0.3);
}
```

### 2.4.11 Focus Not Obscured (Minimum) (Level AA) - *NEW in 2.2*

**Requirement**: Focused element must not be entirely hidden by author-created content (sticky headers, footers, modals).

```css
/* Account for sticky header when scrolling to focused element */
:target {
  scroll-margin-top: 80px; /* Height of sticky header */
}

/* Ensure focus isn't hidden by sticky elements */
main:focus-within {
  scroll-padding-top: 80px;
}

/* Cookie banner shouldn't cover focused elements */
.cookie-banner {
  /* Position at bottom, not covering content */
  position: fixed;
  bottom: 0;
  /* Or make it dismissible before covering content */
}
```

```javascript
// Ensure focused element is visible
function ensureFocusVisible(element) {
  const rect = element.getBoundingClientRect();
  const header = document.querySelector('.sticky-header');
  const headerHeight = header?.offsetHeight || 0;
  
  if (rect.top < headerHeight) {
    window.scrollBy(0, rect.top - headerHeight - 10);
  }
}
```

### 2.4.12 Focus Not Obscured (Enhanced) (Level AAA) - *NEW in 2.2*

**Requirement**: No part of the focused component can be hidden by author-created content.

### 2.4.13 Focus Appearance (Level AAA) - *NEW in 2.2*

**Requirement**: Focus indicator must be at least 2px thick perimeter with 3:1 contrast change.

```css
/* Strong focus indicator meeting AAA */
:focus-visible {
  outline: 3px solid #0056b3;
  outline-offset: 2px;
  /* 3px > 2px minimum */
  /* Blue (#0056b3) on white has 7.5:1 contrast */
}

/* Alternative: area-based focus */
button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px #0056b3;
}
```

---

## 2.5 Input Modalities

### 2.5.1 Pointer Gestures (Level A) - *Added in 2.1*

**Requirement**: Multi-point or path-based gestures must have single-pointer alternatives.

```html
<!-- Pinch-to-zoom alternative -->
<div class="image-viewer">
  <img src="map.jpg" alt="City map">
  <button onclick="zoomIn()">Zoom In (+)</button>
  <button onclick="zoomOut()">Zoom Out (-)</button>
</div>

<!-- Swipe alternative -->
<div class="carousel">
  <button onclick="prevSlide()">Previous</button>
  <div class="slides">...</div>
  <button onclick="nextSlide()">Next</button>
</div>
```

### 2.5.2 Pointer Cancellation (Level A) - *Added in 2.1*

**Requirement**: Actions triggered by pointer can be cancelled. Don't trigger on down-event, use up-event.

```javascript
// Correct: Action on mouseup/click, not mousedown
button.addEventListener('click', doAction);  // Click = mousedown + mouseup

// Allow abort by moving pointer away
button.addEventListener('mousedown', () => {
  // Only indicate action is pending
  button.classList.add('active');
});

button.addEventListener('mouseup', () => {
  if (button.classList.contains('active')) {
    doAction();
  }
});

button.addEventListener('mouseleave', () => {
  // Cancel pending action
  button.classList.remove('active');
});
```

### 2.5.3 Label in Name (Level A) - *Added in 2.1*

**Requirement**: Accessible name must contain visible text label.

```html
<!-- Good: aria-label matches visible text -->
<button aria-label="Search products">Search</button>
<!-- Better: visible text IS the accessible name -->
<button>Search products</button>

<!-- Good: aria-label starts with visible text -->
<button aria-label="Search products in catalog">Search</button>

<!-- Bad: aria-label doesn't include visible text -->
<button aria-label="Find items">Search</button>
```

### 2.5.4 Motion Actuation (Level A) - *Added in 2.1*

**Requirement**: Motion-triggered functions must have alternatives and be disableable.

```html
<!-- Shake-to-undo alternative -->
<button onclick="undo()">Undo</button>

<!-- Device tilt alternative for game -->
<div class="controls">
  <button onclick="moveLeft()">← Move Left</button>
  <button onclick="moveRight()">Move Right →</button>
</div>

<!-- Setting to disable motion controls -->
<label>
  <input type="checkbox" id="disable-motion" onchange="toggleMotionControls()">
  Disable motion controls
</label>
```

### 2.5.7 Dragging Movements (Level AA) - *NEW in 2.2*

**Requirement**: Any drag operation must have a single-pointer alternative.

```html
<!-- Sortable list with drag AND button alternatives -->
<ul class="sortable-list">
  <li>
    <span>Item 1</span>
    <div class="controls">
      <button onclick="moveUp(this)" aria-label="Move Item 1 up">↑</button>
      <button onclick="moveDown(this)" aria-label="Move Item 1 down">↓</button>
    </div>
  </li>
</ul>

<!-- Slider with click alternative to drag -->
<input type="range" min="0" max="100" value="50">
<!-- OR custom slider with keyboard + click support -->
<div class="custom-slider" role="slider" 
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
     tabindex="0">
  <div class="track" onclick="setValueFromClick(event)">
    <div class="thumb"></div>
  </div>
</div>

<!-- Map with click-to-pan instead of drag-only -->
<div class="map-controls">
  <button onclick="panLeft()">Pan Left</button>
  <button onclick="panRight()">Pan Right</button>
  <button onclick="panUp()">Pan Up</button>
  <button onclick="panDown()">Pan Down</button>
</div>
```

### 2.5.8 Target Size (Minimum) (Level AA) - *NEW in 2.2*

**Requirement**: Touch targets must be at least 24×24 CSS pixels, OR have sufficient spacing.

```css
/* Minimum 24x24px touch targets */
button, 
a,
input[type="checkbox"],
input[type="radio"] {
  min-width: 24px;
  min-height: 24px;
}

/* Better: 44x44px for easier touch */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
}

/* Icon buttons */
.icon-button {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Spacing exception - if targets are smaller, ensure spacing */
.small-targets {
  display: flex;
  gap: 8px; /* Ensure 24px diameter circle around each doesn't overlap */
}

/* Inline links in text are exempt */
p a {
  /* No size requirement for inline links */
}
```

---

# PRINCIPLE 3: UNDERSTANDABLE

## 3.1 Readable

### 3.1.1 Language of Page (Level A)

```html
<!DOCTYPE html>
<html lang="en">
  <head>...</head>
  <body>...</body>
</html>

<!-- Other language examples -->
<html lang="es">  <!-- Spanish -->
<html lang="fr">  <!-- French -->
<html lang="zh">  <!-- Chinese -->
<html lang="ar" dir="rtl">  <!-- Arabic, right-to-left -->
```

### 3.1.2 Language of Parts (Level AA)

```html
<p>The French phrase <span lang="fr">c'est la vie</span> means "that's life."</p>

<blockquote lang="de">
  <p>Ich bin ein Berliner.</p>
  <cite>John F. Kennedy</cite>
</blockquote>
```

---

## 3.2 Predictable

### 3.2.1 On Focus (Level A)

**Requirement**: Receiving focus must not cause unexpected context change.

```javascript
// Bad: Auto-submit or navigate on focus
input.addEventListener('focus', () => {
  form.submit();  // Don't do this
});

// Bad: Open new window on focus
link.addEventListener('focus', () => {
  window.open(link.href);  // Don't do this
});

// Good: Only change context on explicit user action
button.addEventListener('click', () => {
  submitForm();
});
```

### 3.2.2 On Input (Level A)

**Requirement**: Changing settings must not cause unexpected context change.

```html
<!-- Bad: Auto-submit on selection -->
<select onchange="this.form.submit()">
  <option>Select country...</option>
  <option value="us">United States</option>
</select>

<!-- Good: Require explicit submission -->
<label for="country">Country</label>
<select id="country" name="country">
  <option>Select country...</option>
  <option value="us">United States</option>
</select>
<button type="submit">Continue</button>

<!-- OR clearly indicate behavior -->
<label for="country">Country (changing this will reload the page)</label>
```

### 3.2.3 Consistent Navigation (Level AA)

**Requirement**: Navigation must appear in same relative order across pages.

```html
<!-- Same navigation structure on every page -->
<header>
  <nav aria-label="Main">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
</header>
```

### 3.2.4 Consistent Identification (Level AA)

**Requirement**: Components with same function must be identified consistently.

```html
<!-- Use consistent labels across site -->
<!-- Good: Always "Search" -->
<input type="search" aria-label="Search">  <!-- on every page -->

<!-- Bad: Inconsistent labels -->
<input type="search" aria-label="Search">       <!-- page 1 -->
<input type="search" aria-label="Find">          <!-- page 2 -->
<input type="search" aria-label="Site search">   <!-- page 3 -->
```

### 3.2.6 Consistent Help (Level A) - *NEW in 2.2*

**Requirement**: Help mechanisms must appear in consistent location across pages.

```html
<!-- Help in consistent location (e.g., footer or header) on every page -->
<footer>
  <nav aria-label="Help">
    <a href="/help">Help Center</a>
    <a href="/contact">Contact Us</a>
    <button onclick="openChat()">Live Chat</button>
    <a href="tel:+1-800-555-0123">1-800-555-0123</a>
  </nav>
</footer>
```

---

## 3.3 Input Assistance

### 3.3.1 Error Identification (Level A)

**Requirement**: Errors must be identified and described in text.

```html
<form novalidate>
  <div class="form-group">
    <label for="email">Email address</label>
    <input 
      type="email" 
      id="email" 
      name="email"
      aria-describedby="email-error"
      aria-invalid="true"
    >
    <span id="email-error" class="error" role="alert">
      Please enter a valid email address (e.g., name@example.com)
    </span>
  </div>
</form>
```

### 3.3.2 Labels or Instructions (Level A)

**Requirement**: Input fields must have labels or instructions.

```html
<!-- Visible label -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- With instructions -->
<label for="password">Password</label>
<input 
  type="password" 
  id="password" 
  name="password"
  aria-describedby="password-hint"
>
<p id="password-hint" class="hint">
  Must be at least 8 characters with one number and one special character.
</p>

<!-- Required field indication -->
<label for="email">
  Email <span aria-hidden="true">*</span>
  <span class="visually-hidden">(required)</span>
</label>
<input type="email" id="email" required aria-required="true">
```

### 3.3.3 Error Suggestion (Level AA)

**Requirement**: Provide suggestions for fixing errors when known.

```html
<div class="form-group error">
  <label for="date">Birth Date</label>
  <input 
    type="text" 
    id="date" 
    value="13/25/1990"
    aria-invalid="true"
    aria-describedby="date-error"
  >
  <span id="date-error" class="error" role="alert">
    Invalid date. Please use MM/DD/YYYY format (e.g., 12/25/1990).
  </span>
</div>

<div class="form-group error">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    value="john@"
    aria-invalid="true"
    aria-describedby="email-error"
  >
  <span id="email-error" class="error" role="alert">
    Email appears incomplete. Did you mean john@example.com?
  </span>
</div>
```

### 3.3.4 Error Prevention - Legal, Financial, Data (Level AA)

**Requirement**: For submissions with legal/financial commitments or user data modification: reversible, checked, or confirmable.

```html
<!-- Confirmation before submission -->
<form>
  <h2>Review Your Order</h2>
  
  <div class="order-summary">
    <!-- Show all details for review -->
    <p>Product: Widget Pro - $99.00</p>
    <p>Shipping: $5.00</p>
    <p>Total: $104.00</p>
  </div>
  
  <label>
    <input type="checkbox" required>
    I confirm this order is correct
  </label>
  
  <button type="button" onclick="goBack()">Go Back and Edit</button>
  <button type="submit">Confirm Purchase</button>
</form>

<!-- For data deletion -->
<dialog id="confirm-delete">
  <h2>Delete Account?</h2>
  <p>This action cannot be undone. All your data will be permanently deleted.</p>
  <button onclick="cancelDelete()">Cancel</button>
  <button onclick="confirmDelete()" class="danger">Delete My Account</button>
</dialog>
```

### 3.3.7 Redundant Entry (Level A) - *NEW in 2.2*

**Requirement**: Don't require users to re-enter information already provided in same process.

```html
<!-- Auto-populate from previous step -->
<form>
  <h2>Shipping Address</h2>
  <!-- User fills this out -->
  <input type="text" name="shipping-street" id="shipping-street">
  
  <h2>Billing Address</h2>
  <label>
    <input type="checkbox" onchange="copyShippingToBilling()" checked>
    Same as shipping address
  </label>
  <!-- Auto-filled or hidden when same as shipping -->
  <input type="text" name="billing-street" id="billing-street">
</form>

<!-- Use autocomplete to prevent re-entry across sessions -->
<input type="email" autocomplete="email">

<!-- Pre-fill from user profile -->
<script>
  if (userProfile.email) {
    document.getElementById('email').value = userProfile.email;
  }
</script>
```

### 3.3.8 Accessible Authentication (Minimum) (Level AA) - *NEW in 2.2*

**Requirement**: No cognitive function test (memorization, transcription, calculation) required for authentication, UNLESS alternative provided or assistance allowed.

```html
<!-- Good: Allow paste in password fields -->
<input type="password" id="password" autocomplete="current-password">
<!-- Don't disable paste! -->

<!-- Good: Allow password managers -->
<input type="password" autocomplete="current-password">
<input type="password" autocomplete="new-password">

<!-- Good: Provide alternatives to CAPTCHA -->
<div class="captcha-options">
  <button onclick="showVisualCaptcha()">Visual CAPTCHA</button>
  <button onclick="showAudioCaptcha()">Audio CAPTCHA</button>
  <button onclick="sendEmailVerification()">Email Verification</button>
</div>

<!-- Good: Magic link / passwordless -->
<form>
  <label for="email">Email address</label>
  <input type="email" id="email" autocomplete="email">
  <button type="submit">Send login link</button>
</form>

<!-- Good: Passkeys / WebAuthn -->
<button onclick="authenticateWithPasskey()">
  Sign in with Passkey
</button>

<!-- Bad: Copy-this-text CAPTCHA -->
<p>Type the following to prove you're human: xK9#mP2$</p>
<input type="text" id="captcha">

<!-- Bad: Math CAPTCHA -->
<p>What is 7 + 15?</p>
<input type="text" id="math-captcha">
```

### 3.3.9 Accessible Authentication (Enhanced) (Level AAA) - *NEW in 2.2*

**Requirement**: No cognitive function test at all (no object recognition CAPTCHA).

---

# PRINCIPLE 4: ROBUST

## 4.1 Compatible

### 4.1.1 Parsing (Obsolete - Removed in 2.2)

This criterion was removed in WCAG 2.2 because modern browsers handle parsing errors gracefully.

### 4.1.2 Name, Role, Value (Level A)

**Requirement**: All UI components must have accessible name, role, and state.

```html
<!-- Native elements have built-in name/role/value -->
<button>Submit</button>
<input type="checkbox" checked>
<a href="/page">Link text</a>

<!-- Custom components need ARIA -->
<div 
  role="button" 
  tabindex="0"
  aria-pressed="false"
  onclick="toggle()"
  onkeydown="handleKeydown(event)"
>
  Toggle Feature
</div>

<!-- Custom checkbox -->
<div 
  role="checkbox"
  tabindex="0"
  aria-checked="false"
  aria-labelledby="checkbox-label"
>
  <span class="checkbox-icon"></span>
</div>
<span id="checkbox-label">Subscribe to newsletter</span>

<!-- Accordion -->
<h3>
  <button 
    aria-expanded="false" 
    aria-controls="section1-content"
    id="section1-header"
  >
    Section 1
  </button>
</h3>
<div 
  id="section1-content" 
  role="region" 
  aria-labelledby="section1-header"
  hidden
>
  Content...
</div>

<!-- Tabs -->
<div role="tablist" aria-label="Product information">
  <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2" tabindex="-1">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel1" aria-labelledby="tab1">
  Description content...
</div>
<div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>
  Reviews content...
</div>
```

### 4.1.3 Status Messages (Level AA) - *Added in 2.1*

**Requirement**: Status messages must be programmatically announced without receiving focus.

```html
<!-- Live region for status updates -->
<div aria-live="polite" aria-atomic="true" id="status">
  <!-- Status messages inserted here -->
</div>

<!-- Alert for important messages -->
<div role="alert" id="error-alert">
  <!-- Error messages inserted here -->
</div>

<!-- Status role for search results -->
<div role="status" id="search-status">
  25 results found
</div>

<!-- Log for chat/activity -->
<div role="log" aria-live="polite" id="chat-log">
  <!-- Chat messages -->
</div>

<script>
// Announce status update
function showStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
}

// Show error alert
function showError(message) {
  const alert = document.getElementById('error-alert');
  alert.textContent = message;
}

// Update search results count
function updateResultsCount(count) {
  const status = document.getElementById('search-status');
  status.textContent = `${count} results found`;
}

// Usage
showStatus('Item added to cart');
showError('Please correct the errors before submitting');
updateResultsCount(25);
</script>
```

---

# HIGH CONTRAST & FORCED COLORS SUPPORT

## Supporting Windows High Contrast Mode

Windows High Contrast Mode (forced-colors) overrides your CSS colors. Ensure your UI remains functional:

```css
/* Detect forced colors mode */
@media (forced-colors: active) {
  /* Use system colors for custom controls */
  .custom-button {
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .custom-button:hover,
  .custom-button:focus {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }
  
  /* Ensure focus indicators are visible */
  :focus {
    outline: 2px solid Highlight !important;
    outline-offset: 2px;
  }
  
  /* Make sure icons are visible */
  .icon {
    forced-color-adjust: auto;
  }
  
  /* Preserve important borders */
  .card {
    border: 1px solid CanvasText;
  }
  
  /* Ensure disabled states are distinguishable */
  .button:disabled {
    border-color: GrayText;
    color: GrayText;
  }
}

/* Support users who prefer more contrast */
@media (prefers-contrast: more) {
  :root {
    --text-color: #000000;
    --bg-color: #ffffff;
    --border-color: #000000;
  }
  
  /* Increase border widths */
  button, input, select {
    border-width: 2px;
  }
}

/* Support users who prefer less contrast (rare but valid) */
@media (prefers-contrast: less) {
  :root {
    --text-color: #333333;
    --bg-color: #f5f5f5;
  }
}
```

### System Colors for Forced Colors Mode

| Color Keyword | Use For |
|---------------|---------|
| `Canvas` | Background |
| `CanvasText` | Text on Canvas |
| `LinkText` | Links |
| `ButtonFace` | Button backgrounds |
| `ButtonText` | Button text |
| `Highlight` | Selected/focused items |
| `HighlightText` | Text on Highlight |
| `GrayText` | Disabled text |

---

# COMMON ARIA PATTERNS

## Buttons

```html
<!-- Standard button -->
<button type="button">Click me</button>

<!-- Toggle button -->
<button type="button" aria-pressed="false">
  Dark mode
</button>

<!-- Menu button -->
<button type="button" aria-haspopup="menu" aria-expanded="false">
  Options
</button>
```

## Modals/Dialogs

```html
<dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-desc">Are you sure you want to proceed?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</dialog>
```

## Tabs

```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel1">General</button>
  <button role="tab" aria-selected="false" aria-controls="panel2" tabindex="-1">Privacy</button>
</div>
<div role="tabpanel" id="panel1">...</div>
<div role="tabpanel" id="panel2" hidden>...</div>
```

## Accordion

```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="content1">Section 1</button>
  </h3>
  <div id="content1" hidden>Content...</div>
</div>
```

## Navigation Menu

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li>
      <button aria-expanded="false" aria-haspopup="true">Products</button>
      <ul>
        <li><a href="/widgets">Widgets</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

## Progress Indicators

```html
<!-- Progress bar -->
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">
  50%
</div>

<!-- Loading spinner -->
<div role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  Loading...
</div>
```

---

# QUICK REFERENCE: NEW IN WCAG 2.2

| Criterion | Level | Key Requirement |
|-----------|-------|-----------------|
| **2.4.11** Focus Not Obscured (Min) | AA | Focused element not entirely hidden |
| **2.4.12** Focus Not Obscured (Enh) | AAA | No part of focused element hidden |
| **2.4.13** Focus Appearance | AAA | 2px perimeter, 3:1 contrast change |
| **2.5.7** Dragging Movements | AA | Single-pointer alternative to drag |
| **2.5.8** Target Size (Minimum) | AA | 24×24px or sufficient spacing |
| **3.2.6** Consistent Help | A | Help in same location across pages |
| **3.3.7** Redundant Entry | A | Don't re-ask for provided info |
| **3.3.8** Accessible Auth (Min) | AA | No cognitive tests, allow paste |
| **3.3.9** Accessible Auth (Enh) | AAA | No object recognition required |

**Removed**: 4.1.1 Parsing (obsolete)

---

# RESOURCES

## Official W3C Resources
- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [How to Meet WCAG (Quick Reference)](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG Techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

## Testing Tools
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessibility Insights](https://accessibilityinsights.io/)

---

*Last updated: December 2024 | Based on WCAG 2.2 (W3C Recommendation)*
