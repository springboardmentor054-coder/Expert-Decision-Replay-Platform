from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.alternative import Alternative
from app.models.decision import Decision
from app.models.user import User
from app.schemas.alternative_schema import (
    AlternativeCreate,
    AlternativeUpdate,
    AlternativeResponse,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/alternatives", tags=["Alternatives"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


def _get_alternative_or_404(db: Session, alternative_id: int) -> Alternative:
    alternative = db.query(Alternative).filter(Alternative.id == alternative_id).first()
    if not alternative:
        raise HTTPException(status_code=404, detail="Alternative not found")
    return alternative


# Create Alternative
@router.post("/", response_model=AlternativeResponse)
def create_alternative(
    alternative: AlternativeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_decision_or_404(db, alternative.decision_id)

    new_alternative = Alternative(**alternative.model_dump())

    db.add(new_alternative)
    db.commit()
    db.refresh(new_alternative)

    return new_alternative


# Get All Alternatives
@router.get("/", response_model=list[AlternativeResponse])
def get_all_alternatives(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Alternative).order_by(Alternative.created_at.desc()).all()


# Get Alternative By ID
@router.get("/{alternative_id}", response_model=AlternativeResponse)
def get_alternative(alternative_id: int, db: Session = Depends(get_db)):
    return _get_alternative_or_404(db, alternative_id)


# Update Alternative
@router.put("/{alternative_id}", response_model=AlternativeResponse)
def update_alternative(
    alternative_id: int,
    updated_data: AlternativeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alternative = _get_alternative_or_404(db, alternative_id)

    update_data = updated_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(alternative, key, value)

    db.commit()
    db.refresh(alternative)

    return alternative


# Delete Alternative
@router.delete("/{alternative_id}")
def delete_alternative(
    alternative_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alternative = _get_alternative_or_404(db, alternative_id)

    db.delete(alternative)
    db.commit()

    return {"message": "Alternative deleted successfully"}
