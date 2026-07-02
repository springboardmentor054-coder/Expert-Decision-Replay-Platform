# Requirements Specification - Expert Decision Replay Platform (EDRP)

* **File Name:** `requirements_specification.md`
* **Folder Location:** `docs/requirements/`
* **Purpose:** Define business objectives, system scope, functional/non-functional requirements, use cases, and detailed user stories for the Expert Decision Replay Platform.

---

## 1. Project Objectives & Business Requirements

### 1.1 Business Objectives
The **Expert Decision Replay Platform (EDRP)** is an enterprise knowledge management system designed to address the problem of "organizational amnesia." In major corporations, key decisions (e.g., technology migrations, architectural patterns, product pivots, vendor selections) are frequently made, but the context, alternative analysis, evaluation criteria, and debate details are lost when employees leave the company.
EDRP aims to:
- **Preserve Tribal Knowledge:** Capture and index the reasoning behind major decisions.
- **Improve Decision Quality:** Provide teams with structured templates to compare alternatives, risks, and criteria.
- **Reduce Architectural/Business Redundancy:** Allow engineers and managers to "replay" past decisions to avoid repeating mistakes or duplicate assessments.
- **Accelerate Onboarding:** Enable new hires to understand why systems are designed or structured in specific ways.
- **Provide Compliance & Audit Trails:** Ensure major decisions undergo formal approval workflows with immutable audit trails.

### 1.2 System Scope
EDRP is a web application with a FastAPI backend, a React frontend, and a PostgreSQL database. It integrates with Redis for caching and session state, and S3 for document storage. The system handles decision lifecycle, alternative comparison (matrix), interactive discussions (comments/replies), approvals (multi-stage workflows), audit logging, reporting, notifications, and administrative setups.

### 1.3 Key Stakeholders
1. **Corporate Leadership (Executives/VP of Engineering):** Require high-level dashboards, reporting, and ROI metrics on organizational knowledge capture.
2. **Managers (Team Leads/Directors):** Drive decision processes, approve proposed strategies, and review logs.
3. **Employees (Software Engineers, Architects, Business Analysts):** Capture decision parameters, draft alternatives, ask questions, and search previous records.
4. **Reviewers (Subject Matter Experts/Security Teams):** Review the compliance and technical accuracy of decision documents.
5. **System Administrators:** Manage configurations, roles, user accounts, and review audit records.

---

## 2. Roles & Permissions Matrix

The system implements Role-Based Access Control (RBAC) across four roles: Employee, Reviewer, Manager, and Administrator.

| Module | Feature / Operation | Employee | Reviewer | Manager | Administrator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **User Access** | Register & Log In | ✓ | ✓ | ✓ | ✓ |
| | Manage Personal Profile | ✓ | ✓ | ✓ | ✓ |
| | Modify User Accounts / Assign Roles | ✗ | ✗ | ✗ | ✓ |
| **Decision Management** | Create Decision (Draft) | ✓ | ✓ | ✓ | ✓ |
| | Update Own Decision (Draft/Changes Req) | ✓ | ✓ | ✓ | ✓ |
| | Submit Decision for Review | ✓ | ✓ | ✓ | ✓ |
| | Delete Decision (Soft Delete) | ✗ | ✗ | ✗ | ✓ |
| | View Approved/Published Decisions | ✓ | ✓ | ✓ | ✓ |
| **Alternative Analysis** | Create & Link Alternatives to Decision | ✓ | ✓ | ✓ | ✓ |
| | Compare Alternatives (Evaluation Matrix) | ✓ | ✓ | ✓ | ✓ |
| **Discussion Module** | Post Comments / Reply to Decision | ✓ | ✓ | ✓ | ✓ |
| | Edit/Delete Own Comments | ✓ | ✓ | ✓ | ✓ |
| | Moderation of Comments (Flag/Delete) | ✗ | ✗ | ✗ | ✓ |
| **Approval Workflow** | Review Decision (Submit Review Feedback) | ✗ | ✓ | ✓ | ✓ |
| | Approve Decision (Final Sign-off) | ✗ | ✗ | ✓ | ✓ |
| | Request Modifications / Changes | ✗ | ✓ | ✓ | ✓ |
| **Knowledge Repository**| Advanced Search & Semantic Filtering | ✓ | ✓ | ✓ | ✓ |
| | Replay Decision Timeline (Version History) | ✓ | ✓ | ✓ | ✓ |
| **Dashboard** | Personal Action Items & Tasks | ✓ | ✓ | ✓ | ✓ |
| | Team Activity & Decision Funnel | ✗ | ✗ | ✓ | ✓ |
| **Reports** | Export Decision PDF | ✓ | ✓ | ✓ | ✓ |
| | Export Organizational Audit/Usage CSV | ✗ | ✗ | ✓ | ✓ |
| **Audit Logs** | View System Audit Trail | ✗ | ✗ | ✗ | ✓ |

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
* **FR-1.1:** The system shall support secure login via username/email and password, issuing a JWT.
* **FR-1.2:** The system shall support OAuth2 / Single-Sign-On (SSO) integration (e.g., Azure AD or Okta placeholder).
* **FR-1.3:** The system shall implement token-based session management, blacklisting logged-out tokens in Redis.
* **FR-1.4:** Administrators shall be able to invite users and update their system roles (Employee, Reviewer, Manager, Admin).

### 3.2 Decision Management
* **FR-2.1:** Users shall be able to create a decision record with fields: Title, Summary, Context, Problem Statement, Status (Draft, Under Review, Changes Requested, Approved, Rejected, Deprecated), and Category.
* **FR-2.2:** The system shall support markdown formatting for text fields.
* **FR-2.3:** Users shall be able to upload supporting evidence files (PDF, images, text docs) to S3 linked to a decision.
* **FR-2.4:** The system shall support versioning of decision records, storing historical snapshots when status updates or major text changes occur.

### 3.3 Alternative Analysis
* **FR-3.1:** Users shall be able to define multiple alternatives for a decision, containing: Alternative Name, Pros, Cons, Estimated Cost, Implementation Effort (Low/Med/High), Risk Level, and Description.
* **FR-3.2:** The system shall generate a comparative decision matrix interface allowing side-by-side analysis.
* **FR-3.3:** The system shall allow users to assign weightings (1-5) and scores (1-10) to alternatives across custom criteria (e.g., performance, security, cost) to calculate a recommendation score.

### 3.4 Discussion Module
* **FR-4.1:** Users shall be able to comment on decision records.
* **FR-4.2:** The discussion module shall support nested comments (up to 3 levels) for structured replies.
* **FR-4.3:** Users shall be able to tag other users using `@mention` syntax, triggering notifications.
* **FR-4.4:** Comments shall support rich-text formatting and link insertion.

### 3.5 Approval Workflow
* **FR-5.1:** Users shall submit a decision to a multi-stage approval workflow.
* **FR-5.2:** The creator shall select or have auto-assigned Reviewers and Managers.
* **FR-5.3:** Reviewers can submit feedback as: "Approved with Comments" or "Request Changes".
* **FR-5.4:** Managers must approve to publish the decision into the "Approved" state.
* **FR-5.5:** The system shall prevent self-approval.

### 3.6 Knowledge Repository & Replay
* **FR-6.1:** Approved decisions must be indexed for text search (PostgreSQL vector/GIN index or standard indexed text search).
* **FR-6.2:** Users shall be able to replay decisions chronologically, stepping through: Draft -> Feedback -> Alternative Matrix -> Final Approval -> Post-Implementation Reviews.
* **FR-6.3:** The replay engine shall visualize the transition times, who approved what, and what comments were posted at each state.

### 3.7 Dashboards & Reports
* **FR-7.1:** The dashboard shall present pending approvals, recently viewed decisions, and drafted items.
* **FR-7.2:** Managers shall see metrics: approval latency, volume of decisions captured, and distribution of categories.
* **FR-7.3:** The system shall support exporting decisions as PDF reports containing the full decision log, alternatives matrix, approval signatures, and key discussions.

### 3.8 Audit Logs & Notifications
* **FR-8.1:** Every change to a decision record (creation, updates, status transitions, comment addition, file download) must write an immutable entry to the Audit Log.
* **FR-8.2:** The system shall dispatch in-app notifications (WebSockets) and email alerts for mentions, review requests, and approvals.

---

## 4. Non-Functional Requirements

### 4.1 Security & Compliance
* **NFR-1.1:** All passwords must be hashed using bcrypt or Argon2 id before database insertion.
* **NFR-1.2:** APIs must validate incoming tokens on every request and enforce RBAC rules.
* **NFR-1.3:** The system must restrict file uploads to valid formats (PDF, JPG, PNG, DOCX) and scan for malicious payloads. Maximum file size is capped at 10MB.
* **NFR-1.4:** Connection strings and credentials must be injected dynamically via environment variables; no secrets in git.

### 4.2 Performance & Scalability
* **NFR-2.1:** Page response time (TTFB) under standard load must be less than 200ms.
* **NFR-2.2:** Complex reports or audit queries must resolve in less than 2.0 seconds.
* **NFR-2.3:** The database schema must use appropriate GIN/B-Tree indexing to scale cleanly to 100,000+ decision records and 1,000,000+ discussion comments.
* **NFR-2.4:** Redis must cache frequently read objects (approved decisions, user profiles) to reduce database load.

### 4.3 Availability & Reliability
* **NFR-3.1:** The application services must be stateless to support horizontal scaling behind a load balancer.
* **NFR-3.2:** Database backups must run daily, storing encrypted snapshots off-site (S3 Glacier).

### 4.4 Usability & Accessibility
* **NFR-4.1:** The application must satisfy WCAG 2.1 AA accessibility guidelines (contrast, keyboard navigation, aria-labels).
* **NFR-4.2:** The frontend must adapt responsively to mobile, tablet, and desktop viewports (breakpoints: 640px, 768px, 1024px, 1280px).
* **NFR-4.3:** The application must offer both dark and light modes, toggled by a user preference switch.

---

## 5. Assumptions, Constraints, & Success Criteria

### 5.1 Assumptions
- All users belong to an active organization directory or can register with an approved corporate domain (e.g., `@infosys.com`).
- AWS S3 or compatible API (like LocalStack or MinIO) is available for storing attachments.
- Redis is available for caching and rate limiting.

### 5.2 Constraints
- The backend must be developed in Python using FastAPI. No Django or Flask.
- The frontend must be developed using React 19 and Vite with TypeScript.
- The UI must leverage Tailwind CSS for styles, and use Shadcn UI / HeroUI patterns.
- Springboard constraints: Deployment must run locally on Docker Compose.

### 5.3 Success Criteria
- **User Adoption:** 90% of architectural decisions in a department logged in the platform within 1 month.
- **Onboarding Speed:** Reducing new engineer onboarding documentation search time by 50%.
- **Zero Data Loss:** 100% of approved decisions and their history must be immutable and audit-logged.
- **High Performance:** 95th percentile UI interactions finish in < 300ms.

---

## 6. Use Cases & User Stories

### Use Case 1: Capture & Submit Decision for Review
* **Actor:** Employee (Author)
* **Preconditions:** User is logged in and belongs to a team.
* **Description:** An employee writes a decision draft, links two alternatives with criteria evaluations, uploads a PDF technical whitepaper, and submits the decision.
* **Postconditions:** Decision is saved as `UNDER_REVIEW`, reviewers receive notification, and an audit trail is written.

### Use Case 2: Process Decision Approval
* **Actor:** Reviewer / Manager
* **Preconditions:** Decision status is `UNDER_REVIEW`.
* **Description:** The Reviewer inspects the decision, leaves comments, and marks it as "Reviewed". The Manager reviews the rating matrix, views the comments, and clicks "Approve".
* **Postconditions:** Status updates to `APPROVED`. Decision is searchable in the Knowledge Repository.

---

### User Stories & Acceptance Criteria

#### User Story 1: Decision Drafting
> **As an** Employee  
> **I want to** draft a decision record, upload technical specifications, and add multiple options  
> **So that** I can compile all background context before requesting reviews.

* **Acceptance Criteria:**
  1. The creation form requires Title, Problem Statement, Context, and Category.
  2. The author can save drafts without sending them to reviewers.
  3. The author can drag-and-drop file attachments, which are saved securely to S3 with a generated UUID path.
  4. The form supports markdown previews for the problem and context text blocks.

#### User Story 2: Alternatives Evaluation Matrix
> **As an** Employee/Architect  
> **I want to** score different technical solutions on custom criteria (e.g. Cost, Performance)  
> **So that** reviewers can see a quantified comparative analysis.

* **Acceptance Criteria:**
  1. Users can add two or more alternatives to a decision record.
  2. Each alternative requires a Name, Pros, Cons, and status (Proposed, Selected, Rejected).
  3. Users can add criteria (e.g. "Scalability") and rank each alternative from 1-10.
  4. The system calculates and displays the average score for each alternative.

#### User Story 3: Decision Replay Timeline
> **As a** Developer onboarding to a team  
> **I want to** replay a decision's historical lifecycle chronologically  
> **So that** I can understand how the decision evolved, who raised concerns, and what was changed.

* **Acceptance Criteria:**
  1. A "Replay" tab is visible on approved/archived decisions.
  2. Clicking "Replay" displays a vertical timeline with steps for: Created -> Comments -> Edit Versions -> Approval Action.
  3. Users can click any step in the timeline to see a diff of text and state changes.

---

## 7. Future Enhancements
- **AI-Powered Decision Summarization:** Summarize lengthy architectural debates using LLM agents.
- **Auto-Risk Assessment:** Scan alternatives with an NLP model to flag compliance or cost risks.
- **Integrations:** Direct plugins for Slack/Teams to capture decisions made inside chat channels.

---

## 8. Glossary
* **EDRP:** Expert Decision Replay Platform.
* **ADR:** Architectural Decision Record. A short text file containing a decision description, context, status, and consequences.
* **RBAC:** Role-Based Access Control. A method of restricting system access to authorized users.
* **GIN Index:** Generalized Inverted Index. Used in PostgreSQL for efficient full-text searching.
* **JWT:** JSON Web Token. An open standard used to share security information between a client and a server.
* **S3:** Simple Storage Service. Object storage service used to store documents.
