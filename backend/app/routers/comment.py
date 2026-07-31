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

from app.utils.notification import create_notification
from app.utils.audit import create_audit_log


router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# GET ALL COMMENTS
# ==========================================

@router.get(
    "/",
    response_model=list[CommentResponse]
)
def get_comments(
    db: Session = Depends(get_db)
):

    comments = db.query(Comment).all()

    return comments


# ==========================================
# CREATE COMMENT
# ==========================================

@router.post(
    "/",
    response_model=CommentResponse
)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # CHECK DECISION EXISTS
    # ==========================================

    decision = db.query(Decision).filter(
        Decision.id == comment.decision_id
    ).first()


    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    # ==========================================
    # CREATE COMMENT
    # ==========================================

    new_comment = Comment(

        decision_id=
            comment.decision_id,

        user_id=
            current_user.id,

        comment=
            comment.content
    )


    db.add(new_comment)


    # ==========================================
    # CREATE COMMENT AUDIT LOG
    # ==========================================

    create_audit_log(

        db=db,

        user_id=
            current_user.id,

        decision_id=
            decision.id,

        action_type=
            "COMMENT_ADDED",

        description=(
            f'User {current_user.id} added a comment '
            f'on decision "{decision.title}".'
        )
    )


    # ==========================================
    # CREATE COMMENT NOTIFICATION
    # ==========================================

    # Notify the decision creator
    # only if someone else adds the comment

    if decision.created_by != current_user.id:

        create_notification(

            db=db,

            user_id=
                decision.created_by,

            decision_id=
                decision.id,

            title=
                "New Comment Added",

            message=(
                f'user{current_user.id} added a new comment '
                f'on your decision "{decision.title}".'
            )
        )


    # ==========================================
    # SAVE COMMENT + AUDIT LOG + NOTIFICATION
    # ==========================================

    db.commit()

    db.refresh(new_comment)


    return new_comment


# ==========================================
# GET SINGLE COMMENT
# ==========================================

@router.get(
    "/{comment_id}",
    response_model=CommentResponse
)
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


# ==========================================
# UPDATE OWN COMMENT
# ==========================================

@router.put(
    "/{comment_id}",
    response_model=CommentResponse
)
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


    # ==========================================
    # CHECK COMMENT OWNER
    # ==========================================

    if comment.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You can only edit your own comments"
        )


    comment.comment = updated_comment.content


    db.commit()

    db.refresh(comment)


    return comment


# ==========================================
# DELETE OWN COMMENT
# ==========================================

@router.delete(
    "/{comment_id}"
)
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


    # ==========================================
    # CHECK COMMENT OWNER
    # ==========================================

    if comment.user_id != current_user.id:

        raise HTTPException(
            status_code=403,

            detail=
                "You can only delete your own comments"
        )


    db.delete(comment)

    db.commit()


    return {

        "message":
            "Comment deleted successfully"

    }


# ==========================================
# GET COMMENTS BY DECISION
# ==========================================

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