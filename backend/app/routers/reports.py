from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
import io
import pandas as pd
import datetime
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

# Dependency to restrict reports access to Managers and Administrators
def check_reports_permission(current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in [models.UserRole.MANAGER.value, models.UserRole.ADMINISTRATOR.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Reports are accessible only by Managers and Administrators."
        )
    return current_user

# Task 2 - Decision Report API
@router.get("/decisions", response_model=schemas.DecisionReportResponse)
def get_decision_report(
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    decisions = db.query(models.Decision).order_by(models.Decision.created_at.desc()).all()
    
    total_decisions = len(decisions)
    approved = sum(1 for d in decisions if d.status == models.DecisionStatus.APPROVED.value)
    rejected = sum(1 for d in decisions if d.status == models.DecisionStatus.REJECTED.value)
    pending = sum(1 for d in decisions if d.status in [models.DecisionStatus.DRAFT.value, models.DecisionStatus.UNDER_REVIEW.value])

    records = []
    for d in decisions:
        creator_name = d.creator.full_name if d.creator else "Unknown User"
        records.append(schemas.DecisionReportItem(
            id=d.id,
            title=d.title,
            category=d.category,
            status=d.status,
            created_by=creator_name,
            created_date=d.created_at
        ))

    return schemas.DecisionReportResponse(
        total_decisions=total_decisions,
        approved=approved,
        rejected=rejected,
        pending=pending,
        records=records
    )

# Task 3 - Approval Report API
@router.get("/approvals", response_model=schemas.ApprovalReportResponse)
def get_approval_report(
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    # Fetch all users who have reviewer/manager/admin roles or have existing approval records
    reviewers = db.query(models.User).filter(
        models.User.role.in_([
            models.UserRole.REVIEWER.value,
            models.UserRole.MANAGER.value,
            models.UserRole.ADMINISTRATOR.value
        ])
    ).all()

    reviewer_items = []
    for reviewer in reviewers:
        approvals = db.query(models.Approval).filter(models.Approval.approver_id == reviewer.id).all()
        approved_count = sum(1 for a in approvals if a.status == "Approved")
        rejected_count = sum(1 for a in approvals if a.status == "Rejected")
        pending_count = sum(1 for a in approvals if a.status == "Pending")

        reviewer_items.append(schemas.ApprovalReportItem(
            reviewer_name=reviewer.full_name,
            reviewer_email=reviewer.email,
            decisions_approved=approved_count,
            decisions_rejected=rejected_count,
            pending_reviews=pending_count
        ))

    return schemas.ApprovalReportResponse(
        total_reviewers=len(reviewer_items),
        reviewers=reviewer_items
    )

# Task 4 - Team Report API
@router.get("/teams", response_model=schemas.TeamReportResponse)
def get_team_report(
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    # Get distinct non-null teams from users
    team_results = db.query(models.User.team).filter(models.User.team != None, models.User.team != "").distinct().all()
    team_names = [t[0] for t in team_results]

    if not team_names:
        team_names = ["Engineering", "Product", "Operations", "Legal", "Executive", "Research"]

    team_items = []
    for team_name in team_names:
        # Total users in team
        team_users = db.query(models.User).filter(models.User.team == team_name).all()
        user_ids = [u.id for u in team_users]

        total_users_count = len(team_users)
        
        # Decisions created by users in team
        total_decisions_count = 0
        total_approvals_count = 0

        if user_ids:
            total_decisions_count = db.query(models.Decision).filter(models.Decision.creator_id.in_(user_ids)).count()
            total_approvals_count = db.query(models.Approval).filter(
                models.Approval.approver_id.in_(user_ids),
                models.Approval.status == "Approved"
            ).count()

        team_items.append(schemas.TeamReportItem(
            team_name=team_name,
            total_decisions=total_decisions_count,
            total_users=total_users_count,
            total_approvals=total_approvals_count
        ))

    return schemas.TeamReportResponse(
        total_teams=len(team_items),
        teams=team_items
    )

# Task 5 - Audit Report API
@router.get("/audit", response_model=schemas.AuditReportResponse)
def get_audit_report(
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    logs = db.query(models.AuditLog).all()

    total_logins = sum(1 for l in logs if l.action_type in ["LOGIN", "USER_LOGIN"])
    decisions_created = sum(1 for l in logs if l.action_type in ["CREATE_DECISION", "DECISION_CREATE"])
    documents_uploaded = sum(1 for l in logs if l.action_type in ["UPLOAD_DOCUMENT", "DOCUMENT_UPLOAD"])
    comments_added = sum(1 for l in logs if l.action_type in ["ADD_COMMENT", "COMMENT_CREATE"])
    approval_actions = sum(1 for l in logs if l.action_type in ["APPROVE_DECISION", "REJECT_DECISION", "APPROVAL_APPROVED", "APPROVAL_REJECTED"])

    return schemas.AuditReportResponse(
        total_logins=total_logins,
        decisions_created=decisions_created,
        documents_uploaded=documents_uploaded,
        comments_added=comments_added,
        approval_actions=approval_actions
    )

# Task 6 - Export Excel Report
@router.get("/export/excel")
def export_reports_excel(
    report_type: Optional[str] = Query("all", description="Report type: all, decisions, approvals, teams, audit"),
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        if report_type in ["all", "decisions"]:
            decisions = db.query(models.Decision).all()
            d_list = [{
                "Decision ID": d.id,
                "Title": d.title,
                "Category": d.category,
                "Status": d.status,
                "Created By": d.creator.full_name if d.creator else "N/A",
                "Created Date": d.created_at.strftime("%Y-%m-%d %H:%M:%S")
            } for d in decisions]
            pd.DataFrame(d_list).to_excel(writer, sheet_name="Decisions Report", index=False)

        if report_type in ["all", "approvals"]:
            reviewers = db.query(models.User).filter(models.User.role.in_(["Reviewer", "Manager", "Administrator"])).all()
            a_list = []
            for r in reviewers:
                apps = db.query(models.Approval).filter(models.Approval.approver_id == r.id).all()
                a_list.append({
                    "Reviewer Name": r.full_name,
                    "Email": r.email,
                    "Decisions Approved": sum(1 for a in apps if a.status == "Approved"),
                    "Decisions Rejected": sum(1 for a in apps if a.status == "Rejected"),
                    "Pending Reviews": sum(1 for a in apps if a.status == "Pending")
                })
            pd.DataFrame(a_list).to_excel(writer, sheet_name="Approval Report", index=False)

        if report_type in ["all", "teams"]:
            teams = db.query(models.User.team).filter(models.User.team != None).distinct().all()
            t_list = []
            for (t_name,) in teams:
                u_ids = [u.id for u in db.query(models.User).filter(models.User.team == t_name).all()]
                t_list.append({
                    "Team Name": t_name,
                    "Total Decisions": db.query(models.Decision).filter(models.Decision.creator_id.in_(u_ids)).count() if u_ids else 0,
                    "Total Users": len(u_ids),
                    "Total Approvals": db.query(models.Approval).filter(models.Approval.approver_id.in_(u_ids), models.Approval.status == "Approved").count() if u_ids else 0
                })
            pd.DataFrame(t_list).to_excel(writer, sheet_name="Team Report", index=False)

        if report_type in ["all", "audit"]:
            logs = db.query(models.AuditLog).all()
            audit_summary = [{
                "Total Logins": sum(1 for l in logs if l.action_type in ["LOGIN", "USER_LOGIN"]),
                "Decisions Created": sum(1 for l in logs if l.action_type in ["CREATE_DECISION", "DECISION_CREATE"]),
                "Documents Uploaded": sum(1 for l in logs if l.action_type in ["UPLOAD_DOCUMENT", "DOCUMENT_UPLOAD"]),
                "Comments Added": sum(1 for l in logs if l.action_type in ["ADD_COMMENT", "COMMENT_CREATE"]),
                "Approval Actions": sum(1 for l in logs if l.action_type in ["APPROVE_DECISION", "REJECT_DECISION", "APPROVAL_APPROVED", "APPROVAL_REJECTED"])
            }]
            pd.DataFrame(audit_summary).to_excel(writer, sheet_name="Audit Report", index=False)

    buffer.seek(0)
    filename = f"governance_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    auth.log_activity(db, current_user.id, "REPORT_EXPORT_EXCEL", f"Exported {report_type} report to Excel.")

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Pure Python Helper to generate valid PDF document bytes
def generate_pdf_bytes(title: str, text_lines: List[str]) -> bytes:
    # Build a clean PDF 1.4 byte stream
    stream_content = []
    stream_content.append("BT")
    stream_content.append("/F1 18 Tf")
    stream_content.append("50 750 Td")
    stream_content.append(f"({title}) Tj")
    stream_content.append("ET")
    
    y = 710
    stream_content.append("BT")
    stream_content.append("/F1 10 Tf")
    stream_content.append(f"50 {y} Td")
    stream_content.append("14 TL")
    
    for line in text_lines:
        safe_line = line.replace("(", "\\(").replace(")", "\\)")
        stream_content.append(f"({safe_line}) Tj")
        stream_content.append("T*")
    stream_content.append("ET")

    content_str = "\n".join(stream_content)
    content_bytes = content_str.encode("latin-1")

    objects = []
    objects.append(b"%PDF-1.4\n")
    
    # Obj 1: Catalog
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    # Obj 2: Pages
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    # Obj 3: Page
    obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
    # Obj 4: Font
    obj4 = b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    # Obj 5: Stream
    obj5 = f"5 0 obj\n<< /Length {len(content_bytes)} >>\nstream\n".encode("latin-1") + content_bytes + b"\nendstream\nendobj\n"

    pdf_body = obj1 + obj2 + obj3 + obj4 + obj5
    return b"%PDF-1.4\n" + pdf_body + b"%%EOF\n"

# Task 6 - Export PDF Report
@router.get("/export/pdf")
def export_reports_pdf(
    report_type: Optional[str] = Query("all", description="Report type: all, decisions, approvals, teams, audit"),
    current_user: models.User = Depends(check_reports_permission),
    db: Session = Depends(get_db)
):
    lines = [
        f"Generated On: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Exported By: {current_user.full_name} ({current_user.email})",
        "--------------------------------------------------------------------------------",
        ""
    ]

    if report_type in ["all", "decisions"]:
        decisions = db.query(models.Decision).all()
        lines.append("DECISIONS REPORT")
        lines.append(f"Total Decisions: {len(decisions)}")
        for d in decisions:
            lines.append(f"- #{d.id} | {d.title} | Category: {d.category} | Status: {d.status} | By: {d.creator.full_name if d.creator else 'N/A'}")
        lines.append("")

    if report_type in ["all", "approvals"]:
        reviewers = db.query(models.User).filter(models.User.role.in_(["Reviewer", "Manager", "Administrator"])).all()
        lines.append("APPROVAL WORKFLOW REPORT")
        for r in reviewers:
            apps = db.query(models.Approval).filter(models.Approval.approver_id == r.id).all()
            app_cnt = sum(1 for a in apps if a.status == "Approved")
            rej_cnt = sum(1 for a in apps if a.status == "Rejected")
            pnd_cnt = sum(1 for a in apps if a.status == "Pending")
            lines.append(f"- Reviewer: {r.full_name} | Approved: {app_cnt} | Rejected: {rej_cnt} | Pending: {pnd_cnt}")
        lines.append("")

    if report_type in ["all", "audit"]:
        logs = db.query(models.AuditLog).all()
        lines.append("AUDIT METRICS SUMMARY REPORT")
        lines.append(f"- Total User Logins: {sum(1 for l in logs if l.action_type in ['LOGIN', 'USER_LOGIN'])}")
        lines.append(f"- Decisions Created: {sum(1 for l in logs if l.action_type in ['CREATE_DECISION', 'DECISION_CREATE'])}")
        lines.append(f"- Documents Uploaded: {sum(1 for l in logs if l.action_type in ['UPLOAD_DOCUMENT', 'DOCUMENT_UPLOAD'])}")
        lines.append(f"- Comments Added: {sum(1 for l in logs if l.action_type in ['ADD_COMMENT', 'COMMENT_CREATE'])}")
        lines.append(f"- Approval Actions: {sum(1 for l in logs if l.action_type in ['APPROVE_DECISION', 'REJECT_DECISION', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED'])}")
        lines.append("")

    pdf_bytes = generate_pdf_bytes("EXPERT DECISION REPLAY PLATFORM - EXECUTIVE REPORT", lines)
    buffer = io.BytesIO(pdf_bytes)

    filename = f"governance_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    auth.log_activity(db, current_user.id, "REPORT_EXPORT_PDF", f"Exported {report_type} report to PDF.")

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
