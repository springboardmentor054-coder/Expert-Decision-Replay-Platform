from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.decision import Decision
from app.models.decision_version import DecisionVersion
from app.models.user import User
from app.schemas.decision_version import VersionCreate, VersionOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/decisions", tags=["Versions"])

@router.get("/{decision_id}/versions", response_model=list[VersionOut])
def list_versions(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(Decision).filter(Decision.id == decision_id).first():
        raise HTTPException(status_code=404, detail="Decision not found")
    return db.query(DecisionVersion).filter(DecisionVersion.decision_id == decision_id).order_by(DecisionVersion.version_number.desc()).all()

@router.post("/{decision_id}/versions", response_model=VersionOut, status_code=status.HTTP_201_CREATED)
def create_version(decision_id: int, payload: VersionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision not found")
    last = db.query(DecisionVersion).filter(DecisionVersion.decision_id == decision_id).order_by(DecisionVersion.version_number.desc()).first()
    next_ver = (last.version_number + 1) if last else 1
    version = DecisionVersion(decision_id=decision_id, version_number=next_ver, title=d.title,
                               description=d.description, status=d.status, modified_by=current_user.id,
                               change_summary=payload.change_summary)
    db.add(version)
    db.commit()
    db.refresh(version)
    return version
