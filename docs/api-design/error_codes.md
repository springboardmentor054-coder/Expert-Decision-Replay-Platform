# Standardized Error Code Catalog - EDRP

* **File Name:** `error_codes.md`
* **Folder Location:** `docs/api-design/`
* **Purpose:** Catalog all standard application error codes, status returns, causes, and troubleshooting procedures.

---

## 1. Global Error Structure

All API error payloads follow a unified JSON schema to simplify client error handling:

```json
{
  "code": "ERROR_CATEGORY_SUBCAT",
  "message": "Human-readable explanation of error.",
  "status_code": 400,
  "details": {
    "field": "Optional validation details here"
  }
}
```

---

## 2. Standardized Error Catalog

### 2.1 Authentication Errors (AUTH)

#### `AUTH_INVALID_CREDENTIALS`
- **HTTP Status:** `401 Unauthorized`
- **Description:** Username or password does not match.
- **Cause:** Typo in credentials, or password hash mismatch.
- **Resolution:** Double-check input fields, or trigger password reset workflow.

#### `AUTH_TOKEN_EXPIRED`
- **HTTP Status:** `401 Unauthorized`
- **Description:** Access JWT token has expired.
- **Cause:** Token lifetime exceeded 15 minutes limit.
- **Resolution:** Send stored `refresh_token` to `/api/v1/auth/refresh` to get a new access token.

#### `AUTH_TOKEN_BLACKLISTED`
- **HTTP Status:** `403 Forbidden`
- **Description:** The token is blacklisted (logged out).
- **Cause:** User has logged out, adding token signature to Redis blacklist.
- **Resolution:** Direct client application to clear auth memory and redirect user to Login.

---

### 2.2 User & Permissions Errors (USER)

#### `USER_ROLE_INSUFFICIENT`
- **HTTP Status:** `403 Forbidden`
- **Description:** Role not authorized to perform action.
- **Cause:** User role does not match required RBAC checks.
- **Resolution:** Contact system administrator to request role promotion.

#### `USER_NOT_ACTIVE`
- **HTTP Status:** `403 Forbidden`
- **Description:** User account is inactive.
- **Cause:** The user was disabled or suspended by an Administrator.
- **Resolution:** Review system administration logs or contact HR/IT helpdesk.

---

### 2.3 Teams & Departments Errors (TEAM / DEPT)

#### `TEAM_LIMIT_EXCEEDED`
- **HTTP Status:** `400 Bad Request`
- **Description:** Cannot create more teams.
- **Cause:** Department limits reached.
- **Resolution:** Deactivate unused teams or upgrade plan settings.

---

### 2.4 Decision Management (DECISION)

#### `DECISION_NOT_FOUND`
- **HTTP Status:** `404 Not Found`
- **Description:** The requested decision record does not exist.
- **Cause:** The UUID matches no entries in the database, or it was hard-deleted.
- **Resolution:** Verify Decision ID string, or reload main repository list.

#### `DECISION_INVALID_STATE_TRANSITION`
- **HTTP Status:** `422 Unprocessable Entity`
- **Description:** Transition between current state and target state is invalid.
- **Cause:** Attempted to approve a 'Draft' directly without moving it to 'Under Review'.
- **Resolution:** Submit the draft to the review workflow before executing manager approvals.

---

### 2.5 Alternatives & Discussion (ALTERNATIVE / COMMENT)

#### `ALTERNATIVE_LIMIT_EXCEEDED`
- **HTTP Status:** `400 Bad Request`
- **Description:** Cannot add more alternatives.
- **Cause:** Exceeded maximum alternative constraint limit (max: 10 options).
- **Resolution:** Remove or consolidate options before creating new ones.

#### `COMMENT_NESTING_TOO_DEEP`
- **HTTP Status:** `400 Bad Request`
- **Description:** Discussion reply nesting limit reached.
- **Cause:** Replied to a third-level comment (max depth: 3 levels).
- **Resolution:** Add reply to parent comment thread or reference the comment using `@` tag.

---

### 2.6 Approvals (APPROVAL)

#### `APPROVAL_SELF_SIGN_BANNED`
- **HTTP Status:** `422 Unprocessable Entity`
- **Description:** Creator cannot approve their own decision.
- **Cause:** Attempted approval action where `owner_id === approver_id`.
- **Resolution:** Request review sign-off from another authorized colleague.

---

### 2.7 System Infrastructure (SYSTEM)

#### `SYSTEM_DATABASE_TIMEOUT`
- **HTTP Status:** `503 Service Unavailable`
- **Description:** Relational DB connection timed out.
- **Cause:** Peak database CPU load or network issue.
- **Resolution:** Retry the request using an exponential backoff scheme.

#### `SYSTEM_STORAGE_UPLOAD_ERROR`
- **HTTP Status:** `502 Bad Gateway`
- **Description:** Object storage upload failure.
- **Cause:** S3 bucket credentials or connection failure.
- **Resolution:** Contact DevOps engineer or review S3 container connection logs.
