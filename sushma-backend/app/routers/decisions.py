"""
Decision Management module:
- Create / edit decisions
- Categories, tags, status lifecycle (Draft -> Under Review -> Approved/Rejected -> Archived)
- Automatic version snapshotting on every edit (Version Tracking)
- Stakeholder assignment
- Search / filter (feeds the Knowledge Repository)
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import (
    Decision, DecisionVersion, DecisionStakeholder, User, UserRole, DecisionStatus, StakeholderRole
)
from app.schemas import (
    DecisionCreate, DecisionUpdate, DecisionOut, DecisionStatusUpdate,
    DecisionVersionOut, StakeholderAdd, StakeholderOut,
)
from app.deps import get_current_user, require_roles

router = APIRouter(prefix="/decisions", tags=["Decision Management"])


def _snapshot_dict(decision: Decision) -> dict:
    return {
        "title": decision.title,
        "problem_statement": decision.problem_statement,
        "category": decision.category,
        "evaluation_criteria": decision.evaluation_criteria,
        "tags": decision.tags,
        "status": decision.status.value if decision.status else None,
    }


def _record_version(db: Session, decision: Decision, editor_id: int, change_summary: Optional[str]):
    decision.current_version += 1
    version = DecisionVersion(
        decision_id=decision.id,
        version_number=decision.current_version,
        snapshot=_snapshot_dict(decision),
        change_summary=change_summary,
        edited_by=editor_id,
    )
    db.add(version)


@router.post("", response_model=DecisionOut, status_code=status.HTTP_201_CREATED)
def create_decision(
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = Decision(
        title=payload.title,
        problem_statement=payload.problem_statement,
        category=payload.category,
        evaluation_criteria=payload.evaluation_criteria,
        tags=payload.tags,
        created_by=current_user.id,
        status=DecisionStatus.DRAFT,
        current_version=1,
    )
    db.add(decision)
    db.flush()  # get decision.id before creating the initial version snapshot

    initial_version = DecisionVersion(
        decision_id=decision.id,
        version_number=1,
        snapshot=_snapshot_dict(decision),
        change_summary="Initial creation",
        edited_by=current_user.id,
    )
    db.add(initial_version)

    # creator is automatically the "owner" stakeholder
    db.add(DecisionStakeholder(decision_id=decision.id, user_id=current_user.id, role=StakeholderRole.OWNER))

    db.commit()
    db.refresh(decision)
    return decision


@router.get("", response_model=List[DecisionOut])
def list_decisions(
    search: Optional[str] = Query(default=None, description="Search title/problem statement/tags"),
    category: Optional[str] = None,
    status_filter: Optional[DecisionStatus] = Query(default=None, alias="status"),
    created_by: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Decision)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(Decision.title.ilike(like), Decision.problem_statement.ilike(like), Decision.tags.ilike(like))
        )
    if category:
        query = query.filter(Decision.category == category)
    if status_filter:
        query = query.filter(Decision.status == status_filter)
    if created_by:
        query = query.filter(Decision.created_by == created_by)
    return query.order_by(Decision.updated_at.desc()).all()


@router.get("/{decision_id}", response_model=DecisionOut)
def get_decision(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.put("/{decision_id}", response_model=DecisionOut)
def update_decision(
    decision_id: int,
    payload: DecisionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    updates = payload.model_dump(exclude_unset=True, exclude={"change_summary"})
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    for field, value in updates.items():
        setattr(decision, field, value)

    _record_version(db, decision, current_user.id, payload.change_summary)
    db.commit()
    db.refresh(decision)
    return decision


@router.put("/{decision_id}/status", response_model=DecisionOut)
def update_decision_status(
    decision_id: int,
    payload: DecisionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.REVIEWER, UserRole.MANAGER, UserRole.ADMINISTRATOR)
    ),
):
    """Only Reviewers, Managers, and Administrators can move a decision through its
    review lifecycle (Under Review / Approved / Rejected / Archived)."""
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    decision.status = payload.status
    summary = payload.change_summary or f"Status changed to {payload.status.value}"
    _record_version(db, decision, current_user.id, summary)
    db.commit()
    db.refresh(decision)
    return decision


@router.get("/{decision_id}/versions", response_model=List[DecisionVersionOut])
def get_decision_versions(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == decision_id)
        .order_by(DecisionVersion.version_number.desc())
        .all()
    )


@router.get("/{decision_id}/versions/{version_number}", response_model=DecisionVersionOut)
def get_decision_version(
    decision_id: int,
    version_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    version = (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == decision_id, DecisionVersion.version_number == version_number)
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


@router.delete("/{decision_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_decision(
    decision_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMINISTRATOR)),
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    db.delete(decision)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Stakeholders
# ---------------------------------------------------------------------------

@router.post("/{decision_id}/stakeholders", response_model=StakeholderOut, status_code=status.HTTP_201_CREATED)
def add_stakeholder(
    decision_id: int,
    payload: StakeholderAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    stakeholder = DecisionStakeholder(decision_id=decision_id, user_id=payload.user_id, role=payload.role)
    db.add(stakeholder)
    db.commit()
    db.refresh(stakeholder)
    return stakeholder


@router.get("/{decision_id}/stakeholders", response_model=List[StakeholderOut])
def list_stakeholders(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(DecisionStakeholder).filter(DecisionStakeholder.decision_id == decision_id).all()
