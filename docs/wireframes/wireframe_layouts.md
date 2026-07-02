# UI Wireframes & Layout Blueprints - EDRP

* **File Name:** `wireframe_layouts.md`
* **Folder Location:** `docs/wireframes/`
* **Purpose:** Present ASCII/textual structural wireframes and layouts for key EDRP system interfaces.

---

## 1. Login Screen Layout
Simple, centered glassmorphic card on a dark gradient background.

```
+-------------------------------------------------------------+
|                                                             |
|                    [ EDRP Logo & Title ]                    |
|                Expert Decision Replay Platform              |
|                                                             |
|             +---------------------------------+             |
|             |          Account Login          |             |
|             |                                 |             |
|             |  Corporate Email                |             |
|             |  [ user@organization.com     ]  |             |
|             |                                 |             |
|             |  Password                       |             |
|             |  [ **********                ]  |             |
|             |                                 |             |
|             |  [X] Remember this workstation  |             |
|             |                                 |             |
|             |  +---------------------------+  |             |
|             |  |        Sign In            |  |             |
|             |  +---------------------------+  |             |
|             |                                 |             |
|             |  Forgot Password? | Sign Up     |             |
|             +---------------------------------+             |
|                                                             |
+-------------------------------------------------------------+
```

---

## 2. Dashboard Screen Layout (Manager & Employee View)
Standard multi-pane layout featuring KPI metric blocks, an action list, and recent organization decisions.

```
+---------------------------------------------------------------------------------------------------+
|  Logo  |  Search decisions, tags, owners...                       [Q] | [Notify (2)] [Jane Profile] |
+--------+------------------------------------------------------------------------------------------+
| (o) DB |  Dashboard Overview                                              [+ New Decision Draft]  |
|        |                                                                                          |
| [*] My |  +------------------+  +------------------+  +------------------+  +------------------+  |
|  Decs  |  | Total Decisions  |  | Pending Approvals|  | Approved Month   |  | Open Discussions |  |
|        |  |       248        |  |        3         |  |        14        |  |        8         |  |
| [v] App|  +------------------+  +------------------+  +------------------+  +------------------+  |
|  Queue |                                                                                          |
|        |  My Pending Action Items                                                                 |
| [i] An |  +------------------------------------------------------------------------------------+  |
|  lytcs |  | Task ID | Decision Title                 | Assigned | Status       | Action          |  |
|        |  +---------+--------------------------------+----------+--------------+-----------------+  |
| [?] Hlp|  | T-1024  | Migrate Core API to FastAPI    | Reviewer | Under Review | [Review Task]   |  |
|        |  | T-1052  | Deprecate AWS Redshift cluster | Manager  | Under Review | [Approve Task]  |  |
| [x] Out|  +------------------------------------------------------------------------------------+  |
+--------+------------------------------------------------------------------------------------------+
```

---

## 3. Decision List & Search View
Grid layout displaying cards with status pills, ownership tags, and filtering controls.

```
+---------------------------------------------------------------------------------------------------+
|  Logo  |  [ Search text...                   ]  Filter Category: [All v]  Status: [Approved v]    |
+--------+------------------------------------------------------------------------------------------+
| (o) DB |  Knowledge Repository - Approved Decisions                                               |
|        |                                                                                          |
| [*] My |  +-----------------------------------+  +-----------------------------------+            |
|  Decs  |  | [Tag: Architecture]    [APPROVED] |  | [Tag: Finance]         [APPROVED] |            |
|        |  | Title: Migrate Core API to FastAPI|  | Title: Q3 Server Infrastructure   |            |
| [v] App|  | Owner: Jane Doe                   |  | Owner: Robert CFO                 |            |
|  Queue |  | Date: 2026-07-02                  |  | Date: 2026-06-25                  |            |
|        |  | Summary: Decouple backend, write  |  | Summary: Upgrade AWS reserved DB  |            |
| [i] An |  | python microservices...           |  | instances for cost discount...    |            |
|  lytcs |  | [Alternatives: 3]  [Comments: 14] |  | [Alternatives: 2]  [Comments: 4]  |            |
|        |  +-----------------------------------+  +-----------------------------------+            |
+--------+------------------------------------------------------------------------------------------+
```

---

## 4. Decision Details & Replay Screen Layout
Triple-pane interface with decision metadata on the left, alternative details in the center, and a discussion/replay timeline drawer on the right.

```
+---------------------------------------------------------------------------------------------------+
| Back to Repository                                             [ Export PDF ] [ Replay Timeline ] |
+---------------------------------------------------------------------------------------------------+
| TITLE: Migrate Core API to FastAPI                             STATUS: [ APPROVED ]               |
| OWNER: Jane Doe (Architect)                                    CATEGORY: Architecture             |
+-----------------------------------------+----------------------------------+----------------------+
| SECTION 1: CONTEXT & PROBLEM            | SECTION 2: ALTERNATIVES MATRIX   | CHRONOLOGICAL REPLAY |
|                                         |                                  |                      |
| Context:                                | +------------------------------+ | (o) Created Draft    |
| Existing services build on Spring Boot  | | Option      | Score | Status | |     Jane Doe (10:15) |
| which features heavy RAM runtime usages | +-------------+-------+--------+ |                      |
| and slow startup initialization...      | | 1. FastAPI  |  8.9  |Selected| | (o) Alt Matrix Added |
|                                         | | 2. Go Gin   |  7.2  |Rejected| |     FastAPI vs Go    |
| Problem:                                | | 3. Node.js  |  6.0  |Rejected| |                      |
| Kubernetes worker nodes are running out | +------------------------------+ | (o) Review Comment   |
| of memory, causing OOM-Kills...         |                                  |     Robert: Check SSL|
|                                         | Pros/Cons comparison pane:       |                      |
|                                         | FastAPI Selected due to lower    | (o) Approved         |
|                                         | learning curves and integration  |     John Mgr (15:00) |
|                                         | with corporate Python DB layers. |                      |
+-----------------------------------------+----------------------------------+----------------------+
```

---

## 5. Approval & Decision Review Workspace
Workspace for Reviewers and Managers to audit draft submissions, review criteria, and leave action remarks.

```
+---------------------------------------------------------------------------------------------------+
|  Logo  |  Review Workspace: Decision #D-9812                                                      |
+--------+------------------------------------------------------------------------------------------+
| (o) DB |  Review Task Details                                                                     |
|        |  Title: Migrate Core API to FastAPI                                                      |
| [*] My |  Submitted By: Jane Doe (Architect)                                                      |
|  Decs  |                                                                                          |
|        |  +------------------------------------------------------------------------------------+  |
| [v] App|  | Review Checklist:                                                                  |  |
|  Queue |  | [X] Problem Statement and context are clear.                                       |  |
|        |  | [X] Multi-Alternative evaluation matrix completed.                                 |  |
| [i] An |  | [ ] Supporting architectural diagrams uploaded (Missing).                          |  |
|  lytcs |  +------------------------------------------------------------------------------------+  |
|        |                                                                                          |
| [?] Hlp|  Audit Review Comments:                                                                   |
|        |  [ Please input your evaluation comments here...                                   ]     |
| [x] Out|                                                                                          |
|        |  [ Approve Proposal ]       [ Request Modification ]       [ Decline / Reject ]          |
+--------+------------------------------------------------------------------------------------------+
```
