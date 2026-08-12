# Milestone 4 — Testing & Bug-Fix Record

Found via a systematic 56-case backend test pass (`auth → users → decisions → alternatives → documents → discussions → versions → approvals`, covering both success and failure paths) plus a dedicated unauthenticated-access audit across every list/write endpoint.

## Critical (fixed)

### 1. Unauthenticated privilege escalation via `PUT /users/{id}`
**Found:** `update_user` had no auth dependency at all. Any anonymous request could change any user's `role` field directly, including to `Admin`.
**Verified exploit (before fix):**
```
unauthenticated PUT to change own role to Admin -> status: 200, new role: Admin
```
**Fix:** Added `current_user` dependency; only the account owner or an existing Admin may update a profile, and only an Admin may change the `role` field (`backend/app/routers/user_router.py`).
**Verified fix (after):** same request → `401 Not authenticated`.

### 2. Unauthenticated account deletion via `DELETE /users/{id}`
**Found:** `delete_user` had no auth dependency. Any anonymous request could delete any account.
**Verified exploit (before fix):**
```
unauthenticated DELETE of the user -> status: 200
```
**Fix:** Same self-or-Admin guard added.
**Verified fix (after):** same request → `401 Not authenticated`.

## High (fixed)

**Found:** the following endpoints returned data with no `Authorization` header at all — fully anonymous access:
- `GET /users/` and `GET /users/{id}` — exposed every user's name, email, role
- `GET /decisions/`
- `GET /roles/`
- `GET /comments/`
- `GET /documents/`
- `GET /alternatives/`
- `GET /approvals/`
- `GET /decision-versions/`

**Fix:** added `current_user: User = Depends(get_current_user)` to each — any logged-in user can still read them (matches the platform's "open page access, gated write actions" design), but anonymous requests are now rejected.

## Medium (fixed)

| Issue | File | Fix |
|---|---|---|
| DB password hardcoded in source | `backend/app/database/connection.py` | Reads `DATABASE_URL` from env, falls back to local dev default |
| JWT signing secret hardcoded (`"mysecretkey123"`) | `backend/app/utils/security.py` | Reads `JWT_SECRET_KEY` from env |
| CORS origins hardcoded to `localhost:5173` | `backend/app/main.py` | Reads comma-separated `CORS_ORIGINS` from env |
| Frontend API base URL hardcoded to `localhost:8000` | `frontend/src/services/api.js` | Reads `VITE_API_BASE_URL` at build time |

## Design note (not a bug)

`GET /decisions/{id}` (and similarly scoped decision sub-resources) intentionally allow **any authenticated user** to view **any** decision, regardless of who created it — this is a deliberate platform design decision (organization-wide visibility of decisions), not an access-control gap. Verified this doesn't apply to write actions (edit/delete/approve remain restricted to the owner, Admin, or Approver as appropriate).

## Regression coverage

All fixes were re-verified against the full 56-case test suite after each change — 56/56 passing both before (for the cases that should already pass) and after the fixes, with zero functional regressions introduced. Test script: `milestone4_test.py` (ask for a copy if needed for submission).
