from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.access_log import AccessLog
from app.models.user import User
from app.schemas.access_log_schema import AccessLogResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/access-logs", tags=["Access Log"])


# Get My Access Log
@router.get("/", response_model=list[AccessLogResponse])
def get_my_access_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AccessLog)
        .filter(AccessLog.user_id == current_user.id)
        .order_by(AccessLog.created_at.desc())
        .all()
    )
