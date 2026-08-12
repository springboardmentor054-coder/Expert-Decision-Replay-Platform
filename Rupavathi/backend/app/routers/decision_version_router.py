from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision_version import DecisionVersion
from app.models.user import User
from app.schemas.decision_version_schema import DecisionVersionResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/decision-versions", tags=["Decision Versions"])


# Get All Decision Versions (across every decision)
@router.get("/", response_model=list[DecisionVersionResponse])
def get_all_decision_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(DecisionVersion).order_by(DecisionVersion.modified_at.desc()).all()
