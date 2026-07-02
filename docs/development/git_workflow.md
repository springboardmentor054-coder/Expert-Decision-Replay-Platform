# Git Workflow & Release Management - EDRP

* **File Name:** `git_workflow.md`
* **Folder Location:** `docs/development/`
* **Purpose:** Define branching strategies, Conventional Commit formats, Pull Request reviews, merge rules, and software release processes.

---

## 1. Repository Branching Strategy

EDRP employs a **GitFlow-inspired** branching model adapted for CI/CD agility.

```
       +---------------------------------------------+
       |                  main                       |  <-- Stable Production releases
       +---------------------------------------------+
              ^                       |
              | release merge         | hotfix branch
              |                       v
       +---------------------------------------------+
       |                  develop                    |  <-- Integration target
       +---------------------------------------------+
         ^        ^                       ^
         |        |                       |
      +-------+ +-------+             +-------+
      |feat/* | |feat/* |             |bug/*  |         <-- Active developer tasks
      +-------+ +-------+             +-------+
```

### 1.1 Branch Categorization

* **`main` (Protected):** Holds clean production releases. Merges are permitted only from `release/*` or `hotfix/*` branches. No direct pushes are allowed.
* **`develop` (Protected):** Main integration sandbox. All features merge into `develop`.
* **`feature/*`:** Developer sandbox for building features. Branch from `develop`, merge to `develop` via Pull Request.
* **`bugfix/*`:** Sandbox for resolving bugs reported in development.
* **`release/*`:** Preparing for a production deployment release. Branch from `develop` and merge to `main` and `develop`.
* **`hotfix/*`:** Emergency hotfix branches for resolving critical production bugs. Branch from `main` and merge directly back to both `main` and `develop`.

---

## 2. Naming Conventions

### 2.1 Branch Names
Format: `<category>/<ticket-id>-<short-description>`
- *Feature:* `feature/EDRP-104-decision-creation`
- *Bugfix:* `bugfix/EDRP-211-jwt-refresh-failure`
- *Hotfix:* `hotfix/EDRP-911-cors-prod-error`

### 2.2 Commit Messages
Enforce the **Conventional Commits 1.0.0** specification.
Format: `<type>(<scope>): <subject>`

* **Types:**
  - `feat`: A new feature introduction.
  - `fix`: A bug resolution.
  - `docs`: Documentation adjustment.
  - `style`: Changes that do not affect code logic (formatting, spaces).
  - `refactor`: Restructuring code logic without changing external behavior.
  - `test`: Adding or adjusting test suites.
  - `chore`: Modifying build systems, dependencies, or config files.
* **Example:** `feat(decisions): add S3 presigned upload URL endpoints`

---

## 3. Pull Request (PR) & Code Review Process

1. **Prerequisites:** Before creating a PR, developers must run local lint checks and ensure all automated test suites pass.
2. **Review Assignment:** Assign at least one developer peer and a Lead Architect or Reviewer.
3. **Automated Validation:**
   - GitHub Actions executes. All checks (SAST scanners, tests, coverage) must pass.
4. **Approval Requirement:** Require at least one peer approval to merge.
5. **Merge Strategy:** **Squash and Merge** is enforced for `feature/*` to `develop` merges. This collapses developer commits into a single commit to keep the history clean. For `release/*` merges to `main`, use **Merge Commits** to preserve merge points.

---

## 4. Software Release Process

1. **Freeze:** Cut a release branch from `develop`: `release/v1.0.0`.
2. **Beta verification:** Run system tests in staging environments. Push bugfixes to the release branch if issues are found.
3. **Production Merge:** Merge `release/v1.0.0` into `main`. Tag the commit with the version string: `v1.0.0`.
4. **Backport:** Merge the release changes back into `develop` to sync bugfixes.
5. **Deployment:** Tagging `main` triggers GitHub Actions to build docker images, tag them as `v1.0.0` and `latest`, and push them to the production registries.

---

## 5. Code Review Checklist

Reviewers must audit code using this checklist before granting approval:

- [ ] **Functional Correctness:** Does the code satisfy the acceptance criteria in the user story?
- [ ] **Coding Standards:** Does it adhere to [coding_standards.md](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/development/coding_standards.md) (formatting, type hints, etc.)?
- [ ] **Security Principles:** Are parameterized queries used? Are input values sanitized? Are correct RBAC route guards in place?
- [ ] **Test Coverage:** Are unit/integration tests included, and do they cover both happy paths and edge cases?
- [ ] **Performance Considerations:** Are there any N+1 query loops, missing DB indexes, or unnecessary network calls?
- [ ] **Documentation:** Have inline code comments been updated? Have API schemas or environment variables changed, and are they documented?
