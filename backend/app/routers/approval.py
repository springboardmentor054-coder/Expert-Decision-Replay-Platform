from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.models.approval import Approval
from app.models.decision import Decision
from app.models.user import User

from app.schemas.approval import (
    ApprovalCreate,
    ApprovalUpdate,
    ApprovalApprove,
    ApprovalReject,
    ApprovalResponse
)

from app.core.security import get_current_user

from app.utils.notification import create_notification
from app.utils.audit import create_audit_log


# ==========================================
# Approval Router
# ==========================================

approval_router = APIRouter(
    prefix="/approvals",
    tags=["Approvals"]
)


# ==========================================
# Decision Approval Router
# ==========================================

decision_approval_router = APIRouter(
    prefix="/decisions",
    tags=["Decision Approvals"]
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
# Helper Function
# Check Reviewer / Manager Permission
# ==========================================

def check_approval_permission(current_user: User):

    if current_user.role not in ["Reviewer", "Manager"]:

        raise HTTPException(
            status_code=403,
            detail="Only Reviewers or Managers can approve or reject decisions."
        )


# ==========================================
# POST /approvals
# Create Approval
# ==========================================

@approval_router.post(
    "",
    response_model=ApprovalResponse
)
def create_approval(
    approval: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only Reviewer or Manager can create approval
    check_approval_permission(current_user)

    # Check decision exists
    decision = db.query(Decision).filter(
        Decision.id == approval.decision_id
    ).first()

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found."
        )

    # Check reviewer exists
    reviewer = db.query(User).filter(
        User.id == approval.reviewer_id
    ).first()

    if not reviewer:

        raise HTTPException(
            status_code=404,
            detail="Reviewer not found."
        )

    # Reviewer must be Reviewer or Manager
    if reviewer.role not in ["Reviewer", "Manager"]:

        raise HTTPException(
            status_code=400,
            detail="Approval can only be assigned to a Reviewer or Manager."
        )

    # Prevent self approval
    if decision.created_by == reviewer.id:

        raise HTTPException(
            status_code=403,
            detail="Employees cannot approve their own decisions."
        )

    new_approval = Approval(
        decision_id=approval.decision_id,
        reviewer_id=approval.reviewer_id,
        approval_level=approval.approval_level,
        status="Pending"
    )

    db.add(new_approval)

    db.commit()

    db.refresh(new_approval)

    return new_approval


# ==========================================
# GET /approvals
# Get All Approvals
# ==========================================

@approval_router.get(
    "",
    response_model=list[ApprovalResponse]
)
def get_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return db.query(Approval).all()


# ==========================================
# GET /approvals/{id}
# Get Single Approval
# ==========================================

@approval_router.get(
    "/{id}",
    response_model=ApprovalResponse
)
def get_approval(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    approval = db.query(Approval).filter(
        Approval.id == id
    ).first()

    if not approval:

        raise HTTPException(
            status_code=404,
            detail="Approval not found."
        )

    return approval


# ==========================================
# PUT /approvals/{id}
# Update Approval
# ==========================================

@approval_router.put(
    "/{id}",
    response_model=ApprovalResponse
)
def update_approval(
    id: int,
    approval_data: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    check_approval_permission(current_user)

    approval = db.query(Approval).filter(
        Approval.id == id
    ).first()

    if not approval:

        raise HTTPException(
            status_code=404,
            detail="Approval not found."
        )

    # Cannot modify an already approved approval
    if approval.status == "Approved":

        raise HTTPException(
            status_code=400,
            detail="This decision has already been approved."
        )

    if approval_data.approval_level is not None:

        approval.approval_level = approval_data.approval_level

    if approval_data.status is not None:

        approval.status = approval_data.status

    if approval_data.remarks is not None:

        approval.remarks = approval_data.remarks

    db.commit()

    db.refresh(approval)

    return approval


# ==========================================
# DELETE /approvals/{id}
# Delete Approval
# ==========================================

@approval_router.delete(
    "/{id}"
)
def delete_approval(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    check_approval_permission(current_user)

    approval = db.query(Approval).filter(
        Approval.id == id
    ).first()

    if not approval:

        raise HTTPException(
            status_code=404,
            detail="Approval not found."
        )

    db.delete(approval)

    db.commit()

    return {
        "message": "Approval deleted successfully."
    }


# ==========================================
# GET /decisions/{id}/approvals
# Get Approvals For Specific Decision
# ==========================================

@decision_approval_router.get(
    "/{id}/approvals",
    response_model=list[ApprovalResponse]
)
def get_decision_approvals(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    decision = db.query(Decision).filter(
        Decision.id == id
    ).first()

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found."
        )

    approvals = db.query(Approval).filter(
        Approval.decision_id == id
    ).all()

    return approvals


# ==========================================
# PUT /approvals/{id}/approve
# Approve Decision
# ==========================================

@approval_router.put(
    "/{id}/approve",
    response_model=ApprovalResponse
)
def approve_decision(
    id: int,
    approval_data: ApprovalApprove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only Reviewer or Manager
    check_approval_permission(current_user)

    approval = db.query(Approval).filter(
        Approval.id == id
    ).first()

    if not approval:

        raise HTTPException(
            status_code=404,
            detail="Approval not found."
        )

    decision = db.query(Decision).filter(
        Decision.id == approval.decision_id
    ).first()

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found."
        )

    # Prevent self approval
    if decision.created_by == current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You cannot approve your own decision."
        )

    # Only assigned reviewer can approve
    if approval.reviewer_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You are not assigned to approve this decision."
        )

    # Already approved
    if approval.status == "Approved":

        raise HTTPException(
            status_code=400,
            detail="This decision has already been approved."
        )

    # ==========================================
    # APPROVE DECISION
    # ==========================================

    approval.status = "Approved"

    approval.remarks = approval_data.remarks

    approval.approved_at = datetime.utcnow()

    # Update Decision Status
    decision.status = "Approved"


    # ==========================================
    # CREATE APPROVAL AUDIT LOG
    # ==========================================

    create_audit_log(

        db=db,

        user_id=
            current_user.id,

        decision_id=
            decision.id,

        action_type=
            "DECISION_APPROVED",

        description=(
            f'Decision "{decision.title}" '
            f'was approved by User '
            f'{current_user.id}.'
        )
    )


    # ==========================================
    # CREATE APPROVAL NOTIFICATION
    # ==========================================

    create_notification(

        db=db,

        user_id=
            decision.created_by,

        decision_id=
            decision.id,

        title=
            "Decision Approved",

        message=(
            f'Your decision "{decision.title}" '
            f'has been approved by the reviewer.'
        )
    )


    # ==========================================
    # SAVE APPROVAL + DECISION +
    # AUDIT LOG + NOTIFICATION
    # ==========================================

    db.commit()

    db.refresh(approval)

    return approval


# ==========================================
# PUT /approvals/{id}/reject
# Reject Decision
# ==========================================

@approval_router.put(
    "/{id}/reject",
    response_model=ApprovalResponse
)
def reject_decision(
    id: int,
    approval_data: ApprovalReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only Reviewer or Manager
    check_approval_permission(current_user)

    approval = db.query(Approval).filter(
        Approval.id == id
    ).first()

    if not approval:

        raise HTTPException(
            status_code=404,
            detail="Approval not found."
        )

    decision = db.query(Decision).filter(
        Decision.id == approval.decision_id
    ).first()

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found."
        )

    # Prevent self rejection
    if decision.created_by == current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You cannot reject your own decision."
        )

    # Only assigned reviewer can reject
    if approval.reviewer_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You are not assigned to reject this decision."
        )

    # Already approved
    if approval.status == "Approved":

        raise HTTPException(
            status_code=400,
            detail="This decision has already been approved and cannot be rejected."
        )

    # Mandatory remarks
    if not approval_data.remarks.strip():

        raise HTTPException(
            status_code=400,
            detail="Remarks are mandatory when rejecting a decision."
        )

    # ==========================================
    # REJECT DECISION
    # ==========================================

    approval.status = "Rejected"

    approval.remarks = approval_data.remarks

    approval.approved_at = datetime.utcnow()

    # Update Decision Status
    decision.status = "Rejected"


    # ==========================================
    # CREATE REJECTION AUDIT LOG
    # ==========================================

    create_audit_log(

        db=db,

        user_id=
            current_user.id,

        decision_id=
            decision.id,

        action_type=
            "DECISION_REJECTED",

        description=(
            f'Decision "{decision.title}" '
            f'was rejected by User '
            f'{current_user.id}. '
            f'Remarks: {approval_data.remarks}'
        )
    )


    # ==========================================
    # CREATE REJECTION NOTIFICATION
    # ==========================================

    create_notification(

        db=db,

        user_id=
            decision.created_by,

        decision_id=
            decision.id,

        title=
            "Decision Rejected",

        message=(
            f'Your decision "{decision.title}" '
            f'has been rejected by the reviewer. '
            f'Remarks: {approval_data.remarks}'
        )
    )


    # ==========================================
    # SAVE APPROVAL + DECISION +
    # AUDIT LOG + NOTIFICATION
    # ==========================================

    db.commit()

    db.refresh(approval)

    return approval