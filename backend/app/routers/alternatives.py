from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.alternative import Alternative
from app.models.decision import Decision
from app.models.user import User
from app.schemas.alternative import AlternativeCreate, AlternativeOut, AlternativeUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/alternatives", tags=["Alternatives"])

@router.get("", response_model=list[AlternativeOut])
def list_alternatives(decision_id: Optional[int] = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Alternative)
    if decision_id:
        q = q.filter(Alternative.decision_id == decision_id)
    return q.order_by(Alternative.id).all()

@router.post("", response_model=AlternativeOut, status_code=status.HTTP_201_CREATED)
def create_alternative(payload: AlternativeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(Decision).filter(Decision.id == payload.decision_id).first():
        raise HTTPException(status_code=400, detail="Decision does not exist")
    alt = Alternative(**payload.model_dump())
    db.add(alt)
    db.commit()
    db.refresh(alt)
    return alt

@router.put("/{alt_id}", response_model=AlternativeOut)
def update_alternative(alt_id: int, payload: AlternativeUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alt = db.query(Alternative).filter(Alternative.id == alt_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alternative not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(alt, k, v)
    db.commit()
    db.refresh(alt)
    return alt

@router.delete("/{alt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alternative(alt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alt = db.query(Alternative).filter(Alternative.id == alt_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alternative not found")
    db.delete(alt)
    db.commit()
