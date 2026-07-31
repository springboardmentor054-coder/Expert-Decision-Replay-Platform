from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.decision import Decision

from app.schemas.audit_log import AuditLogResponse

from app.core.security import get_current_admin


# ==========================================
# Audit Log Router
# ==========================================

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


# ==========================================
# User Audit Log Router
# ==========================================

user_audit_log_router = APIRouter(
    prefix="/users",
    tags=["User Audit Logs"]
)


# ==========================================
# Decision Audit Log Router
# ==========================================

decision_audit_log_router = APIRouter(
    prefix="/decisions",
    tags=["Decision Audit Logs"]
)


# ==========================================
# Database Dependency
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# GET /audit-logs
# Get All Audit Logs
# ADMINISTRATOR ONLY
# ==========================================

@router.get(
    "",
    response_model=list[AuditLogResponse]
)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    audit_logs = db.query(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).all()

    return audit_logs


# ==========================================
# GET /audit-logs/{id}
# Get Single Audit Log
# ADMINISTRATOR ONLY
# ==========================================

@router.get(
    "/{id}",
    response_model=AuditLogResponse
)
def get_audit_log(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    audit_log = db.query(AuditLog).filter(
        AuditLog.id == id
    ).first()

    if not audit_log:

        raise HTTPException(
            status_code=404,
            detail="Audit log not found."
        )

    return audit_log


# ==========================================
# GET /users/{id}/audit-logs
# Get Audit Logs For Specific User
# ADMINISTRATOR ONLY
# ==========================================

@user_audit_log_router.get(
    "/{id}/audit-logs",
    response_model=list[AuditLogResponse]
)
def get_user_audit_logs(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    # ==========================================
    # CHECK USER EXISTS
    # ==========================================

    user = db.query(User).filter(
        User.id == id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # ==========================================
    # GET USER AUDIT LOGS
    # ==========================================

    audit_logs = db.query(AuditLog).filter(
        AuditLog.user_id == id
    ).order_by(
        AuditLog.created_at.desc()
    ).all()

    return audit_logs


# ==========================================
# GET /decisions/{id}/audit-logs
# Get Audit Logs For Specific Decision
# ADMINISTRATOR ONLY
# ==========================================

@decision_audit_log_router.get(
    "/{id}/audit-logs",
    response_model=list[AuditLogResponse]
)
def get_decision_audit_logs(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    # ==========================================
    # CHECK DECISION EXISTS
    # ==========================================

    decision = db.query(Decision).filter(
        Decision.id == id
    ).first()

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found."
        )

    # ==========================================
    # GET DECISION AUDIT LOGS
    # ==========================================

    audit_logs = db.query(AuditLog).filter(
        AuditLog.decision_id == id
    ).order_by(
        AuditLog.created_at.desc()
    ).all()

    return audit_logs