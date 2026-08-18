from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    user_id: Optional[int] = Query(default=None),
    action_type: Optional[str] = Query(default=None),
    decision_id: Optional[int] = Query(default=None),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if action_type:
        q = q.filter(AuditLog.action_type == action_type)
    if decision_id:
        q = q.filter(AuditLog.decision_id == decision_id)
    return q.order_by(AuditLog.id.desc()).limit(limit).all()

@router.get("/{log_id}", response_model=AuditLogOut)
def get_audit_log(log_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from fastapi import HTTPException
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@router.get("/users/{user_id}/audit-logs", response_model=list[AuditLogOut])
def get_user_audit_logs(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AuditLog).filter(AuditLog.user_id == user_id).order_by(AuditLog.id.desc()).all()
