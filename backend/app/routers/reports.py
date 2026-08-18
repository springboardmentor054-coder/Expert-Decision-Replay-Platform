from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.approval import Approval
from app.models.audit_log import AuditLog
from app.models.comment import Comment
from app.models.decision import Decision
from app.models.document import Document
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/decisions")
def decisions_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    decisions = db.query(Decision).all()
    return {
        "total": len(decisions),
        "approved": sum(1 for d in decisions if d.status == "approved"),
        "rejected": sum(1 for d in decisions if d.status == "rejected"),
        "pending": sum(1 for d in decisions if d.status in ("open", "in_review")),
        "items": [
            {"id": d.id, "title": d.title, "category": d.category,
             "status": d.status, "created_by": d.created_by,
             "created_at": d.created_at.isoformat()}
            for d in decisions
        ]
    }

@router.get("/approvals")
def approvals_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).all()
    items = []
    for u in users:
        appr = db.query(Approval).filter(Approval.approver_id == u.id).all()
        if appr:
            items.append({
                "reviewer": u.full_name,
                "approved": sum(1 for a in appr if a.status == "approved"),
                "rejected": sum(1 for a in appr if a.status == "rejected"),
                "pending": sum(1 for a in appr if a.status == "pending"),
            })
    return {"items": items}

@router.get("/teams")
def teams_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.role import Role
    roles = db.query(Role).all()
    items = []
    for r in roles:
        users = db.query(User).filter(User.role_id == r.id).all()
        user_ids = [u.id for u in users]
        decisions = db.query(Decision).filter(Decision.created_by.in_(user_ids)).count() if user_ids else 0
        approvals = db.query(Approval).filter(Approval.approver_id.in_(user_ids)).count() if user_ids else 0
        items.append({"team": r.name, "total_users": len(users), "total_decisions": decisions, "total_approvals": approvals})
    return {"items": items}

@router.get("/audit")
def audit_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.query(AuditLog).all()
    return {
        "total_logins": sum(1 for l in logs if l.action_type == "USER_LOGIN"),
        "decisions_created": sum(1 for l in logs if l.action_type == "DECISION_CREATED"),
        "documents_uploaded": sum(1 for l in logs if l.action_type == "DOCUMENT_UPLOADED"),
        "comments_added": sum(1 for l in logs if l.action_type == "COMMENT_ADDED"),
        "approval_actions": sum(1 for l in logs if l.action_type == "APPROVAL_ACTION"),
        "total_events": len(logs),
    }
