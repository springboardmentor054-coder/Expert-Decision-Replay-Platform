# Root Repository Structure Specification - EDRP

* **File Name:** `repository_structure.md`
* **Folder Location:** `docs/development/`
* **Purpose:** Define EDRP's repository layout, files index, and top-level directory responsibilities.

---

## 1. Directory Tree Map

```tree
expert-decision-replay-platform/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions automated test & build workflows
├── .vscode/
│   ├── settings.json           # Workspace configurations for VS Code (Black, Prettier presets)
│   └── extensions.json         # Recommended extensions (ESLint, Ruff, Tailwind)
├── backend/                    # Python FastAPI monorepo application service code
│   ├── alembic/                # DB migrations
│   ├── app/                    # Code root
│   ├── tests/                  # Pytest unit & integration tests
│   ├── Dockerfile              # Backend container recipe
│   └── requirements.txt        # Backend dependencies
├── docker/                     # Environment orchestration profiles
│   ├── nginx/
│   │   └── default.conf        # Local reverse proxy routing presets
│   └── localstack/
│       └── init-s3.sh          # S3 local mocking initial setups
├── docs/                       # Complete Platform Documentation Repository
│   ├── api-design/
│   ├── architecture/
│   ├── audit/
│   ├── business-rules/
│   ├── config/
│   ├── database/
│   ├── decisions/
│   ├── deployment/
│   ├── diagrams/
│   ├── frontend/
│   ├── backend/
│   ├── notifications/
│   ├── project-planning/
│   ├── requirements/
│   ├── security/
│   ├── testing/
│   ├── ui-design/
│   ├── validation/
│   └── wireframes/
├── frontend/                   # React 19 Client SPA application code
│   ├── src/                    # Code root
│   ├── tests/                  # Frontend tests (Vitest / Playwright)
│   ├── Dockerfile              # Nginx web-serve container recipe
│   ├── package.json            # Node package configurations
│   └── tailwind.config.js      # Styling presets
├── scripts/                    # Automation and maintenance shell scripts
│   ├── setup.sh                # Interactive workspace initialization wrapper
│   └── seed_db.py              # Mock data database population helper
├── .env.example                # Global variables template
├── .gitignore                  # Git untracked files specification
├── CONTRIBUTING.md             # Guidelines for onboarding developers
├── docker-compose.yml          # Container stack orchestration profile
├── LICENSE                     # Open source / organization license file
└── README.md                   # Core project entrypoint
```

---

## 2. Directory Responsibilities

- **`.github/`:** Contains CI/CD integration configurations. Enforces lint checks, dependency vulnerability scans, and unit tests on every pull request targeting `develop` or `main`.
- **`backend/`:** Contains the Python API backend. Built using FastAPI for async execution, SQLAlchemy for database ORM operations, and Alembic for schema migrations.
- **`frontend/`:** Contains the React single-page application (SPA). Manages layout forms, alternatives matrices, timelines, and calls backend endpoints.
- **`docker/`:** Contains configuration files for services in the local environment, such as Nginx routing setups and S3 mock buckets.
- **`docs/`:** Holds the complete architectural and business specification documents for EDRP, providing a comprehensive design reference.
- **`scripts/`:** Contains utility scripts for setup automation, database seeding, and container maintenance tasks.
- **`docker-compose.yml`:** Defines the multi-container configuration to spin up the local development stack (PostgreSQL, Redis, Backend, Frontend) with a single command.
