from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.models.decision import Decision
from app.models.decision_version import DecisionVersion
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


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# ==========================
# CREATE DECISION
# ==========================

@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_decision = Decision(
        title=decision.title,
        problem_statement=decision.problem_statement,
        description=decision.description,
        category_id=decision.category_id,
        status=decision.status if decision.status else "Draft",
        created_by=current_user.id
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)


    # Create Version 1

    first_version = DecisionVersion(
        decision_id=new_decision.id,
        version_number=1,
        title=new_decision.title,
        description=new_decision.description,
        status=new_decision.status,
        modified_by=current_user.id,
        change_summary="Initial version created"
    )

    db.add(first_version)
    db.commit()


    return new_decision




# ==========================
# GET ALL DECISIONS
# ==========================

@router.get("/", response_model=list[DecisionResponse])
def get_decisions(
    db: Session = Depends(get_db)
):

    return db.query(Decision).all()




# ==========================
# GET SINGLE DECISION
# ==========================

@router.get("/{id}", response_model=DecisionResponse)
def get_decision(
    id: int,
    db: Session = Depends(get_db)
):

    decision = (
        db.query(Decision)
        .filter(Decision.id == id)
        .first()
    )


    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    return decision




# ==========================
# UPDATE DECISION
# ==========================

@router.put("/{id}", response_model=DecisionResponse)
def update_decision(
    id: int,
    decision_data: DecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    decision = (
        db.query(Decision)
        .filter(Decision.id == id)
        .first()
    )


    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    # Update fields

    if decision_data.title is not None:
        decision.title = decision_data.title


    if decision_data.problem_statement is not None:
        decision.problem_statement = decision_data.problem_statement


    if decision_data.description is not None:
        decision.description = decision_data.description


    if decision_data.category_id is not None:
        decision.category_id = decision_data.category_id


    if decision_data.status is not None:
        decision.status = decision_data.status



    db.commit()
    db.refresh(decision)



    # ==========================
    # CREATE NEW VERSION
    # ==========================

    latest_version = (
        db.query(DecisionVersion)
        .filter(
            DecisionVersion.decision_id == decision.id
        )
        .order_by(
            DecisionVersion.version_number.desc()
        )
        .first()
    )


    if latest_version:
        new_version_number = latest_version.version_number + 1
    else:
        new_version_number = 1



    new_version = DecisionVersion(
        decision_id=decision.id,
        version_number=new_version_number,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        modified_by=current_user.id,
        change_summary="Decision updated"
    )


    db.add(new_version)
    db.commit()



    return decision




# ==========================
# DELETE DECISION
# ==========================

@router.delete("/{id}")
def delete_decision(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    decision = (
        db.query(Decision)
        .filter(Decision.id == id)
        .first()
    )


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