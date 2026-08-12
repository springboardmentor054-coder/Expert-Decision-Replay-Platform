from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/summary")
def get_report(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return {
        "total_decisions": db.query(Decision).count(),
        "approved": db.query(Decision).filter(
            Decision.status == "Approved"
        ).count(),
        "rejected": db.query(Decision).filter(
            Decision.status == "Rejected"
        ).count(),
        "pending": db.query(Decision).filter(
            Decision.status == "Pending"
        ).count(),
        "draft": db.query(Decision).filter(
            Decision.status == "Draft"
        ).count()
    }