from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.models.comment import Comment
from app.models.decision import Decision
from app.models.user import User

from app.utils.auth import get_current_user

from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
)


router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)



def comment_response(comment):

    return {
        "id": comment.id,
        "decision_id": comment.decision_id,
        "user_id": comment.user_id,
        "user_name": comment.user.name if comment.user else "Unknown",
        "comment": comment.comment,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at
    }



# Create Comment
@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check decision exists
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
        comment=comment.comment
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    new_comment = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(
        Comment.id == new_comment.id
    ).first()

    return comment_response(new_comment)





# Get All Comments
@router.get("/", response_model=list[CommentResponse])
def get_comments(
    db: Session = Depends(get_db)
):


    comments = db.query(Comment).options(
        joinedload(Comment.user)
    ).order_by(
        Comment.created_at.asc()
    ).all()



    return [

        comment_response(comment)

        for comment in comments

    ]







# Get Single Comment
@router.get("/{id}", response_model=CommentResponse)
def get_comment(
    id: int,
    db: Session = Depends(get_db)
):


    comment = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(
        Comment.id == id
    ).first()



    if not comment:

        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )



    return comment_response(comment)







# Update Comment
@router.put("/{id}", response_model=CommentResponse)
def update_comment(
    id: int,
    updated: CommentUpdate,
    db: Session = Depends(get_db)
):


    comment = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(
        Comment.id == id
    ).first()



    if not comment:

        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )



    data = updated.model_dump(exclude_unset=True)



    for key, value in data.items():

        setattr(comment, key, value)



    db.commit()

    db.refresh(comment)



    comment = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(
        Comment.id == id
    ).first()



    return comment_response(comment)







# Delete Comment
@router.delete("/{id}")
def delete_comment(
    id: int,
    db: Session = Depends(get_db)
):


    comment = db.query(Comment).filter(
        Comment.id == id
    ).first()



    if not comment:

        raise HTTPException(
            status_code=404,
            detail="Comment not found"
        )



    db.delete(comment)

    db.commit()



    return {

        "message": "Comment deleted successfully"

    }