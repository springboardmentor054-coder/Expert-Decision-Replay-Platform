"""
Audit Logs module:
- Stores action history for login, decision changes, document uploads, and comments
- Access restricted to administrators
- Read-only API surface (logs cannot be edited or deleted)
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditActionType, AuditLog, Decision, User, UserRole
from app.schemas import AuditLogOut
from app.deps import require_roles

router = APIRouter(tags=["Audit Logs"])


def _get_client_ip(request: Optional[Request]) -> Optional[str]:
    if not request:
        return None
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def create_audit_log(
    db: Session,
    user_id: int,
    action_type: AuditActionType,
    description: str,
    request: Optional[Request] = None,
    decision_id: Optional[int] = None,
    commit: bool = True,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        decision_id=decision_id,
        action_type=action_type,
        description=description,
        ip_address=_get_client_ip(request),
    )
    db.add(log)
    if commit:
        db.commit()
        db.refresh(log)
    return log


@router.get("/audit-logs", response_model=List[AuditLogOut])
def list_audit_logs(
    action_type: Optional[AuditActionType] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    decision_id: Optional[int] = Query(default=None),
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)),
):
    query = db.query(AuditLog)
    if action_type is not None:
        query = query.filter(AuditLog.action_type == action_type)
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if decision_id is not None:
        query = query.filter(AuditLog.decision_id == decision_id)
    if date_from is not None:
        query = query.filter(AuditLog.created_at >= date_from)
    if date_to is not None:
        query = query.filter(AuditLog.created_at <= date_to)
    return query.order_by(AuditLog.created_at.desc()).all()


@router.get("/audit-logs/{audit_log_id}", response_model=AuditLogOut)
def get_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)),
):
    log = db.query(AuditLog).filter(AuditLog.id == audit_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return log


@router.get("/users/{user_id}/audit-logs", response_model=List[AuditLogOut])
def get_user_audit_logs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)),
):
    return db.query(AuditLog).filter(AuditLog.user_id == user_id).order_by(AuditLog.created_at.desc()).all()


@router.get("/decisions/{decision_id}/audit-logs", response_model=List[AuditLogOut])
def get_decision_audit_logs(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)),
):
    return db.query(AuditLog).filter(AuditLog.decision_id == decision_id).order_by(AuditLog.created_at.desc()).all()
