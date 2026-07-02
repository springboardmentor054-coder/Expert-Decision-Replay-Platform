# Audit Event Catalog & Compliance Rules - EDRP

* **File Name:** `audit_event_catalog.md`
* **Folder Location:** `docs/audit/`
* **Purpose:** Define auditable system events, metadata parameters, logging severities, retention policies, and compliance mapping.

---

## 1. Metadata Schema for Audit Records

Every logged audit event must capture these standard attributes:
- **`timestamp`:** UTC timestamp when the event occurred (generated database-side).
- **`actor_id`:** UUID of the authenticated user who initiated the action.
- **`actor_ip`:** IPv4/IPv6 address of the originating request.
- **`action`:** Unique event identifier (e.g. `USER_LOGIN_SUCCESS`).
- **`severity`:** Low, Medium, High, or Critical.
- **`resource_id`:** Target UUID of the affected entity.
- **`payload`:** JSON object recording the changed attributes (diff of old vs. new values).

---

## 2. System Auditable Events Catalog

### 2.1 Authentication & Sessions

| Event Action | Severity | Description | Actor | Retention | Compliance Map |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`USER_LOGIN_SUCCESS`** | Low | Successful login. | User | 1 Year | SOC 2 CC6.1, ISO 27001 A.12.4.1 |
| **`USER_LOGIN_FAILED`** | Medium | Failed login attempt. | Anonymous| 1 Year | SOC 2 CC6.1, ISO 27001 A.12.4.3 |
| **`USER_LOGOUT`** | Low | Explicit user logout. | User | 90 Days | SOC 2 CC6.1 |
| **`SESSION_REVOKED`** | Medium | Administrative session termination. | Admin | 1 Year | SOC 2 CC6.3 |

### 2.2 Security & Access Controls

| Event Action | Severity | Description | Actor | Retention | Compliance Map |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`USER_ROLE_PROMOTED`** | **Critical**| User authorization role changed. | Admin | Indefinite| SOC 2 CC6.3, ISO 27001 A.9.2.3 |
| **`USER_SUSPENDED`** | High | User account suspended/deactivated. | Admin | Indefinite| SOC 2 CC6.3, ISO 27001 A.9.2.6 |
| **`API_RATE_LIMIT_HIT`** | Medium | IP rate limits exceeded. | IP Origin | 30 Days | ISO 27001 A.12.4.1 |

### 2.3 Decision Management & Approvals

| Event Action | Severity | Description | Actor | Retention | Compliance Map |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`DECISION_CREATED`** | Low | Decision draft created. | Employee | 3 Years | SOC 2 CC8.1 |
| **`DECISION_SUBMITTED`** | Low | Decision submitted for review. | Employee | 3 Years | SOC 2 CC8.1 |
| **`DECISION_APPROVED`** | High | Decision approved and published. | Manager | Indefinite| SOC 2 CC8.1, ISO 27001 A.14.2.2 |
| **`DECISION_DEPRECATED`** | Medium | Published decision deprecated. | Manager | 3 Years | SOC 2 CC8.1 |
| **`DECISION_DELETED`** | **Critical**| Hard delete of decision record. | Admin | Indefinite| SOC 2 CC6.5, ISO 27001 A.12.4.2 |
| **`ATTACHMENT_DELETED`** | High | File attachment removed. | Admin | 1 Year | SOC 2 CC6.5 |

---

## 3. Storage and Retention Rules

- **Immutability:** The database structure restricts the `audit_logs` table to insert operations only. Update (`UPDATE`) and delete (`DELETE`) operations are blocked on this table.
- **Log Rotation:** After 1 year, audit entries are compressed, encrypted with AES-256, and moved to an offline AWS S3 Glacier vault for long-term retention.
- **Compliance Compliance:** Ensures adherence to SOC 2 (Common Criteria 6.1/6.5 for monitoring access and configuration changes) and ISO/IEC 27001 (Control A.12.4 for logging and monitoring).
