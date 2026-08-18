from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.approval import Approval
from app.models.decision import Decision
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.approval import ApprovalCreate, ApprovalOut, ApprovalUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])

@router.get("", response_model=list[ApprovalOut])
def list_approvals(decision_id: Optional[int] = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Approval)
    if decision_id:
        q = q.filter(Approval.decision_id == decision_id)
    return q.order_by(Approval.id).all()

@router.post("", response_model=ApprovalOut, status_code=status.HTTP_201_CREATED)
def create_approval(payload: ApprovalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(Decision).filter(Decision.id == payload.decision_id).first():
        raise HTTPException(status_code=400, detail="Decision does not exist")
    approval = Approval(**payload.model_dump())
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval

@router.put("/{approval_id}", response_model=ApprovalOut)
def update_approval(approval_id: int, payload: ApprovalUpdate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(approval, k, v)
    db.commit()
    db.refresh(approval)
    ip = request.client.host if request.client else None
    db.add(AuditLog(user_id=current_user.id, decision_id=approval.decision_id, action_type="APPROVAL_ACTION",
                    description=f"Approval {approval.status}", ip_address=ip))
    db.commit()
    return approval

@router.delete("/{approval_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_approval(approval_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    db.delete(approval)
    db.commit()
