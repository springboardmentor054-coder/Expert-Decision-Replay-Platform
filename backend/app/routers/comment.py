from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.comment import Comment
from app.models.decision import Decision
from app.models.user import User
from app.core.security import get_current_user

from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse
)


router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# Get all comments
@router.get("/", response_model=list[CommentResponse])
def get_comments(
    db: Session = Depends(get_db)
):

    comments = db.query(Comment).all()

    return comments



# Create comment
@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    decision = db.query(Decision).filter(
        Decision.id == comment.decision_id
    ).first()


    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    new_comment = Comment(
        decision_id=comment.decision_id,
        user_id=current_user.id,
        comment=comment.content
    )


    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)


    return new_comment



# Get single comment
@router.get("/{comment_id}", response_model=CommentResponse)
def get_comment(
    comment_id: int,
    db: Session = Depends(get_db)
):

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()


    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )


    return comment



# Update own comment
@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    updated_comment: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()


    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )


    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own comments"
        )


    comment.comment = updated_comment.content


    db.commit()
    db.refresh(comment)


    return comment



# Delete own comment
@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()


    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )


    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own comments"
        )


    db.delete(comment)
    db.commit()


    return {
        "message": "Comment deleted successfully"
    }



# Get comments by decision
@router.get(
    "/decision/{decision_id}",
    response_model=list[CommentResponse]
)
def get_comments_by_decision(
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


    comments = db.query(Comment).filter(
        Comment.decision_id == decision_id
    ).order_by(
        Comment.created_at.asc()
    ).all()


    return comments