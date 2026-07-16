from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.discussion import Discussion
from app.models.user import User
from app.models.decision import Decision

from app.schemas.discussion import (
    DiscussionCreate,
    DiscussionUpdate
)

router = APIRouter(
    prefix="/discussions",
    tags=["Discussions"]
)


@router.post("/")
def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db)
):

    # Check if user exists
    user = db.query(User).filter(
        User.id == discussion.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check if decision exists
    decision = db.query(Decision).filter(
        Decision.id == discussion.decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    new_discussion = Discussion(
        comment=discussion.comment,
        user_id=discussion.user_id,
        decision_id=discussion.decision_id
    )

    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)

    return {
        "message": "Discussion added successfully",
        "discussion_id": new_discussion.id
    }


@router.get("/")
def get_all_discussions(
    db: Session = Depends(get_db)
):
    return db.query(Discussion).all()


@router.get("/{discussion_id}")
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):

    discussion = db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()

    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return discussion


@router.put("/{discussion_id}")
def update_discussion(
    discussion_id: int,
    updated_discussion: DiscussionUpdate,
    db: Session = Depends(get_db)
):

    discussion = db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()

    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    if updated_discussion.comment is not None:
        discussion.comment = updated_discussion.comment

    db.commit()
    db.refresh(discussion)

    return {
        "message": "Discussion updated successfully"
    }


@router.delete("/{discussion_id}")
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db)
):

    discussion = db.query(Discussion).filter(
        Discussion.id == discussion_id
    ).first()

    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    db.delete(discussion)
    db.commit()

    return {
        "message": "Discussion deleted successfully"
    }