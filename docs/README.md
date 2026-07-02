# Expert Decision Replay Platform (EDRP) - Documentation Index

Welcome to the enterprise-grade documentation repository for the **Expert Decision Replay Platform (EDRP)**, built as part of the Infosys Springboard Internship.

The platform is a mission-critical, enterprise-grade system designed to capture, archive, search, and replay high-impact organizational decisions. It acts as a hybrid of Jira (workflows), Confluence/Notion (rich documentation), Google Docs (collaborative inputs), and audit/compliance systems to ensure that institutional knowledge is preserved and reviewable.

---

## 1. Directory Structure

The EDRP documentation is organized into modular sections matching professional enterprise software standards:

```tree
docs/
├── README.md                           # Main Documentation Index
├── requirements/
│   └── requirements_specification.md   # Functional, Non-functional, & Business Requirements
├── architecture/
│   └── architecture_design.md          # High/Low Level Architecture & Tech Stack Decisions
├── database/
│   └── database_design.md              # Database Schema, Data Dictionary, & ERD
├── api-design/
│   └── api_specification.md            # REST API Specification (Endpoints, Reqs, Resps)
├── security/
│   └── security_specification.md       # JWT Auth, RBAC, Encryption, & OWASP Protections
├── workflows/
│   └── business_workflows.md           # Visual & Functional Business Process Workflows
├── ui-design/
│   └── ui_ux_guidelines.md             # Color Palette, Typography, Components & Dark Mode Guidelines
├── wireframes/
│   └── wireframe_layouts.md            # Wireframe Mockups for key application pages
├── testing/
│   └── testing_strategy.md             # Unit, Integration, E2E Testing Plans & Folder Layout
├── deployment/
│   └── deployment_guide.md             # Docker, CI/CD Actions, and Env Configuration
├── project-planning/
│   └── project_schedule.md             # Milestones, Weekly Roadmaps, and Risk Register
├── diagrams/
│   └── system_diagrams.md              # Compiled Mermaid diagrams (ERD, Architecture, Flows)
└── decisions/
    └── adr_template.md                 # Architecture Decision Record (ADR) Log & Template
```

---

## 2. Documentation Modules Quick Access

Click the links below to access the complete, production-ready specifications for each module:

| Document | Folder Location | Description |
| :--- | :--- | :--- |
| [Requirements Specification](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/requirements/requirements_specification.md) | `docs/requirements/` | System Scope, Objectives, Functional/Non-Functional Specs, User Stories, and Roles Matrix. |
| [Architecture & Design](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/architecture/architecture_design.md) | `docs/architecture/` | High/Low Level Architecture, Tech Decisions, Folder Structure and Scalability Plan. |
| [Database Schema & Dictionary](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/database/database_design.md) | `docs/database/` | PostgreSQL tables, data dictionary, naming conventions, and migrations. |
| [API Specification](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/api-design/api_specification.md) | `docs/api-design/` | Complete REST API definition, including requests, responses, status codes, and validations. |
| [Security Specification](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/security/security_specification.md) | `docs/security/` | Authentication strategy, JWT, RBAC mapping, OWASP protection, and encryption. |
| [Business Workflows](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/workflows/business_workflows.md) | `docs/workflows/` | Sequence flows for Registration, Approvals, Replays, and Versioning. |
| [UI & UX Guidelines](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/ui-design/ui_ux_guidelines.md) | `docs/ui-design/` | Design system tokens, color palettes, typography, responsive breakpoints, and dark mode standards. |
| [Wireframe Layouts](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/wireframes/wireframe_layouts.md) | `docs/wireframes/` | Mockup schemas for EDRP dashboards, search tools, details screens, and approvals. |
| [Testing Strategy](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/testing/testing_strategy.md) | `docs/testing/` | Test suites, folder structure, and QA execution guidelines. |
| [Deployment & Devops Plan](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/deployment/deployment_guide.md) | `docs/deployment/` | Docker Compose specs, CI/CD workflows, Environment variables, and release plans. |
| [Project Planning & Milestones](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/project-planning/project_schedule.md) | `docs/project-planning/` | Week 1 to 8 roadmaps, RACI matrix, and the organizational risk register. |
| [System Diagrams](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/diagrams/system_diagrams.md) | `docs/diagrams/` | Mermaid Diagrams for Architecture, ERD, Sequence, and Workflows. |
| [ADR Log & Template](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/decisions/adr_template.md) | `docs/decisions/` | Architectural Decision Record template and logs for critical design decisions. |

---

## 3. Technology Stack Summary

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios, TanStack Query, React Hook Form, Zod, Framer Motion, Shadcn UI / HeroUI
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, JWT/OAuth2, Uvicorn
- **Database**: PostgreSQL (Relational storage)
- **Caching**: Redis (Session cache, token blacklist, query caching, rate-limiting)
- **Storage**: AWS S3 or LocalStack (for PDF, document evidence storage)
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD

---

## 4. User Roles Overview

1. **Employee**: Drafts decisions, uploads supporting assets, inputs alternatives, participates in discussion, and monitors status.
2. **Reviewer**: Evaluates decision compliance, reviews alternatives, leaves comments, and marks items as reviewed.
3. **Manager**: Reviews escalated decisions, provides final approvals, monitors team analytics, and generates reports.
4. **Administrator**: Manages organizational directory, user accounts, system configuration, categories, and system-wide audit logging.
