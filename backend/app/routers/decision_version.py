from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.decision import Decision
from app.models.decision_version import DecisionVersion

router = APIRouter(
    prefix="/decisions",
    tags=["Decision Versions"]
)


@router.get("/{decision_id}/versions")
def get_versions_by_decision(
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

    versions = (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == decision_id)
        .order_by(DecisionVersion.version_number.desc())
        .all()
    )

    return versions