from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.audit_log import AuditLog
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get("")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


# Get audit/approval history for one decision
@router.get("/decision/{decision_id}")
def get_decision_audit_logs(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.decision_id == decision_id)
        .order_by(AuditLog.created_at.asc())
        .all()
    )