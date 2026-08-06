from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.models.discussion import Discussion
from app.models.decision import Decision
from app.schemas.discussion import DiscussionCreate, DiscussionResponse


router = APIRouter(
    prefix="/discussions",
    tags=["Discussions"]
)


def discussion_response(discussion):

    return {
        "id": discussion.id,
        "decision_id": discussion.decision_id,
        "user_id": discussion.user_id,
        "user_name": discussion.user.name if discussion.user else "Unknown",
        "message": discussion.message,
        "created_at": discussion.created_at
    }



# Create Discussion
@router.post("/", response_model=DiscussionResponse)
def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db)
):

    decision = db.query(Decision).filter(
        Decision.id == discussion.decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    new_discussion = Discussion(
        **discussion.model_dump()
    )


    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)


    new_discussion = db.query(Discussion).options(
        joinedload(Discussion.user)
    ).filter(
        Discussion.id == new_discussion.id
    ).first()


    return discussion_response(new_discussion)




# Get All Discussions
@router.get("/", response_model=list[DiscussionResponse])
def get_discussions(
    db: Session = Depends(get_db)
):

    discussions = db.query(Discussion).options(
        joinedload(Discussion.user)
    ).order_by(
        Discussion.created_at
    ).all()


    return [
        discussion_response(d)
        for d in discussions
    ]




# Get Single Discussion
@router.get("/{id}", response_model=DiscussionResponse)
def get_discussion(
    id: int,
    db: Session = Depends(get_db)
):

    discussion = db.query(Discussion).options(
        joinedload(Discussion.user)
    ).filter(
        Discussion.id == id
    ).first()


    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )


    return discussion_response(discussion)




# Delete Discussion
@router.delete("/{id}")
def delete_discussion(
    id: int,
    db: Session = Depends(get_db)
):

    discussion = db.query(Discussion).filter(
        Discussion.id == id
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