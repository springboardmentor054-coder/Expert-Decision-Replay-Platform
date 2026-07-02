# Security Specification - EDRP

* **File Name:** `security_specification.md`
* **Folder Location:** `docs/security/`
* **Purpose:** Define security controls, cryptographic schemes, compliance rules, threat mitigations, and secrets management models for the EDRP application.

---

## 1. Authentication Strategy

EDRP employs a stateless **JSON Web Token (JWT)** mechanism for API authentication combined with a token blacklist store in Redis.

```
+--------+             1. POST /auth/login             +------------+
|        | ------------------------------------------> |            |
| Client |             2. Returns Access + Refresh     |   FastAPI  |
|        | <------------------------------------------ |   Backend  |
|        |                                             |   Server   |
|        |             3. Request + Bearer JWT         |            |
|        | ------------------------------------------> |            |
+--------+                                             +------------+
                                                             |
                                                   4. Check Blacklist
                                                             v
                                                       +------------+
                                                       |    Redis   |
                                                       +------------+
```

### 1.1 Access Token Rules
- **Algorithm:** HMAC SHA-256 (`HS256`).
- **Signature Key:** Unique key loaded from environment variables (`JWT_SECRET_KEY`).
- **Lifetime:** 15 minutes.
- **Claims Payload:**
```json
{
  "sub": "user_id_uuid",
  "email": "user@organization.com",
  "role": "Employee",
  "exp": 1782914100
}
```

### 1.2 Refresh Token Rules
- **Value:** Cryptographically secure random UUID string (not JWT) to avoid payload inflation.
- **Lifetime:** 7 days.
- **Verification:** Resolved in Redis (`refresh_token:<uuid>` -> User ID). Enables revocation if a user's session needs termination or their account is compromised.
- **Logout behavior:** Upon logout, the active access token's remaining TTL is added to a Redis blacklist set, and the refresh token UUID is deleted from Redis.

---

## 2. Role-Based Access Control (RBAC)

RBAC is validated statically via FastAPI dependencies using the user's role extracted from the validated JWT token payload.

### 2.1 Role Hierarchy & Scopes

- **Employee:** Lowest tier. Access to read approved decisions, create draft decisions, add alternatives, comment in discussions.
- **Reviewer:** Inherits Employee. Ability to post review comments and approve/request changes at the initial triage stage.
- **Manager:** Inherits Reviewer. Access to dashboard metrics, final decision approvals, and team export reports.
- **Administrator:** Highest tier. Access to update roles, hard delete files/comments, adjust category lists, and read immutable system audit logs.

### 2.2 Backend Authorization Rule Pattern
```python
def check_role(allowed_roles: list[str]):
    def dependency(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current role configuration."
            )
        return current_user
    return dependency
```

---

## 3. Cryptography & Encryption Strategy

### 3.1 Data in Transit
- **TLS 1.3 / 1.2:** Enforced on Nginx for all incoming HTTPS and WSS connections. Cipher suites are limited to strong AEAD ciphers (e.g., ECDHE-RSA-AES128-GCM-SHA256).
- **HSTS (HTTP Strict Transport Security):** Enforced with header:
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### 3.2 Data at Rest
- **Database Storage:** PostgreSQL volumes configured with Transparent Data Encryption (TDE) at the infrastructure level or using PG Crypto for sensitive database columns.
- **S3 Bucket:** Configuration enforces bucket-level default encryption using AWS KMS keys (`sse-s3` or `aws:kms`).
- **Password Hashing:** Passwords are never stored in plain text. Enforced hashing uses **Bcrypt** with a work factor cost of 12.

---

## 4. OWASP Top 10 Protections

### 4.1 SQL Injection (SQLi)
- **Prevention:** Use SQLAlchemy 2.0 object-relational mapping (ORM) with parametrized statements. No raw queries using string concatenation (`f"SELECT * FROM decisions WHERE title = '{q}'"` is strictly forbidden).

### 4.2 Cross-Site Scripting (XSS)
- **Prevention:**
  - React automatically escapes variables in JSX.
  - Markdown content parsed in the frontend must go through a sanitization library (e.g., `DOMPurify`) before injection into the DOM (`dangerouslySetInnerHTML`).

### 4.3 Cross-Site Request Forgery (CSRF)
- **Prevention:** Since the application uses stateless HTTP Authorization Bearer headers (local storage or secure session memory) instead of ambient cookies for API requests, CSRF is mitigated natively by the browser's Same-Origin Policy.

### 4.4 Rate Limiting
- **Implementation:** Redis-backed token bucket algorithm.
- **Limits:**
  - Standard endpoints: 100 requests per minute per IP.
  - Login/Auth endpoints: 5 requests per minute per IP to prevent brute-force attacks.
- **Headers:** Returned on rate-limited responses:
  - `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

### 4.5 CORS (Cross-Origin Resource Sharing)
- Enforce strict origin validation. Wildcard (`*`) is banned in staging/production environments. Allowed origins must match corporate domains:
  `cors_origins = ["https://edrp.organization.com"]`

---

## 5. Secrets Management

- **Zero Hardcoded Credentials:** Banned. Any credential (DB connection strings, JWT keys, AWS keys, Redis URLs) must be loaded from local environment configurations.
- **Development Configuration:** `.env` files matching `.env.example` templates (never checked into Git).
- **Production Configuration:** Injected by deployment pipeline (e.g., AWS Secrets Manager, GitHub Secrets, HashiCorp Vault) directly as secure environment parameters at runtime.
- **Audit Logging:** System logs all permission/role changes, document deletion, and login activities to an audit table that has no API support for modification or delete operations.
