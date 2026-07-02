# Role-Based Access Control (RBAC) Permission Matrix - EDRP

* **File Name:** `rbac_matrix.md`
* **Folder Location:** `docs/security/`
* **Purpose:** Define systemic authorizations, feature capabilities, and security boundaries for EDRP roles.

---

## 1. Systemic Permissions by Module

The matrix uses **Y (Yes)** and **N (No)** tags to map system capabilities for the following roles:
* **EMP:** Employee
* **REV:** Reviewer
* **MGR:** Manager
* **ADM:** Administrator

### 1.1 Authentication & Configuration Modules

| Module / Resource | Action | EMP | REV | MGR | ADM | Functional Description |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication** | Login / Session | Y | Y | Y | Y | Basic access authentication. |
| | Revoke session | Y | Y | Y | Y | User logs out, blacklisting active token. |
| **Users** | Read profile | Y | Y | Y | Y | Load personal details. |
| | Manage users | N | N | N | Y | Invite new users, update user active status. |
| | Assign Roles | N | N | N | Y | Modify role levels (e.g. promoting EMP to REV). |
| **Teams & Departments**| Create Team | N | N | Y | Y | Initialize team project boundaries. |
| | Assign members | N | N | Y | Y | Add users to department groupings. |
| **Settings** | Update system configs| N | N | N | Y | Global settings (file size limits, custom templates). |

---

### 1.2 Decision Management & Workflows

| Module / Resource | Action | EMP | REV | MGR | ADM | Functional Description |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Decisions** | Create (Draft) | Y | Y | Y | Y | Start a decision proposal. |
| | Read (Approved) | Y | Y | Y | Y | Open decisions from the knowledge base. |
| | Read (Draft/Review) | Note 1| Y | Y | Y | Drafts visible only to owner and reviewers. |
| | Update (Draft) | Y | Y | Y | Y | Edit properties before final approval. |
| | Delete (Soft Delete) | N | N | N | Y | Remove decision from view (logs flag = active=false). |
| | Deprecate | N | N | Y | Y | Mark a published decision as deprecated/superseded. |
| **Alternatives** | Add/Edit alternative | Y | Y | Y | Y | Propose alternatives and criteria scores. |
| **Comments & Threads** | Post comment | Y | Y | Y | Y | Ask questions or provide feedback on decisions. |
| | Edit/Delete own comment| Y | Y | Y | Y | Edit/delete personal comments. |
| | Moderate comments | N | N | N | Y | Hard-delete other users' comments. |
| **Approvals** | Review & Submit | N | Y | Y | Y | Technical reviewer checkpoint verification. |
| | Approve (Final) | N | N | Y | Y | Manager final sign-off capability. |
| **Notifications** | Read notifications | Y | Y | Y | Y | Mark alerts as read. |
| **Reports** | Export PDF | Y | Y | Y | Y | Export decision summaries to PDF format. |
| | Export CSV Audits | N | N | Y | Y | Export systemic metric aggregates. |
| **Audit Logs** | Read System logs | N | N | N | Y | Read immutable audit records. |

* **Note 1 (Decisions - Read Draft/Review):** Employees can read drafts and under-review decisions only if they are the author (`owner_id === user.id`). Reviewers, Managers, and Admins can read all drafts and review pipeline queues.

---

## 2. API Level Enforcements

All API endpoints must implement authorization decorators checking these permissions:
1. **Token Parse:** Parse incoming `Authorization: Bearer <JWT>` header to extract the user's role.
2. **Path Verification:** Check if the requested module action maps to the user's role:
   - For endpoints like `GET /api/v1/audits`, check role constraints. If the user's role is not `Administrator`, return `403 Forbidden`.
   - For records-specific endpoints (e.g. `PUT /api/v1/decisions/{id}`), check that `owner_id === user.id` OR user role is `Administrator` before allowing updates.
   - For approval actions (`POST /api/v1/decisions/{id}/approve`), verify that the user's role is `Reviewer`, `Manager`, or `Administrator`, and reject self-approval attempts.
