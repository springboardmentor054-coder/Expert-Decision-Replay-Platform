# System Diagram Compilations - EDRP

* **File Name:** `system_diagrams.md`
* **Folder Location:** `docs/diagrams/`
* **Purpose:** Consolidated Mermaid diagrams representing system components, databases, sequence flows, and lifecycles.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    User([Web Client / Browser]) -->|HTTPS / WSS| Nginx[Nginx Load Balancer]
    Nginx -->|React SPA Static Files| FrontVite[Vite static server]
    Nginx -->|API Requests| FastAPI[FastAPI Backend Server]
    FastAPI -->|Token Blacklist & Session| Redis[(Redis Cache)]
    FastAPI -->|OLTP SQL Queries| PostgreSQL[(PostgreSQL DB)]
    FastAPI -->|Direct upload URL| S3[(AWS S3 Storage)]
```

---

## 2. Component Diagram

```mermaid
graph LR
    subgraph Frontend Components [React SPA]
        Router[Router]
        Pages[Page Views]
        Forms[Form Handlers]
        ClientAPI[Axios API Client]
        QueryState[TanStack Query Cache]
    end

    subgraph Backend Components [FastAPI App]
        Routes[API Router / Entrypoint]
        AuthService[Auth Service]
        DecisionService[Decision Service]
        ApprovalEngine[Approval Workflow Engine]
        DBRepo[DB Repository Layer]
    end

    Router --> Pages
    Pages --> Forms
    Forms --> ClientAPI
    ClientAPI <--> QueryState

    ClientAPI -->|REST| Routes
    Routes --> AuthService
    Routes --> DecisionService
    Routes --> ApprovalEngine
    
    AuthService --> DBRepo
    DecisionService --> DBRepo
    ApprovalEngine --> DBRepo
```

---

## 3. Deployment Diagram

```mermaid
graph TD
    subgraph Client Infrastructure
        Browser[Browser Chrome/Safari]
    end
    
    subgraph Cloud Infrastructure (AWS / Docker Compose)
        NginxProxy[Nginx Container]
        FastAPIApp[FastAPI Container]
        PostgresContainer[PostgreSQL Container]
        RedisContainer[Redis Container]
        S3Bucket[AWS S3 Bucket]
    end
    
    Browser -->|Port 80/443| NginxProxy
    NginxProxy -->|Proxy Pass 8000| FastAPIApp
    FastAPIApp -->|Port 5432| PostgresContainer
    FastAPIApp -->|Port 6379| RedisContainer
    FastAPIApp -->|HTTPS / SSL| S3Bucket
```

---

## 4. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar hashed_password
        varchar full_name
        varchar role
        boolean is_active
        timestamp created_at
    }
    
    decision_records {
        uuid id PK
        varchar title
        text summary
        text context
        text problem_statement
        varchar status
        varchar category
        uuid owner_id FK
        timestamp created_at
    }
    
    alternatives {
        uuid id PK
        uuid decision_id FK
        varchar name
        text description
        text_array pros
        text_array cons
        numeric score
        varchar status
    }
    
    discussion_comments {
        uuid id PK
        uuid decision_id FK
        uuid user_id FK
        uuid parent_comment_id FK
        text comment_text
        timestamp created_at
    }
    
    approval_workflows {
        uuid id PK
        uuid decision_id FK
        uuid approver_id FK
        varchar stage
        varchar status
        text comments
        timestamp actioned_at
    }

    users ||--o{ decision_records : "creates"
    users ||--o{ discussion_comments : "writes"
    users ||--o{ approval_workflows : "actions"
    decision_records ||--o{ alternatives : "has"
    decision_records ||--o{ discussion_comments : "has"
    decision_records ||--o{ approval_workflows : "requires"
```

---

## 5. Authentication Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    User->>Browser: Enter credentials
    Browser->>Backend: POST /auth/login (email, password)
    Backend->>Database: Fetch user where emailMatches
    Database-->>Backend: Return Hash
    Backend->>Backend: Compare Hash (Bcrypt)
    alt Success
        Backend->>Backend: Generate Access JWT (15m)
        Backend->>Backend: Generate Refresh UUID (7d)
        Backend->>Redis: Store refresh UUID -> user_id
        Backend-->>Browser: Return tokens
    else Fail
        Backend-->>Browser: HTTP 401 Unauthorized
    end
```

---

## 6. Decision Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Decision
    Draft --> UnderReview : Submit for Review
    UnderReview --> ChangesRequested : Request Modifications
    ChangesRequested --> UnderReview : Resubmit Draft
    UnderReview --> Approved : Manager Approve
    UnderReview --> Rejected : Manager Reject
    Approved --> Deprecated : Decision Superseded / Deprecated
    Deprecated --> [*]
    Rejected --> [*]
```

---

## 7. Approval Workflow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Decision Creator
    actor Reviewer as Technical Reviewer
    actor Manager as Approval Authority
    participant DB as Database
    
    Employee->>DB: Submit Decision draft (status = UNDER_REVIEW)
    Reviewer->>DB: Add comment, mark draft "Reviewed"
    Manager->>DB: Sign-off & Approve decision
    DB->>DB: Update state to APPROVED
    DB-->>Employee: Dispatch email notifications (Approved)
```

---

## 8. Folder Structure Relationship Diagram

```mermaid
graph TD
    root[Expert-Decision-Replay-Platform] --> docs[docs/]
    root --> backend[backend/]
    root --> frontend[frontend/]
    
    backend --> alembic[alembic/ migrations]
    backend --> app[app/]
    app --> api[api/ router handlers]
    app --> models[models/ schemas/ services/ repositories/]
    
    frontend --> src[src/]
    src --> components[components/ elements]
    src --> features[features/ modules]
    src --> hooks[hooks/ services/]
```
