# UI Component Library - EDRP

* **File Name:** `component_library.md`
* **Folder Location:** `docs/ui-design/`
* **Purpose:** Document properties, accessibility rules, styling options, and code patterns for reusable React UI components.

---

## 1. Core Actions & Inputs

### 1.1 Button Component
* **Purpose:** Trigger operations, submit forms, or navigate views.
* **Props:**
  - `label: string` (Button text content).
  - `variant: 'primary' | 'secondary' | 'ghost' | 'danger'` (Style presets).
  - `isLoading?: boolean` (Renders spinner and disables click events).
  - `disabled?: boolean` (Native HTML disabled state).
* **Accessibility:** Enforces `aria-busy` when loading and matches keyboard focus indicators (`focus-visible`).
* **Usage Guidelines:** Keep labels active and short (e.g. "Create Proposal", "Cancel").

### 1.2 TextInput Component
* **Purpose:** Capture single line user text input values.
* **Props:**
  - `name: string` (Form binding name).
  - `label: string` (Aria-linked text label).
  - `error?: string` (Displays validation message).
  - `type?: 'text' | 'email' | 'password'` (Defaults to `'text'`).
* **Accessibility:** Automatically links the label `htmlFor` matching the input `id`. Adds `aria-invalid="true"` when errors are present.

---

## 2. Layout & Navigation Elements

### 2.1 Navigation Sidebar
* **Purpose:** Render persistent navigation links for desktop layouts.
* **Props:**
  - `collapsed: boolean` (Toggles width between `260px` and `72px`).
  - `activePath: string` (Highlighted route marker).
* **Accessibility:** Wraps links in a `<nav>` tag with `aria-label="Main Navigation"`. Supports tab navigation across routes.

### 2.2 Breadcrumb
* **Purpose:** Display user's location within the portal hierarchy.
* **Props:**
  - `items: Array<{ label: string, path?: string }>` (Location path).
* **Accessibility:** Wraps elements in a `<nav aria-label="Breadcrumb">` tag.

---

## 3. Data Representation & Timelines

### 3.1 DecisionCard
* **Purpose:** Render summaries of decisions in grid listings.
* **Props:**
  - `title: string` (Decision header).
  - `status: DecisionStatus` (Draft, Approved, etc. Determines badge colors).
  - `category: string` (Category tags).
  - `ownerName: string` (Creator's name).
  - `createdAt: string` (Formatted timestamp).
* **Usage Guidelines:** Used inside the main repository dashboard grid.

### 3.2 ReplayTimeline
* **Purpose:** Render step-by-step decision history log replays.
* **Props:**
  - `steps: TimelineStep[]` (History snapshots list).
  - `activeStep: number` (Active step index).
  - `onStepClick: (idx: number) => void` (Click handler).
* **Accessibility:** Supports keyboard selection (Arrow keys) to navigate steps.

---

## 4. Overlay & Feedback Elements

### 4.1 Modal Dialog
* **Purpose:** Interrupt screen interactions for confirmations (e.g., delete actions, status revisions).
* **Props:**
  - `isOpen: boolean` (Visibility trigger).
  - `title: string` (Modal header).
  - `onClose: () => void` (Close event).
  - `children: React.ReactNode` (Body content).
* **Accessibility:** Focus trap binds focus within the modal. Pressing `Escape` triggers the `onClose` callback.

### 4.2 Skeleton Loader
* **Purpose:** Placeholder loading states before data loads.
* **Props:**
  - `type: 'card' | 'table' | 'line'` (Placeholder shapes).
  - `count?: number` (Repetition lines).
* **Usage Guidelines:** Renders automatically while TanStack Query is in the `isLoading` state.
