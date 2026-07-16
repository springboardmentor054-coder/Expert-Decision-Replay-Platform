from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db

from app.models.decision import Decision
from app.models.user import User
from app.models.decision_version import DecisionVersion

from app.schemas.decision import DecisionCreate

router = APIRouter(
    prefix="/decisions",
    tags=["Decisions"]
)


@router.post("/")
def create_decision(decision: DecisionCreate, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == decision.created_by).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_decision = Decision(
        title=decision.title,
        problem_statement=decision.problem_statement,
        decision_taken=decision.decision_taken,
        reasoning=decision.reasoning,
        created_by=decision.created_by
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)

    return {
        "message": "Decision created successfully",
        "decision_id": new_decision.id
    }


@router.get("/")
def get_all_decisions(db: Session = Depends(get_db)):
    return db.query(Decision).all()


@router.get("/{decision_id}")
def get_decision(decision_id: int, db: Session = Depends(get_db)):

    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    return decision


@router.put("/{decision_id}")
def update_decision(
    decision_id: int,
    updated_decision: DecisionCreate,
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

    # Verify user exists
    user = db.query(User).filter(
        User.id == updated_decision.created_by
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Get next version number
    latest_version = db.query(
        func.max(DecisionVersion.version_number)
    ).filter(
        DecisionVersion.decision_id == decision.id
    ).scalar()

    next_version = 1 if latest_version is None else latest_version + 1

    # Save current decision as history
    history = DecisionVersion(
        version_number=next_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        decision_taken=decision.decision_taken,
        reasoning=decision.reasoning,
        decision_id=decision.id
    )

    db.add(history)

    # Update current decision
    decision.title = updated_decision.title
    decision.problem_statement = updated_decision.problem_statement
    decision.decision_taken = updated_decision.decision_taken
    decision.reasoning = updated_decision.reasoning
    decision.created_by = updated_decision.created_by

    db.commit()
    db.refresh(decision)

    return {
        "message": "Decision updated successfully",
        "version_created": next_version
    }


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