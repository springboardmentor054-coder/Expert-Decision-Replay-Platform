# Business Workflows & Execution Cycles - EDRP

* **File Name:** `business_workflows.md`
* **Folder Location:** `docs/workflows/`
* **Purpose:** Document primary user workflows, lifecycle states, approval sequences, notifications, and audit logging pathways.

---

## 1. User Registration & Onboarding Workflow

The registration process registers new corporate users and routes them to an Admin pending queue if verification is necessary.

```mermaid
graph TD
    Start([User Registration Request]) --> Input[Fill Name, Email, Password]
    Input --> ValidDomain{Email Domain Approved?}
    ValidDomain -->|No| RejectReg[Reject registration: 400 Bad Request]
    ValidDomain -->|Yes| HashPass[Hash Password via Bcrypt]
    HashPass --> CreateUser[Insert User Record with status active=true, role=Employee]
    CreateUser --> SendNotify[Send onboarding email]
    SendNotify --> Complete([Registration Complete])
```

1. User enters profile details. Email must match corporate domains (e.g. `@organization.com`).
2. Backend computes Bcrypt hash and writes record into database.
3. Default role is assigned as `Employee`.
4. Administrators can later promote roles to `Reviewer`, `Manager`, or `Administrator`.

---

## 2. Decision Creation & Documentation Workflow

This workflow represents the initial stages of documenting and scoping an organizational decision.

```mermaid
graph TD
    D1[Start: Create Decision Draft] --> D2[Provide Title, Category, Context, Problem]
    D2 --> D3[Add Alternatives & Evaluation Criteria]
    D3 --> D4[Upload Supporting Docs / Evidence]
    D4 --> D5{Ready for Review?}
    D5 -->|No| D6[Save as Draft]
    D5 -->|Yes| D7[Submit for Review]
    D7 --> D8[Status changes to UNDER_REVIEW]
    D8 --> D9[Notify Reviewers & Manager]
```

---

## 3. Review & Approval Lifecycle Workflow

This is a multi-step verification pipeline to transition a decision draft to the immutable Knowledge Repository.

```mermaid
graph TD
    StartWorkflow([Decision Status: UNDER_REVIEW]) --> Assign[Assign Reviewer & Manager]
    Assign --> StepReview{Reviewer Evaluation}
    
    StepReview -->|Request Changes| ReqChange[Status: CHANGES_REQUESTED]
    ReqChange --> NotifyOwner[Notify Creator to Edit]
    NotifyOwner --> EditDraft[Owner Modifies Draft]
    EditDraft --> StartWorkflow
    
    StepReview -->|Approve with Comments| StepManager{Manager Final Review}
    
    StepManager -->|Approve| Publish[Status: APPROVED]
    StepManager -->|Reject| Decline[Status: REJECTED]
    StepManager -->|Request Changes| ReqChange
    
    Publish --> IndexRepo[Index for Search & Replay]
    Decline --> EndWorkflow([Workflow Complete])
    IndexRepo --> EndWorkflow
```

---

## 4. Chronological Decision Replay Flow

"Replay" is the ability of EDRP to trace and replay historical events that led to a decision.

1. **Query:** User selects an Approved Decision and clicks the "Replay" interface.
2. **Fetch History:** Backend queries the `decision_versions` table and loads all saved snapshots in ascending order.
3. **Compare Diffs:** Frontend reads snapshots and highlights additions/deletions between versions.
4. **Visual Timeline Rendering:**
   * Step 1: Draft initiated (Author, Timestamp).
   * Step 2: Alternative matrix created.
   * Step 3: Discussion thread additions.
   * Step 4: Revision edits made due to Reviewer feedback.
   * Step 5: Final approval and digital signature (Manager, Timestamp).
   * Step 6: Post-implementation retrospect notes.

---

## 5. Attachment Upload Workflow (S3 Presigned URLs)

To optimize server resource usage, file attachments use direct client-to-S3 uploads.

```mermaid
sequenceDiagram
    autonumber
    Client->>Backend: Request Upload (filename, size, mimetype)
    Backend->>Backend: Validate File Type & Size (<10MB)
    Backend->>S3: Request Presigned POST URL
    S3-->>Backend: Return Upload Policy & URL
    Backend-->>Client: Return JSON with Presigned URL details
    Client->>S3: Upload File binary (Directly to S3)
    S3-->>Client: Return 204 No Content / Success
    Client->>Backend: Post Metadata (S3 Key, name, decision_id)
    Backend->>Database: Write record to `attachments` table
    Backend-->>Client: Return attachment metadata details
```

---

## 6. Audit Logging Flow

An audit log records every transactional change across EDRP tables.

1. **Trigger:** A database mutation occurs (Insert, Update, Delete) via the repository layer.
2. **Capture:** The repository captures the logged-in User ID, IP address, Action type, old record JSON, and new record JSON.
3. **Write:** A write operation publishes this metadata to the `audit_logs` table.
4. **Immutability:** There are no API handlers or database procedures that permit updates or deletion operations on the `audit_logs` table (inserts only).
