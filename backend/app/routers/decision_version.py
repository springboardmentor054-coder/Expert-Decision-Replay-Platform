from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.decision_version import DecisionVersion

router = APIRouter(
    prefix="/decision-versions",
    tags=["Decision Versions"]
)


@router.get("/")
def get_all_versions(
    db: Session = Depends(get_db)
):
    return db.query(DecisionVersion).all()


@router.get("/{decision_id}")
def get_versions_by_decision(
    decision_id: int,
    db: Session = Depends(get_db)
):

    versions = db.query(DecisionVersion).filter(
        DecisionVersion.decision_id == decision_id
    ).all()

    if not versions:
        raise HTTPException(
            status_code=404,
            detail="No version history found for this decision"
        )

    return versions