# AGENTS.md — CRM UI/UX Design System & Engineering Guidelines

## 🌟 Design Identity: Premium Minimal Monochrome SaaS UI

All frontend design and code in this project strictly adheres to a **White + Black + Minimal Gray** monochrome aesthetic inspired by **shadcn/ui** and high-end enterprise SaaS applications (Linear, Vercel, Stripe). 

**Design Keywords:**
`White + Black + Minimal Gray + Inter + shadcn/ui + Thin Borders + Clean Tables + Subtle Radius + Minimal Shadows`

---

## 🎨 1. Color System

The UI is **90–95% White/Black/Gray**. Semantic colors (`#16A34A`, `#F59E0B`, `#DC2626`) are reserved exclusively for status indicators, badges, and alerts.

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Primary Background** | `#FFFFFF` | Page canvas, main viewports |
| **Secondary Background** | `#F8F8F8` | Page sections, container wrappers, auth backdrop |
| **Card Background** | `#FFFFFF` | Cards, panels, dropdowns, dialogs |
| **Primary Text** | `#111111` | Primary titles, headlines, table values |
| **Secondary Text** | `#666666` | Descriptions, labels, secondary metadata |
| **Muted Text** | `#999999` / `#737373` | Hints, placeholders, disabled states |
| **Border** | `#E5E5E5` | Default card borders, dividers, table row borders |
| **Strong Border** | `#D4D4D4` | Input focus borders, active card borders |
| **Primary Button** | `#111111` | Default CTA buttons (hover: `#262626`) |
| **White Button** | `#FFFFFF` | Secondary button (border: `#D4D4D4`, hover: `#F8F8F8`) |
| **Success** | `#16A34A` | Won deals, paid invoices, converted leads |
| **Warning** | `#F59E0B` | In-progress tasks, negotiation, partial payments |
| **Danger** | `#DC2626` | Overdue invoices, cancelled orders, urgent tasks |

---

## 🖥️ 2. Core Layout Architecture

```text
┌────────────────────────────────────────────────────────────┐
│  LOGO       Search...                  + Create   🔔   👤  │
├───────────────┬────────────────────────────────────────────┤
│               │                                            │
│  Dashboard    │  Dashboard                                 │
│  Leads        │  Overview                                  │
│  Contacts     │                                            │
│  Accounts     │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  Deals        │  │  Leads   │ │  Deals   │ │ Revenue  │   │
│               │  │ 12,458   │ │   328    │ │ ₹18.6L   │   │
│  Activities   │  └──────────┘ └──────────┘ └──────────┘   │
│  Products     │                                            │
│  Quotes       │  Sales Pipeline                            │
│  Orders       │  ┌────────────────────────────────────┐   │
│  Invoices     │  │                                    │   │
│  Payments     │  │             Analytics              │   │
│               │  │                                    │   │
│  Reports      │  └────────────────────────────────────┘   │
│               │                                            │
│  Settings     │                                            │
│               │                                            │
└───────────────┴────────────────────────────────────────────┘
```

### 🧭 Sidebar
- **Background:** `#FFFFFF` with right border `1px solid #E5E5E5`
- **Sections:**
  - **SALES:** Leads, Contacts, Accounts, Deals
  - **ACTIVITIES:** Tasks, Calls, Meetings, Calendar
  - **FINANCE:** Products, Quotes, Orders, Invoices, Payments
  - **ANALYTICS:** Reports
  - **SYSTEM:** Settings
- **Active State:** Solid black badge or `#111111` text with subtle `#F4F4F5` background. No gradients.
- **Collapsible:** Supports compact icon-only mode and full labeled drawer.

### 🔝 Navbar
- Header height: 60px (h-15)
- Quick search bar with `Ctrl + K` style prompt
- Quick Create dropdown menu for fast actions (+ Lead, + Deal, + Contact, + Task)
- User Profile menu with Organization context

---

## 📊 3. Component Design Rules

### 🔲 Border > Shadow Rule
**Crucial:** Do not use heavy drop shadows (`shadow-xl`, `shadow-2xl`). Always prioritize clean borders over heavy shadows:
- Default Cards: `border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]`

### 📈 KPI Metric Cards
- Background: `#FFFFFF`
- Border: `1px solid #E5E5E5`
- Metric Numbers: Large bold font (`text-2xl font-bold font-mono text-[#111111]`)
- Trend Indicator: Small minimal badge with `ArrowUpRight` or percentage

### 📋 Tables (Data Grid)
- Header row: Clean border bottom, uppercase tracking (`text-[11px] font-semibold text-[#666666] tracking-wider`)
- Row hover: Subtle background `#FAFAFA`
- Numeric columns: Right-aligned or clear `font-mono` typography
- Currency and Number fields must use `suppressHydrationWarning` and `formatNumber` to prevent SSR mismatch.

### 💰 Kanban Boards (Deals Pipeline)
- Minimalist columns with light gray background `#FAFAFA` or `#FFFFFF` borders
- Deal cards: White background, `border border-[#E5E5E5]`, deal amount in bold monospace, stage badge

### 🪟 Modals & Dialogs
- Backdrop: `rgba(0, 0, 0, 0.4)`
- Dialog Box: `bg-white rounded-xl border border-[#E5E5E5] shadow-lg`
- Actions: Primary action `#111111` button, Cancel action `#FFFFFF` with border

---

## ✨ 4. Typography & Font Hierarchy

**Primary Font:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

| Element | Weight | Size | Color |
| :--- | :--- | :--- | :--- |
| **Page Title** | 700 (Bold) | 20px - 24px | `#111111` |
| **Section Header** | 600 (Semibold) | 16px - 18px | `#111111` |
| **Card Title** | 600 (Semibold) | 14px | `#111111` |
| **KPI Value** | 700 (Bold) | 24px - 30px | `#111111` (or `#16A34A`) |
| **Body Text** | 400 (Regular) | 13px - 14px | `#404040` |
| **Labels & Captions**| 500 (Medium) | 11px - 12px | `#666666` |
| **Muted Meta** | 400 (Regular) | 11px - 12px | `#999999` |
| **Mono Values** | 500/600 (Mono) | 12px - 13px | Font Family: Monospace |

---

## 📐 5. Spacing, Borders & Radius

### Spacing Scale
Consistent 4px/8px grid system:
- `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`
- Standard Card padding: `16px` to `24px` (`p-4` or `p-6`)

### Border Radius
- **Cards & Panels:** `12px` (`rounded-xl`)
- **Inputs & Textareas:** `8px` (`rounded-lg`)
- **Buttons:** `8px` (`rounded-lg`)
- **Badges:** `6px` (`rounded-md`)
- **Modals / Dialogs:** `12px` (`rounded-xl`)
- **Avoid:** Pill/circular shapes except for avatars and spinners.

---

## ⚙️ 6. React / Next.js Hydration Prevention Rules

When formatting numbers, currencies, or dates:
1. **Always import `formatNumber` or `formatCurrency` from `@/lib/utils`** which formats deterministically with `'en-IN'`.
2. **Always append `suppressHydrationWarning`** to elements displaying dynamic monetary or date values:
   ```tsx
   <span suppressHydrationWarning className="font-mono font-bold text-[#111111]">
     ₹{formatNumber(lead.expected_value)}
   </span>
   ```
3. Never invoke raw `.toLocaleString()` without explicit locale options on server components or SSR boundaries.
