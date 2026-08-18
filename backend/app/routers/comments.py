from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
import datetime
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.config import settings

router = APIRouter(tags=["Discussions & Comments"])

@router.post("/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment_direct(
    comment_in: schemas.CommentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Validation: comment must belong to an existing decision
    if not comment_in.decision_id:
        raise HTTPException(status_code=400, detail="Every comment must belong to an existing decision.")
    
    decision = db.query(models.Decision).filter(models.Decision.id == comment_in.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")

    comment_text = comment_in.content or comment_in.comment
    if not comment_text or not comment_text.strip():
        raise HTTPException(status_code=400, detail="Empty comments cannot be submitted.")

    comment = models.Comment(
        decision_id=comment_in.decision_id,
        user_id=current_user.id,
        content=comment_text.strip(),
        parent_id=comment_in.parent_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    auth.log_activity(db, current_user.id, "ADD_COMMENT", f"Commented on decision {comment_in.decision_id}.", decision_id=comment_in.decision_id)

    # Notify decision creator (if commenter is not the creator)
    if decision.creator_id != current_user.id:
        try:
            auth.create_notification(
                db, decision.creator_id,
                "New Comment",
                f"{current_user.full_name} commented on your decision '{decision.title}'",
                "comment_added",
                decision_id=decision.id
            )
        except Exception:
            pass

    return comment

@router.post("/decisions/{decision_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment_for_decision(
    decision_id: int,
    comment_in: schemas.CommentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")

    comment_text = comment_in.content or comment_in.comment
    if not comment_text or not comment_text.strip():
        raise HTTPException(status_code=400, detail="Empty comments cannot be submitted.")

    comment = models.Comment(
        decision_id=decision_id,
        user_id=current_user.id,
        content=comment_text.strip(),
        parent_id=comment_in.parent_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    auth.log_activity(db, current_user.id, "ADD_COMMENT", f"Commented on decision {decision_id}.", decision_id=decision_id)

    # Notify decision creator (if commenter is not the creator)
    if decision.creator_id != current_user.id:
        try:
            auth.create_notification(
                db, decision.creator_id,
                "New Comment",
                f"{current_user.full_name} commented on your decision '{decision.title}'",
                "comment_added",
                decision_id=decision.id
            )
        except Exception:
            pass

    return comment

@router.get("/comments", response_model=List[schemas.CommentResponse])
def get_comments(
    decision_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Comment)
    if decision_id is not None:
        query = query.filter(models.Comment.decision_id == decision_id)
    return query.order_by(models.Comment.created_at.asc()).all()

@router.get("/comments/{comment_id}", response_model=schemas.CommentResponse)
def get_comment(comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")
    return comment

@router.put("/comments/{comment_id}", response_model=schemas.CommentResponse)
def update_comment(
    comment_id: int,
    comment_in: schemas.CommentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")

    if comment.user_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment.")

    comment_text = comment_in.content or comment_in.comment
    if not comment_text or not comment_text.strip():
        raise HTTPException(status_code=400, detail="Empty comments cannot be submitted.")

    comment.content = comment_text.strip()
    comment.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(comment)

    auth.log_activity(db, current_user.id, "COMMENT_UPDATE", f"Updated comment {comment_id}.")
    return comment

@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
def delete_comment(
    comment_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")

    # Permission check: comment owner or manager/admin
    if comment.user_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment.")

    db.delete(comment)
    db.commit()
    auth.log_activity(db, current_user.id, "COMMENT_DELETE", f"Deleted comment {comment_id}.")
    return {"message": "Comment deleted successfully.", "id": comment_id}

@router.get("/decisions/{decision_id}/comments", response_model=List[schemas.CommentResponse])
def get_decision_comments(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    comments = db.query(models.Comment).filter(
        models.Comment.decision_id == decision_id,
        models.Comment.parent_id == None
    ).order_by(models.Comment.created_at.asc()).all()
    return comments
