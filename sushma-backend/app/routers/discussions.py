"""
Discussion Module:
- Comments and threaded replies on a decision
- Meeting notes (flagged comments)
- Decision rationale is simply the discussion trail attached to a decision
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comment, Decision, User
from app.schemas import CommentCreate, CommentUpdate, CommentOut, CommentThreadOut
from app.deps import get_current_user

router = APIRouter(tags=["Discussion Module"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


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
    _get_decision_or_404(db, decision_id)

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
    db.commit()
    db.refresh(comment)
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
    return top_level


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
