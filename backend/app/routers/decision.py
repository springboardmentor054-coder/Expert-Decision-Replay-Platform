from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.models.decision_version import DecisionVersion
from app.models.alternative import Alternative
from app.models.document import Document

from app.schemas.decision import (
    DecisionCreate,
    DecisionResponse,
)
from app.schemas.alternative import AlternativeResponse
from app.schemas.document import DocumentResponse

from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/decisions",
    tags=["Decisions"]
)


# POST /decisions
@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_decision = Decision(
        title=decision.title,
        problem_statement=decision.problem_statement,
        description=decision.description,
        category_id=decision.category_id,
        status="Draft",
        created_by=current_user.id
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)

    return new_decision


# GET /decisions
@router.get("/", response_model=list[DecisionResponse])
def get_decisions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Decision).all()


# GET /decisions/{id}
@router.get("/{id}", response_model=DecisionResponse)
def get_decision(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return decision


# PUT /decisions/{id}
@router.put("/{id}", response_model=DecisionResponse)
def update_decision(
    id: int,
    updated_decision: DecisionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    # Find latest version
    latest_version = (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == id)
        .order_by(DecisionVersion.version_number.desc())
        .first()
    )

    # Generate next version number
    next_version = 1 if latest_version is None else latest_version.version_number + 1

    # Save current decision as history
    version = DecisionVersion(
        decision_id=decision.id,
        version_number=next_version,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        modified_by=current_user.id,
        change_summary="Decision updated"
    )

    db.add(version)

    # Update decision
    decision.title = updated_decision.title
    decision.problem_statement = updated_decision.problem_statement
    decision.description = updated_decision.description
    decision.category_id = updated_decision.category_id

    db.commit()
    db.refresh(decision)

    return decision


# DELETE /decisions/{id}
@router.delete("/{id}")
def delete_decision(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    db.delete(decision)
    db.commit()

    return {
        "message": "Decision deleted successfully"
    }


# GET /decisions/{id}/alternatives
@router.get("/{id}/alternatives", response_model=list[AlternativeResponse])
def get_decision_alternatives(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return db.query(Alternative).filter(
        Alternative.decision_id == id
    ).all()


# GET /decisions/{id}/documents
@router.get("/{id}/documents", response_model=list[DocumentResponse])
def get_decision_documents(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    documents = db.query(Document).filter(
        Document.decision_id == id
    ).all()

    return documents