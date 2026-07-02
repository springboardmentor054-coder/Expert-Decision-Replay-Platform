# Testing Strategy & QA Plan - EDRP

* **File Name:** `testing_strategy.md`
* **Folder Location:** `docs/testing/`
* **Purpose:** Define quality control processes, testing levels, test suites execution, automation structure, and coverage objectives.

---

## 1. Testing Strategy Overview

The testing strategy for EDRP is based on the **Testing Pyramid**, focusing heavily on automated unit and integration tests to support rapid development cycles, backed by targeted end-to-end UI tests and security assessments.

```
       /\
      /  \      UI / E2E (Playwright)  -> ~10% of tests
     /----\
    /      \    API / Integration      -> ~30% of tests
   /--------\
  /          \  Unit Tests (Pytest)    -> ~60% of tests
 /____________\
```

- **Target Coverage:** Minimum **80% code coverage** on all business logic (backend services, repository queries, frontend utility functions).
- **CI/CD Integration:** Tests are executed automatically on every GitHub Pull Request. Merging to `development` is blocked if any test fails or coverage drops.

---

## 2. Testing Levels

### 2.1 Backend Unit Testing
- **Framework:** `pytest` along with `pytest-asyncio` for asynchronous endpoint testing.
- **Mocking:** Use standard `unittest.mock` to isolate service models from external networks (e.g. AWS S3 API calls, SMTP servers).
- **Scope:** Validation of schema properties, alternative calculation logic, and utility helper operations.

### 2.2 Integration & API Testing
- **Database Isolation:** Use a separate PostgreSQL test database (e.g., initialized via Docker). Databases are wiped and re-migrated (`alembic upgrade head`) before runs, and each test runs inside a rolled-back transaction to ensure test isolation.
- **Framework:** `TestClient` provided by FastAPI to run integration requests directly.
- **Scope:** Route permissions, JWT validation, database relationship constraints, and cascade delete operations.

### 2.3 Frontend UI & E2E Testing
- **Framework:** `Vitest` and `React Testing Library` for React component unit tests. `Playwright` for E2E user workflow tests.
- **E2E Scopes:**
  - Standard user login and token persistence.
  - Decision Creation Form submission and file upload flow (mocking S3 upload endpoints).
  - Decision Replay Timeline rendering.

### 2.4 Performance & Stress Testing
- **Tool:** `Locust` (Python-based load testing framework).
- **Scenario:** Simulating 500 concurrent users searching the knowledge repository and logging comments.
- **Target Metrics:**
  - 95% of read requests must resolve under 200ms.
  - 99% of read requests must resolve under 500ms.
  - Database CPU utilization remains below 70% under peak simulated loads.

### 2.5 Security Testing
- **Static Analysis:** `Bandit` (Python SAST) and `ESLint-plugin-security` (JS/TS SAST).
- **Dependency Scan:** `pip-audit` for Python libraries and `npm audit` for frontend packages.
- **API Fuzzing:** Automated REST API scanning using OWASP ZAP to check for improper input sanitization, XSS vectors, and access control bypasses.

---

## 3. Test Folder Structure

The tests are physically colocated within the respective backend and frontend code bases:

```tree
Expert-Decision-Replay-Platform/
├── backend/
│   └── tests/
│       ├── conftest.py             # Pytest fixtures (DB sessions, app clients, mock tokens)
│       ├── api/                    # Endpoint tests
│       │   ├── test_auth.py
│       │   ├── test_decisions.py
│       │   └── test_approvals.py
│       ├── services/               # Core business logic tests
│       │   └── test_alternative_score.py
│       └── utils/                  # Cryptography and helper tests
│           └── test_jwt.py
└── frontend/
    └── tests/
        ├── setup.ts                # Test environment hooks
        ├── components/             # Component rendering tests
        │   └── DecisionCard.test.tsx
        └── e2e/                    # Playwright browser automation tests
            ├── login.spec.ts
            └── decision_workflow.spec.ts
```

---

## 4. Test Execution Guide

### 4.1 Running Backend Tests
Execute commands from the `/backend` directory:
```bash
# Run all tests with coverage reporting
pytest --cov=app --cov-report=term-missing tests/
```

### 4.2 Running Frontend Tests
Execute commands from the `/frontend` directory:
```bash
# Run Vitest unit tests
npm run test

# Run Playwright E2E browser tests
npx playwright test
```
