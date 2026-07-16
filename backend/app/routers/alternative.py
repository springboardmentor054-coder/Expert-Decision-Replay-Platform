from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.alternative import Alternative
from app.models.decision import Decision

from app.schemas.alternative import (
    AlternativeCreate,
    AlternativeUpdate
)

router = APIRouter(
    prefix="/alternatives",
    tags=["Alternatives"]
)


@router.post("/")
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

    if alternative.cost <= 0:
        raise HTTPException(
            status_code=400,
            detail="Cost must be greater than zero"
        )

    if alternative.risk_level not in ["Low", "Medium", "High"]:
        raise HTTPException(
            status_code=400,
            detail="Risk level must be Low, Medium or High"
        )

    new_alternative = Alternative(
        alternative_name=alternative.alternative_name,
        description=alternative.description,
        cost=alternative.cost,
        risk_level=alternative.risk_level,
        decision_id=alternative.decision_id
    )

    db.add(new_alternative)
    db.commit()
    db.refresh(new_alternative)

    return {
        "message": "Alternative created successfully",
        "alternative_id": new_alternative.id
    }


@router.get("/")
def get_all_alternatives(
    db: Session = Depends(get_db)
):
    return db.query(Alternative).all()


@router.get("/compare/{decision_id}")
def compare_alternatives(
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

    alternatives = db.query(Alternative).filter(
        Alternative.decision_id == decision_id
    ).all()

    return [
        {
            "alternative_name": alt.alternative_name,
            "description": alt.description,
            "cost": alt.cost,
            "risk_level": alt.risk_level
        }
        for alt in alternatives
    ]


@router.get("/{alternative_id}")
def get_alternative(
    alternative_id: int,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == alternative_id
    ).first()

    if not alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    return alternative


@router.put("/{alternative_id}")
def update_alternative(
    alternative_id: int,
    updated_alternative: AlternativeUpdate,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == alternative_id
    ).first()

    if not alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    if updated_alternative.decision_id is not None:

        decision = db.query(Decision).filter(
            Decision.id == updated_alternative.decision_id
        ).first()

        if not decision:
            raise HTTPException(
                status_code=404,
                detail="Decision not found"
            )

        alternative.decision_id = updated_alternative.decision_id

    if updated_alternative.alternative_name is not None:
        alternative.alternative_name = updated_alternative.alternative_name

    if updated_alternative.description is not None:
        alternative.description = updated_alternative.description

    if updated_alternative.cost is not None:

        if updated_alternative.cost <= 0:
            raise HTTPException(
                status_code=400,
                detail="Cost must be greater than zero"
            )

        alternative.cost = updated_alternative.cost

    if updated_alternative.risk_level is not None:

        if updated_alternative.risk_level not in ["Low", "Medium", "High"]:
            raise HTTPException(
                status_code=400,
                detail="Risk level must be Low, Medium or High"
            )

        alternative.risk_level = updated_alternative.risk_level

    db.commit()
    db.refresh(alternative)

    return {
        "message": "Alternative updated successfully"
    }


@router.delete("/{alternative_id}")
def delete_alternative(
    alternative_id: int,
    db: Session = Depends(get_db)
):

    alternative = db.query(Alternative).filter(
        Alternative.id == alternative_id
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