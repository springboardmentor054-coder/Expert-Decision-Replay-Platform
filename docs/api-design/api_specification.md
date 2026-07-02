# REST API Specification - EDRP

* **File Name:** `api_specification.md`
* **Folder Location:** `docs/api-design/`
* **Purpose:** Define standard HTTP endpoints, payload formats, authentication, status codes, and validations for backend services.

---

## 1. Global API Standards
- **Base URL:** `/api/v1`
- **Content Type:** `application/json` (except multi-part file uploads)
- **Response Format:** Consistent JSON schemas.
- **Date/Time Format:** ISO 8601 UTC format (e.g., `2026-07-02T13:15:30Z`).
- **Standard Error Payload Structure:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## 2. Authentication APIs

### 2.1 User Login
* **Endpoint:** `/api/v1/auth/login`
* **Method:** `POST`
* **Purpose:** Authenticate user and issue JWT credentials.
* **Authentication:** None (Public).
* **Request Body:**
```json
{
  "email": "user@organization.com",
  "password": "SecurePassword123"
}
```
* **Validation Rules:**
  - `email`: Required, valid email format.
  - `password`: Required, minimum 8 characters.
* **Response Body (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "8f8983ac-8178-4ad0-b...",
  "token_type": "bearer",
  "expires_in": 900
}
```
* **Status Codes & Error Responses:**
  - `200 OK`: Successful authentication.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Invalid credentials (`{"detail": "Incorrect email or password"}`).

### 2.2 Token Refresh
* **Endpoint:** `/api/v1/auth/refresh`
* **Method:** `POST`
* **Purpose:** Exchange refresh token for a new short-lived access JWT.
* **Authentication:** None (Requires valid refresh token).
* **Request Body:**
```json
{
  "refresh_token": "8f8983ac-8178-4ad0-b..."
}
```
* **Response Body (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "expires_in": 900
}
```
* **Status Codes & Error Responses:**
  - `401 Unauthorized`: Expired or invalid refresh token.

---

## 3. User APIs

### 3.1 Get Current Profile
* **Endpoint:** `/api/v1/users/me`
* **Method:** `GET`
* **Purpose:** Retrieve active user metadata.
* **Authentication:** Bearer Access Token.
* **Response Body (200 OK):**
```json
{
  "id": "e0bfa900-2d88-4228-a6d1-137bfaad747c",
  "email": "architect@organization.com",
  "full_name": "Jane Doe",
  "role": "Reviewer",
  "is_active": true,
  "created_at": "2026-06-01T10:00:00Z"
}
```

### 3.2 Update User Role (Admin Only)
* **Endpoint:** `/api/v1/users/{user_id}/role`
* **Method:** `PATCH`
* **Purpose:** Change permissions level of a user.
* **Authentication:** Bearer Access Token (Admin required).
* **Request Body:**
```json
{
  "role": "Manager"
}
```
* **Validation Rules:**
  - `role`: Must be one of `['Employee', 'Reviewer', 'Manager', 'Administrator']`.
* **Response Body (200 OK):**
```json
{
  "id": "e0bfa900-2d88-4228-a6d1-137bfaad747c",
  "role": "Manager",
  "updated_at": "2026-07-02T13:20:00Z"
}
```

---

## 4. Decision APIs

### 4.1 Create Decision
* **Endpoint:** `/api/v1/decisions`
* **Method:** `POST`
* **Purpose:** Create a draft decision record.
* **Authentication:** Bearer Access Token (Any Authenticated Role).
* **Request Body:**
```json
{
  "title": "Migrate Core Services to FastAPI",
  "summary": "Proposal to replace Spring Boot services with Python FastAPI.",
  "context": "Current system suffers from high latency and startup overhead...",
  "problem_statement": "Spring Boot microservices consume excessive RAM in Kubernetes pods.",
  "category": "Architecture"
}
```
* **Response Body (201 Created):**
```json
{
  "id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "title": "Migrate Core Services to FastAPI",
  "summary": "Proposal to replace Spring Boot services with Python FastAPI.",
  "context": "Current system suffers from high latency and startup overhead...",
  "problem_statement": "Spring Boot microservices consume excessive RAM in Kubernetes pods.",
  "category": "Architecture",
  "status": "Draft",
  "owner_id": "e0bfa900-2d88-4228-a6d1-137bfaad747c",
  "created_at": "2026-07-02T13:30:00Z"
}
```

### 4.2 Search Decisions
* **Endpoint:** `/api/v1/decisions`
* **Method:** `GET`
* **Purpose:** Query, search, and page through decision records.
* **Authentication:** Bearer Access Token.
* **Query Parameters:**
  - `q`: Search query string (optional).
  - `status`: Filter by status (optional).
  - `category`: Filter by category (optional).
  - `page`: Page index (default: `1`).
  - `size`: Items per page (default: `20`, limit: `100`).
* **Response Body (200 OK):**
```json
{
  "items": [
    {
      "id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
      "title": "Migrate Core Services to FastAPI",
      "status": "Draft",
      "category": "Architecture",
      "owner_name": "Jane Doe",
      "created_at": "2026-07-02T13:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

### 4.3 Get Decision Details & Timeline
* **Endpoint:** `/api/v1/decisions/{id}`
* **Method:** `GET`
* **Purpose:** Retrieve comprehensive single decision details, its alternatives, and history logs.
* **Authentication:** Bearer Access Token.
* **Response Body (200 OK):**
```json
{
  "id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "title": "Migrate Core Services to FastAPI",
  "summary": "...",
  "context": "...",
  "problem_statement": "...",
  "status": "Approved",
  "category": "Architecture",
  "owner": {
    "id": "e0bfa900-2d88-4228-a6d1-137bfaad747c",
    "name": "Jane Doe"
  },
  "alternatives": [
    {
      "id": "c1f1a520-5678-4389-bcde-184511abcd11",
      "name": "FastAPI with SQLAlchemy",
      "score": 8.50,
      "status": "Selected"
    }
  ],
  "timeline": [
    {
      "status": "Draft",
      "actioned_by": "Jane Doe",
      "timestamp": "2026-07-02T13:30:00Z"
    },
    {
      "status": "Approved",
      "actioned_by": "John Manager",
      "timestamp": "2026-07-02T15:00:00Z"
    }
  ]
}
```

---

## 5. Alternative Analysis APIs

### 5.1 Create Alternative
* **Endpoint:** `/api/v1/decisions/{decision_id}/alternatives`
* **Method:** `POST`
* **Purpose:** Add a proposed option to an active decision.
* **Authentication:** Bearer Access Token.
* **Request Body:**
```json
{
  "name": "Go (Golang) Gin Framework",
  "description": "Utilize Gin web framework in Go to build the APIs.",
  "pros": ["Extremely high throughput", "Low memory signature"],
  "cons": ["Developer learning curve", "Lacks rich ecosystem library integrations"],
  "score": 6.80,
  "status": "Proposed"
}
```
* **Response Body (201 Created):**
```json
{
  "id": "1ab7a900-e228-3b9d-a6d1-557bfaad1234",
  "decision_id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "name": "Go (Golang) Gin Framework",
  "description": "Utilize Gin web framework in Go to build the APIs.",
  "pros": ["Extremely high throughput", "Low memory signature"],
  "cons": ["Developer learning curve", "Lacks rich ecosystem library integrations"],
  "score": 6.80,
  "status": "Proposed"
}
```

---

## 6. Discussion APIs

### 6.1 Post Comment
* **Endpoint:** `/api/v1/decisions/{decision_id}/comments`
* **Method:** `POST`
* **Purpose:** Add comment, questions or feedback to decision.
* **Authentication:** Bearer Access Token.
* **Request Body:**
```json
{
  "parent_comment_id": null,
  "comment_text": "Did we evaluate the performance difference under DB load?"
}
```
* **Response Body (201 Created):**
```json
{
  "id": "bb4fa900-3456-4228-a6d1-137bfaad747c",
  "decision_id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "user": {
    "name": "Jane Doe",
    "role": "Reviewer"
  },
  "parent_comment_id": null,
  "comment_text": "Did we evaluate the performance difference under DB load?",
  "created_at": "2026-07-02T14:10:00Z"
}
```

---

## 7. Approval Workflow APIs

### 7.1 Submit for Review
* **Endpoint:** `/api/v1/decisions/{decision_id}/submit`
* **Method:** `POST`
* **Purpose:** Submit decision draft for reviewer signoff.
* **Authentication:** Bearer Access Token (Owner only).
* **Response Body (200 OK):**
```json
{
  "decision_id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "status": "Under Review",
  "submitted_at": "2026-07-02T14:15:00Z"
}
```

### 7.2 Action Approval
* **Endpoint:** `/api/v1/decisions/{decision_id}/approve`
* **Method:** `POST`
* **Purpose:** Approve, reject, or request changes on a decision.
* **Authentication:** Bearer Access Token (Reviewers and Managers only).
* **Request Body:**
```json
{
  "action": "Approved", 
  "comments": "The alternative comparison is detailed and reasonable."
}
```
* **Validation Rules:**
  - `action`: Must be one of `['Approved', 'Rejected', 'Changes Requested']`.
* **Response Body (200 OK):**
```json
{
  "decision_id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
  "status": "Approved",
  "actioned_by": "John Manager",
  "timestamp": "2026-07-02T15:00:00Z"
}
```

---

## 8. Dashboard & Analytics APIs

### 8.1 Get Dashboard Statistics
* **Endpoint:** `/api/v1/dashboard/stats`
* **Method:** `GET`
* **Purpose:** Load aggregates of system metrics for dashboard summaries.
* **Authentication:** Bearer Access Token.
* **Response Body (200 OK):**
```json
{
  "total_decisions": 482,
  "pending_my_approval": 3,
  "approved_this_month": 12,
  "category_breakdown": {
    "Architecture": 240,
    "Finance": 120,
    "Product": 122
  }
}
```

### 8.2 Generate Reports (PDF Export)
* **Endpoint:** `/api/v1/reports/decisions/{decision_id}/export`
* **Method:** `POST`
* **Purpose:** Trigger compilation and fetch download URL for a decision summary PDF.
* **Authentication:** Bearer Access Token.
* **Response Body (200 OK):**
```json
{
  "download_url": "https://edrp-reports.s3.amazonaws.com/exports/decision_aa3e7.pdf?AWSAccessKeyId=..."
}
```

---

## 9. Audit APIs

### 9.1 Search System Audits (Admin Only)
* **Endpoint:** `/api/v1/audits`
* **Method:** `GET`
* **Purpose:** Query immutable system operations logs.
* **Authentication:** Bearer Access Token (Admin only).
* **Query Parameters:**
  - `user_id`: Filter by user.
  - `action`: Action name (e.g. `APPROVE_DECISION`).
  - `page`: Page index (default: `1`).
* **Response Body (200 OK):**
```json
{
  "items": [
    {
      "id": 1845,
      "user_name": "John Manager",
      "action": "APPROVE_DECISION",
      "table_name": "decision_records",
      "record_id": "aa3e7a02-ecde-48be-810a-cb904ef23b9d",
      "ip_address": "192.168.1.52",
      "created_at": "2026-07-02T15:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20
}
```
