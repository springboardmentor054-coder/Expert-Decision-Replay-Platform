"""
Alternative Analysis module:
- Record multiple options per decision
- Pros & cons, cost comparison, feasibility scoring, risk assessment
- Mark the selected alternative
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alternative, Decision, User
from app.schemas import AlternativeCreate, AlternativeUpdate, AlternativeOut
from app.deps import get_current_user

router = APIRouter(tags=["Alternative Analysis"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.post(
    "/decisions/{decision_id}/alternatives",
    response_model=AlternativeOut,
    status_code=status.HTTP_201_CREATED,
)
def add_alternative(
    decision_id: int,
    payload: AlternativeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_decision_or_404(db, decision_id)
    alternative = Alternative(decision_id=decision_id, **payload.model_dump())
    db.add(alternative)
    db.commit()
    db.refresh(alternative)
    return alternative


@router.get("/decisions/{decision_id}/alternatives", response_model=List[AlternativeOut])
def list_alternatives(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _get_decision_or_404(db, decision_id)
    return (
        db.query(Alternative)
        .filter(Alternative.decision_id == decision_id)
        .order_by(Alternative.created_at.asc())
        .all()
    )


@router.get("/decisions/{decision_id}/alternatives/compare", response_model=List[AlternativeOut])
def compare_alternatives(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Returns all alternatives for a decision sorted by feasibility score (desc)
    then estimated cost (asc) — a quick side-by-side comparison view."""
    _get_decision_or_404(db, decision_id)
    return (
        db.query(Alternative)
        .filter(Alternative.decision_id == decision_id)
        .order_by(Alternative.feasibility_score.desc().nullslast(), Alternative.estimated_cost.asc().nullslast())
        .all()
    )


@router.put("/alternatives/{alternative_id}", response_model=AlternativeOut)
def update_alternative(
    alternative_id: int,
    payload: AlternativeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alternative = db.query(Alternative).filter(Alternative.id == alternative_id).first()
    if not alternative:
        raise HTTPException(status_code=404, detail="Alternative not found")

    updates = payload.model_dump(exclude_unset=True)

    # If this alternative is being marked as selected, un-select any siblings
    if updates.get("is_selected") is True:
        db.query(Alternative).filter(
            Alternative.decision_id == alternative.decision_id, Alternative.id != alternative_id
        ).update({"is_selected": False})

    for field, value in updates.items():
        setattr(alternative, field, value)

    db.commit()
    db.refresh(alternative)
    return alternative


@router.delete("/alternatives/{alternative_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alternative(
    alternative_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    alternative = db.query(Alternative).filter(Alternative.id == alternative_id).first()
    if not alternative:
        raise HTTPException(status_code=404, detail="Alternative not found")
    db.delete(alternative)
    db.commit()
    return None
