{/*
  CONTACTINFOSIDEBAR OVERFLOW FIX - KEY CHANGES
  =============================================
  
  Apply these patterns throughout the ContactInfoSidebar.tsx file.
  The file is too large to recreate entirely, so here are the specific
  patterns that need to be changed:
*/}

// ============================================================================
// FIX 1: Wrap ScrollArea with a constraining container
// ============================================================================

// BEFORE:
<ScrollArea className="h-full">
  <div className="p-5 space-y-5">
    {/* content */}
  </div>
</ScrollArea>

// AFTER:
<div className="h-full w-full min-w-0 overflow-hidden">
  <ScrollArea className="h-full w-full">
    <div className="p-5 space-y-5 w-full box-border">
      {/* content */}
    </div>
  </ScrollArea>
</div>

// ============================================================================
// FIX 2: Contact Header - add min-w-0 to all flex containers
// ============================================================================

// BEFORE:
<div className="flex items-start gap-4 pb-5 border-b">
  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-emerald-500/20 shrink-0">
    {/* ... */}
  </Avatar>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      <h1 className="text-lg font-semibold truncate">{fullName}</h1>
      {/* ... */}
    </div>
  </div>
</div>

// AFTER:
<div className="flex items-start gap-4 pb-5 border-b min-w-0">
  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-emerald-500/20 shrink-0">
    {/* ... */}
  </Avatar>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1 min-w-0">
      <h1 className="text-lg font-semibold truncate flex-1 min-w-0">{fullName}</h1>
      {/* ... */}
    </div>
  </div>
</div>

// ============================================================================
// FIX 3: Phone/Email entries - fix flex container and action buttons
// ============================================================================

// BEFORE (phones):
<div
  className={`flex items-center gap-2 ${
    phone.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
  }`}
>
  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
  <span className="flex-1 min-w-0 truncate">{formatPhoneNumber(phone.value)}</span>
  {phone.label && (
    <span className="text-xs text-muted-foreground shrink-0">({phone.label})</span>
  )}
  <div className="flex items-center gap-1.5 ml-auto">
    {/* action buttons */}
  </div>
</div>

// AFTER (phones):
<div
  className={`flex items-center gap-2 min-w-0 ${
    phone.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
  }`}
>
  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
  <span className="flex-1 min-w-0 truncate">{formatPhoneNumber(phone.value)}</span>
  {phone.label && (
    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">({phone.label})</span>
  )}
  <div className="flex items-center gap-1.5 shrink-0">
    {/* action buttons - removed ml-auto, using shrink-0 instead */}
  </div>
</div>

// BEFORE (emails):
<div
  className={`flex items-center gap-2 ${
    email.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
  }`}
>
  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
  <span className="flex-1 min-w-0 truncate">{email.value}</span>
  {email.label && (
    <span className="text-xs text-muted-foreground shrink-0">({email.label})</span>
  )}
  <div className="flex items-center gap-1.5 ml-auto">
    {/* action buttons */}
  </div>
</div>

// AFTER (emails):
<div
  className={`flex items-center gap-2 min-w-0 ${
    email.is_primary ? 'text-emerald-600 font-medium' : 'text-sm'
  }`}
>
  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
  <span className="flex-1 min-w-0 truncate">{email.value}</span>
  {email.label && (
    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">({email.label})</span>
  )}
  <div className="flex items-center gap-1.5 shrink-0">
    {/* action buttons - removed ml-auto, using shrink-0 instead */}
  </div>
</div>

// ============================================================================
// FIX 4: Address entries - add min-w-0 to parent flex container
// ============================================================================

// BEFORE:
<div className="flex items-start gap-2 text-sm">
  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
  <div className="flex-1 min-w-0">
    {/* address lines */}
  </div>
  <div className="flex items-center gap-1.5 mt-0.5 ml-auto">
    {/* action buttons */}
  </div>
</div>

// AFTER:
<div className="flex items-start gap-2 text-sm min-w-0">
  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
  <div className="flex-1 min-w-0">
    {/* address lines */}
  </div>
  <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
    {/* action buttons - removed ml-auto, using shrink-0 instead */}
  </div>
</div>

// ============================================================================
// FIX 5: Collapsible triggers - add min-w-0 and ensure proper width
// ============================================================================

// BEFORE:
<CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors">
  <div className="flex items-center gap-2">
    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="font-medium text-sm">Relationships</span>
    {/* badge */}
  </div>
  {/* chevron */}
</CollapsibleTrigger>

// AFTER:
<CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors min-w-0">
  <div className="flex items-center gap-2 min-w-0 flex-1">
    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="font-medium text-sm truncate">Relationships</span>
    {/* badge - add shrink-0 */}
  </div>
  {/* chevron - ensure shrink-0 */}
</CollapsibleTrigger>

// ============================================================================
// FIX 6: Social links and other text content - ensure proper truncation
// ============================================================================

// BEFORE:
<a
  href={social.linkedin}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
>
  <AtSign className="h-4 w-4 shrink-0" />
  LinkedIn
</a>

// AFTER:
<a
  href={social.linkedin}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 text-sm text-emerald-600 hover:underline min-w-0"
>
  <AtSign className="h-4 w-4 shrink-0" />
  <span className="truncate">LinkedIn</span>
</a>

// ============================================================================
// SUMMARY OF KEY PATTERNS:
// ============================================================================
/*
  1. Add wrapper div around ScrollArea with: 
     className="h-full w-full min-w-0 overflow-hidden"
  
  2. Add min-w-0 to ALL parent flex containers that contain truncatable content
  
  3. Replace ml-auto with shrink-0 on action button containers
     - ml-auto pushes content but doesn't prevent parent expansion
     - shrink-0 keeps buttons fixed size while flex-1 items take remaining space
  
  4. Add whitespace-nowrap to labels that shouldn't wrap (like "(Mobile)")
  
  5. Add box-border to content containers with padding
  
  6. Ensure text elements have both flex-1 min-w-0 truncate for proper truncation
  
  7. Add shrink-0 to icons and badges that shouldn't shrink
  
  WHY min-w-0 IS CRITICAL:
  - Flexbox items default to min-width: auto
  - This means they can't shrink smaller than their content
  - Adding min-w-0 overrides this, allowing proper shrinking
  - Without it, long emails/names will push the container wider than its parent
*/
