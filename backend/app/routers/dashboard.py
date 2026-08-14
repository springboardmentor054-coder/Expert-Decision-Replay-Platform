from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total = db.query(Decision).count()

    approved = db.query(Decision).filter(
        Decision.status == "Approved"
    ).count()

    rejected = db.query(Decision).filter(
        Decision.status == "Rejected"
    ).count()

    pending = db.query(Decision).filter(
        Decision.status.in_(["Pending", "Pending Approval"])
    ).count()

    draft = db.query(Decision).filter(
        Decision.status == "Draft"
    ).count()

    return {
        "total_decisions": total,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "draft": draft
    }