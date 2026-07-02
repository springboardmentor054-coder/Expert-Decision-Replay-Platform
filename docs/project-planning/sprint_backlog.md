# Agile Sprint Backlog & Delivery Plan - EDRP

* **File Name:** `sprint_backlog.md`
* **Folder Location:** `docs/project-planning/`
* **Purpose:** Outline sprint objectives, tasks, estimates (story points), and delivery constraints for EDRP implementation.

---

## 1. Definition of Done (DoD)

A backlog task is completed only when it meets the following criteria:
- **Code Quality:** Written in TypeScript/Python with type annotations, and passes local lint and format checks.
- **Testing:** Unit/Integration test coverage exceeds **80%** for new code.
- **Review:** Code is reviewed and approved by at least one team member.
- **CI/CD:** Code builds successfully and passes all checks in the CI pipeline.
- **Documentation:** Inline comments are updated, and external API specifications are updated if API changes occurred.

---

## 2. Sprint Backlog Schedule (Sprints 1 - 8)

### 2.1 Sprint 1: Project Initialization & Blueprints (Completed)
- **Sprint Goal:** Establish repository, directories, environment configurations, and documentation.
- **Tasks:**
  - Create directory structures for backend, frontend, docs, and docker. (High, 5 SP)
  - Generate Requirements, Database schemas, API, and Security guides. (High, 8 SP)
  - Configure global linter presets, git branching rules, and contributing guides. (Medium, 3 SP)
- **Deliverables:** Main documentation indexes, configurations templates, and UML designs.

---

### 2.2 Sprint 2: Database Setup & Authentication Backend (Week 3)
- **Sprint Goal:** Setup PostgreSQL database connections and JWT authentication APIs.
- **Tasks:**
  - Initialize PostgreSQL databases. Set up SQLAlchemy ORM models. (High, 5 SP)
  - Configure Alembic migrations. Verify initial table generation. (High, 3 SP)
  - Write User schema validation. Implement password hashing via bcrypt. (High, 3 SP)
  - Develop POST `/auth/login`, `/auth/refresh` and User retrieval routes. (High, 5 SP)
- **Dependencies:** Database container environment configured.
- **Deliverables:** Working Auth APIs, database schemas, and migration history.

---

### 2.3 Sprint 3: Core Decision Management Backend (Week 4)
- **Sprint Goal:** Build the decision lifecycle API and implement S3 upload features.
- **Tasks:**
  - Develop Decision schema logic, CRUD routes, and category query filters. (High, 5 SP)
  - Set up S3 connection configurations and develop Presigned POST URL endpoints. (High, 5 SP)
  - Build Alternative creation and score calculation routines. (Medium, 5 SP)
  - Implement basic DB full-text search indexing on Title/Problem fields. (Medium, 3 SP)
- **Dependencies:** Sprint 2 (Auth/DB setup) completed.
- **Deliverables:** CRUD API endpoints for decisions, alternatives matrix creation, and direct S3 uploads.

---

### 2.4 Sprint 4: Discussion Threads & Approval Engine (Week 5)
- **Sprint Goal:** Develop comment threads and the approval workflow state machine.
- **Tasks:**
  - Develop comment and reply models with hierarchical nesting support. (High, 5 SP)
  - Build Workflow State Engine (transitions: Draft -> Review -> Approved -> Rejected). (High, 8 SP)
  - Implement Redis locking to prevent concurrent double-approvals. (Medium, 5 SP)
  - Write email notification alerts scheduler. (Low, 3 SP)
- **Dependencies:** Sprint 3 (Decision APIs) completed.
- **Deliverables:** API routes for comment posting/replying, workflow status updates, and email dispatches.

---

### 2.5 Sprint 5: Frontend Scaffold & User Authentication (Week 6)
- **Sprint Goal:** Scaffold the React SPA and integrate registration and login views.
- **Tasks:**
  - Scaffold Vite React project. Set up Tailwind, routing and layout components. (High, 5 SP)
  - Implement Auth provider context, LoginPage and Profile forms. (High, 5 SP)
  - Develop Dashboard components: metric cards, user action lists. (Medium, 5 SP)
- **Dependencies:** Backend Auth APIs (Sprint 2) completed.
- **Deliverables:** Functional frontend login flow and base portal navigation.

---

### 2.6 Sprint 6: Frontend Decision & Alternative Interfaces (Week 7)
- **Sprint Goal:** Implement decision details, the alternatives matrix, and timeline replays.
- **Tasks:**
  - Integrate backend APIs using Axios and TanStack Query. (High, 5 SP)
  - Implement Decision Creation form with Drag-and-drop file upload. (High, 8 SP)
  - Build the Alternatives Score Matrix comparison interface. (Medium, 5 SP)
  - Implement the **Chronological Replay Timeline** UI using Framer Motion. (High, 8 SP)
- **Dependencies:** Backend Decision APIs (Sprint 3 & 4) completed.
- **Deliverables:** Interactive pages for creating decisions, comparing alternatives, and replaying history.

---

### 2.7 Sprint 7: System Integration & QA Auditing (Week 7)
- **Sprint Goal:** Perform system integration, bug fixing, and end-to-end testing.
- **Tasks:**
  - Run Playwright E2E browser test scenarios (Login, Create, Review, Approve). (High, 5 SP)
  - Implement dashboard analytics widgets and export PDF summaries. (Medium, 5 SP)
  - Resolve edge cases and bugs identified during integration testing. (High, 5 SP)
- **Dependencies:** Sprints 1-6 completed.
- **Deliverables:** Fully integrated application, passing test suites, and PDF export features.

---

### 2.8 Sprint 8: Production Release & CI/CD Pipeline (Week 8)
- **Sprint Goal:** Configure Docker containers, setup CI/CD pipelines, and prepare final release.
- **Tasks:**
  - Finalize Nginx configurations, Dockerfiles, and docker-compose files. (High, 5 SP)
  - Setup CI/CD pipeline runs on GitHub Actions. (High, 5 SP)
  - Perform stress tests with Locust and run security reviews. (Medium, 3 SP)
  - Prepare project documentation slides and final presentation. (Low, 3 SP)
- **Dependencies:** Sprint 7 completed.
- **Deliverables:** Dockerized services, automated release pipeline, and project presentation.
