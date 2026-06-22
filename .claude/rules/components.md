---
paths: src/components/**/*.tsx, src/app/**/*.tsx
---

# UI Component Rules for DevFlow AI

## Color Tokens (from globals.css)
Use ONLY these DesignRift tokens. NEVER use default Tailwind colors.

### Common Usage Patterns:
```
Backgrounds:
bg-canvas-base        → Page background
bg-canvas-bg          → Card/elevated background
bg-canvas-bg-subtle   → Subtle card (forms, inputs)
bg-canvas-bg-hover    → Hover state background
bg-canvas-bg-active   → Active state background

Text:
text-canvas-text-contrast  → Primary text (headings, strong)
text-canvas-text           → Secondary text (body, muted)
text-primary-text          → Teal brand text (accents)
text-primary-solid         → Strong teal (highlights)
text-secondary-solid       → Pink accent
text-success-text          → Green text
text-warning-text          → Yellow text
text-alert-text            → Red text
text-info-text             → Blue text

Buttons (3-layer system):
Primary solid:   bg-primary-solid text-primary-on-primary hover:bg-primary-solid-hover
Secondary solid: bg-secondary-solid text-secondary-on-secondary hover:bg-secondary-solid-hover
Success solid:   bg-success-solid text-success-on-success hover:bg-success-solid-hover
Alert solid:     bg-alert-solid text-alert-on-alert hover:bg-alert-solid-hover
Outline:         border-canvas-border/50 text-canvas-text-contrast hover:bg-canvas-bg

Borders (ALWAYS use /50 opacity):
border-canvas-border/50    → Default border
border-primary-border/50   → Teal border
border-secondary-border/50 → Pink border
border-success-border/50   → Green border
border-alert-border/50     → Red border
```

## Icon Imports
ALWAYS use react-icons/pi (Phosphor Icons). NEVER use lucide-react.
```tsx
import { PiArrowRight, PiSpinner, PiCheck } from 'react-icons/pi'
```

Common icon mappings:
- Close/X → PiX
- Check → PiCheck  
- Arrow → PiArrowRight, PiArrowLeft
- Loading → PiSpinner (animate-spin)
- User → PiUser, PiUsers, PiUserPlus
- Settings → PiGear
- Plus → PiPlus
- Trash → PiTrash, PiTrashSimple
- Edit → PiPencil, PiPencilSimple
- Search → PiMagnifyingGlass
- Warning → PiWarning, PiWarningCircle
- Info → PiInfo
- Code → PiCode
- GitHub → PiGithubLogo
- Sprint/Calendar → PiCalendar
- Standup → PiMicrophone
- AI/Magic → PiSparkle
- Send → PiPaperPlaneRight
- Eye → PiEye, PiEyeSlash
- Google → PiGoogleLogo
- SignOut → PiSignOut

## Framer Motion Patterns
Always import at top of file:
```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

### Card hover (use on ALL clickable cards):
```tsx
<motion.div
  whileHover={{ y: -2, transition: { duration: 0.2 } }}
  className="..."
>
```

### Staggered list (use for any list of items):
```tsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li key={i.id} variants={item}>...</motion.li>)}
</motion.ul>
```

### Page entry (use on main page containers):
```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
```

### Modal/Dialog entry:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
```

## ShadCN Component Color Overrides
When using ANY ShadCN component, ALWAYS replace these:
- `bg-primary` → `bg-primary-solid`
- `text-primary-foreground` → `text-primary-on-primary`
- `text-muted-foreground` → `text-canvas-text`
- `border-input` → `border-canvas-border/50`
- `bg-background` → `bg-canvas-base`
- `bg-card` → `bg-canvas-bg-subtle`
- `bg-secondary` → `bg-canvas-bg`
- `ring-ring` → `ring-primary-solid`
- `text-destructive` → `text-alert-text`
- `bg-destructive` → `bg-alert-solid`
- `border` (any default) → add `/50` opacity

## Border Rule
ALL borders must have /50 opacity to match DesignRift system:
```
border-canvas-border/50      ✅
border-primary-border/50     ✅
border-canvas-border         ❌ too strong
```

## Typography Pattern
```tsx
// Headings
<h1 className="text-canvas-text-contrast font-semibold text-2xl">Title</h1>
<h2 className="text-canvas-text-contrast font-semibold text-xl">Subtitle</h2>

// Body
<p className="text-canvas-text text-sm">Muted description</p>
<span className="text-canvas-text-contrast text-base">Main text</span>

// Accents
<span className="text-primary-solid text-sm font-medium">Brand accent</span>
<span className="text-secondary-solid text-sm font-medium">Pink accent</span>
```

## Installed ShadCN Components
These are confirmed installed in src/components/ui/:
- accordion
- avatar
- badge
- button
- card
- dialog
- dropdown-menu
- input
- label
- popover
- progress
- scroll-area
- separator
- sheet
- sidebar
- skeleton
- sonner (toaster)
- tabs
- textarea
- tooltip
