from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])
extra_router = APIRouter(tags=["Audit Logs"])

@router.get("", response_model=List[schemas.AuditLogResponse])
@router.get("/", response_model=List[schemas.AuditLogResponse])
def get_all_audit_logs(
    user_id: Optional[int] = Query(None, description="Filter by User ID"),
    action_type: Optional[str] = Query(None, description="Filter by Action Type"),
    decision_id: Optional[int] = Query(None, description="Filter by Decision ID"),
    date: Optional[str] = Query(None, description="Filter by Date (YYYY-MM-DD)"),
    current_user: models.User = Depends(auth.check_role(["Administrator"])),
    db: Session = Depends(get_db)
):
    query = db.query(models.AuditLog)

    if user_id is not None:
        query = query.filter(models.AuditLog.user_id == user_id)
    
    if action_type:
        query = query.filter(models.AuditLog.action_type.ilike(f"%{action_type}%"))

    if decision_id is not None:
        query = query.filter(models.AuditLog.decision_id == decision_id)

    if date:
        try:
            target_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            query = query.filter(
                models.AuditLog.created_at >= datetime.datetime.combine(target_date, datetime.time.min),
                models.AuditLog.created_at <= datetime.datetime.combine(target_date, datetime.time.max)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    logs = query.order_by(models.AuditLog.created_at.desc()).all()
    
    res_logs = []
    for log in logs:
        log_res = schemas.AuditLogResponse.model_validate(log)
        if log.decision:
            log_res.decision_title = log.decision.title
        res_logs.append(log_res)

    return res_logs

@router.get("/{audit_log_id}", response_model=schemas.AuditLogResponse)
def get_audit_log_by_id(
    audit_log_id: int,
    current_user: models.User = Depends(auth.check_role(["Administrator"])),
    db: Session = Depends(get_db)
):
    log = db.query(models.AuditLog).filter(models.AuditLog.id == audit_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Audit log entry not found.")

    log_res = schemas.AuditLogResponse.model_validate(log)
    if log.decision:
        log_res.decision_title = log.decision.title
    return log_res

# Immutability Enforcements: Prevent modification or deletion of Audit Logs
@router.put("/{audit_log_id}")
@router.patch("/{audit_log_id}")
def update_audit_log_forbidden(audit_log_id: int, current_user: models.User = Depends(auth.get_current_user)):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Audit logs cannot be edited. Audit log entries are immutable compliance records."
    )

@router.delete("/{audit_log_id}")
def delete_audit_log_forbidden(audit_log_id: int, current_user: models.User = Depends(auth.get_current_user)):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Audit logs cannot be deleted. Audit log entries are immutable compliance records."
    )

# Direct routes for /users/{id}/audit-logs and /decisions/{id}/audit-logs
@extra_router.get("/users/{user_id}/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_user_audit_logs(
    user_id: int,
    current_user: models.User = Depends(auth.check_role(["Administrator"])),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    logs = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == user_id
    ).order_by(models.AuditLog.created_at.desc()).all()

    res_logs = []
    for log in logs:
        log_res = schemas.AuditLogResponse.model_validate(log)
        if log.decision:
            log_res.decision_title = log.decision.title
        res_logs.append(log_res)

    return res_logs

@extra_router.get("/decisions/{decision_id}/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_decision_audit_logs(
    decision_id: int,
    current_user: models.User = Depends(auth.check_role(["Administrator"])),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")

    logs = db.query(models.AuditLog).filter(
        models.AuditLog.decision_id == decision_id
    ).order_by(models.AuditLog.created_at.desc()).all()

    res_logs = []
    for log in logs:
        log_res = schemas.AuditLogResponse.model_validate(log)
        if log.decision:
            log_res.decision_title = log.decision.title
        res_logs.append(log_res)

    return res_logs
