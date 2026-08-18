from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.comment import Comment
from app.models.decision import Decision
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.comment import CommentCreate, CommentOut, CommentUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/comments", tags=["Comments"])

@router.get("", response_model=list[CommentOut])
def list_comments(decision_id: Optional[int] = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Comment)
    if decision_id:
        q = q.filter(Comment.decision_id == decision_id)
    return q.order_by(Comment.id).all()

@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(payload: CommentCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    d = db.query(Decision).filter(Decision.id == payload.decision_id).first()
    if not d:
        raise HTTPException(status_code=400, detail="Decision does not exist")
    comment = Comment(decision_id=payload.decision_id, user_id=current_user.id, content=payload.content)
    db.add(comment)
    ip = request.client.host if request.client else None
    db.add(AuditLog(user_id=current_user.id, decision_id=payload.decision_id, action_type="COMMENT_ADDED",
                    description=f"Comment added to decision '{d.title}'", ip_address=ip))
    # notify decision creator
    if d.created_by != current_user.id:
        db.add(Notification(user_id=d.created_by, decision_id=d.id, title="New Comment",
                            message=f"{current_user.full_name} commented on '{d.title}'"))
    db.commit()
    db.refresh(comment)
    return comment

@router.put("/{comment_id}", response_model=CommentOut)
def update_comment(comment_id: int, payload: CommentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.content = payload.content
    db.commit()
    db.refresh(comment)
    return comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
