from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.models.category import Category
from app.models.alternative import Alternative
from app.models.document import Document
from app.models.comment import Comment
from app.models.meeting_note import MeetingNote
from app.models.decision_version import DecisionVersion
from app.models.approval import Approval
from app.models.user import User
from app.schemas.decision_schema import (
    DecisionCreate,
    DecisionUpdate,
    DecisionResponse,
)
from app.schemas.alternative_schema import AlternativeResponse
from app.schemas.document_schema import DocumentResponse
from app.schemas.comment_schema import CommentResponse
from app.schemas.meeting_note_schema import MeetingNoteResponse
from app.schemas.decision_version_schema import (
    DecisionVersionCreate,
    DecisionVersionResponse,
)
from app.schemas.approval_schema import ApprovalResponse
from app.utils.dependencies import get_current_user
from app.utils.notifications import create_notification
from app.utils.audit import create_audit_log

router = APIRouter(prefix="/decisions", tags=["Decisions"])

VERSIONED_FIELDS = ("title", "description", "status")


def _get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def _create_decision_version(
    db: Session,
    decision: Decision,
    current_user: User,
    change_summary: str | None,
) -> DecisionVersion:
    last_version_number = (
        db.query(DecisionVersion.version_number)
        .filter(DecisionVersion.decision_id == decision.id)
        .order_by(DecisionVersion.version_number.desc())
        .first()
    )
    next_version_number = (last_version_number[0] + 1) if last_version_number else 1

    version = DecisionVersion(
        decision_id=decision.id,
        version_number=next_version_number,
        title=decision.title,
        description=decision.description,
        status=decision.status,
        modified_by=current_user.id,
        change_summary=change_summary,
    )

    db.add(version)
    db.commit()
    db.refresh(version)

    return version


# Create Decision
@router.post("/", response_model=DecisionResponse)
def create_decision(
    decision: DecisionCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _get_category_or_404(db, decision.category_id)

    new_decision = Decision(
        title=decision.title,
        problem_statement=decision.problem_statement,
        description=decision.description,
        category_id=decision.category_id,
        status="Draft",
        created_by=current_user.id
    )

    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)

    _create_decision_version(db, new_decision, current_user, "Decision created")

    create_audit_log(
        db,
        user_id=current_user.id,
        action_type="Decision Created",
        description=f'Created decision "{new_decision.title}"',
        decision_id=new_decision.id,
        request=request,
    )

    return new_decision


# Get All Decisions
@router.get("/", response_model=list[DecisionResponse])
def get_all_decisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Decision).order_by(Decision.created_at.desc()).all()


# Get Decision By ID
@router.get("/{decision_id}", response_model=DecisionResponse)
def get_decision(
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

    return decision


# Update Decision
@router.put("/{decision_id}", response_model=DecisionResponse)
def update_decision(
    decision_id: int,
    updated_data: DecisionUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    update_data = updated_data.model_dump(exclude_unset=True)

    change_summary = update_data.pop("change_summary", None)

    if "category_id" in update_data:
        _get_category_or_404(db, update_data["category_id"])

    before = {field: getattr(decision, field) for field in VERSIONED_FIELDS}

    for key, value in update_data.items():
        setattr(decision, key, value)

    db.commit()
    db.refresh(decision)

    if update_data:
        create_audit_log(
            db,
            user_id=current_user.id,
            action_type="Decision Updated",
            description=f'Updated {", ".join(update_data.keys())} on "{decision.title}"',
            decision_id=decision.id,
            request=request,
        )

    after = {field: getattr(decision, field) for field in VERSIONED_FIELDS}
    changed_fields = [field for field in VERSIONED_FIELDS if before[field] != after[field]]

    if changed_fields:
        if not change_summary:
            change_summary = "; ".join(
                f"{field} changed from '{before[field]}' to '{after[field]}'"
                for field in changed_fields
            )
        _create_decision_version(db, decision, current_user, change_summary)

        if "status" in changed_fields and decision.created_by != current_user.id:
            category = "reviews" if decision.status in ("Approved", "Rejected") else "decisions"
            create_notification(
                db,
                user_id=decision.created_by,
                category=category,
                title="Decision status updated",
                message=f'"{decision.title}" status changed to {decision.status}',
                decision_id=decision.id,
            )

        if "status" in changed_fields and decision.status == "Under Review":
            existing_approvals = db.query(Approval).filter(Approval.decision_id == decision.id).count()
            if existing_approvals == 0:
                db.add(Approval(decision_id=decision.id, approval_level=2, status="Pending"))
                db.commit()

                approvers = db.query(User).filter(User.role == "Approver").all()
                for approver in approvers:
                    create_notification(
                        db,
                        user_id=approver.id,
                        category="decisions",
                        title="Decision submitted for approval",
                        message=f'"{decision.title}" was submitted by {decision.creator.full_name} and is awaiting your approval.',
                        decision_id=decision.id,
                    )

    return decision


# Get Approvals For A Decision
@router.get("/{decision_id}/approvals", response_model=list[ApprovalResponse])
def get_decision_approvals(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(Approval)
        .filter(Approval.decision_id == decision_id)
        .order_by(Approval.approval_level.asc())
        .all()
    )


# Get Alternatives For A Decision
@router.get("/{decision_id}/alternatives", response_model=list[AlternativeResponse])
def get_decision_alternatives(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(Alternative)
        .filter(Alternative.decision_id == decision_id)
        .order_by(Alternative.created_at.desc())
        .all()
    )


# Get Documents For A Decision
@router.get("/{decision_id}/documents", response_model=list[DocumentResponse])
def get_decision_documents(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(Document)
        .filter(Document.decision_id == decision_id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


# Get Comments For A Decision
@router.get("/{decision_id}/comments", response_model=list[CommentResponse])
def get_decision_comments(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(Comment)
        .filter(Comment.decision_id == decision_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


# Get Meeting Notes For A Decision
@router.get("/{decision_id}/meeting-notes", response_model=list[MeetingNoteResponse])
def get_decision_meeting_notes(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(MeetingNote)
        .filter(MeetingNote.decision_id == decision_id)
        .order_by(MeetingNote.created_at.asc())
        .all()
    )


# Get Version History For A Decision
@router.get("/{decision_id}/versions", response_model=list[DecisionVersionResponse])
def get_decision_versions(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return (
        db.query(DecisionVersion)
        .filter(DecisionVersion.decision_id == decision_id)
        .order_by(DecisionVersion.version_number.desc())
        .all()
    )


# Manually Create A Version Checkpoint For A Decision
@router.post("/{decision_id}/versions", response_model=DecisionVersionResponse)
def create_decision_version(
    decision_id: int,
    payload: DecisionVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return _create_decision_version(db, decision, current_user, payload.change_summary)


# Delete Decision
@router.delete("/{decision_id}")
def delete_decision(
    decision_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    if decision.created_by != current_user.id and current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only the decision's creator or an Admin can delete it",
        )

    deleted_title = decision.title

    documents = db.query(Document).filter(Document.decision_id == decision_id).all()
    for document in documents:
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()

    db.delete(decision)
    db.commit()

    create_audit_log(
        db,
        user_id=current_user.id,
        action_type="Decision Deleted",
        description=f'Deleted decision "{deleted_title}"',
        decision_id=None,
        request=request,
    )

    return {"message": "Decision deleted successfully"}
