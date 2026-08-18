from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/approvals", tags=["Approval Workflow"])

@router.get("/pending", response_model=List[schemas.ApprovalResponse])
def get_pending_approvals(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Returns all pending approvals assigned to the current user
    # If the user is a Manager or Administrator, they might also see all pending approvals
    if current_user.role in ["Manager", "Administrator"]:
        return db.query(models.Approval).filter(models.Approval.status == "Pending").all()
    
    return db.query(models.Approval).filter(
        models.Approval.approver_id == current_user.id,
        models.Approval.status == "Pending"
    ).all()

@router.post("/{approval_id}/action", response_model=schemas.ApprovalResponse)
def action_approval(
    approval_id: int,
    action: schemas.ApprovalAction,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval task not found.")

    # Permissions check: Must be the assigned approver, or a Manager/Admin
    if approval.approver_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to action this approval.")

    if approval.status != "Pending":
        raise HTTPException(status_code=400, detail="This approval has already been completed.")

    decision = db.query(models.Decision).filter(models.Decision.id == approval.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Associated decision not found.")

    # Update approval
    approval.status = action.status  # Approved or Rejected
    approval.comments = action.comments
    approval.actioned_at = datetime.datetime.now(datetime.timezone.utc)

    # Re-evaluate Decision Status
    all_approvals = db.query(models.Approval).filter(models.Approval.decision_id == decision.id).all()
    
    if action.status == "Rejected":
        decision.status = "Rejected"
        decision.current_version += 1
        db_version = models.DecisionVersion(
            decision_id=decision.id,
            version=decision.current_version,
            title=decision.title,
            problem_statement=decision.problem_statement,
            category=decision.category,
            status=decision.status,
            changed_by_id=current_user.id,
            change_summary=f"Approval Rejected at level {approval.level} by {current_user.full_name}: {action.comments}"
        )
        db.add(db_version)
    else:
        # Check if ALL approvals are Approved
        all_approved = True
        for app in all_approvals:
            if app.status != "Approved":
                all_approved = False
                break
        
        if all_approved:
            decision.status = "Approved"
            decision.current_version += 1
            db_version = models.DecisionVersion(
                decision_id=decision.id,
                version=decision.current_version,
                title=decision.title,
                problem_statement=decision.problem_statement,
                category=decision.category,
                status=decision.status,
                changed_by_id=current_user.id,
                change_summary=f"All approvals completed. Decision Approved."
            )
            db.add(db_version)
        else:
            # Check if there is a sequential flow where we should notify next level
            # Currently it is handled on the front-end, but we can set status to Under Review
            pass

    db.commit()
    db.refresh(approval)
    db.refresh(decision)

    action_type = "APPROVE_DECISION" if action.status == "Approved" else "REJECT_DECISION"
    auth.log_activity(
        db, current_user.id, action_type, 
        f"Actioned approval for decision {decision.id} (Status: {action.status})",
        decision_id=decision.id
    )

    # Notify the decision creator
    try:
        notif_title = "Decision Approved" if action.status == "Approved" else "Decision Rejected"
        notif_msg = f"Your decision '{decision.title}' has been {action.status.lower()} by {current_user.full_name}."
        if action.comments:
            notif_msg += f" Comment: {action.comments}"
        auth.create_notification(
            db, decision.creator_id,
            notif_title, notif_msg,
            f"decision_{action.status.lower()}",
            decision_id=decision.id
        )
    except Exception:
        pass

    return approval

@router.post("/{approval_id}/reassign", response_model=schemas.ApprovalResponse)
def reassign_approver(
    approval_id: int,
    new_approver_id: int,
    current_user: models.User = Depends(auth.check_role(["Manager", "Administrator"])),
    db: Session = Depends(get_db)
):
    approval = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval task not found.")

    if approval.status != "Pending":
        raise HTTPException(status_code=400, detail="Cannot reassign a completed approval.")

    # Check new approver exists
    new_approver = db.query(models.User).filter(models.User.id == new_approver_id).first()
    if not new_approver:
        raise HTTPException(status_code=404, detail="New approver not found.")
        
    old_approver_id = approval.approver_id
    approval.approver_id = new_approver_id
    db.commit()
    db.refresh(approval)

    auth.log_activity(
        db, current_user.id, "APPROVAL_REASSIGN", 
        f"Reassigned approval {approval_id} from user {old_approver_id} to user {new_approver_id}"
    )
    return approval
