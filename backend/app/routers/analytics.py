from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse, HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
import io
import pandas as pd
import datetime
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Total counts
    total_decisions = db.query(models.Decision).count()
    
    # Decisions by Status
    status_counts = db.query(
        models.Decision.status, func.count(models.Decision.id)
    ).group_by(models.Decision.status).all()
    status_map = {s[0]: s[1] for s in status_counts}
    
    # Decisions by Category
    category_counts = db.query(
        models.Decision.category, func.count(models.Decision.id)
    ).group_by(models.Decision.category).all()
    category_map = {c[0]: c[1] for c in category_counts}

    # User's Own Stats
    my_decisions_count = db.query(models.Decision).filter(models.Decision.creator_id == current_user.id).count()
    
    # Pending approvals assigned to this user
    my_pending_approvals = db.query(models.Approval).filter(
        models.Approval.approver_id == current_user.id,
        models.Approval.status == "Pending"
    ).count()

    # Total users and active teams
    total_users = db.query(models.User).count()
    active_teams = db.query(models.User.team).filter(models.User.team != None).distinct().count()

    # Recent activities (last 10 audit logs)
    # Standard users see activities relating to themselves; Admin/Manager see all
    log_query = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc())
    if current_user.role not in ["Manager", "Administrator"]:
        log_query = log_query.filter(models.AuditLog.user_id == current_user.id)
    recent_logs = log_query.limit(10).all()
    
    logs_data = []
    for log in recent_logs:
        logs_data.append({
            "id": log.id,
            "user_email": log.user.email if log.user else "System",
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Average approval turnaround time
    # (Difference between assigned_at and actioned_at for completed approvals)
    completed_approvals = db.query(models.Approval).filter(models.Approval.status != "Pending").all()
    avg_turnaround_hours = 0.0
    if completed_approvals:
        total_time = datetime.timedelta()
        for app in completed_approvals:
            if app.actioned_at and app.assigned_at:
                total_time += (app.actioned_at - app.assigned_at)
        avg_turnaround_hours = (total_time.total_seconds() / 3600.0) / len(completed_approvals)

    return {
        "total_decisions": total_decisions,
        "status_distribution": status_map,
        "category_distribution": category_map,
        "my_decisions_count": my_decisions_count,
        "my_pending_approvals": my_pending_approvals,
        "total_users": total_users,
        "active_teams": active_teams,
        "recent_activities": logs_data,
        "avg_approval_turnaround_hours": round(avg_turnaround_hours, 2)
    }

@router.get("/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    current_user: models.User = Depends(auth.check_role(["Administrator", "Manager"])),
    db: Session = Depends(get_db)
):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

@router.get("/export/excel")
def export_to_excel(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch decisions data
    decisions = db.query(models.Decision).all()
    decisions_list = []
    for d in decisions:
        decisions_list.append({
            "Decision ID": d.id,
            "Title": d.title,
            "Problem Statement": d.problem_statement,
            "Category": d.category,
            "Status": d.status,
            "Version": d.current_version,
            "Creator": d.creator.full_name,
            "Created At": d.created_at,
            "Updated At": d.updated_at
        })
    df_decisions = pd.DataFrame(decisions_list)

    # Fetch audit logs (only include if Manager or Admin)
    df_audit = pd.DataFrame()
    if current_user.role in ["Manager", "Administrator"]:
        logs = db.query(models.AuditLog).all()
        logs_list = []
        for l in logs:
            logs_list.append({
                "Log ID": l.id,
                "User": l.user.email if l.user else "System",
                "Action": l.action,
                "Details": l.details,
                "IP Address": l.ip_address,
                "Timestamp": l.timestamp
            })
        df_audit = pd.DataFrame(logs_list)

    # Write to in-memory bytes buffer
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        if not df_decisions.empty:
            df_decisions.to_excel(writer, sheet_name="Decisions", index=False)
        if not df_audit.empty:
            df_audit.to_excel(writer, sheet_name="Audit Logs", index=False)

    buffer.seek(0)
    
    # Generate filename
    filename = f"decision_replay_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    auth.log_activity(db, current_user.id, "REPORT_EXPORT_EXCEL", "Exported decisions database to Excel.")

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
