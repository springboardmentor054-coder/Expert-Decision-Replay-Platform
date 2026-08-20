"""
Approval workflow module:
- Create approval records
- Approve/reject decisions
- Enforce reviewer/manager permissions
- Track approval history and update decision status
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Approval,
    ApprovalStatus,
    Decision,
    DecisionStatus,
    User,
    UserRole,
    AuditActionType,
)
from app.schemas import ApprovalCreate, ApprovalUpdate, ApprovalOut
from app.deps import get_current_user, require_roles
from app.routers.audit import create_audit_log
from app.routers.notifications import create_notification, notify_stakeholders

router = APIRouter(prefix="/approvals", tags=["Approvals"])


def _get_approval(db: Session, approval_id: int) -> Approval:
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval


def _validate_reviewer(db: Session, reviewer_id: int, current_user: User) -> User:
    reviewer = db.query(User).filter(User.id == reviewer_id).first()
    if not reviewer:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    if reviewer.role not in (UserRole.REVIEWER, UserRole.MANAGER):
        raise HTTPException(status_code=403, detail="Only reviewers or managers can process approvals")
    if reviewer_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="You can only create approvals for yourself")
    return reviewer


@router.post("", response_model=ApprovalOut, status_code=status.HTTP_201_CREATED)
def create_approval(
    payload: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.REVIEWER, UserRole.MANAGER, UserRole.ADMINISTRATOR):
        raise HTTPException(status_code=403, detail="Only reviewers or managers can create approvals")

    decision = db.query(Decision).filter(Decision.id == payload.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if decision.created_by == current_user.id and current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="You cannot approve your own decision")
    reviewer = _validate_reviewer(db, payload.reviewer_id, current_user)

    approval = Approval(
        decision_id=payload.decision_id,
        reviewer_id=reviewer.id,
        approval_level=payload.approval_level or 1,
        status=ApprovalStatus.PENDING,
        remarks=payload.remarks,
        created_at=datetime.utcnow(),
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision.id,
        action_type=AuditActionType.CHANGE_STATUS,
        description=f"Created approval request for decision '{decision.title}'",
    )

    create_notification(
        db,
        user_id=reviewer.id,
        title=f"Review needed: {decision.title}",
        message=f"A decision was submitted for your review.",
        decision_id=decision.id,
    )

    return approval


@router.get("", response_model=List[ApprovalOut])
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Approval)
    if current_user.role not in (UserRole.MANAGER, UserRole.ADMINISTRATOR):
        query = query.filter(Approval.reviewer_id == current_user.id)
    return query.order_by(Approval.created_at.desc()).all()


@router.get("/{approval_id}", response_model=ApprovalOut)
def get_approval(
    approval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = _get_approval(db, approval_id)
    if approval.reviewer_id != current_user.id and current_user.role not in (UserRole.MANAGER, UserRole.ADMINISTRATOR):
        raise HTTPException(status_code=403, detail="Not authorized to view this approval")
    return approval


@router.put("/{approval_id}", response_model=ApprovalOut)
def update_approval(
    approval_id: int,
    payload: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = _get_approval(db, approval_id)
    if approval.reviewer_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Not authorized to update this approval")
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending approvals can be updated")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(approval, field, value)

    db.commit()
    db.refresh(approval)
    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=approval.decision_id,
        action_type=AuditActionType.CHANGE_STATUS,
        description=f"Updated approval request #{approval.id} for decision ID {approval.decision_id}",
    )
    return approval


@router.delete("/{approval_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_approval(
    approval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = _get_approval(db, approval_id)
    if approval.reviewer_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Not authorized to delete this approval")
    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=approval.decision_id,
        action_type=AuditActionType.CHANGE_STATUS,
        description=f"Deleted approval request #{approval.id} for decision ID {approval.decision_id}",
    )
    db.delete(approval)
    db.commit()
    return None


@router.get("/decisions/{decision_id}", response_model=List[ApprovalOut])
def get_decision_approvals(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if current_user.role not in (UserRole.MANAGER, UserRole.ADMINISTRATOR) and decision.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view approvals for this decision")
    return db.query(Approval).filter(Approval.decision_id == decision_id).order_by(Approval.created_at.desc()).all()


@router.put("/{approval_id}/approve", response_model=ApprovalOut)
def approve_decision(
    approval_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.REVIEWER, UserRole.MANAGER, UserRole.ADMINISTRATOR)),
):
    approval = _get_approval(db, approval_id)
    if approval.reviewer_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Not authorized to approve this decision")
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending approvals can be approved")

    decision = db.query(Decision).filter(Decision.id == approval.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if decision.created_by == current_user.id and current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Employees cannot approve their own decisions")

    approval.status = ApprovalStatus.APPROVED
    approval.approved_at = datetime.utcnow()
    approval.remarks = approval.remarks or "Approved"
    db.commit()
    db.refresh(approval)

    decision.status = DecisionStatus.APPROVED
    db.commit()
    db.refresh(decision)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision.id,
        action_type=AuditActionType.APPROVE_DECISION,
        description=f"Approved decision '{decision.title}'",
    )
    notify_stakeholders(
        db,
        decision_id=decision.id,
        title=f"Decision approved: {decision.title}",
        message=f"{current_user.full_name} approved this decision.",
        exclude_user_id=current_user.id,
    )

    return approval


@router.put("/{approval_id}/reject", response_model=ApprovalOut)
def reject_decision(
    approval_id: int,
    payload: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.REVIEWER, UserRole.MANAGER, UserRole.ADMINISTRATOR)),
):
    approval = _get_approval(db, approval_id)
    if approval.reviewer_id != current_user.id and current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="Not authorized to reject this decision")
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending approvals can be rejected")
    if not payload.remarks:
        raise HTTPException(status_code=400, detail="Remarks are required when rejecting")

    decision = db.query(Decision).filter(Decision.id == approval.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    if decision.created_by == current_user.id and current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Employees cannot reject their own decisions")

    approval.status = ApprovalStatus.REJECTED
    approval.approved_at = datetime.utcnow()
    approval.remarks = payload.remarks
    db.commit()
    db.refresh(approval)

    decision.status = DecisionStatus.REJECTED
    db.commit()
    db.refresh(decision)

    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision.id,
        action_type=AuditActionType.REJECT_DECISION,
        description=f"Rejected decision '{decision.title}'",
    )
    notify_stakeholders(
        db,
        decision_id=decision.id,
        title=f"Decision rejected: {decision.title}",
        message=f"{current_user.full_name} rejected this decision. Remarks: {payload.remarks}",
        exclude_user_id=current_user.id,
    )

    return approval
