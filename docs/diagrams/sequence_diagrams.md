# Sequence Diagrams Specification - EDRP

* **File Name:** `sequence_diagrams.md`
* **Folder Location:** `docs/diagrams/`
* **Purpose:** Detail interaction sequences between the Client UI, Backend API, Database, and S3 Storage using Mermaid.

---

## 1. User Registration & Onboarding Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Corporate User
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    
    User->>UI: Input Registration Details
    UI->>API: POST /api/v1/auth/register (name, email, password)
    API->>API: Validate email domain
    alt Email Valid
        API->>API: Hash password (Bcrypt cost=12)
        API->>DB: Insert User (role=Employee, is_active=true)
        DB-->>API: User Record Created
        API-->>UI: HTTP 201 Created (User details)
        UI-->>User: Show success screen (Redirect to Login)
    else Invalid Email Domain
        API-->>UI: HTTP 400 Bad Request (Domain rejected)
        UI-->>User: Show validation error message
    end
```

---

## 2. User Authentication Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Corporate User
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant Redis as Redis Cache
    participant DB as PostgreSQL DB

    User->>UI: Enter login details
    UI->>API: POST /api/v1/auth/login (email, password)
    API->>DB: Fetch user by email
    DB-->>API: Return user object & password hash
    API->>API: Verify password via bcrypt
    alt Credentials Valid
        API->>API: Generate Access Token (JWT, 15m)
        API->>API: Generate Refresh Token (UUID, 7d)
        API->>Redis: Set refresh_token:<uuid> -> user_id (TTL 7d)
        API-->>UI: HTTP 200 OK (access_token, refresh_token)
        UI->>UI: Store access_token in memory, refresh_token in storage
        UI-->>User: Redirect to Dashboard
    else Invalid
        API-->>UI: HTTP 401 Unauthorized
        UI-->>User: Show authentication error
    end
```

---

## 3. Decision Creation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Decision Owner
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB

    Employee->>UI: Create decision draft (fill title, context, etc.)
    UI->>API: POST /api/v1/decisions (headers: Bearer JWT)
    API->>API: Validate user active session & scopes
    API->>DB: Insert Decision Record (status='Draft')
    DB-->>API: Return Decision Entity
    API-->>UI: HTTP 201 Created (Decision ID)
    UI-->>Employee: Render Decision Draft Workspace
```

---

## 4. Decision Review Pipeline Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Reviewer as Technical Reviewer
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    participant WS as WebSocket Service

    Reviewer->>UI: Select decision under review
    UI->>API: GET /api/v1/decisions/{id}
    API-->>UI: Return Decision & Alternatives details
    Reviewer->>UI: Add comments, click 'Submit Review'
    UI->>API: POST /api/v1/decisions/{id}/approve (action='Changes Requested', comments='...')
    API->>DB: Insert approval status record & comments
    API->>DB: Update decision status to 'Changes Requested'
    DB-->>API: Database Updated
    API->>WS: Broadcast event: 'decision.changes_requested'
    WS-->>UI: Push notification to decision owner
    API-->>UI: HTTP 200 OK
    UI-->>Reviewer: Show evaluation finalized
```

---

## 5. Manager Approval Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Approval Authority
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    
    Manager->>UI: Open decision details
    UI->>API: GET /api/v1/decisions/{id}
    API-->>UI: Return Decision Data
    Manager->>UI: Click 'Approve Decision'
    UI->>API: POST /api/v1/decisions/{id}/approve (action='Approved', comments='...')
    API->>API: Verify user has Manager role
    API->>DB: Update decision_records set status='Approved'
    API->>DB: Write version snapshot to decision_versions
    DB-->>API: Database Updated
    API-->>UI: HTTP 200 OK
    UI-->>Manager: Display decision published
```

---

## 6. Document Upload Sequence (S3 Presigned)

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant S3 as AWS S3 Storage
    participant DB as PostgreSQL DB

    User->>UI: Drag and drop PDF specification
    UI->>API: POST /api/v1/decisions/upload-url (filename, mime)
    API->>API: Verify file size (<10MB) & extensions
    API->>S3: Generate Presigned POST payload
    S3-->>API: Return payload (target URL, fields)
    API-->>UI: HTTP 200 OK (Presigned details)
    UI->>S3: POST file binary using presigned fields
    S3-->>UI: HTTP 204 No Content (Success)
    UI->>API: POST /api/v1/decisions/{id}/attachments (s3_key, file_name, file_size)
    API->>DB: Insert attachment metadata record
    DB-->>API: Return record
    API-->>UI: HTTP 201 Created
    UI-->>User: Show file upload complete
```

---

## 7. Chronological Decision Replay Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as New Developer
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB

    User->>UI: Click 'Replay Timeline' tab
    UI->>API: GET /api/v1/decisions/{id}/history
    API->>DB: Fetch records from decision_versions where decision_id = id ORDER BY version_number ASC
    DB-->>API: Return versions list
    API-->>UI: HTTP 200 OK (Timeline array)
    UI->>UI: Parse JSON configurations & render timeline steps
    UI-->>User: Display step-by-step playback with visual diff transitions
```

---

## 8. Report Generation (PDF Export) Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee/Manager
    participant UI as React Client UI
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    participant S3 as AWS S3 Storage

    User->>UI: Click 'Export PDF'
    UI->>API: POST /api/v1/reports/decisions/{id}/export
    API->>DB: Fetch decision, alternatives, comments, approvals
    DB-->>API: Return complete entities dataset
    API->>API: Compile Report (generate PDF bytes)
    API->>S3: PUT PDF bytes to reports/ folder
    S3-->>API: Upload Complete
    API->>S3: Generate temporary GET presigned URL (valid 15m)
    API-->>UI: HTTP 200 OK (download_url)
    UI->>User: Open download_url in browser window
```
