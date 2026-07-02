# Project Plan, Roadmap & Milestones - EDRP

* **File Name:** `project_schedule.md`
* **Folder Location:** `docs/project-planning/`
* **Purpose:** Define deliverables, milestone markers, risk registry, team roles, and weekly task schedules from Week 1 to Week 8.

---

## 1. Project Milestones

| Milestone ID | Target Date | Title / Output | Focus |
| :--- | :--- | :--- | :--- |
| **M1** | End of Week 2 | System Specifications & Blueprints | Requirements, Database & API specs completed (Complete Repository Setup). |
| **M2** | End of Week 4 | Backend Core Services & Schema | Auth APIs, Decision model, DB schema & Seed data ready. |
| **M3** | End of Week 6 | Frontend Integration & Workflows | Dashboard views, Alternatives Matrix, timeline replays. |
| **M4** | End of Week 7 | System Integration & Testing | E2E validation, load benchmarks, security audits. |
| **M5** | End of Week 8 | Production Delivery & Deployment | Docker Orchestration, CD pipelines, project presentation. |

---

## 2. Weekly Roadmap (Week 1 - Week 8)

### 2.1 Week 1 & Week 2 (System Blueprints & Requirements Analysis) - CURRENT
- **Deliverables:**
  - Create standard repo structure and configure workspace configuration files.
  - Draft complete Requirements Specs, System Scope and NFRs.
  - Complete DB Model drafts, migrations mapping, and indexes.
  - Complete REST API specification contracts.
  - Detail Security parameters, JWT logic, and CORS configs.
  - Compile workflow flowcharts and UI Style guides.
  - *Status:* **100% Completed**.

### 2.2 Week 3 (Database setup & Authentication Backend)
- **Tasks:**
  - Initialize PostgreSQL databases. Set up SQLAlchemy ORM models.
  - Configure Alembic migrations and verify early model creation.
  - Write User schema validation. Implement password hashing via bcrypt.
  - Develop POST `/auth/login`, `/auth/refresh` and User retrieval routes.

### 2.3 Week 4 (Core Decision Management Backend)
- **Tasks:**
  - Develop Decision schema logic, CRUD routes, and category query filters.
  - Set up S3 connection configurations and develop Presigned POST URL endpoints.
  - Build Alternative creation and score calculation routines.
  - Implement basic DB full-text search indexing on Title/Problem fields.

### 2.4 Week 5 (Discussion & Approval Backend)
- **Tasks:**
  - Develop comment and reply models with hierarchical nesting support.
  - Build Workflow State Engine (transitions: Draft -> Review -> Approved -> Rejected).
  - Implement Redis locking to prevent concurrent double-approvals.
  - Write email notification alerts scheduler.

### 2.5 Week 6 (Frontend UI Implementation - Pages & Context)
- **Tasks:**
  - Scaffold Vite React project. Set up Tailwind, routing and layout components.
  - Implement Auth provider context, LoginPage and Profile forms.
  - Develop Dashboard components: metric cards, user action lists.
  - Develop Decision catalog search grids and filter panels.

### 2.6 Week 7 (Frontend Integration & Timeline Replays)
- **Tasks:**
  - Integrate backend APIs using Axios and TanStack Query.
  - Implement Decision Creation form with Drag-and-drop file upload.
  - Build the Alternatives Score Matrix comparison interface.
  - Implement the **Chronological Replay Timeline** UI using Framer Motion.
  - Run Unit tests and fix QA bugs.

### 2.7 Week 8 (Deploy, QA Benchmarks, Delivery)
- **Tasks:**
  - Finalize Nginx configurations, Dockerfiles, and docker-compose files.
  - Setup CI/CD pipeline runs on GitHub Actions.
  - Perform stress tests with Locust and run security reviews.
  - Prepare project documentation slides and final presentation.

---

## 3. Project Risk Register

| Risk ID | Risk Description | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **R-1** | High latency on deep nested comment threads queries. | Medium | Medium | Limit nested discussion rendering depth to 3 levels. Use recursive SQL CTEs to resolve hierarchies fast. |
| **R-2** | Leakage of corporate decision files stored on S3. | High | Low | Enforce strict private bucket access. Disable public reading; serve files exclusively via backend-generated temporary presigned URLs (15m expiration). |
| **R-3** | Concurrency issues in approval transitions (double approvals). | Medium | Low | Use PostgreSQL row locks (`SELECT FOR UPDATE`) or Redis locks during status change execution. |
| **R-4** | Inconsistent schema migration versions across developer local environments. | Medium | High | Enforce all schema adjustments to pass through Alembic revisions. Running migrations must be part of the Docker start processes. |

---

## 4. Team Responsibilities Matrix (RACI)

- **R:** Responsible (Does the work)
- **A:** Accountable (Approves the work)
- **C:** Consulted (Provides input)
- **I:** Informed (Kept updated)

| Role / Phase | Req Specs | DB Design | API Dev | Frontend | DevOps | testing |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Principal Architect** | A | A | A | C | A | C |
| **Lead Backend Dev** | C | R | R | I | R | R |
| **Lead Frontend Dev** | C | I | C | R | I | R |
| **QA / Tester** | I | I | C | C | I | A |
| **Project Manager** | R | I | I | I | I | I |
