# Sidebar UI/UX Design Specification

## Overview

A collapsible sidebar navigation with organized domain groups, icons, active states, and responsive behavior for the management portal.

---

## Layout Structure

### Desktop View (1024px+)

```
┌─────────────────────────────────────────────────────┐
│  Logo                        [hamburger]   Profile   │  ← Top Nav (50px)
├───────────────┬─────────────────────────────────────┤
│               │                                       │
│  SIDEBAR      │                                       │
│  (250px)      │         MAIN CONTENT                 │
│               │                                       │
│               │                                       │
│               │                                       │
└───────────────┴─────────────────────────────────────┘
```

### Tablet View (768px-1023px)

```
Same as desktop, but sidebar collapses to icons-only (70px) at smaller sizes
```

### Mobile View (<768px)

```
┌──────────────────────────────────┐
│  Logo    [hamburger]   Profile   │  ← Top Nav (50px)
├──────────────────────────────────┤
│  MAIN CONTENT                     │
│  (Sidebar slides in as overlay)   │
└──────────────────────────────────┘
```

---

## Sidebar Specifications

### Dimensions

- **Desktop**: 250px wide (expanded), 70px wide (collapsed)
- **Tablet/Mobile**: 250px wide (overlay when open), fully hidden when closed
- **Height**: Full viewport height minus top nav (calc(100vh - 50px))
- **Z-index**: 1000 (above main content on mobile)

### Color Scheme

```
Background:      #f8fafc (light gray-blue, Tailwind: slate-50)
Border:          #e2e8f0 (Tailwind: slate-200)
Text Primary:    #1e293b (Tailwind: slate-800)
Text Secondary:  #64748b (Tailwind: slate-500)
Hover BG:        #f1f5f9 (Tailwind: slate-100)
Active BG:       #e0e7ff (Tailwind: indigo-100)
Active Text:     #4f46e5 (Tailwind: indigo-600)
Hover Text:      #0f172a (Tailwind: slate-900)
Border Right:    #cbd5e1 (Tailwind: slate-300)
```

### Structure

```
┌─────────────────────────────────┐
│ SIDEBAR HEADER (60px)           │
│  [Logo] Woragis  [x or ←]       │  (When expanded or on mobile)
├─────────────────────────────────┤
│                                 │
│ MAIN NAVIGATION AREA            │
│                                 │
│ DASHBOARD                       │  [icon] [label] [chevron?]
│ > Dashboard                     │  - Primary link
│                                 │
│ PROJECTS & IDEAS                │  [Collapsed/Expandable Group]
│ > Projects                      │  - Sub-items
│ > Ideas                         │  - Sub-items
│                                 │
│ CAREER DEVELOPMENT [collapsed]  │  [Group Header - Collapsible]
│   > Experiences                 │  - Hidden when collapsed
│   > Languages                   │
│   > Certifications              │
│   > Testimonials                │
│                                 │
│ PLANNING & AI [expanded]        │  [Group Header - Expanded]
│   > Scheduler                   │
│   > Chats                       │
│                                 │
│ ACCOUNT [collapsed]             │  [Group Header - Collapsible]
│   > Profile                     │
│   > Settings                    │
│     - Preferences               │  [Sub-sub-items]
│     - API Keys                  │
│                                 │
├─────────────────────────────────┤
│ FOOTER AREA (60px)              │
│                                 │
│ [user-icon] Settings [gear]     │
│ [logout-icon] Logout            │
│                                 │
└─────────────────────────────────┘
```

---

## Component Layout Details

### Header Section (60px)

```
Expanded View:
┌────────────────────────────────┐
│ [Logo Icon] Woragis      [<] X  │
└────────────────────────────────┘

Collapsed View:
┌─────┐
│ [W] │  (Just logo icon centered)
└─────┘
```

**Behavior:**

- `[<]` button: Collapse sidebar (desktop only)
- `[X]` button: Close sidebar (mobile only)
- On mobile, clicking overlay area also closes

---

### Navigation Items

#### Primary Link (Not in a group)

```
┌─────────────────────────────────┐
│ [icon] Dashboard                │ ← Expanded
└─────────────────────────────────┘

┌─────┐
│ [D] │ ← Collapsed (show tooltip on hover)
└─────┘
```

**States:**

1. **Inactive**:
   - BG: transparent
   - Icon: slate-500
   - Text: slate-700
   - Cursor: pointer

2. **Hover**:
   - BG: slate-100
   - Icon: slate-700
   - Text: slate-900
   - Box-shadow: subtle

3. **Active**:
   - BG: indigo-100
   - Icon: indigo-600
   - Text: indigo-600
   - Border-left: 3px indigo-600

**Padding:**

- Expanded: `px-4 py-3`
- Collapsed: Center icon, `py-3`

---

#### Group Headers (Collapsible Sections)

```
Expanded with items visible:
┌─────────────────────────────────┐
│ CAREER DEVELOPMENT         [v]  │ ← Group header (uppercase)
│ > Experiences               │    │ ← Sub-item
│ > Languages                 │    │ ← Sub-item
│ > Certifications            │    │ ← Sub-item
│ > Testimonials              │    │ ← Sub-item
└─────────────────────────────────┘

Collapsed:
┌─────────────────────────────────┐
│ CAREER DEVELOPMENT         [>]  │ ← Rotated chevron
└─────────────────────────────────┘
```

**Group Header Style:**

- Font: 11px uppercase, font-weight 600
- Color: slate-600
- Padding: `px-4 py-2 mt-2`
- Letter-spacing: 0.05em
- Cursor: pointer on hover

**Behavior:**

- Click to toggle expansion
- Chevron rotates 90° on toggle
- Smooth animation (0.2s)
- Remember collapsed state in localStorage

---

#### Sub-items (Under Groups)

```
┌─────────────────────────────────┐
│   > Experiences                 │ ← Shows icon or arrow
│   > Languages                   │
│   > Certifications              │
└─────────────────────────────────┘
```

**Style:**

- Padding: `pl-8 pr-4 py-2.5`
- Font: 14px, normal weight
- Color: slate-700
- Icon: 16px, 12px from left edge
- Indent: Arrow/chevron indicates nesting

**States:**

1. **Inactive**: Same as primary but lighter
2. **Hover**: slate-100 BG
3. **Active**: indigo-100 BG with left border

---

#### Grouped Items (Multi-level)

```
┌─────────────────────────────────┐
│ ACCOUNT                    [v]  │
│   > Profile                     │
│   > Settings              [v]   │
│     - Preferences               │ ← Tertiary level
│     - API Keys                  │
│   > Help                        │
└─────────────────────────────────┘
```

**Third-level Style:**

- Padding: `pl-12 pr-4 py-2`
- Font: 13px, slightly lighter
- Symbol: `-` instead of `>`
- Indent: More to the right

---

### Footer Section (60px)

```
┌─────────────────────────────────┐
│                                 │
│ [settings-icon] Settings        │
│ [logout-icon] Logout            │
│                                 │
└─────────────────────────────────┘
```

**Style:**

- Separator line above (border-top)
- Same hover/active states as primary links
- Always visible (doesn't scroll with nav)
- Fixed at bottom

---

## Icon Set

### Icons to Use (from Lucide/Heroicons)

```
Dashboard        → LayoutDashboard (2 grid squares)
Projects         → FolderOpen / Grid3x3
Ideas            → Lightbulb / Brain
Clients          → Users / Building2
Finances         → Wallet / TrendingUp
Career Group     → Briefcase
Experiences      → Award / Badge
Languages        → Globe / MessageCircle
Certifications   → Certificate
Testimonials     → MessageSquare / Quote
Planning Group   → Calendar
Scheduler        → Calendar / Clock
Chats            → MessageSquare / Zap
Account Group    → User / Settings
Profile          → User / UserCircle
Settings         → Settings / Sliders
Preferences      → Sliders
API Keys         → Key / Lock
Help             → HelpCircle / Question
Logout           → LogOut / Exit
Hamburger        → Menu
Close            → X
Chevron Right    → ChevronRight
Chevron Down     → ChevronDown
```

**Icon Sizing:**

- Primary items: `w-5 h-5` (20px)
- Sidebar header: `w-6 h-6` (24px)
- Group headers: `w-4 h-4` (16px)

---

## Animations & Transitions

### Sidebar Toggle (Desktop)

```css
/* Sidebar Width */
.sidebar {
	transition: width 0.3s ease-in-out;
	width: 250px;
}

.sidebar.collapsed {
	width: 70px;
}

/* Labels Fade Out */
.sidebar-label {
	transition: opacity 0.2s ease-in-out 0.1s;
	opacity: 1;
}

.sidebar.collapsed .sidebar-label {
	opacity: 0;
	transition-delay: 0s;
}

/* Icons Adjust */
.sidebar-icon {
	transition: margin-left 0.3s ease-in-out;
	margin-left: 0;
}

.sidebar.collapsed .sidebar-icon {
	margin-left: calc((70px - 20px) / 2 - 10px);
}
```

### Hover Effects

```css
.nav-item {
	transition:
		background-color 0.15s ease,
		color 0.15s ease;
}

.nav-item:hover {
	background-color: #f1f5f9;
	color: #0f172a;
}
```

### Group Toggle (Expand/Collapse)

```css
.group-header {
	transition: background-color 0.15s ease;
}

.group-header .chevron {
	transition: transform 0.2s ease;
}

.group-header.collapsed .chevron {
	transform: rotate(-90deg);
}

.group-items {
	max-height: 500px;
	transition:
		max-height 0.3s ease,
		opacity 0.2s ease;
	opacity: 1;
}

.group-items.collapsed {
	max-height: 0;
	opacity: 0;
}
```

### Mobile Overlay Animation

```css
.sidebar-overlay {
	background-color: rgba(0, 0, 0, 0);
	transition: background-color 0.3s ease;
}

.sidebar-overlay.open {
	background-color: rgba(0, 0, 0, 0.5);
}

.sidebar {
	transform: translateX(-100%);
	transition: transform 0.3s ease;
}

.sidebar.open {
	transform: translateX(0);
}
```

---

## Responsive Behavior

### Desktop (1024px+)

```
✓ Sidebar always visible
✓ Can toggle collapsed state
✓ Width: 250px (expanded) / 70px (collapsed)
✗ No overlay
✓ Hamburger button shows current state
```

### Tablet (768px - 1023px)

```
✓ Sidebar visible by default (collapsed to 70px)
✓ Click icon to expand/collapse
✓ Active items still highlighted
✓ Hamburger visible
✗ No overlay when expanded
```

### Mobile (<768px)

```
✗ Sidebar hidden by default
✓ Hamburger button opens sidebar as overlay
✓ Full 250px width sidebar
✓ Semi-transparent backdrop behind sidebar
✓ Close button in header
✓ Click backdrop to close
✓ ESC key to close
```

---

## States & Behaviors

### Active Route Highlighting

```typescript
// Pseudo-code
if (currentRoute === item.route) {
  style = {
    background: indigo-100,
    color: indigo-600,
    borderLeft: '3px solid indigo-600'
  }
}
```

### Parent Active When Child Active

```typescript
// If /finance/reports is current and sidebar has:
// Finances
//   > Transactions
//   > Reports ← /finance/reports
// Then both Finances group and Reports item show as active
```

### Collapsible Groups Behavior

```
Default State:
✓ Primary items: Always visible
✓ Career Group: Collapsed
✓ Planning: Expanded
✓ Account: Collapsed

Remembers in localStorage:
- sidebarGroups.career = false
- sidebarGroups.planning = true
- sidebarGroups.account = false
```

### Tooltip on Collapsed Icons (Desktop)

```
When sidebar is collapsed, hovering icon shows tooltip:

Position: Right of icon, 8px gap
Content: Item label
BG: slate-900
Text: white
Font: 12px
Padding: 4px 8px
Border-radius: 4px
Z-index: 1001

Example:
┌─────┐
│ [D] │─── Dashboard
└─────┘

Shows after 300ms delay, hides immediately on mouseleave
```

---

## Color Variants by Theme

### Light Theme (Default)

```
Background:      #f8fafc
Text Primary:    #1e293b
Text Secondary:  #64748b
Hover BG:        #f1f5f9
Active BG:       #e0e7ff
Active Text:     #4f46e5
Border:          #e2e8f0
```

### Dark Theme (Future)

```
Background:      #1e293b
Text Primary:    #f1f5f9
Text Secondary:  #94a3b8
Hover BG:        #334155
Active BG:       #3730a3
Active Text:     #818cf8
Border:          #334155
```

---

## Accessibility

### Keyboard Navigation

```
Tab → Navigate through sidebar items
Enter/Space → Click active item
ArrowDown → Next item (optional)
ArrowUp → Previous item (optional)
ESC → Close sidebar on mobile
```

### ARIA Labels

```html
<nav aria-label="Main navigation">
  <button aria-label="Toggle navigation">
  <a role="menuitem" aria-current="page">
  <li role="none">
    <button role="menuitem" aria-expanded="false">
      Career Development
    </button>
  </li>
</nav>
```

### Focus States

```css
.nav-item:focus {
	outline: 2px solid #4f46e5;
	outline-offset: -2px;
}
```

### Screen Reader Text

```html
<!-- For collapsed state icon-only items -->
<span class="sr-only">Dashboard</span>
```

---

## Sidebar Component Props

```typescript
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  items: NavigationItem[]
  currentRoute: string
  onNavigate: (route: string) => void
  onLogout: () => void
  userProfile?: {
    name: string
    avatar?: string
  }
}

interface NavigationItem {
  id: string
  label: string
  route: string
  icon: IconType
  badge?: number | 'new'
  children?: NavigationItem[]
  action?: () => void
}
```

---

## Mobile Menu Behavior

### Opening

```
1. User clicks hamburger
2. Overlay fades in (0.3s)
3. Sidebar slides in from left (0.3s)
4. Focus moves to sidebar
5. Scroll locked on body
```

### Closing

```
1. User clicks X, clicks overlay, or presses ESC
2. Sidebar slides out left (0.3s)
3. Overlay fades out (0.3s)
4. Focus returns to hamburger (optional)
5. Scroll unlocked on body
```

---

## Performance Considerations

```
✓ Sidebar hidden by transform (not display: none)
✓ Icons lazy-loaded with dynamic imports
✓ Use CSS for collapsed animation (GPU-accelerated)
✓ Debounce window resize event
✓ Memoize navigation items array
✓ Virtual scrolling if items exceed 100 (future)
```

---

## File Structure

```
src/lib/components/
├── Sidebar.svelte
│   ├── SidebarHeader.svelte
│   ├── SidebarNav.svelte
│   │   ├── NavItem.svelte
│   │   ├── NavGroup.svelte
│   │   └── NavSubItem.svelte
│   ├── SidebarFooter.svelte
│   └── Sidebar.module.css
│
└── Navigation.svelte (Top Nav)
    ├── NavigationHeader.svelte
    ├── NavigationProfile.svelte
    └── Navigation.module.css
```
