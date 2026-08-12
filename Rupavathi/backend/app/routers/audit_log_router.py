from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log_schema import AuditLogResponse
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["Audit Logs"])


def _get_audit_log_or_404(db: Session, audit_log_id: int) -> AuditLog:
    audit_log = db.query(AuditLog).filter(AuditLog.id == audit_log_id).first()
    if not audit_log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return audit_log


# Get All Audit Logs (optionally filtered)
@router.get("/audit-logs", response_model=list[AuditLogResponse])
def list_audit_logs(
    user_id: Optional[int] = None,
    action_type: Optional[str] = None,
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(AuditLog)
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)
    if date_filter is not None:
        query = query.filter(func.date(AuditLog.created_at) == date_filter)

    return query.order_by(AuditLog.created_at.desc()).all()


# Get Audit Log By ID
@router.get("/audit-logs/{audit_log_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_audit_log_or_404(db, audit_log_id)


# Get Audit Logs For A User
@router.get("/users/{user_id}/audit-logs", response_model=list[AuditLogResponse])
def get_user_audit_logs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


# Get Audit Logs For A Decision
@router.get("/decisions/{decision_id}/audit-logs", response_model=list[AuditLogResponse])
def get_decision_audit_logs(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.decision_id == decision_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )
