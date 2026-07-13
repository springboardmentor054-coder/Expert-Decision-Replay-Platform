from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.alternative import Alternative
from app.schemas.alternative import AlternativeCreate, AlternativeResponse

router = APIRouter(
    prefix="/alternatives",
    tags=["Alternatives"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[AlternativeResponse])
def get_alternatives(db: Session = Depends(get_db)):
    return db.query(Alternative).all()


@router.post("/", response_model=AlternativeResponse)
def create_alternative(
    alternative: AlternativeCreate,
    db: Session = Depends(get_db)
):
    new_alternative = Alternative(
        decision_id=alternative.decision_id,
        alternative_name=alternative.alternative_name,
        description=alternative.description,
        pros=alternative.pros,
        cons=alternative.cons,
        estimated_cost=alternative.estimated_cost,
        feasibility=alternative.feasibility,
        risk_level=alternative.risk_level
    )

    db.add(new_alternative)
    db.commit()
    db.refresh(new_alternative)

    return new_alternative


@router.get("/{alternative_id}", response_model=AlternativeResponse)
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


@router.put("/{alternative_id}", response_model=AlternativeResponse)
def update_alternative(
    alternative_id: int,
    alternative: AlternativeCreate,
    db: Session = Depends(get_db)
):
    db_alternative = db.query(Alternative).filter(
        Alternative.id == alternative_id
    ).first()

    if not db_alternative:
        raise HTTPException(
            status_code=404,
            detail="Alternative not found"
        )

    db_alternative.decision_id = alternative.decision_id
    db_alternative.alternative_name = alternative.alternative_name
    db_alternative.description = alternative.description
    db_alternative.pros = alternative.pros
    db_alternative.cons = alternative.cons
    db_alternative.estimated_cost = alternative.estimated_cost
    db_alternative.feasibility = alternative.feasibility
    db_alternative.risk_level = alternative.risk_level

    db.commit()
    db.refresh(db_alternative)

    return db_alternative


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

    return {"message": "Alternative deleted successfully"}


@router.get("/decision/{decision_id}", response_model=list[AlternativeResponse])
def get_decision_alternatives(
    decision_id: int,
    db: Session = Depends(get_db)
):
    alternatives = db.query(Alternative).filter(
        Alternative.decision_id == decision_id
    ).all()

    return alternatives

