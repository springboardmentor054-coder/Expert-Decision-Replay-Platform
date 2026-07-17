from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal

from app.models.decision_version import DecisionVersion
from app.models.decision import Decision

from app.schemas.decision_version import (
    DecisionVersionCreate,
    DecisionVersionResponse
)


router = APIRouter(
    prefix="/decisions",
    tags=["Decision Versions"]
)


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# ==================================
# GET VERSION HISTORY
# GET /decisions/{id}/versions
# ==================================

@router.get("/{id}/versions", response_model=list[DecisionVersionResponse])
def get_decision_versions(
    id: int,
    db: Session = Depends(get_db)
):

    versions = (
        db.query(DecisionVersion)
        .filter(
            DecisionVersion.decision_id == id
        )
        .order_by(
            DecisionVersion.version_number.asc()
        )
        .all()
    )

    return versions



# ==================================
# POST CREATE VERSION MANUALLY
# POST /decisions/{id}/versions
# ==================================

@router.post("/{id}/versions", response_model=DecisionVersionResponse)
def create_decision_version(
    id: int,
    version_data: DecisionVersionCreate,
    db: Session = Depends(get_db)
):

    decision = (
        db.query(Decision)
        .filter(
            Decision.id == id
        )
        .first()
    )


    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    latest_version = (
        db.query(DecisionVersion)
        .filter(
            DecisionVersion.decision_id == id
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
        decision_id=id,
        version_number=new_version_number,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        modified_by=decision.created_by,
        change_summary=(
            version_data.change_summary
            if version_data.change_summary
            else "Manual version created"
        )
    )


    db.add(new_version)
    db.commit()
    db.refresh(new_version)


    return new_version