# CampusVerse AI — Enterprise Design System Specification

## 1. Design Philosophy
The CampusVerse AI design system prioritizes **clarity, institutional authority, and visual hierarchy**. It rejects visual clutter, gratuitous glowing gradients, and superficial animations in favor of a crisp, professional university management aesthetic.

---

## 2. Color Palette & Semantic Tokens

### Primary Brand Palette (Navy Blue)
- **Deep Navy** (`#0B132B` / `navy-950`): Application chrome, sidebar, and landing hero backgrounds.
- **Brand Navy** (`#0F2744` / `navy-900`): Primary buttons, header text, active brand accents.
- **Slate Navy** (`#1E3A5F` / `navy-800`): Sidebar hover states, secondary navigation borders.
- **Soft Slate** (`#334E68` / `navy-600`): Secondary typography, muted indicators.

### Accent Palette (Teal)
- **Vibrant Teal** (`#0D9488` / `teal-600`): Primary accent, focus rings, interactive toggles.
- **Teal Light** (`#14B8A6` / `teal-500`): Hover states, active status pills, icons.
- **Teal Surface** (`#F0FDFA` / `teal-50`): Badge backgrounds, selection highlights, card tags.

### Neutral & Background Palette
- **Canvas Base** (`#F8FAFC` / `slate-50`): Main dashboard background canvas.
- **Card Surface** (`#FFFFFF`): Elevated cards, modals, table rows.
- **Subtle Border** (`#E2E8F0` / `slate-200`): Controlled 1px borders on all cards and tables.
- **Primary Text** (`#0F172A` / `slate-900`): High-contrast readable typography.
- **Muted Text** (`#64748B` / `slate-500`): Meta tags, timestamps, secondary labels.

### Semantic Status Badges
| Status Category | Background | Border | Text | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#ECFDF5` (`emerald-50`) | `#A7F3D0` | `#065F46` | Paid, Eligible, Active, Present |
| **Warning** | `#FFFBEB` (`amber-50`) | `#FDE68A` | `#92400E` | Pending, Needs Review, Partial |
| **Danger** | `#FFF1F2` (`rose-50`) | `#FECDD3` | `#9F1239` | Shortage (<75%), Overdue, Rejected |
| **Info** | `#F0F9FF` (`sky-50`) | `#BAE6FD` | `#075985` | Submitted, Scheduled, Enrolled |
| **Demonstration** | `#FEF3C7` (`amber-100/80`)| `#FCD34D` | `#78350F` | Part 1 Simulated Data Label |

---

## 3. Typography Hierarchy
- **Display Headings**: `Plus Jakarta Sans`, font weights 600, 700, 800 with tight tracking (`-0.02em`).
- **Body & Data Records**: `Inter`, font weights 400, 500, 600 with clean tabular figure rendering.
- **Scale**:
  - `h1`: 24px - 32px (Desktop 36px)
  - `h2`: 20px - 24px
  - `h3`: 16px - 18px
  - `body`: 14px (0.875rem)
  - `caption / data cell`: 12px (0.75rem)
  - `micro badge`: 10px - 11px font-weight 700 uppercase

---

## 4. Component Standards

1. **Button (`Button.jsx`)**:
   - `primary`: Navy fill (`#0F1E2E`) with subtle shadow and white text.
   - `secondary`: White background with slate border and hover elevation.
   - `teal`: Vibrant teal fill for primary conversion actions.
   - `danger`: Accessible rose fill for destructive or rejection actions.
   - `ghost`: Transparent background for low-prominence actions.

2. **Card (`Card.jsx` & `StatCard.jsx`)**:
   - Subtle 1px border (`border-slate-200/90`)
   - Soft elevation (`shadow-card`)
   - Optional header with badge and action slots
   - Fluid responsive padding (`p-5` to `p-6`)

3. **Table (`Table.jsx`)**:
   - Full-width wrapper with horizontal overflow containment (`overflow-x-auto`)
   - Sticky header row with uppercase micro-labels
   - Zebra alternate rows (`bg-slate-50/30`)
   - Custom cell renderers for badges, progress bars, and monospace numbers

4. **Form Controls (`Input.jsx`, `Select.jsx`)**:
   - Accessible labels with explicit `htmlFor` and unique IDs
   - Teal focus ring (`focus:ring-2 focus:ring-teal-500`)
   - Inline validation error messages with icons
   - Standardized 40px height (`py-2.5 px-3.5`)
