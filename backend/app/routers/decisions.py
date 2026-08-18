from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.decision import Decision
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.decision_version import DecisionVersion
from app.schemas.decision import DecisionCreate, DecisionOut, DecisionUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/decisions", tags=["Decisions"])

def _audit(db, user_id, decision_id, action, desc, request=None):
    ip = request.client.host if request and request.client else None
    db.add(AuditLog(user_id=user_id, decision_id=decision_id, action_type=action, description=desc, ip_address=ip))

def _notify_all(db, decision_id, title, message, exclude_user_id=None):
    from app.models.user import User as UserModel
    users = db.query(UserModel).filter(UserModel.is_active == True).all()
    for u in users:
        if u.id != exclude_user_id:
            db.add(Notification(user_id=u.id, decision_id=decision_id, title=title, message=message))

def _snapshot_version(db, decision, user_id, summary=None):
    last = db.query(DecisionVersion).filter(DecisionVersion.decision_id == decision.id).order_by(DecisionVersion.version_number.desc()).first()
    next_ver = (last.version_number + 1) if last else 1
    db.add(DecisionVersion(decision_id=decision.id, version_number=next_ver,
                           title=decision.title, description=decision.description,
                           status=decision.status, modified_by=user_id, change_summary=summary))

@router.get("", response_model=list[DecisionOut])
def list_decisions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Decision).order_by(Decision.id.desc()).all()

@router.get("/{decision_id}", response_model=DecisionOut)
def get_decision(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    return d

@router.post("", response_model=DecisionOut, status_code=status.HTTP_201_CREATED)
def create_decision(payload: DecisionCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        d = Decision(title=payload.title, problem_statement=payload.problem_statement,
                     description=payload.description, category=payload.category,
                     status=payload.status or "open", created_by=current_user.id)
        db.add(d)
        db.commit()
        db.refresh(d)
        _snapshot_version(db, d, current_user.id, "Initial version")
        _audit(db, current_user.id, d.id, "DECISION_CREATED", f"Decision '{d.title}' created", request)
        _notify_all(db, d.id, "New Decision Created", f"A new decision '{d.title}' has been created.", exclude_user_id=current_user.id)
        db.commit()
        return d
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{decision_id}", response_model=DecisionOut)
def update_decision(decision_id: int, payload: DecisionUpdate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    try:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(d, k, v)
        db.commit()
        db.refresh(d)
        _snapshot_version(db, d, current_user.id, "Decision updated")
        _audit(db, current_user.id, d.id, "DECISION_UPDATED", f"Decision '{d.title}' updated", request)
        if d.status == "approved":
            _notify_all(db, d.id, "Decision Approved", f"Decision '{d.title}' has been approved.")
        elif d.status == "rejected":
            _notify_all(db, d.id, "Decision Rejected", f"Decision '{d.title}' has been rejected.")
        db.commit()
        return d
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{decision_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_decision(decision_id: int, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    _audit(db, current_user.id, d.id, "DECISION_DELETED", f"Decision '{d.title}' deleted", request)
    db.commit()
    db.delete(d)
    db.commit()
