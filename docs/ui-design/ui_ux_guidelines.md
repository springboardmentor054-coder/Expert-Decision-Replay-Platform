# UI/UX Design System & Guidelines - EDRP

* **File Name:** `ui_ux_guidelines.md`
* **Folder Location:** `docs/ui-design/`
* **Purpose:** Define standard design tokens, typography, component behaviors, responsive grids, color schemas, and accessibility layouts.

---

## 1. Design Aesthetics & Core Principles

The EDRP user interface is built to feel premium, enterprise-grade, and responsive. It uses a modern dark-mode-first aesthetic with clean lines, high-contrast typography, glassmorphism card layouts, and subtle transitions (micro-interactions) using Tailwind CSS and Framer Motion.

---

## 2. Color Palette (HSL & Hex)

We employ a balanced, semantic color scheme customized to keep readability high.

| Semantic Name | Light Mode (Hex / HSL) | Dark Mode (Hex / HSL) | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary (Brand)** | `#0F172A` / `HSL(222, 47%, 11%)` | `#38BDF8` / `HSL(199, 89%, 60%)` | Main buttons, active sidebar links |
| **Secondary** | `#475569` / `HSL(215, 16%, 37%)` | `#94A3B8` / `HSL(215, 20%, 65%)` | Subtext, secondary buttons, borders |
| **Background** | `#F8FAFC` / `HSL(210, 40%, 98%)` | `#0B0F19` / `HSL(222, 40%, 7%)` | Page canvas background |
| **Surface** | `#FFFFFF` / `HSL(0, 0%, 100%)` | `#111827` / `HSL(223, 47%, 11%)` | Cards, popups, side navigation |
| **Success** | `#16A34A` / `HSL(142, 76%, 36%)` | `#4ADE80` / `HSL(142, 71%, 73%)` | "Approved" tags, checkmarks |
| **Warning** | `#D97706` / `HSL(35, 92%, 43%)` | `#FBBF24` / `HSL(45, 93%, 47%)` | "Under Review", "Changes Requested" |
| **Destructive** | `#DC2626` / `HSL(0, 72%, 51%)` | `#F87171` / `HSL(0, 84%, 60%)` | "Rejected" tags, error boundaries |

---

## 3. Typography & Spacing Scale

### 3.1 Font Family
- **Primary:** `Inter`, sans-serif (Google Fonts).
- **Code/Markdown:** `Fira Code`, monospace.

### 3.2 Font Scale
- **Display 1:** `36px` / `2.25rem` (Bold, tracking tight) - Main dashboard headers.
- **Heading 1:** `24px` / `1.5rem` (SemiBold) - Page titles.
- **Heading 2:** `20px` / `1.25rem` (Medium) - Section headings.
- **Body Large:** `16px` / `1rem` (Regular) - Content, paragraphs.
- **Body Base:** `14px` / `0.875rem` (Regular) - Table columns, lists.
- **Subtext:** `12px` / `0.75rem` (Medium) - Tooltips, timestamps.

### 3.3 Spacing System
Standard tailwind-based spacing grid (factor of 4px):
- `xs` (4px): Inner item alignment.
- `sm` (8px): Button paddings, labels.
- `md` (16px): Card paddings, layout column gaps.
- `lg` (24px): Page side paddings.
- `xl` (32px): Major layout grid gaps.

---

## 4. Layout Architecture

### 4.1 Global Layout Blueprint (Three-Pane System)
- **Left Pane (Sidebar):** Persistent navigation. Fixed width: `260px`. collapsible to `72px` on smaller viewports.
- **Center Pane (Main Content Area):** Scrollable container. Automatically sizes up to a max-width of `1280px` to maintain line length readability.
- **Right Pane (Context/Timeline Inspector):** Present on decision detail screens. Shows discussions and action timelines. Width: `380px`.

### 4.2 Sidebar Structure
- **Top:** Corporate logo & EDRP title text.
- **Middle:** Hierarchical navigation links (Dashboard, My Decisions, Approvals Queue, Analytics, Settings).
- **Bottom:** Logged-in user profile pill with quick role toggle (for developers testing in sandbox) and Logout icon.

---

## 5. UI Component Standards

### 5.1 Buttons
- **Primary:** solid color, 4px rounded corners (`rounded-md`), subtle shadow. Scale up on hover (`scale-102`) with transitions: `transition-all duration-200`.
- **Secondary:** Outlined, border thickness `1px`.
- **Ghost:** No border or background, background transitions to translucent primary on hover.

### 5.2 Form Fields
- Label must float or sit clearly above inputs.
- Focused state must add a primary color border shadow ring: `focus:ring-2 focus:ring-primary/20`.
- Errors must render helper text in HSL Destructive color directly below the field.

### 5.3 Data Tables
- Row hover states must highlight row backgrounds (`hover:bg-slate-50` or `dark:hover:bg-slate-800/50`).
- Status columns must display colored badge pills:
  - *Approved:* Green background, green text.
  - *Under Review:* Orange/Yellow background, matching text.

---

## 6. Accessibility & Responsiveness

### 6.1 WCAG 2.1 Compliance Checklists
- **Contrast:** Ensure contrast ratios between text and background exceed 4.5:1.
- **Focus Indicators:** Interactive buttons/links must have visible `:focus-visible` ring outlines.
- **Semantic Tags:** Use `<main>`, `<nav>`, `<aside>`, `<header>`, and `<section>`.
- **Keyboard Navigation:** Dropdowns and modals must support Escape key to close, and Tab/Arrow keys to navigate options.

### 6.2 Responsive Breakpoints
- **Mobile (sm):** `< 640px` (Sidebar collapses to bottom bar, matrix switches to card list).
- **Tablet (md):** `640px - 1024px` (Sidebar collapsed to icons, table columns hidden dynamically).
- **Desktop (lg):** `1024px - 1280px` (Full layout visible, timeline pane collapses into a slide-over drawer).
- **Wide Desktop (xl):** `> 1280px` (Full triple-pane layout pinned open).
