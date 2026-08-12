# Expert Decision Replay Platform (EDRP)

A full-stack platform for organizations to capture, review, approve, and replay important decisions — from the initial problem statement through alternatives analysis, discussion, approval, and version history — with a full audit trail.

---

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture / Project Structure](#system-architecture--project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Docker](#docker)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Team](#team)
- [Future Improvements](#future-improvements)

---

## Description

EDRP gives teams a structured place to record a decision, weigh alternatives, discuss it with stakeholders, route it through an approval workflow, and keep a full version/audit history of everything that happened — so past decisions can be searched, understood, and learned from later instead of living in scattered chat threads and documents.

## Features

- **Authentication** — email/password registration & login (JWT), Google & Apple sign-in, strong password validation
- **Role-based access** — `Admin`, `Approver`, `Decision Reviewer`, `Team Member`, `User`. Every role can view all pages; only `Approver`/`Admin` can approve or reject decisions, and only `Admin` can manage roles
- **Decision management** — create/edit/delete decisions, category tagging, status lifecycle (`Draft → Under Review → Approved/Rejected`)
- **Alternatives** — record and compare multiple options per decision (cost, risk, feasibility)
- **Documents** — upload/download/delete supporting files per decision (type & size validated)
- **Discussions** — threaded comments on each decision
- **Version history** — every edit to a decision automatically snapshots a new version
- **Approval workflow** — single-step approval; submitting a decision auto-creates an approval record and notifies all Approvers
- **Notifications** — live-polling toast alerts + unread badge, with per-category mute preferences
- **Audit logs** — a full trail of who did what and when across the platform
- **Reports** — decision, approval, team, and audit reports
- **Dashboard** — summary stats, charts, recent activity, and role-specific panels
- **Profile & Settings** — editable profile with activity stats, profile picture upload, notification preferences, layout density, font size/style, default landing page

## Technology Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Axios
- Recharts (dashboard charts)
- Plain CSS per component (Forest Green theme, fully responsive, no UI framework)

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- JWT auth (`python-jose`) + `passlib` (pbkdf2_sha256) password hashing
- Pydantic v2 request/response schemas

**Infrastructure**
- Docker + Docker Compose (backend, frontend, Postgres)
- Deployed via [Render](https://render.com) (see [`render.yaml`](./render.yaml))

## System Architecture / Project Structure

```
Rupavathi/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, startup seed data
│   │   ├── database/            # SQLAlchemy engine/session (connection.py)
│   │   ├── models/               # SQLAlchemy models (one file per table)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── routers/              # One router per resource (auth, users, decisions, ...)
│   │   └── utils/                # security (JWT/hashing), dependencies, audit/notification helpers
│   ├── uploads/                  # Uploaded documents & avatars (gitignored, volume-mounted in Docker)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                # One component per route
│   │   ├── components/           # Shared UI (Sidebar, Navbar, CustomSelect, Avatar, ...)
│   │   ├── context/               # AuthContext, ToastContext, PreferencesContext
│   │   ├── services/api.js       # Centralized Axios client + per-resource API modules
│   │   └── App.jsx               # Route table
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
├── render.yaml                   # Render Blueprint (backend + frontend + Postgres)
├── ER_diagram/ER_diagram.png
├── Features/features.md
└── Users/users.md
```

The backend follows a standard layered structure: **router → schema (validation) → model (persistence)**, with cross-cutting concerns (JWT auth, audit logging, notifications) in `utils/`. The frontend is a single-page app with one page component per route, a centralized Axios API layer, and React Context for auth/toasts/user preferences — no global state library.

## Prerequisites

- Python 3.12+ (3.11+ works; the Docker image uses 3.12-slim)
- Node.js 20+
- PostgreSQL 14+ (or Docker, to run it in a container instead)
- Docker Desktop (optional, only needed for the containerized workflow)

## Installation

```bash
git clone https://github.com/springboardmentor054-coder/Expert-Decision-Replay-Platform.git
cd Expert-Decision-Replay-Platform/Rupavathi
```

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

**Frontend**
```bash
cd frontend
npm install
```

## Environment Variables

Copy each `.env.example` to `.env` in the same folder and fill in real values.

**`backend/.env`**

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET_KEY` | Secret used to sign auth tokens — generate with `python -c "import secrets; print(secrets.token_hex(32))"` | Yes |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | Only for Google sign-in |
| `APPLE_SERVICES_ID` | Apple Services ID | Only for Apple sign-in |

**`frontend/.env`**

| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | Only for Google sign-in |
| `VITE_APPLE_SERVICES_ID` | Apple Services ID | Only for Apple sign-in |
| `VITE_APPLE_REDIRECT_URI` | Apple sign-in return URL (must be HTTPS in production) | Only for Apple sign-in |

`.env` files are git-ignored — never commit real secrets. Only the `.env.example` files (with blank/placeholder values) are tracked.

## Running the Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
Runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

On first startup, the app auto-creates all tables (`Base.metadata.create_all`) and seeds default categories and roles if they don't already exist.

## Running the Frontend

```bash
cd frontend
npm run dev
```
Runs at `http://localhost:5173`. The backend's CORS is keyed off `CORS_ORIGINS`, so make sure it includes whatever origin the frontend is actually served from.

## Database Setup

The project uses PostgreSQL and does **not** use a migration tool (no Alembic) — schema is created via SQLAlchemy's `Base.metadata.create_all`, which creates missing tables but does **not** alter existing ones. If you change a model's columns after tables already exist, you need a manual migration script (see `backend/migrate_*.py` for examples of the pattern used in this project).

1. Create a Postgres database matching your `DATABASE_URL` (e.g. `expert_decision_replay_db`)
2. Start the backend once — tables and default seed data (categories, roles) are created automatically

## API Documentation

The backend is built with FastAPI, which auto-generates interactive API documentation from the route definitions and Pydantic schemas:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Major endpoint groups (see `/docs` for the full, current list with request/response models):

| Group | Prefix | Notes |
|---|---|---|
| Auth | `/auth` | register, login, Google/Apple sign-in |
| Users | `/users` | profile, avatar, password, notifications (self or Admin only for writes) |
| Roles | `/roles` | list (any authenticated user), create/delete (Admin only) |
| Decisions | `/decisions` | CRUD + nested alternatives/documents/comments/approvals/versions |
| Alternatives | `/alternatives` | CRUD |
| Documents | `/documents` | upload/list/download/delete |
| Comments | `/comments` | CRUD (discussions) |
| Approvals | `/approvals` | approve/reject |
| Decision Versions | `/decision-versions` | version history |
| Notifications | `/notifications` | list, mark read |
| Audit Logs | `/audit-logs` | full activity trail |
| Reports | `/reports` | decision/approval/team/audit reports |
| Dashboard | `/dashboard` | summary, charts, analytics |
| Categories | `/categories` | decision categories |

All endpoints except `/auth/*` require a `Bearer` JWT in the `Authorization` header.

## Docker

Each service has its own Dockerfile, and `docker-compose.yml` wires backend + frontend + Postgres together for local full-stack testing:

```bash
cd Rupavathi
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`

The backend container reads secrets from `backend/.env` via `env_file`; `DATABASE_URL` is overridden inside `docker-compose.yml` to point at the `db` service instead of `localhost`. Uploaded files persist in a named volume (`backend_uploads`) across container restarts.

## Deployment

Deployed via [Render](https://render.com) using the [`render.yaml`](./render.yaml) Blueprint, which provisions three services in one step:

1. A managed Postgres database
2. The backend as a Docker web service (built from `backend/Dockerfile`)
3. The frontend as a static site (`npm run build` → served from `frontend/dist`)

**To deploy:**
1. Push this repo to GitHub (already connected: `springboardmentor054-coder/Expert-Decision-Replay-Platform`, branch `Rupavathi`)
2. In the Render dashboard: **New +** → **Blueprint** → select this repo/branch
3. Render auto-detects `render.yaml` and provisions all three services, wiring `DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, and `VITE_API_BASE_URL` automatically
4. Optionally set `GOOGLE_CLIENT_ID` / `APPLE_SERVICES_ID` (and their `VITE_` frontend equivalents) in the dashboard if OAuth sign-in is needed in production

**Deployed URLs:** _add your live Render URLs here once deployed —_
- Frontend: `https://edrp-frontend.onrender.com`
- Backend: `https://edrp-backend.onrender.com`

## Screenshots

_Add screenshots of the Login, Dashboard, Decision Detail, and Approval flow here before submission — e.g. `![Dashboard](./screenshots/dashboard.png)`._

An entity-relationship diagram of the database is available at [`ER_diagram/ER_diagram.png`](./ER_diagram/ER_diagram.png).

## Team

_Add team member names and roles here._

## Future Improvements

- Automated test suite (unit + integration) checked into CI
- PDF/Excel/CSV export for reports
- Search across decisions, documents, and comments
- Multi-level / configurable approval chains (currently single-step: Approver or Admin)
- Real-time updates via WebSockets instead of notification polling
- Object storage (e.g. S3) for uploaded documents/avatars instead of local disk, so uploads survive redeploys without a persistent volume
