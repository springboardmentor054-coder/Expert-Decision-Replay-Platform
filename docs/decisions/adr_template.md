# Architectural Decision Records (ADR) Template & Log - EDRP

* **File Name:** `adr_template.md`
* **Folder Location:** `docs/decisions/`
* **Purpose:** Define standard structures for logging critical design decisions and compile an active index of structural decisions.

---

## 1. What is an Architectural Decision Record?

An **Architectural Decision Record (ADR)** is a document that captures a significant technical decision, including its context, alternatives evaluated, consequences, and current status. Logging ADRs ensures that new developers and architects understand the historical trade-offs made during development.

---

## 2. ADR Log Index

| ADR ID | Decision Date | Title | Status |
| :--- | :--- | :--- | :--- |
| **ADR-001** | 2026-07-02 | [ADR-001: Move Stack from Java to Python FastAPI](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/decisions/adr_template.md#adr-001-move-stack-from-java-to-python-fastapi) | Approved |
| **ADR-002** | 2026-07-02 | [ADR-002: Direct-to-S3 Upload with Presigned URLs](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/decisions/adr_template.md#adr-002-direct-to-s3-upload-with-presigned-urls) | Approved |

---

## 3. Standard ADR Markdown Template

Use this markdown structure to create new records inside the `docs/decisions/` folder:

```markdown
# [ADR-XXX] [Title of Decision]

* **Status:** [Draft | Under Review | Approved | Rejected | Deprecated]
* **Date:** [YYYY-MM-DD]
* **Author(s):** [Name/Team]

## 1. Context
[What is the context/problem statement? What are we trying to solve? List any external constraints or assumptions.]

## 2. Decision
[What is the selected strategy or solution? Why did we select this path over others?]

## 3. Alternatives Evaluated
* **Alternative A:** [Description, Pros, Cons]
* **Alternative B:** [Description, Pros, Cons]

## 4. Consequences
* **Positive:** [What are the benefits or outcomes of this decision?]
* **Negative:** [What are the risks, trade-offs, or secondary tasks required?]
```

---

## 4. Completed ADR Records

### ADR-001: Move Stack from Java to Python FastAPI

* **Status:** Approved
* **Date:** 2026-07-02
* **Author:** Principal Software Architect

#### Context
The prototype codebase was originally specified using Java with Spring Boot. However, the system requires rapid deployment setup, lightweight container footprints, native asynchronous execution to support WebSocket notification traffic, and high developer iteration speeds during the Infosys Springboard timeline.

#### Decision
We will develop the backend API services using Python and **FastAPI** coupled with SQLAlchemy 2.0 and Alembic.

#### Alternatives Evaluated
- **Java Spring Boot:** High boilerplate, slow cold starts in Kubernetes container setups, heavier RAM utilization.
- **Node.js Express / NestJS:** Good candidate, but Python offers cleaner native typing features via Pydantic and aligns with planned AI enhancements.

#### Consequences
- **Positive:** Speed of implementation, auto-generated OpenAPI (Swagger) interface, low memory profile (runs on < 120MB per pod).
- **Negative:** Teams must learn FastAPI standards and manage python environments (`pip`, virtualenvs).

---

### ADR-002: Direct-to-S3 Upload with Presigned URLs

* **Status:** Approved
* **Date:** 2026-07-02
* **Author:** Principal Software Architect

#### Context
Decision records can have attachments up to 10MB (PDFs, Diagrams). Sending large binaries through stateless FastAPI API processes increases backend memory utilization, network bandwidth costs, and blocks event-loops.

#### Decision
The system will implement a **Direct-to-S3 upload workflow** using backend-generated presigned POST URLs.

#### Alternatives Evaluated
- **Proxy Uploads through Backend:** Backend receives file multipart streaming, then uploads it to S3. Easy to authorize but resource intensive.

#### Consequences
- **Positive:** Frontend uploads directly to AWS S3, reducing CPU/network loading on the FastAPI pods.
- **Negative:** Require frontend code logic to handle double-phase uploads (1. Get URL, 2. POST binary to S3).
