from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.models.decision import Decision
from app.models.decision_version import DecisionVersion

from app.schemas.decision_version import (
    DecisionVersionCreate,
    DecisionVersionResponse,
)

from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/decisions",
    tags=["Decision Versions"]
)


# GET /decisions/{id}/versions
@router.get("/{id}/versions", response_model=list[DecisionVersionResponse])
def get_versions(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.id == id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    versions = (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == id)
        .order_by(DecisionVersion.version_number.desc())
        .all()
    )

    return versions


# POST /decisions/{id}/versions
@router.post("/{id}/versions", response_model=DecisionVersionResponse)
def create_version(
    id: int,
    version: DecisionVersionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    decision = db.query(Decision).filter(
        Decision.id == id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    latest_version = (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == id)
        .order_by(DecisionVersion.version_number.desc())
        .first()
    )

    next_version = 1

    if latest_version:
        next_version = latest_version.version_number + 1

    new_version = DecisionVersion(
        decision_id=decision.id,
        version_number=next_version,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        modified_by=current_user.id,
        change_summary=version.change_summary
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return new_version