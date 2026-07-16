from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.decision import Decision
from app.models.user import User
from app.schemas.decision import (
    DecisionCreate,
    DecisionUpdate,
    DecisionResponse
)

from app.core.security import get_current_user
router = APIRouter(
    prefix="/decisions",
    tags=["Decisions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[DecisionResponse])
def get_decisions(
    db: Session = Depends(get_db)
):
    decisions = db.query(Decision).all()
    return decisions


@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_decision = Decision(
        title=decision.title,
        problem_statement=decision.problem_statement,
        description=decision.description,
        category_id=decision.category_id,
        status=decision.status,
        created_by=current_user.id
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)

    return new_decision


@router.get("/{decision_id}", response_model=DecisionResponse)
def get_decision(
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

    return decision


@router.put("/{decision_id}", response_model=DecisionResponse)
def update_decision(
    decision_id: int,
    decision: DecisionUpdate,
    db: Session = Depends(get_db)
):
    db_decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not db_decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    db_decision.title = decision.title
    db_decision.problem_statement = decision.problem_statement
    db_decision.description = decision.description
    db_decision.category_id = decision.category_id
    db_decision.status = decision.status

    db.commit()
    db.refresh(db_decision)

    return db_decision


@router.delete("/{decision_id}")
def delete_decision(
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

    db.delete(decision)
    db.commit()

    return {
        "message": "Decision deleted successfully"
    }