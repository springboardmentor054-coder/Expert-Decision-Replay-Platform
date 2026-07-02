# Backend Folder Architecture - EDRP

* **File Name:** `backend_architecture.md`
* **Folder Location:** `docs/backend/`
* **Purpose:** Specify directory responsibilities, clean architecture package boundaries, dependency rules, and request lifecycles for the FastAPI application.

---

## 1. Directory Tree Representation

```tree
backend/
├── alembic/                    # Database migrations scripts
│   ├── versions/               # Chronological schema versions
│   ├── env.py                  # Alembic setup configuration
│   └── script.py.mako          # Migration template
├── app/
│   ├── api/                    # Presentation Layer (API Routers)
│   │   ├── deps.py             # FastAPI Dependencies (Auth, Session, DB)
│   │   └── v1/
│   │       ├── endpoints/      # API endpoints (auth, decisions, audit)
│   │       └── router.py       # Main Router compiler
│   ├── core/                   # Shared Configuration & Infrastructure Core
│   │   ├── config.py           # Pydantic BaseSettings loader
│   │   ├── database.py         # SQLAlchemy engine and SessionLocal setup
│   │   ├── security.py         # JWT tokens & Bcrypt hashing helpers
│   │   └── exceptions.py       # Base error handlers
│   ├── models/                 # Data Layer - SQLAlchemy Entities
│   │   ├── user.py
│   │   ├── decision.py
│   │   └── audit.py
│   ├── schemas/                # Contract Layer - Pydantic DTO validation
│   │   ├── user.py
│   │   ├── decision.py
│   │   └── audit.py
│   ├── repositories/           # Data Access Layer - DB queries abstraction
│   │   ├── base.py             # CRUD generic class definition
│   │   ├── user_repo.py
│   │   └── decision_repo.py
│   ├── services/               # Domain Layer - Pure business logic rules
│   │   ├── user_service.py
│   │   ├── decision_service.py
│   │   └── approval_service.py
│   └── main.py                 # Application Bootstrap
├── tests/                      # Automated Test Suite
│   ├── conftest.py             # Shared fixtures
│   ├── api/
│   └── services/
├── Dockerfile                  # Container definition
├── requirements.txt            # Dependency definitions
└── alembic.ini                 # Alembic configuration
```

---

## 2. Folder and Package Responsibilities

* **`app/api/` (Presentation Layer):** Exposes HTTP routes. Responsible strictly for parsing query/path parameters, calling FastAPI dependency injections (e.g., verifying JWTs), delegating execution to the Service Layer, and returning mapped Pydantic models. It must not execute SQL or contain complex business validation.
* **`app/core/` (Infrastructure Core):** Bootstraps configurations (reading system environment variables), initializes database engines, provides global encryption/JWT helpers, and manages global exception hooks.
* **`app/models/` (Data Layer Models):** Defines SQLAlchemy Declarative Base mappings representing physical database tables. Contains database relationship declarations (e.g., `back_populates`).
* **`app/schemas/` (Pydantic DTOs):** Defines runtime data contracts for inputs and outputs. Ensures clean validation of fields (e.g., formatting email strings, parsing nested types).
* **`app/repositories/` (Data Access Abstraction):** Implements the Repository Pattern. Focuses exclusively on reading and writing from PostgreSQL. Isolates complex SQLAlchemy filters and JOIN logic.
* **`app/services/` (Domain Business Services):** Orchestrates domain logic workflows. Evaluates business rules (e.g., "Cannot approve own decision", "Trigger notification on action"). Consumes repositories, coordinates actions, and raises domain errors.

---

## 3. Layer Interaction & Dependency Flow

To maintain **Clean Architecture**, dependencies must only flow inwards:
$$\text{api} \longrightarrow \text{services} \longrightarrow \text{repositories} \longrightarrow \text{models}$$
* **No Upward References:** Models and Repositories must never import from `app/services/` or `app/api/`.
* **No Direct DB Access in API:** API routers must never import SQLAlchemy session operators or perform queries directly. They must interact with `services`.
* **DTO Isolation:** API routers receive and return Pydantic schemas. Services handle Pydantic schemas or raw models but return Pydantic schemas to the router.

---

## 4. Module Boundaries & Import Rules

- **Absolute Imports:** Use absolute paths starting with `app` (e.g., `from app.core.config import settings`). Relative imports (`from ..models import user`) are restricted to keep packages relocatable.
- **Circular Dependency Guard:** Never cross-import services (e.g., `UserService` importing `ApprovalService` while `ApprovalService` imports `UserService`). If two services need shared behavior, extract that logic to a new lower-level service or coordinate them from a specialized orchestrator service.

---

## 5. Example Request Lifecycle (GET `/decisions/{id}`)

1. **Request Reception:** Nginx routes request to Uvicorn. FastAPI routes path `/api/v1/decisions/{id}` to the controller.
2. **Authentication Middleware:** Dependency `deps.get_current_active_user` extracts JWT, verifies signature, check blacklist in Redis, and populates the request context with the User entity.
3. **Controller Execution:** Router extracts `id` (validated as UUID) and calls `DecisionService.get_decision_by_id(id)`.
4. **Service Execution:** Service checks if decision exists. If it exists, calls `DecisionRepository.fetch_by_id(id)`.
5. **Database Resolution:** Repository executes the query against PostgreSQL using SQLAlchemy session, returning the entity.
6. **Authorization Check:** Service verifies if the active user role permits reading this decision category.
7. **Serialization:** Service transforms the SQLAlchemy entity into `schemas.DecisionDetailResponse`.
8. **HTTP Response:** Router returns the response payload with status `200 OK`.

---

## 6. Future Scalability & Microservice Readiness Strategy

While starting as a modular monolith, modules are logically decoupled:
- **Service Boundaries:** Keep modules like `auth`, `decisions`, `discussion`, and `notifications` separate.
- **Shared Kernel:** Keep `core` generic so it can be packaged as a private pip module for multiple services.
- **Asynchronous Events:** Use Redis Pub/Sub or a message broker (RabbitMQ/Kafka) to decouple services. Instead of calling `NotificationService` synchronously inside `DecisionService`, emit a `decision.submitted` event.
