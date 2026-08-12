from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/approval",
    tags=["Approval"]
)


@router.put("/{decision_id}/approve")
def approve_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find decision
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    # Update decision status
    decision.status = "Approved"

    # Create notification for decision creator
    if decision.created_by is not None:
        notification = Notification(
            user_id=decision.created_by,
            message=f'Your decision "{decision.title}" has been approved.',
            notification_type="approval",
            is_read=False
        )

        db.add(notification)

    # Create audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="Decision Approved",
        decision_id=decision.id,
        details=f'Decision "{decision.title}" was approved.'
    )

    db.add(audit)

    # Save changes
    db.commit()
    db.refresh(decision)

    return {
        "message": "Decision approved",
        "decision_id": decision.id,
        "status": decision.status
    }


@router.put("/{decision_id}/reject")
def reject_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Find decision
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    # Update decision status
    decision.status = "Rejected"

    # Create notification for decision creator
    if decision.created_by is not None:
        notification = Notification(
            user_id=decision.created_by,
            message=f'Your decision "{decision.title}" has been rejected.',
            notification_type="approval",
            is_read=False
        )

        db.add(notification)

    # Create audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="Decision Rejected",
        decision_id=decision.id,
        details=f'Decision "{decision.title}" was rejected.'
    )

    db.add(audit)

    # Save changes
    db.commit()
    db.refresh(decision)

    return {
        "message": "Decision rejected",
        "decision_id": decision.id,
        "status": decision.status
    }