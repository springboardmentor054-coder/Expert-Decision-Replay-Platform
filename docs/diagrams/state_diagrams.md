# State Diagrams Specification - EDRP

* **File Name:** `state_diagrams.md`
* **Folder Location:** `docs/diagrams/`
* **Purpose:** Define lifecycle state transitions and constraints for EDRP system entities using Mermaid.

---

## 1. Decision Record Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Decision Record
    
    state Draft {
        [*] --> EmptyDraft
        EmptyDraft --> ContextCompleted : Fill Details
        ContextCompleted --> AlternativesLinked : Add Options
        AlternativesLinked --> EmptyDraft : Reset Form
    }
    
    Draft --> UnderReview : Submit for Review
    
    state UnderReview {
        [*] --> PendingReviewer
        PendingReviewer --> PendingManager : Reviewer Action (Approved)
        PendingReviewer --> ChangesRequested : Reviewer Action (Changes Req)
        PendingManager --> ChangesRequested : Manager Action (Changes Req)
    }

    ChangesRequested --> UnderReview : Owner Resubmits
    
    UnderReview --> Approved : Manager Action (Approved)
    UnderReview --> Rejected : Manager Action (Rejected)
    
    Approved --> Deprecated : Superceded / Deprecated
    Deprecated --> [*]
    Rejected --> [*]
```

---

## 2. Approval Stage Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Assigned : Workflow Initialized
    
    Assigned --> PendingAction : Assign to Reviewer/Manager
    
    state PendingAction {
        [*] --> Idle
        Idle --> ReviewInProcess : Open Workspace
    }
    
    ReviewInProcess --> Approved : Click 'Approve'
    ReviewInProcess --> Rejected : Click 'Reject'
    ReviewInProcess --> ChangesRequested : Click 'Request Changes'
    
    Approved --> [*]
    Rejected --> [*]
    ChangesRequested --> [*]
```

---

## 3. User Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PendingOnboarding : Registration Submitted
    PendingOnboarding --> Active : Domain Validated
    
    state Active {
        [*] --> Idle
        Idle --> ActiveWorking : Session Authenticated
        ActiveWorking --> Idle : Session Expired
    }
    
    Active --> Suspended : Admin Action (Suspend Account)
    Suspended --> Active : Admin Action (Unsuspend)
    
    Active --> [*]
    Suspended --> [*]
```

---

## 4. Notification Alert Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Queued : System Event Triggered
    Queued --> Dispatched : Processed by Worker
    
    state Dispatched {
        [*] --> InAppDelivered : WS Client Online
        [*] --> EmailSent : SMTP Worker Push
    }
    
    InAppDelivered --> Read : User click alert
    Read --> Archived : Delete/Archive Alert
    
    InAppDelivered --> Archived : Expired (TTL 30 Days)
    Archived --> [*]
```

---

## 5. Document Upload Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initialized : Upload Presigned URL Requested
    Initialized --> Uploading : Client starts push to S3
    
    Uploading --> UploadSuccess : HTTP 204 received from S3
    Uploading --> UploadFailed : Network Error / Timeout
    
    UploadFailed --> [*]
    
    UploadSuccess --> MetadataSaved : Client confirms key to API
    MetadataSaved --> Verified : S3 Object exists check
    Verified --> [*]
```
