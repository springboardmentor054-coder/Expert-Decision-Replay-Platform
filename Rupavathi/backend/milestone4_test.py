# -*- coding: utf-8 -*-
import urllib.request
import urllib.error
import json
import uuid
import time

BASE = "http://localhost:8000"
results = []


def req(method, path, data=None, headers=None, raw=False):
    headers = dict(headers or {})
    body = None
    if data is not None:
        if raw:
            body = data
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    r = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw_body = resp.read()
            try:
                return resp.status, json.loads(raw_body) if raw_body else None
            except Exception:
                return resp.status, raw_body
    except urllib.error.HTTPError as e:
        raw_body = e.read()
        try:
            return e.code, json.loads(raw_body) if raw_body else None
        except Exception:
            return e.code, raw_body


def check(section, name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    results.append((section, name, status, detail))
    print(f"[{status}] {section} :: {name}" + (f"  -- {detail}" if (not condition and detail) else ""))


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


run_id = uuid.uuid4().hex[:8]
created_user_ids = []
created_decision_ids = []

print("=" * 70)
print("SECTION 1: AUTHENTICATION")
print("=" * 70)

# 1a. Register valid
admin_email = f"m4_admin_{run_id}@example.com"
status, body = req("POST", "/auth/register", {
    "full_name": "M4 Admin", "email": admin_email, "password": "Str0ng!Pass123", "role": "Admin"
})
check("Auth", "Register with valid data succeeds", status == 200, f"status={status} body={body}")

# 1b. Register duplicate email
status, body = req("POST", "/auth/register", {
    "full_name": "M4 Admin Dup", "email": admin_email, "password": "Str0ng!Pass123", "role": "Admin"
})
check("Auth", "Register with duplicate email is rejected", status == 400, f"status={status} body={body}")

# 1c. Register weak password
status, body = req("POST", "/auth/register", {
    "full_name": "Weak Pw", "email": f"m4_weak_{run_id}@example.com", "password": "weak", "role": "User"
})
check("Auth", "Register with weak password is rejected", status in (400, 422), f"status={status} body={body}")

# 1d. Register with empty fields
status, body = req("POST", "/auth/register", {
    "full_name": "", "email": "", "password": "", "role": ""
})
check("Auth", "Register with empty fields is rejected", status in (400, 422), f"status={status} body={body}")

# 1e. Login correct credentials
status, body = req("POST", "/auth/login", {"email": admin_email, "password": "Str0ng!Pass123"})
check("Auth", "Login with correct credentials succeeds", status == 200 and "access_token" in (body or {}), f"status={status}")
admin_token = body.get("access_token") if status == 200 else None
admin_id = body.get("user", {}).get("id") if status == 200 else None

# 1f. Login wrong password
status, body = req("POST", "/auth/login", {"email": admin_email, "password": "WrongPassword123!"})
check("Auth", "Login with wrong password returns proper error (401)", status == 401, f"status={status} body={body}")

# 1g. Login invalid/non-existent email
status, body = req("POST", "/auth/login", {"email": f"doesnotexist_{run_id}@example.com", "password": "Str0ng!Pass123"})
check("Auth", "Login with non-existent email returns proper error (401)", status == 401, f"status={status} body={body}")

# 1h. Login malformed email
status, body = req("POST", "/auth/login", {"email": "not-an-email", "password": "Str0ng!Pass123"})
check("Auth", "Login with malformed email is rejected (422)", status == 422, f"status={status} body={body}")

# 1i. Login empty fields
status, body = req("POST", "/auth/login", {"email": "", "password": ""})
check("Auth", "Login with empty fields is rejected (422)", status == 422, f"status={status} body={body}")

# 1j. JWT: access protected endpoint without token
status, body = req("PUT", "/users/999999/password", {"current_password": "x", "new_password": "Str0ng!Pass123"})
check("Auth", "Protected endpoint without token is rejected", status in (401, 403), f"status={status} body={body}")

# 1k. JWT: access protected endpoint with garbage token
status, body = req("PUT", "/users/999999/password", {"current_password": "x", "new_password": "Str0ng!Pass123"},
                    headers={"Authorization": "Bearer garbage.token.value"})
check("Auth", "Protected endpoint with invalid token is rejected", status in (401, 403), f"status={status} body={body}")

# 1l. JWT: access protected endpoint with valid token
status, body = req("GET", f"/users/{admin_id}/notifications", headers=auth_headers(admin_token)) if admin_token else (0, None)
check("Auth", "Protected endpoint with valid token succeeds", status == 200, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 2: USER MANAGEMENT")
print("=" * 70)

# 2a. Create user (self-service via register) with role
approver_email = f"m4_approver_{run_id}@example.com"
status, body = req("POST", "/auth/register", {
    "full_name": "M4 Approver", "email": approver_email, "password": "Str0ng!Pass123", "role": "Approver"
})
check("Users", "Create user with Approver role succeeds", status == 200, f"status={status}")

member_email = f"m4_member_{run_id}@example.com"
status, body = req("POST", "/auth/register", {
    "full_name": "M4 Member", "email": member_email, "password": "Str0ng!Pass123", "role": "Team Member"
})
check("Users", "Create user with Team Member role succeeds", status == 200, f"status={status}")

status, body = req("POST", "/auth/login", {"email": approver_email, "password": "Str0ng!Pass123"})
approver_token = body.get("access_token") if status == 200 else None
approver_id = body.get("user", {}).get("id") if status == 200 else None

status, body = req("POST", "/auth/login", {"email": member_email, "password": "Str0ng!Pass123"})
member_token = body.get("access_token") if status == 200 else None
member_id = body.get("user", {}).get("id") if status == 200 else None

created_user_ids = [uid for uid in [approver_id, member_id, admin_id] if uid]  # admin last: its token deletes the others first

# 2b. Update own user info
status, body = req("PUT", f"/users/{member_id}", {
    "full_name": "M4 Member Updated", "email": member_email, "role": "Team Member", "bio": "updated bio"
}, headers=auth_headers(member_token))
check("Users", "Update user info succeeds", status == 200 and body.get("full_name") == "M4 Member Updated", f"status={status} body={body}")

# 2c. Role-based access: non-admin tries to create a role
status, body = req("POST", "/roles/", {"name": f"HackerRole_{run_id}", "description": "x"}, headers=auth_headers(member_token))
check("Users", "Non-admin creating a role is denied (403)", status == 403, f"status={status} body={body}")

# 2d. Role-based access: admin creates a role
status, body = req("POST", "/roles/", {"name": f"M4TestRole_{run_id}", "description": "test"}, headers=auth_headers(admin_token))
check("Users", "Admin creating a role succeeds", status == 200, f"status={status} body={body}")
test_role_id = body.get("id") if status == 200 else None

# 2e. Unauthorized: change another user's password
status, body = req("PUT", f"/users/{admin_id}/password", {"current_password": "x", "new_password": "NewStr0ng!Pass1"},
                    headers=auth_headers(member_token))
check("Users", "Changing another user's password is denied (403)", status == 403, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 3: DECISION MANAGEMENT")
print("=" * 70)

# get a category id
status, body = req("GET", "/categories/", headers=auth_headers(member_token))
category_id = body[0]["id"] if status == 200 and body else None
check("Decisions", "Category list is available for decision creation", category_id is not None, f"status={status} body={body}")

# 3a. Create decision valid data
status, body = req("POST", "/decisions/", {
    "title": f"M4 Test Decision {run_id}", "problem_statement": "A problem statement.",
    "description": "A description.", "category_id": category_id
}, headers=auth_headers(member_token))
check("Decisions", "Create decision with valid data succeeds", status == 200, f"status={status} body={body}")
decision_id = body.get("id") if status == 200 else None
if decision_id:
    created_decision_ids.append(decision_id)

# 3b. Create decision missing required field (title)
status, body = req("POST", "/decisions/", {
    "problem_statement": "no title here", "category_id": category_id
}, headers=auth_headers(member_token))
check("Decisions", "Create decision missing required title fails validation (422)", status == 422, f"status={status} body={body}")

# 3c. Create decision with empty title
status, body = req("POST", "/decisions/", {
    "title": "", "problem_statement": "x", "category_id": category_id
}, headers=auth_headers(member_token))
check("Decisions", "Create decision with empty title fails validation (422)", status == 422, f"status={status} body={body}")

# 3d. Create decision without auth
status, body = req("POST", "/decisions/", {
    "title": "No auth decision", "problem_statement": "x", "category_id": category_id
})
check("Decisions", "Create decision without auth is rejected", status in (401, 403), f"status={status} body={body}")

# 3e. View decision
status, body = req("GET", f"/decisions/{decision_id}", headers=auth_headers(member_token))
check("Decisions", "View decision by id succeeds", status == 200 and body.get("id") == decision_id, f"status={status}")

# 3f. View another user's decision (cross-user visibility check)
status, body = req("GET", f"/decisions/{decision_id}", headers=auth_headers(approver_token))
check("Decisions", "Another authenticated user CAN view the decision (org-wide visibility by design)", status == 200, f"status={status} body={body}")

# 3g. Update decision (owner)
status, body = req("PUT", f"/decisions/{decision_id}", {"description": "Updated description."}, headers=auth_headers(member_token))
check("Decisions", "Update decision succeeds", status == 200 and body.get("description") == "Updated description.", f"status={status} body={body}")

# 3h. Status change: submit for review
status, body = req("PUT", f"/decisions/{decision_id}", {"status": "Under Review"}, headers=auth_headers(member_token))
check("Decisions", "Status change to 'Under Review' succeeds", status == 200 and body.get("status") == "Under Review", f"status={status} body={body}")

# 3i. Non-existent decision
status, body = req("GET", "/decisions/999999999", headers=auth_headers(member_token))
check("Decisions", "Viewing non-existent decision returns 404", status == 404, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 4: ALTERNATIVES")
print("=" * 70)

# 4a. Create alternative valid
status, body = req("POST", "/alternatives/", {
    "decision_id": decision_id, "alternative_name": "Option A", "description": "desc",
    "risk_level": "Low"
}, headers=auth_headers(member_token))
check("Alternatives", "Create alternative with valid data succeeds", status == 200, f"status={status} body={body}")
alt_id = body.get("id") if status == 200 else None

# 4b. Create alternative missing required field (risk_level)
status, body = req("POST", "/alternatives/", {
    "decision_id": decision_id, "alternative_name": "Option Missing Risk"
}, headers=auth_headers(member_token))
check("Alternatives", "Create alternative missing required risk_level fails (422)", status == 422, f"status={status} body={body}")

# 4c. Create alternative with invalid risk_level
status, body = req("POST", "/alternatives/", {
    "decision_id": decision_id, "alternative_name": "Option Bad Risk", "risk_level": "Extreme"
}, headers=auth_headers(member_token))
check("Alternatives", "Create alternative with invalid risk_level enum fails (422)", status == 422, f"status={status} body={body}")

# 4d. Create second alternative for comparison
status, body = req("POST", "/alternatives/", {
    "decision_id": decision_id, "alternative_name": "Option B", "risk_level": "Medium", "estimated_cost": 500
}, headers=auth_headers(member_token))
alt_id_2 = body.get("id") if status == 200 else None
check("Alternatives", "Create second alternative for comparison succeeds", status == 200, f"status={status}")

# 4e. Update alternative
status, body = req("PUT", f"/alternatives/{alt_id}", {"description": "updated desc"}, headers=auth_headers(member_token))
check("Alternatives", "Update alternative succeeds", status == 200 and body.get("description") == "updated desc", f"status={status} body={body}")

# 4f. List alternatives for decision (used by frontend "compare" — client-side, no dedicated endpoint)
status, body = req("GET", f"/decisions/{decision_id}/alternatives", headers=auth_headers(member_token))
check("Alternatives", "List alternatives for a decision returns both created alternatives", status == 200 and len(body) >= 2, f"status={status} body={body}")

# 4g. Delete alternative
status, body = req("DELETE", f"/alternatives/{alt_id_2}", headers=auth_headers(member_token))
check("Alternatives", "Delete alternative succeeds", status == 200, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 5: DOCUMENTS")
print("=" * 70)

import base64


def multipart_body(fields, file_field_name, filename, content_type, file_bytes):
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{file_field_name}"; filename="{filename}"\r\n'.encode())
    parts.append(f'Content-Type: {content_type}\r\n\r\n'.encode())
    parts.append(file_bytes)
    parts.append(f'\r\n--{boundary}--\r\n'.encode())
    return b"".join(parts), boundary


png_bytes = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")

# 5a. Upload valid document
body_bytes, boundary = multipart_body({"decision_id": str(decision_id)}, "file", "test.png", "image/png", png_bytes)
status, body = req("POST", "/documents/upload", body_bytes,
                    headers={**auth_headers(member_token), "Content-Type": f"multipart/form-data; boundary={boundary}"}, raw=True)
check("Documents", "Upload valid document succeeds", status == 200, f"status={status} body={body}")
doc_id = body.get("id") if status == 200 else None

# 5b. Upload invalid file type
body_bytes, boundary = multipart_body({"decision_id": str(decision_id)}, "file", "malware.exe", "application/octet-stream", b"MZ\x90\x00fakeexe")
status, body = req("POST", "/documents/upload", body_bytes,
                    headers={**auth_headers(member_token), "Content-Type": f"multipart/form-data; boundary={boundary}"}, raw=True)
check("Documents", "Upload invalid file type (.exe) is rejected (400)", status == 400, f"status={status} body={body}")

# 5c. Upload oversized file (>10MB)
big_bytes = b"0" * (10 * 1024 * 1024 + 100)
body_bytes, boundary = multipart_body({"decision_id": str(decision_id)}, "file", "big.png", "image/png", big_bytes)
status, body = req("POST", "/documents/upload", body_bytes,
                    headers={**auth_headers(member_token), "Content-Type": f"multipart/form-data; boundary={boundary}"}, raw=True)
check("Documents", "Upload oversized file (>10MB) is rejected (400)", status == 400, f"status={status} body={body}")

# 5d. Upload empty file
body_bytes, boundary = multipart_body({"decision_id": str(decision_id)}, "file", "empty.png", "image/png", b"")
status, body = req("POST", "/documents/upload", body_bytes,
                    headers={**auth_headers(member_token), "Content-Type": f"multipart/form-data; boundary={boundary}"}, raw=True)
check("Documents", "Upload empty file is rejected (400)", status == 400, f"status={status} body={body}")

# 5e. View document
status, body = req("GET", f"/documents/{doc_id}", headers=auth_headers(member_token))
check("Documents", "View document metadata succeeds", status == 200, f"status={status} body={body}")

# 5f. Download document
status, body = req("GET", f"/documents/{doc_id}/download", headers=auth_headers(member_token))
check("Documents", "Download document succeeds", status == 200, f"status={status}")

# 5g. Download non-existent document
status, body = req("GET", "/documents/999999999/download", headers=auth_headers(member_token))
check("Documents", "Download non-existent document returns 404", status == 404, f"status={status} body={body}")

# 5h. Delete document
status, body = req("DELETE", f"/documents/{doc_id}", headers=auth_headers(member_token))
check("Documents", "Delete document succeeds", status == 200, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 6: DISCUSSIONS (COMMENTS)")
print("=" * 70)

# 6a. Add comment
status, body = req("POST", "/comments/", {"decision_id": decision_id, "comment": "This is a test comment."}, headers=auth_headers(member_token))
check("Discussions", "Add comment succeeds", status == 200, f"status={status} body={body}")
comment_id = body.get("id") if status == 200 else None

# 6b. Add comment with empty text
status, body = req("POST", "/comments/", {"decision_id": decision_id, "comment": ""}, headers=auth_headers(member_token))
check("Discussions", "Add empty comment fails validation (422)", status == 422, f"status={status} body={body}")

# 6c. View comments for decision
status, body = req("GET", f"/decisions/{decision_id}/comments", headers=auth_headers(member_token))
check("Discussions", "View comments for decision succeeds", status == 200 and len(body) >= 1, f"status={status} body={body}")

# 6d. Edit own comment
status, body = req("PUT", f"/comments/{comment_id}", {"comment": "Edited comment."}, headers=auth_headers(member_token))
check("Discussions", "Edit own comment succeeds", status == 200 and body.get("comment") == "Edited comment.", f"status={status} body={body}")

# 6e. Delete comment
status, body = req("DELETE", f"/comments/{comment_id}", headers=auth_headers(member_token))
check("Discussions", "Delete comment succeeds", status == 200, f"status={status} body={body}")

print()
print("=" * 70)
print("SECTION 7: VERSION TRACKING")
print("=" * 70)

# 7a. Edit decision title -> new version created
status, body = req("GET", f"/decisions/{decision_id}/versions", headers=auth_headers(member_token))
versions_before = len(body) if status == 200 else -1

status, body = req("PUT", f"/decisions/{decision_id}", {"title": f"M4 Test Decision {run_id} EDITED"}, headers=auth_headers(member_token))
check("Versions", "Edit decision title succeeds", status == 200, f"status={status}")

status, body = req("GET", f"/decisions/{decision_id}/versions", headers=auth_headers(member_token))
versions_after = len(body) if status == 200 else -1
check("Versions", "Editing a decision creates a new version record", versions_after > versions_before, f"before={versions_before} after={versions_after}")

print()
print("=" * 70)
print("SECTION 8: APPROVALS WORKFLOW")
print("=" * 70)

# decision is already Under Review from section 3h; check approval was auto-created
status, body = req("GET", f"/decisions/{decision_id}/approvals", headers=auth_headers(member_token))
check("Approvals", "Approval record auto-created on submit-for-review", status == 200 and len(body) >= 1, f"status={status} body={body}")
approval_id = body[0]["id"] if status == 200 and body else None

# 8a. Non-approver tries to approve
status, body = req("PUT", f"/approvals/{approval_id}/approve", {}, headers=auth_headers(member_token))
check("Approvals", "Non-approver approving is denied (403)", status == 403, f"status={status} body={body}")

# 8c. Approver approves
status, body = req("PUT", f"/approvals/{approval_id}/approve", {}, headers=auth_headers(approver_token))
check("Approvals", "Approver approving succeeds", status == 200, f"status={status} body={body}")

# 8d. Decision status reflects approval
status, body = req("GET", f"/decisions/{decision_id}", headers=auth_headers(member_token))
check("Approvals", "Decision status becomes 'Approved' after approval", status == 200 and body.get("status") == "Approved", f"status={status} body={body}")

# 8e. Reject without remarks should fail (remarks mandatory)
status, body2 = req("POST", "/decisions/", {
    "title": f"M4 Reject Test {run_id}", "problem_statement": "x", "category_id": category_id
}, headers=auth_headers(member_token))
reject_decision_id = body2.get("id")
created_decision_ids.append(reject_decision_id)
req("PUT", f"/decisions/{reject_decision_id}", {"status": "Under Review"}, headers=auth_headers(member_token))
status, body = req("GET", f"/decisions/{reject_decision_id}/approvals", headers=auth_headers(member_token))
reject_approval_id = body[0]["id"] if status == 200 and body else None

status, body = req("PUT", f"/approvals/{reject_approval_id}/reject", {}, headers=auth_headers(approver_token))
check("Approvals", "Reject without remarks is rejected (validation)", status in (400, 422), f"status={status} body={body}")

status, body = req("PUT", f"/approvals/{reject_approval_id}/reject", {"remarks": "Not good enough."}, headers=auth_headers(approver_token))
check("Approvals", "Reject with remarks succeeds", status == 200, f"status={status} body={body}")

print()
print("=" * 70)
print("CLEANUP")
print("=" * 70)

for did in created_decision_ids:
    status, body = req("DELETE", f"/decisions/{did}", headers=auth_headers(admin_token))
    print(f"  deleted decision {did}: status={status}")

if test_role_id:
    status, body = req("DELETE", f"/roles/{test_role_id}", headers=auth_headers(admin_token))
    print(f"  deleted role {test_role_id}: status={status}")

for uid in created_user_ids:
    status, body = req("DELETE", f"/users/{uid}", headers=auth_headers(admin_token))
    print(f"  deleted user {uid}: status={status}")

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
total = len(results)
passed = sum(1 for r in results if r[2] == "PASS")
failed = total - passed
print(f"Total: {total}  Passed: {passed}  Failed: {failed}")
if failed:
    print("\nFAILED CHECKS:")
    for section, name, status, detail in results:
        if status == "FAIL":
            print(f"  - [{section}] {name}  -- {detail}")
