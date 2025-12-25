# Prompt: Fix ContactInfoSidebar Sizing & Spacing Issues

## Context

I need to fix the sizing and spacing of the left sidebar (`ContactInfoSidebar`) on the Contact Detail page. The current implementation has inconsistent spacing, cramped sections, and could benefit from better visual hierarchy.

## Current Implementation

The `ContactInfoSidebar` component is located at `src/features/contacts/components/ContactInfoSidebar.tsx` and is rendered within the three-column layout in `ContactDetail.tsx`:

```tsx
{/* Left Sidebar - Fixed width 288px (w-72) */}
<aside className="w-72 border-r bg-white flex-shrink-0">
  <ContactInfoSidebar contact={contact} />
</aside>
```

The sidebar currently uses:
- `ScrollArea` with `h-full` for scrollable content
- Inner container: `<div className="p-4 space-y-4">`
- Various collapsible sections for Relationships, Organizations, Details, etc.

## Issues to Address

1. **Sidebar Width**: The `w-72` (288px) width feels slightly narrow for the content density. Consider whether `w-80` (320px) would provide better readability without wasting space.

2. **Internal Padding**: The `p-4` (16px) padding is consistent but may need adjustment based on the width change.

3. **Section Spacing**: The `space-y-4` (16px) gap between sections may be too uniform - consider:
   - Tighter spacing (8-12px) between related items within sections
   - Larger spacing (20-24px) between major sections separated by `<Separator />`

4. **Collapsible Section Headers**: The current trigger styling uses `py-2 hover:bg-muted rounded-md px-2 -mx-2` which creates some visual inconsistency with negative margins.

5. **"Add" Button Sizing**: The ghost buttons for "Add phone", "Add email", "Add address", etc. take up significant vertical space. Consider:
   - Reducing button height with `size="xs"` or custom sizing
   - Using more compact padding
   - Grouping related add actions

6. **Contact Info Header**: The avatar and name section at the top needs better visual separation from the contact methods section.

7. **Touch Targets**: Ensure all interactive elements meet WCAG 2.2 minimum 24x24px touch targets while not being oversized.

8. **Text Truncation**: Long email addresses and phone labels need proper truncation with the `truncate` class.

## Requirements

Please refactor `ContactInfoSidebar.tsx` with the following improvements:

### Spacing Scale
Use a consistent 4px-based spacing scale:
- `gap-1` (4px) - between tightly related items
- `gap-2` (8px) - between items in a group
- `gap-3` (12px) - between subsections
- `gap-4` (16px) - standard section padding
- `gap-5` or `gap-6` (20-24px) - between major sections

### Section Hierarchy
```
├── Contact Header (Avatar + Name + Person X of Y)
│   └── [gap-5 below]
├── Primary Contact Methods
│   ├── Phones (gap-2 between items)
│   ├── Add Phone button (compact)
│   ├── Emails (gap-2 between items)  
│   ├── Add Email button (compact)
│   ├── Address
│   └── Add Address button (compact)
│   └── [Separator + gap-4]
├── Relationships Section (Collapsible)
│   └── [Separator + gap-4]
├── Organizations Section (Collapsible)
│   └── [Separator + gap-4]
├── Details Section (Collapsible)
│   └── [Separator + gap-4 if more sections]
├── Background Section (Collapsible, conditional)
├── Social Profile Section (Collapsible, conditional)
└── Delete Contact Button (at bottom, danger styling)
```

### Specific Changes

1. **Increase sidebar width** in `ContactDetail.tsx`:
   ```tsx
   <aside className="w-80 border-r bg-white flex-shrink-0">
   ```

2. **Update inner container spacing**:
   ```tsx
   <div className="p-5 space-y-5">
   ```

3. **Create compact "Add" buttons**:
   ```tsx
   <Button 
     variant="ghost" 
     size="sm" 
     className="h-8 w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 -mx-2"
   >
     <Plus className="h-3.5 w-3.5 mr-1.5" />
     <span className="text-sm">Add phone</span>
   </Button>
   ```

4. **Improve collapsible header consistency**:
   ```tsx
   <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors">
   ```

5. **Group contact methods more tightly**:
   ```tsx
   <div className="space-y-4">
     {/* Phones group */}
     <div className="space-y-1.5">
       {phones.map(...)}
       <AddPhoneButton />
     </div>
     
     {/* Emails group */}
     <div className="space-y-1.5">
       {emails.map(...)}
       <AddEmailButton />
     </div>
     
     {/* Address */}
     <div className="space-y-1.5">
       {address && <AddressDisplay />}
       <AddAddressButton />
     </div>
   </div>
   ```

6. **Add visual weight to section headers**:
   ```tsx
   <div className="flex items-center gap-2">
     <Users className="h-4 w-4 text-muted-foreground" />
     <span className="font-medium text-sm">Relationships</span>
     {count > 0 && (
       <Badge variant="secondary" className="h-5 px-1.5 text-xs">
         {count}
       </Badge>
     )}
   </div>
   ```

### Accessibility Considerations
- Maintain minimum 44x44px effective touch targets for mobile
- Ensure sufficient color contrast for muted text (4.5:1 ratio)
- Keep focus states visible on all interactive elements
- Use semantic HTML structure with proper heading levels

### Testing Checklist
After implementation, verify:
- [ ] Sidebar doesn't feel cramped or too spacious
- [ ] All text is readable without excessive truncation
- [ ] Collapsible sections have smooth animations
- [ ] Touch targets are appropriately sized
- [ ] Separator lines provide clear visual breaks
- [ ] Delete button is clearly positioned at bottom
- [ ] Scrolling works smoothly with ScrollArea
- [ ] Responsive behavior if sidebar needs to collapse on smaller screens

## Reference Files
- `src/features/contacts/components/ContactInfoSidebar.tsx` - Main component to modify
- `src/features/contacts/components/ContactDetail.tsx` - Parent layout (sidebar width)
- `src/components/ui/button.tsx` - Button variants
- `src/components/ui/collapsible.tsx` - Collapsible component
- Project knowledge files for spacing guidelines: `qol-ux-best-practices.md`
