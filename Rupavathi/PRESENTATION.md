# EDRP — Final Presentation / Demo Script

A working outline for the Milestone 4 final presentation. Fill in the bracketed spots (team names, live URLs, timing) before presenting.

---

## 1. Intro (1 min)

- **Project:** Expert Decision Replay Platform (EDRP)
- **Team:** _[names]_
- **One-liner:** A platform where teams record a decision, weigh alternatives, discuss it, route it through approval, and keep a full version/audit history — so past decisions can be searched and learned from instead of living in scattered chats and docs.

## 2. Problem it solves (1 min)

- Important organizational decisions are usually made in meetings/chats and then forgotten
- No structured record of *why* a decision was made, what alternatives were considered, or who approved it
- No easy way to search "have we decided something like this before?"

## 3. Architecture (2 min)

- **Frontend:** React 19 + Vite, React Router, Axios, Recharts — SPA, plain CSS (Forest Green theme)
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL, JWT auth
- **Layered backend:** router → Pydantic schema (validation) → SQLAlchemy model (persistence)
- **Containerized:** Docker + Docker Compose (backend, frontend, Postgres) — verified working end-to-end
- Point at the diagram: `ER_diagram/ER_diagram.png`

## 4. Live demo flow (6–8 min)

Follow this exact sequence — it exercises every major module in one coherent story instead of randomly clicking around:

1. **Register + login** as a Team Member — show password strength validation, then a wrong-password login attempt (proper error, not a crash)
2. **Create a decision** — title, problem statement, category
3. **Add two alternatives** — show cost/risk fields, then the comparison view
4. **Upload a document** to the decision
5. **Add a discussion comment**
6. **Edit the decision** — go to Version History, show the new version was auto-recorded
7. **Submit for review** — show the notification that fires to Approvers
8. **Switch to an Approver account** — show Pending Approvals, approve it — show the decision status flip to Approved
9. **Dashboard** — point out the charts and role-based summary updating to reflect what just happened
10. **Audit Logs** — show the trail of everything that just happened, timestamped and attributed
11. **Reports** — show one report (e.g. Approval Report) reflecting the same activity
12. **Settings** — quickly show profile picture upload + notification preferences (shows attention to UX polish)

## 5. Roles & access control (1 min)

- 5 roles: `Admin`, `Approver`, `Decision Reviewer`, `Team Member`, `User`
- Every role can **view** everything — only `Approver`/`Admin` can approve/reject, only `Admin` can manage roles
- Mention this was a deliberate design decision made mid-project (collapsed from a 2-level approval chain to single-step)

## 6. Testing & hardening (2 min)

- 56-case systematic backend test suite covering every module, both success and failure paths (wrong password, invalid email, missing fields, unauthorized access)
- Found and fixed 2 **critical** bugs during testing: unauthenticated requests could escalate any account to Admin, or delete any account outright — both required zero login. Fixed and re-verified.
- Found and fixed 8 endpoints that leaked data to anonymous (non-logged-in) requests
- Full detail: `BUGFIXES.md`

## 7. Docker & deployment (1–2 min)

- `docker compose up --build` brings up backend + frontend + Postgres together — demonstrated working locally
- Deployed to Render as three services (PostgreSQL, a Docker web service for the backend, a static site for the frontend); `render.yaml` documents the equivalent one-step Blueprint configuration
- **Live URLs:**
  - Frontend: https://expert-decision-replay-platform-1.onrender.com
  - Backend: https://expert-decision-replay-platform-3tcn.onrender.com
  - API docs: https://expert-decision-replay-platform-3tcn.onrender.com/docs

## 8. What's next (1 min)

- Automated CI test suite
- Report export (PDF/Excel/CSV)
- Full-text search across decisions/documents/comments
- Configurable multi-level approval chains
- Object storage for uploads instead of local disk

---

## Talking points if asked "what was hardest?"

- Getting the approval workflow's role model right — it went through a real design change mid-project (2-level → single-step) based on how the team actually wanted approvals to work, which touched the backend workflow, notifications, and every frontend page that displayed approval state
- The unauthenticated privilege-escalation bug found during Milestone 4 testing — a good example of why "it works when I click through it" isn't the same as "it's secure," and why a systematic test pass (including the unhappy paths) matters
