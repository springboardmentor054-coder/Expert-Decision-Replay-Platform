from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.alternative import Alternative
from app.models.decision import Decision
from app.schemas.alternative import (
    AlternativeCreate,
    AlternativeUpdate,
    AlternativeResponse,
)

router = APIRouter(
    prefix="/alternatives",
    tags=["Alternatives"]
)


# Create Alternative
@router.post("/", response_model=AlternativeResponse)
def create_alternative(
    alternative: AlternativeCreate,
    db: Session = Depends(get_db)
):

    decision = db.query(Decision).filter(
        Decision.id == alternative.decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    new_alternative = Alternative(
        **alternative.model_dump()
    )

    db.add(new_alternative)
    db.commit()
    db.refresh(new_alternative)

    return new_alternative


# Get All Alternatives
@router.get("/", response_model=list[AlternativeResponse])
def get_alternatives(
    db: Session = Depends(get_db)
):
    return db.query(Alternative).all()


# Get Alternatives by Decision ID
@router.get(
    "/decisions/{decision_id}",
    response_model=list[AlternativeResponse]
)
def get_decision_alternatives(
    decision_id: int,
    db: Session = Depends(get_db)
):

    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    return db.query(Alternative).filter(
        Alternative.decision_id == decision_id
    ).all()


# Get Single Alternative
@router.get("/{id}", response_model=AlternativeResponse)
def get_alternative(
    id: int,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == id
    ).first()

    if not alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    return alternative


# Update Alternative
@router.put("/{id}", response_model=AlternativeResponse)
def update_alternative(
    id: int,
    updated: AlternativeUpdate,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == id
    ).first()

    if not alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    data = updated.model_dump(exclude_unset=True)

    if "decision_id" in data:
        decision = db.query(Decision).filter(
            Decision.id == data["decision_id"]
        ).first()

        if not decision:
            raise HTTPException(
                status_code=404,
                detail="Decision not found"
            )

    for key, value in data.items():
        setattr(alternative, key, value)

    db.commit()
    db.refresh(alternative)

    return alternative


# Delete Alternative
@router.delete("/{id}")
def delete_alternative(
    id: int,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == id
    ).first()

    if not alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    db.delete(alternative)
    db.commit()

    return {
        "message": "Alternative deleted successfully"
    }