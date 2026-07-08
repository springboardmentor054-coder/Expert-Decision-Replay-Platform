from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.decision import Decision
from app.schemas.decision_schema import DecisionCreate, DecisionResponse
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["Employee", "Administrator"]:
        raise HTTPException(status_code=403, detail="You are not allowed to create decisions")

    new_decision = Decision(
        title=decision.title,
        description=decision.description,
        category=decision.category,
        status=decision.status,
        owner_id=current_user.id
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    return new_decision


@router.get("/", response_model=list[DecisionResponse])
def get_decisions(db: Session = Depends(get_db)):
    return db.query(Decision).all()