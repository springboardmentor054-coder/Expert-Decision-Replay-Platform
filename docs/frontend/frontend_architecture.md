# Frontend Folder Architecture - EDRP

* **File Name:** `frontend_architecture.md`
* **Folder Location:** `docs/frontend/`
* **Purpose:** Define React 19/Vite project structure, feature-sliced directory rules, routing configurations, global state, and hooks patterns.

---

## 1. Directory Tree Representation

```tree
frontend/
├── public/                     # Static files (favicons, manifest)
├── src/
│   ├── assets/                 # Shared images, vectors, style variables
│   │   ├── logo.svg
│   │   └── index.css           # Global Tailwind declarations
│   ├── components/             # Reusable Global UI Elements (Shadcn/HeroUI)
│   │   ├── ui/                 # Atomic elements (buttons, inputs, badges)
│   │   ├── layout/             # Framework structures (Sidebar, Header, Container)
│   │   └── feedback/           # Modals, Toast systems, loaders
│   ├── context/                # Global React Contexts (Auth, Theme)
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── features/               # Feature-sliced application sub-modules
│   │   ├── auth/               # Login, registration, profile updating
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── pages/
│   │   ├── decisions/          # Lists, creation wizard, details replay
│   │   ├── approvals/          # Verification list, checklist audit workspace
│   │   └── discussion/         # Comments threads, nested replies
│   ├── hooks/                  # Global hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── routes/                 # Routing configurations & guard middleware
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/               # API clients, axios configurations, interceptors
│   │   ├── apiClient.ts        # Axios setup with authorization inject
│   │   └── endpoints/          # Sub-service clients
│   ├── types/                  # Shared TypeScript models and definitions
│   │   ├── index.ts            # Export aggregations
│   │   ├── user.ts
│   │   └── decision.ts
│   ├── App.tsx                 # Base wrapper, Providers setup
│   └── main.tsx                # Client bootstrap entrypoint
├── package.json                # Dependencies manifest
├── tsconfig.json               # TypeScript configurations
├── tailwind.config.js          # Tailwind styling presets
└── vite.config.ts              # Vite configurations
```

---

## 2. Feature-Sliced Architecture

EDRP implements a **feature-based** organization model under `src/features/`. Each feature encapsulates its own business components, custom local hooks, types, and sub-pages:
- **`components/`**: Views specific to that feature (e.g. `DecisionTimeline.tsx` inside `features/decisions/components/`).
- **`hooks/`**: Specialized local data-fetching hooks (e.g. `useGetDecision.ts`).
- **`pages/`**: Complete page containers loaded by the Router (e.g. `DecisionDetailsPage.tsx`).

*Rule:* Components in one feature must never import local components from another feature directly. For shared behaviors, extract the component to `src/components/` or expose a public interface using a shared module definition.

---

## 3. Routing & Route Guarding

- **Router:** React Router v7 / v6 configured in `src/routes/AppRoutes.tsx`.
- **Layout Route wrapping:** Core layout template (`src/components/layout/DashboardLayout.tsx`) wraps all nested authenticated routes to render the Sidebar and Topbar.
- **Route Guards (`src/routes/ProtectedRoute.tsx`):**
  - Wraps routes requiring authentication. If the context has no active token, redirects users to `/login`.
  - Enforces role-based path validation. For example, the path `/admin/*` is restricted by verifying `user.role === 'Administrator'`.

---

## 4. State Management Strategy

To minimize complex state tracking, EDRP splits state management:
* **Server State (Caching):** Managed via **TanStack Query** (`@tanstack/react-query`). Caches API responses, handles auto-refreshes, invalidates cache keys upon mutation (e.g. invalidating query keys `['decision', id]` after posting a comment), and handles loading/error states.
* **Global App State:** Implemented via **React Context** (lightweight storage) for Auth states (logged-in profiles, JWT keys) and Theme configs (dark/light toggles).
* **Local View State:** Standard `useState` and `useReducer` inside components for local interactions (e.g., toggle active tabs, open/close modals).
* **Form States:** Managed via **React Hook Form** with **Zod** schema validations.

---

## 5. API Services & Axios Client

- **Client Setup (`src/services/apiClient.ts`):** Creates an Axios instance with base URL configuration, headers configuration, and interceptors.
- **Request Interceptor:** Dynamically injects the `Authorization: Bearer <token>` header from local/session storage.
- **Response Interceptor:** Intercepts `401 Unauthorized` responses. If an expired token error occurs, it attempts to fetch a new access token via `/auth/refresh` using the stored refresh token. If the refresh fail, it cleanses context and redirects the browser to the login screen.
