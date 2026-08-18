from fastapi.testclient import TestClient
import pytest
import os
import sys

# Add project root to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Force SQLite test DB BEFORE any app import
os.environ["DATABASE_URL"] = "sqlite:///./test_decisions.db"

from backend.app.main import app
from backend.app.database import engine, Base

# Recreate tables in test database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Re-seed the test database with default users
from backend.app.main import seed_users
seed_users()

client = TestClient(app)


# ---- Helper: login and return headers ----
def login_headers(email, password):
    response = client.post(
        "/api/v1/users/login",
        data={"username": email, "password": password}
    )
    assert response.status_code == 200, f"Login failed for {email}: {response.json()}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_user_registration_and_login():
    """Register a brand new user and verify login and profile."""
    # 1. Register
    response = client.post(
        "/api/v1/users/register",
        json={
            "email": "testuser@company.com",
            "password": "TestPassword123",
            "full_name": "Test User",
            "role": "Employee",
            "team": "Engineering"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "testuser@company.com"

    # 2. Login
    headers = login_headers("testuser@company.com", "TestPassword123")

    # 3. Read profile
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Test User"
    assert response.json()["role"] == "Employee"


def test_decision_create_and_workflow():
    """Create a decision with alternatives and approvers, then submit for review."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    decision_payload = {
        "title": "Migrate Database to Cloud",
        "problem_statement": "Local server is running out of disk space and memory.",
        "category": "Infrastructure",
        "status": "Draft",
        "alternatives": [
            {
                "title": "Option A: AWS RDS PostgreSQL",
                "description": "Migrate to AWS RDS cloud managed database",
                "cost": 12000.0,
                "feasibility_rating": 4,
                "risk_rating": 2,
                "pros": ["Managed backups", "Scaling capabilities"],
                "cons": ["Vendor Lock-in"],
                "risk_mitigation": "Configure auto-scaling backups and multi-AZ"
            },
            {
                "title": "Option B: Self-hosted on EC2",
                "description": "Run PostgreSQL on EC2 instances managed by us",
                "cost": 8000.0,
                "feasibility_rating": 3,
                "risk_rating": 4,
                "pros": ["Full control", "Lower cost"],
                "cons": ["Operational burden", "Manual backup setup"],
                "risk_mitigation": "Hire dedicated DBA"
            }
        ],
        "required_approvers": [
            {"level": 1, "approver_id": 2}
        ]
    }

    response = client.post("/api/v1/decisions/", json=decision_payload, headers=headers)
    assert response.status_code == 201
    decision = response.json()
    assert decision["title"] == "Migrate Database to Cloud"
    assert len(decision["alternatives"]) == 2
    assert len(decision["approvals"]) == 1
    decision_id = decision["id"]

    # List decisions
    response = client.get("/api/v1/decisions/", headers=headers)
    assert response.status_code == 200
    assert any(d["id"] == decision_id for d in response.json())

    # Get decision detail
    response = client.get(f"/api/v1/decisions/{decision_id}", headers=headers)
    assert response.status_code == 200
    detail = response.json()
    assert detail["current_version"] == 1
    assert len(detail["versions"]) == 1

    # Submit for review
    response = client.post(f"/api/v1/decisions/{decision_id}/submit-review", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Under Review"

    # Verify version was incremented
    response = client.get(f"/api/v1/decisions/{decision_id}", headers=headers)
    assert response.json()["current_version"] == 2


def test_approval_workflow():
    """Login as manager, action a pending approval, verify decision status changes."""
    admin_headers = login_headers("admin@company.com", "AdminPassword123")

    decision_payload = {
        "title": "Adopt Kubernetes for Orchestration",
        "problem_statement": "Container deployments are manual and error-prone.",
        "category": "Architecture",
        "status": "Draft",
        "alternatives": [
            {
                "title": "Kubernetes on EKS",
                "description": "Use AWS EKS managed Kubernetes",
                "cost": 15000.0,
                "feasibility_rating": 4,
                "risk_rating": 3,
                "pros": ["Industry standard", "Auto-scaling"],
                "cons": ["Steep learning curve"],
                "risk_mitigation": "Team training program"
            }
        ],
        "required_approvers": [
            {"level": 1, "approver_id": 2}
        ]
    }

    response = client.post("/api/v1/decisions/", json=decision_payload, headers=admin_headers)
    assert response.status_code == 201
    decision_id = response.json()["id"]

    # Submit for review
    response = client.post(f"/api/v1/decisions/{decision_id}/submit-review", headers=admin_headers)
    assert response.status_code == 200

    # Login as manager
    manager_headers = login_headers("manager@company.com", "ManagerPassword123")

    # Get pending approvals
    response = client.get("/api/v1/approvals/pending", headers=manager_headers)
    assert response.status_code == 200
    pending = response.json()
    assert len(pending) > 0

    # Find the approval for our decision
    approval = next(a for a in pending if a["decision_id"] == decision_id)
    approval_id = approval["id"]

    # Approve it
    response = client.post(
        f"/api/v1/approvals/{approval_id}/action",
        json={"status": "Approved", "comments": "Looks good, proceed with EKS."},
        headers=manager_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Approved"

    # Verify the decision is now Approved
    response = client.get(f"/api/v1/decisions/{decision_id}", headers=admin_headers)
    assert response.json()["status"] == "Approved"


def test_comments_and_discussion():
    """Post comments and replies on a decision."""
    admin_headers = login_headers("admin@company.com", "AdminPassword123")

    # Get any existing decision
    response = client.get("/api/v1/decisions/", headers=admin_headers)
    decisions = response.json()
    assert len(decisions) > 0
    decision_id = decisions[0]["id"]

    # Post a root comment
    response = client.post(
        f"/api/v1/decisions/{decision_id}/comments",
        json={"content": "I think Option A is the safest approach."},
        headers=admin_headers
    )
    assert response.status_code == 201
    comment = response.json()
    comment_id = comment["id"]

    # Post a reply
    response = client.post(
        f"/api/v1/decisions/{decision_id}/comments",
        json={"content": "Agreed, but we should consider the cost implications.", "parent_id": comment_id},
        headers=admin_headers
    )
    assert response.status_code == 201
    reply = response.json()
    assert reply["parent_id"] == comment_id

    # Fetch threaded comments
    response = client.get(f"/api/v1/decisions/{decision_id}/comments", headers=admin_headers)
    assert response.status_code == 200
    comments = response.json()
    assert len(comments) > 0


def test_analytics_dashboard():
    """Fetch analytics dashboard and validate structure."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_decisions" in data
    assert "status_distribution" in data
    assert "category_distribution" in data
    assert "recent_activities" in data
    assert "my_decisions_count" in data
    assert "avg_approval_turnaround_hours" in data
    assert data["total_decisions"] >= 2


def test_audit_logs():
    """Verify audit logs endpoint for admin users."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    response = client.get("/api/v1/analytics/audit-logs", headers=headers)
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) > 0

    log = logs[0]
    assert "action" in log
    assert "timestamp" in log


def test_decision_update_and_versioning():
    """Update a decision and verify version increments."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    response = client.get("/api/v1/decisions/", headers=headers)
    decisions = response.json()
    decision_id = decisions[0]["id"]

    initial_detail = client.get(f"/api/v1/decisions/{decision_id}", headers=headers).json()
    initial_version = initial_detail["current_version"]

    response = client.put(
        f"/api/v1/decisions/{decision_id}",
        json={
            "title": "Updated: " + initial_detail["title"],
            "change_summary": "Updated title for clarity"
        },
        headers=headers
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["current_version"] == initial_version + 1


def test_categories_endpoint():
    """Verify categories listing."""
    headers = login_headers("admin@company.com", "AdminPassword123")
    response = client.get("/api/v1/decisions/categories", headers=headers)
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0


def test_decision_validation_empty_title_and_problem_statement():
    """Ensure title cannot be empty and problem statement is mandatory."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    # 1. Empty Title should fail (422)
    res_empty_title = client.post(
        "/api/v1/decisions/",
        json={"title": "   ", "problem_statement": "Valid problem statement", "category": "Architecture"},
        headers=headers
    )
    assert res_empty_title.status_code == 422

    # 2. Empty Problem statement should fail (422)
    res_empty_problem = client.post(
        "/api/v1/decisions/",
        json={"title": "Valid Title", "problem_statement": "   ", "category": "Architecture"},
        headers=headers
    )
    assert res_empty_problem.status_code == 422

    # 3. Unauthenticated user creation should fail (401)
    res_unauth = client.post(
        "/api/v1/decisions/",
        json={"title": "Valid Title", "problem_statement": "Valid Problem", "category": "Architecture"}
    )
    assert res_unauth.status_code == 401


def test_decision_delete_endpoint():
    """Test DELETE /decisions/{id}."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    # Create a dummy decision to delete
    create_res = client.post(
        "/api/v1/decisions/",
        json={"title": "Temporary Decision to Delete", "problem_statement": "Need to be deleted", "category": "Security"},
        headers=headers
    )
    assert create_res.status_code == 201
    dec_id = create_res.json()["id"]

    # Delete decision
    del_res = client.delete(f"/api/v1/decisions/{dec_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["id"] == dec_id

    # Verify 404 on fetch
    get_res = client.get(f"/api/v1/decisions/{dec_id}", headers=headers)
    assert get_res.status_code == 404


def test_document_management_crud_and_validations():
    """Test document upload logic, file type & size validations, list, and delete."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    # 1. Get an existing decision ID
    decisions = client.get("/api/v1/decisions/", headers=headers).json()
    decision_id = decisions[0]["id"]

    # 2. Upload with invalid extension (.txt) should fail (400)
    invalid_file = ("bad_file.txt", b"Hello text file content", "text/plain")
    res_invalid_ext = client.post(
        "/api/v1/documents/upload",
        data={"decision_id": decision_id},
        files={"file": invalid_file},
        headers=headers
    )
    assert res_invalid_ext.status_code == 400
    assert "Invalid file type" in res_invalid_ext.json()["detail"]

    # 3. Upload valid PDF document
    valid_pdf = ("architecture_diagram.pdf", b"%PDF-1.4 Mock PDF content for test", "application/pdf")
    res_upload = client.post(
        "/api/v1/documents/upload",
        data={"decision_id": decision_id},
        files={"file": valid_pdf},
        headers=headers
    )
    assert res_upload.status_code == 201
    doc_data = res_upload.json()
    assert doc_data["file_name"] == "architecture_diagram.pdf"
    assert doc_data["decision_id"] == decision_id
    doc_id = doc_data["id"]

    # 4. Get all documents
    res_list = client.get("/api/v1/documents/", headers=headers)
    assert res_list.status_code == 200
    assert any(d["id"] == doc_id for d in res_list.json())

    # 5. Get documents for decision
    res_dec_docs = client.get(f"/api/v1/decisions/{decision_id}/documents", headers=headers)
    assert res_dec_docs.status_code == 200
    assert len(res_dec_docs.json()) > 0

    # 5b. Test decision attachment endpoint POST /decisions/{id}/attachments
    attachment_png = ("screenshot.png", b"\x89PNG\r\n\x1a\nFake PNG content", "image/png")
    res_attachment = client.post(
        f"/api/v1/decisions/{decision_id}/attachments",
        files={"file": attachment_png},
        headers=headers
    )
    assert res_attachment.status_code == 201
    assert "Attachment uploaded successfully." in res_attachment.json()["message"]

    # 6. Delete document
    res_del = client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert res_del.status_code == 200


def test_comment_crud_and_validations():
    """Test top-level Comment CRUD APIs and validations."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    decisions = client.get("/api/v1/decisions/", headers=headers).json()
    decision_id = decisions[0]["id"]

    # 1. Empty comment should fail (400 or 422)
    res_empty = client.post(
        "/api/v1/comments",
        json={"decision_id": decision_id, "content": "   "},
        headers=headers
    )
    assert res_empty.status_code in [400, 422]

    # 2. Valid comment via POST /comments
    res_create = client.post(
        "/api/v1/comments",
        json={"decision_id": decision_id, "comment": "This is a direct comment test."},
        headers=headers
    )
    assert res_create.status_code == 201
    comment_data = res_create.json()
    comment_id = comment_data["id"]
    assert comment_data["content"] == "This is a direct comment test."

    # 3. Update comment via PUT /comments/{id}
    res_update = client.put(
        f"/api/v1/comments/{comment_id}",
        json={"content": "Updated comment content text."},
        headers=headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["content"] == "Updated comment content text."

    # 4. GET /comments/{id}
    res_get = client.get(f"/api/v1/comments/{comment_id}", headers=headers)
    assert res_get.status_code == 200

    # 5. Delete comment via DELETE /comments/{id}
    res_del = client.delete(f"/api/v1/comments/{comment_id}", headers=headers)
    assert res_del.status_code == 200


def test_meeting_notes_updates():
    """Test updating meeting summary, conclusion, and next action on a decision."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    decisions = client.get("/api/v1/decisions/", headers=headers).json()
    decision_id = decisions[0]["id"]

    notes_payload = {
        "meeting_summary": "Discussed migration timeline and cloud architecture options.",
        "conclusion": "Agreed to proceed with AWS RDS PostgreSQL.",
        "next_action": "Schedule security audit by Friday."
    }

    res = client.put(f"/api/v1/decisions/{decision_id}/meeting-notes", json=notes_payload, headers=headers)
    assert res.status_code == 200
    updated_dec = res.json()
    assert updated_dec["meeting_summary"] == notes_payload["meeting_summary"]
    assert updated_dec["conclusion"] == notes_payload["conclusion"]
    assert updated_dec["next_action"] == notes_payload["next_action"]


def test_decision_versions_endpoints():
    """Test GET and POST /decisions/{id}/versions endpoints and automatic version creation validation."""
    headers = login_headers("admin@company.com", "AdminPassword123")

    # 1. Fetch a decision ID
    decisions = client.get("/api/v1/decisions/", headers=headers).json()
    decision_id = decisions[0]["id"]
    initial_versions = client.get(f"/api/v1/decisions/{decision_id}/versions", headers=headers).json()
    initial_version_count = len(initial_versions)

    # 2. Call POST /api/v1/decisions/{id}/versions to manually create a new version snapshot
    version_payload = {
        "change_summary": "Manual snapshot created during API test",
        "title": decisions[0]["title"],
        "status": "Draft"
    }
    res_post = client.post(f"/api/v1/decisions/{decision_id}/versions", json=version_payload, headers=headers)
    assert res_post.status_code == 201
    new_version_data = res_post.json()
    assert "version_number" in new_version_data
    assert "modified_at" in new_version_data
    assert "modified_by" in new_version_data
    assert new_version_data["change_summary"] == "Manual snapshot created during API test"

    # 3. Call GET /api/v1/decisions/{id}/versions to verify version list
    res_get = client.get(f"/api/v1/decisions/{decision_id}/versions", headers=headers)
    assert res_get.status_code == 200
    versions_list = res_get.json()
    assert len(versions_list) == initial_version_count + 1
    assert versions_list[0]["version_number"] > versions_list[1]["version_number"]

    # 4. Test 404 for non-existent decision
    res_404 = client.get("/api/v1/decisions/999999/versions", headers=headers)
    assert res_404.status_code == 404


def test_milestone3_audit_logs_and_immutability():
    admin_headers = login_headers("admin@company.com", "AdminPassword123")
    emp_headers = login_headers("employee@company.com", "EmployeePassword123")

    # 1. Employee access should be forbidden (403)
    res_emp = client.get("/api/v1/audit-logs/", headers=emp_headers)
    assert res_emp.status_code == 403

    # 2. Admin access should succeed
    res_admin = client.get("/api/v1/audit-logs/", headers=admin_headers)
    assert res_admin.status_code == 200
    logs = res_admin.json()
    assert len(logs) > 0

    log_id = logs[0]["id"]

    # 3. Lookup by ID
    res_single = client.get(f"/api/v1/audit-logs/{log_id}", headers=admin_headers)
    assert res_single.status_code == 200
    assert res_single.json()["id"] == log_id

    # 4. Audit Log Immutability: PUT and DELETE are forbidden
    res_put = client.put(f"/api/v1/audit-logs/{log_id}", json={"action_type": "HACKED"}, headers=admin_headers)
    assert res_put.status_code == 403

    res_del = client.delete(f"/api/v1/audit-logs/{log_id}", headers=admin_headers)
    assert res_del.status_code == 403

    # 5. Test filtering by action_type and date
    res_filter = client.get("/api/v1/audit-logs/?action_type=LOGIN", headers=admin_headers)
    assert res_filter.status_code == 200

    # 6. Test direct routes GET /users/{id}/audit-logs and GET /decisions/{id}/audit-logs
    res_user_logs = client.get("/api/v1/users/1/audit-logs", headers=admin_headers)
    assert res_user_logs.status_code == 200


def test_milestone3_reports_and_exports():
    admin_headers = login_headers("admin@company.com", "AdminPassword123")
    manager_headers = login_headers("manager@company.com", "ManagerPassword123")
    emp_headers = login_headers("employee@company.com", "EmployeePassword123")

    # 1. Employee forbidden from reports
    assert client.get("/api/v1/reports/decisions", headers=emp_headers).status_code == 403
    assert client.get("/api/v1/reports/approvals", headers=emp_headers).status_code == 403

    # 2. Decision Report
    res_dec = client.get("/api/v1/reports/decisions", headers=manager_headers)
    assert res_dec.status_code == 200
    dec_data = res_dec.json()
    assert "total_decisions" in dec_data
    assert "approved" in dec_data
    assert "records" in dec_data

    # 3. Approval Report
    res_app = client.get("/api/v1/reports/approvals", headers=manager_headers)
    assert res_app.status_code == 200
    app_data = res_app.json()
    assert "total_reviewers" in app_data
    assert "reviewers" in app_data

    # 4. Team Report
    res_team = client.get("/api/v1/reports/teams", headers=manager_headers)
    assert res_team.status_code == 200
    team_data = res_team.json()
    assert "total_teams" in team_data

    # 5. Audit Report
    res_audit = client.get("/api/v1/reports/audit", headers=manager_headers)
    assert res_audit.status_code == 200
    audit_data = res_audit.json()
    assert "total_logins" in audit_data

    # 6. Export Excel
    res_excel = client.get("/api/v1/reports/export/excel?report_type=all", headers=manager_headers)
    assert res_excel.status_code == 200
    assert "sheet" in res_excel.headers.get("content-type", "").lower() or len(res_excel.content) > 0

    # 7. Export PDF
    res_pdf = client.get("/api/v1/reports/export/pdf?report_type=all", headers=manager_headers)
    assert res_pdf.status_code == 200
    assert res_pdf.headers.get("content-type") == "application/pdf"
    assert res_pdf.content.startswith(b"%PDF-1.4")


def test_notifications_system():
    admin_headers = login_headers("admin@company.com", "AdminPassword123")
    emp_headers = login_headers("employee@company.com", "EmployeePassword123")

    # 1. GET /notifications
    res = client.get("/api/v1/notifications/", headers=emp_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert isinstance(notifs, list)

    # 2. GET /notifications/count
    res_count = client.get("/api/v1/notifications/count", headers=emp_headers)
    assert res_count.status_code == 200
    count_data = res_count.json()
    assert "unread_count" in count_data
    assert "total_count" in count_data

    # 3. Test mark all read
    res_read_all = client.put("/api/v1/notifications/read-all", headers=emp_headers)
    assert res_read_all.status_code == 200

    # 4. DELETE /notifications/{id} forbidden
    res_del = client.delete("/api/v1/notifications/1", headers=emp_headers)
    assert res_del.status_code == 403
    assert "cannot be deleted" in res_del.json()["detail"].lower()


def test_auth_wrong_password_and_invalid_inputs():
    """Test wrong password, invalid email, empty fields, and unauthorized requests."""
    # 1. Wrong password -> Proper HTTP 401 error
    res_wrong_pw = client.post(
        "/api/v1/users/login",
        data={"username": "admin@company.com", "password": "WrongPassword999"}
    )
    assert res_wrong_pw.status_code == 401
    assert "Incorrect email or password" in res_wrong_pw.json()["detail"]

    # 2. Invalid email format during registration -> HTTP 422
    res_invalid_email = client.post(
        "/api/v1/users/register",
        json={"email": "not-an-email", "password": "Password123", "full_name": "Invalid Email User"}
    )
    assert res_invalid_email.status_code == 422

    # 3. Empty password -> HTTP 422
    res_empty_pw = client.post(
        "/api/v1/users/register",
        json={"email": "validuser@company.com", "password": "   ", "full_name": "Empty Pass User"}
    )
    assert res_empty_pw.status_code == 422

    # 4. Unauthorized access to protected route -> HTTP 401
    res_unauth = client.get("/api/v1/users/me")
    assert res_unauth.status_code == 401


def test_alternatives_crud_and_matrix_comparison():
    """Test Alternatives CRUD, feasibility/risk scoring, and decision comparison payload."""
    admin_headers = login_headers("admin@company.com", "AdminPassword123")

    decisions = client.get("/api/v1/decisions/", headers=admin_headers).json()
    decision_id = decisions[0]["id"]

    # 1. Create Alternative
    alt_payload = {
        "title": "Option C: Serverless Architecture",
        "description": "Deploy components as cloud microservices.",
        "cost": 5000.0,
        "feasibility_rating": 5,
        "risk_rating": 2,
        "pros": ["Low operational cost", "Automatic scale"],
        "cons": ["Cold start latency"],
        "risk_mitigation": "Provisioned concurrency"
    }
    res_create = client.post(f"/api/v1/decisions/{decision_id}/alternatives", json=alt_payload, headers=admin_headers)
    assert res_create.status_code in [200, 201]
    alt_data = res_create.json()
    alt_id = alt_data["id"]
    assert alt_data["title"] == "Option C: Serverless Architecture"

    # 2. Update Alternative
    res_update = client.put(
        f"/api/v1/alternatives/{alt_id}",
        json={"title": "Option C: Serverless Microservices", "cost": 5500.0},
        headers=admin_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["cost"] == 5500.0

    # 3. Decision Comparison Verification
    res_dec = client.get(f"/api/v1/decisions/{decision_id}", headers=admin_headers)
    assert res_dec.status_code == 200
    alts = res_dec.json()["alternatives"]
    assert len(alts) >= 1
    assert any(a["id"] == alt_id for a in alts)

    # 4. Delete Alternative
    res_del = client.delete(f"/api/v1/alternatives/{alt_id}", headers=admin_headers)
    assert res_del.status_code in [200, 204]


def test_document_large_file_size_rejection():
    """Upload a file exceeding 10MB limit and verify proper HTTP 400 rejection."""
    headers = login_headers("admin@company.com", "AdminPassword123")
    decisions = client.get("/api/v1/decisions/", headers=headers).json()
    decision_id = decisions[0]["id"]

    # Create dummy bytes slightly larger than 10MB (10.5 MB)
    large_content = b"0" * (10 * 1024 * 1024 + 500 * 1024)
    large_pdf = ("oversized_report.pdf", large_content, "application/pdf")

    res_large = client.post(
        "/api/v1/documents/upload",
        data={"decision_id": decision_id},
        files={"file": large_pdf},
        headers=headers
    )
    assert res_large.status_code == 400
    assert "exceeds maximum allowed limit of 10 MB" in res_large.json()["detail"]


def test_dashboard_and_reports_db_match():
    """CRITICAL REQUIREMENT: Verify that numbers shown in reports and dashboards match database data exactly."""
    from backend.app.database import SessionLocal
    from backend.app import models
    from sqlalchemy import func

    # Get admin headers first so login audit log entry is written before snapshot
    admin_headers = login_headers("admin@company.com", "AdminPassword123")

    db_session = SessionLocal()
    try:
        # Direct SQL / ORM Queries
        actual_total_decisions = db_session.query(models.Decision).count()
        actual_approved = db_session.query(models.Decision).filter(models.Decision.status == "Approved").count()
        actual_rejected = db_session.query(models.Decision).filter(models.Decision.status == "Rejected").count()
        actual_pending = db_session.query(models.Decision).filter(models.Decision.status.in_(["Draft", "Under Review"])).count()
        actual_total_users = db_session.query(models.User).count()
        actual_total_logins = db_session.query(models.AuditLog).filter(models.AuditLog.action_type.in_(["LOGIN", "USER_LOGIN"])).count()

        # Query Status counts from DB
        status_rows = db_session.query(models.Decision.status, func.count(models.Decision.id)).group_by(models.Decision.status).all()
        expected_status_map = {s[0]: s[1] for s in status_rows}

        # Query Category counts from DB
        cat_rows = db_session.query(models.Decision.category, func.count(models.Decision.id)).group_by(models.Decision.category).all()
        expected_category_map = {c[0]: c[1] for c in cat_rows}

        # Request Dashboard API
        res_dash = client.get("/api/v1/analytics/dashboard", headers=admin_headers)
        assert res_dash.status_code == 200
        dash_data = res_dash.json()

        # 1. Verify Analytics Dashboard matches DB
        assert dash_data["total_decisions"] == actual_total_decisions, f"Dashboard total decisions {dash_data['total_decisions']} != DB count {actual_total_decisions}"
        assert dash_data["total_users"] == actual_total_users, f"Dashboard total users {dash_data['total_users']} != DB count {actual_total_users}"
        assert dash_data["status_distribution"] == expected_status_map, f"Dashboard status map {dash_data['status_distribution']} != DB {expected_status_map}"
        assert dash_data["category_distribution"] == expected_category_map, f"Dashboard category map {dash_data['category_distribution']} != DB {expected_category_map}"

        # Request Decisions Report API
        res_rep_dec = client.get("/api/v1/reports/decisions", headers=admin_headers)
        assert res_rep_dec.status_code == 200
        rep_dec_data = res_rep_dec.json()

        # 2. Verify Decisions Report matches DB
        assert rep_dec_data["total_decisions"] == actual_total_decisions
        assert rep_dec_data["approved"] == actual_approved
        assert rep_dec_data["rejected"] == actual_rejected
        assert rep_dec_data["pending"] == actual_pending

        # Request Audit Report API
        res_rep_audit = client.get("/api/v1/reports/audit", headers=admin_headers)
        assert res_rep_audit.status_code == 200
        rep_audit_data = res_rep_audit.json()

        # 3. Verify Audit Report matches DB
        assert rep_audit_data["total_logins"] == actual_total_logins

    finally:
        db_session.close()


# Clean up test DB after execution
def teardown_module(module):
    if os.path.exists("./test_decisions.db"):
        try:
            os.remove("./test_decisions.db")
        except Exception:
            pass


if __name__ == "__main__":
    import pytest
    sys.exit(pytest.main(["-v", __file__]))



