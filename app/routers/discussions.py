"""
Discussion Module:
- Comments and threaded replies on a decision
- Meeting notes (flagged comments)
- Decision rationale is simply the discussion trail attached to a decision
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comment, Decision, User, AuditActionType
from app.schemas import CommentCreate, CommentUpdate, CommentOut, CommentThreadOut
from app.deps import get_current_user
from app.routers.audit import create_audit_log
from app.routers.notifications import notify_stakeholders

router = APIRouter(tags=["Discussion Module"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.post(
    "/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.decision_id is None:
        raise HTTPException(status_code=422, detail="decision_id is required")

    decision = _get_decision_or_404(db, payload.decision_id)

    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id).first()
        if not parent or parent.decision_id != payload.decision_id:
            raise HTTPException(status_code=400, detail="Invalid parent comment for this decision")

    comment = Comment(
        decision_id=payload.decision_id,
        author_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content,
        is_meeting_note=payload.is_meeting_note,
    )
    db.add(comment)

    notify_stakeholders(
        db,
        decision_id=decision.id,
        title=f"New Comment on {decision.title}",
        message=f"{current_user.full_name} commented: \"{comment.content[:60]}...\"",
        exclude_user_id=current_user.id,
    )

    db.commit()
    db.refresh(comment)
    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision.id,
        action_type=AuditActionType.ADD_COMMENT,
        description=f"Added comment to decision '{decision.title}'",
    )
    return comment


@router.post(
    "/decisions/{decision_id}/comments",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    decision_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = _get_decision_or_404(db, decision_id)

    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id).first()
        if not parent or parent.decision_id != decision_id:
            raise HTTPException(status_code=400, detail="Invalid parent comment for this decision")

    comment = Comment(
        decision_id=decision_id,
        author_id=current_user.id,
        parent_id=payload.parent_id,
        content=payload.content,
        is_meeting_note=payload.is_meeting_note,
    )
    db.add(comment)

    notify_stakeholders(
        db,
        decision_id=decision.id,
        title=f"New Comment on {decision.title}",
        message=f"{current_user.full_name} commented: \"{comment.content[:60]}...\"",
        exclude_user_id=current_user.id,
    )

    db.commit()
    db.refresh(comment)
    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision.id,
        action_type=AuditActionType.ADD_COMMENT,
        description=f"Added comment to decision '{decision.title}'",
    )
    return comment


@router.get("/comments", response_model=List[CommentOut])
def list_comments(
    decision_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Comment)
    if decision_id is not None:
        query = query.filter(Comment.decision_id == decision_id)
    comments = query.order_by(Comment.created_at.asc()).all()
    return comments


@router.get("/comments/{comment_id}", response_model=CommentOut)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.get("/decisions/{decision_id}/comments", response_model=List[CommentThreadOut])
def list_comments_threaded(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Returns top-level comments with nested replies (threaded discussion view)."""
    _get_decision_or_404(db, decision_id)
    top_level = (
        db.query(Comment)
        .filter(Comment.decision_id == decision_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at.asc())
        .all()
    )
    def _serialize(c: Comment):
        return {
            "id": c.id,
            "decision_id": c.decision_id,
            "author_id": c.author_id,
            "author_name": c.author_name,
            "parent_id": c.parent_id,
            "content": c.content,
            "is_meeting_note": c.is_meeting_note,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "replies": [_serialize(r) for r in (c.replies or [])],
        }

    return [_serialize(c) for c in top_level]


@router.put("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own comments")
    comment.content = payload.content
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id and current_user.role.value not in ("manager", "administrator"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
    return None
