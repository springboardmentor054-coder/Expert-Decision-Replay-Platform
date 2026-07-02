# Domain Business Rules & Logic Constraints - EDRP

* **File Name:** `business_rules.md`
* **Folder Location:** `docs/business-rules/`
* **Purpose:** Define business logic constraints, validation rules, operations thresholds, and processing rules.

---

## 1. User & Account Rules

- **Corporate Verification:** Only emails matching registered corporate domains (e.g. `@organization.com`) are allowed to register.
- **Default Permissions:** All newly registered users are assigned the `Employee` role by default. Promotion to other roles must be performed by an Administrator.
- **Session Limits:** A user can have up to 5 concurrent active sessions. If a user logs in from a 6th device, the oldest session token is invalidated.

---

## 2. Teams & Departments Rules

- **Owner Constraint:** A team must always have an active Manager assigned as its primary owner. If a Manager leaves the organization, ownership must be reassigned to another Manager before their account is deactivated.
- **Isolation Boundary:** Employees can only see and participate in decisions drafted by members of their assigned department, unless the decision category is marked as "Cross-Departmental" or is fully approved and published.

---

## 3. Decision Records Rules

- **Status Transition Logic:** Decisions must advance through the workflow step-by-step:
  $$\text{Draft} \longrightarrow \text{Under Review} \longrightarrow \text{Approved / Rejected}$$
- **Version Snapshots:** A new immutable version snapshot must be created in the `decision_versions` table whenever:
  1. The decision's title, problem statement, or context is modified after it has been submitted for review.
  2. The status is updated to `Approved`, `Rejected`, or `Deprecated`.
- **Deprecation Constraint:** A decision can only be marked as `Deprecated` if the author or manager links it to a newer, approved decision that supersedes it.

---

## 4. Alternatives Evaluation Matrix

- **Alternative Requirement:** A decision must have at least 2 proposed alternatives before it can be submitted to the review workflow.
- **Scoring Scale:** Evaluation criteria weightings must be scored on a scale of 1-5, and alternative evaluations must be scored on a scale of 1-10.
- **Selected Constraint:** Only one alternative can be marked as `Selected` per decision. All other alternatives must be marked as `Rejected` or `Proposed` when the decision is approved.

---

## 5. Attachments & Evidence Files

- **File Type Constraints:** Permitted formats are limited to `['pdf', 'png', 'jpg', 'docx', 'xlsx', 'txt']`. Executable files (e.g. `.exe`, `.sh`, `.bat`) are blocked.
- **File Size Limit:** The maximum file size per upload is capped at **10MB**.
- **Attachment Limit:** A decision record can have a maximum of 10 linked attachments.

---

## 6. Approvals & Reviews

- **Conflict of Interest Prevention:** An employee cannot review or approve their own decision. The backend must enforce that `owner_id !== approver_id` for all approval actions.
- **Reviewer Action Rule:** Reviewers can request changes or approve with comments, but only a user with the `Manager` or `Administrator` role can perform the final approval to transition a decision to the `Approved` state.

---

## 7. Discussion Comments

- **Nesting Limit:** The discussion comments hierarchy is capped at a maximum nesting depth of **3 levels** (Parent Comment -> First Reply -> Second Reply). Any subsequent replies are added as siblings at the third level.
- **Self-Deletion Rule:** Users can edit or delete their own comments at any time, but deleted comments leave a placeholder ("*This comment was deleted by the author*") to preserve the readability of reply threads.
