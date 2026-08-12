from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.comment import Comment
from app.models.decision import Decision
from app.models.user import User
from app.schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from app.utils.dependencies import get_current_user
from app.utils.notifications import create_notification
from app.utils.audit import create_audit_log

router = APIRouter(prefix="/comments", tags=["Comments"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


def _get_comment_or_404(db: Session, comment_id: int) -> Comment:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


def _require_owner(comment: Comment, current_user: User) -> None:
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only modify your own comments")


# Create Comment
@router.post("/", response_model=CommentResponse)
def create_comment(
    payload: CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = _get_decision_or_404(db, payload.decision_id)

    new_comment = Comment(
        decision_id=payload.decision_id,
        user_id=current_user.id,
        comment=payload.comment,
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    create_audit_log(
        db,
        user_id=current_user.id,
        action_type="Comment Added",
        description=f'Commented on "{decision.title}"',
        decision_id=decision.id,
        request=request,
    )

    if decision.created_by != current_user.id:
        create_notification(
            db,
            user_id=decision.created_by,
            category="decisions",
            title="New comment on your decision",
            message=f'{current_user.full_name} commented on "{decision.title}"',
            decision_id=decision.id,
        )

    return new_comment


# Get All Comments
@router.get("/", response_model=list[CommentResponse])
def get_all_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Comment).order_by(Comment.created_at.asc()).all()


# Get Comment By ID
@router.get("/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    return _get_comment_or_404(db, comment_id)


# Update Comment
@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = _get_comment_or_404(db, comment_id)
    _require_owner(comment, current_user)

    comment.comment = payload.comment
    db.commit()
    db.refresh(comment)

    return comment


# Delete Comment
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = _get_comment_or_404(db, comment_id)
    _require_owner(comment, current_user)

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}
