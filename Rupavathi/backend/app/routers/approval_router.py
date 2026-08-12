from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.approval import Approval
from app.models.decision import Decision
from app.models.user import User
from app.schemas.approval_schema import (
    ApprovalCreate,
    ApprovalUpdate,
    ApprovalAction,
    ApprovalResponse,
)
from app.utils.dependencies import get_current_user
from app.utils.notifications import create_notification
from app.utils.audit import create_audit_log

router = APIRouter(prefix="/approvals", tags=["Approvals"])

REVIEWER_ROLE_BY_LEVEL = {2: "Approver"}


def _role_can_act(role: str, level: int) -> bool:
    return role == "Admin" or role == REVIEWER_ROLE_BY_LEVEL.get(level)


def _get_approval_or_404(db: Session, approval_id: int) -> Approval:
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found")
    return approval


# Create Approval (manual override, Admin only)
@router.post("/", response_model=ApprovalResponse)
def create_approval(
    payload: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only an Admin can manually create approval records")

    decision = db.query(Decision).filter(Decision.id == payload.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    approval = Approval(
        decision_id=payload.decision_id,
        approval_level=payload.approval_level,
        status="Pending",
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


# Get All Approvals
@router.get("/", response_model=list[ApprovalResponse])
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Approval).order_by(Approval.created_at.desc()).all()


# Get Approval By ID
@router.get("/{approval_id}", response_model=ApprovalResponse)
def get_approval(approval_id: int, db: Session = Depends(get_db)):
    return _get_approval_or_404(db, approval_id)


# Update Approval (manual override, Admin only)
@router.put("/{approval_id}", response_model=ApprovalResponse)
def update_approval(
    approval_id: int,
    payload: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only an Admin can edit approval records directly")

    approval = _get_approval_or_404(db, approval_id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(approval, key, value)

    db.commit()
    db.refresh(approval)
    return approval


# Delete Approval (Admin only)
@router.delete("/{approval_id}")
def delete_approval(
    approval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only an Admin can delete approval records")

    approval = _get_approval_or_404(db, approval_id)
    db.delete(approval)
    db.commit()
    return {"message": "Approval record deleted successfully"}


def _act_on_approval(
    db: Session,
    approval_id: int,
    current_user: User,
    new_status: str,
    remarks: str | None,
    request: Request,
) -> Approval:
    approval = _get_approval_or_404(db, approval_id)
    decision = db.query(Decision).filter(Decision.id == approval.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    if not _role_can_act(current_user.role, approval.approval_level):
        raise HTTPException(
            status_code=403,
            detail=f"Only an {REVIEWER_ROLE_BY_LEVEL.get(approval.approval_level, 'Approver')} or Admin can act on this approval",
        )

    if decision.created_by == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot approve or reject your own decision")

    if approval.status != "Pending":
        raise HTTPException(status_code=400, detail=f"This approval has already been {approval.status.lower()}")

    if decision.status in ("Approved", "Rejected"):
        raise HTTPException(status_code=400, detail=f"This decision has already been {decision.status.lower()}")

    if new_status == "Rejected" and not (remarks and remarks.strip()):
        raise HTTPException(status_code=400, detail="Remarks are mandatory when rejecting")

    approval.status = new_status
    approval.remarks = remarks
    approval.reviewer_id = current_user.id
    approval.approved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(approval)

    create_audit_log(
        db,
        user_id=current_user.id,
        action_type=f"Decision {new_status}",
        description=f'{new_status} "{decision.title}"'
        + (f' with remarks: {remarks}' if remarks else ''),
        decision_id=decision.id,
        request=request,
    )

    if new_status == "Rejected":
        decision.status = "Rejected"
        db.commit()
        create_notification(
            db,
            user_id=decision.created_by,
            category="reviews",
            title="Decision rejected",
            message=f'"{decision.title}" was rejected.',
            decision_id=decision.id,
        )
    else:
        decision.status = "Approved"
        db.commit()
        create_notification(
            db,
            user_id=decision.created_by,
            category="reviews",
            title="Decision approved",
            message=f'"{decision.title}" has been approved.',
            decision_id=decision.id,
        )

    return approval


@router.put("/{approval_id}/approve", response_model=ApprovalResponse)
def approve_approval(
    approval_id: int,
    payload: ApprovalAction,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _act_on_approval(db, approval_id, current_user, "Approved", payload.remarks, request)


@router.put("/{approval_id}/reject", response_model=ApprovalResponse)
def reject_approval(
    approval_id: int,
    payload: ApprovalAction,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _act_on_approval(db, approval_id, current_user, "Rejected", payload.remarks, request)
