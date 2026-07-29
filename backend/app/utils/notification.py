from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User


def create_notification(
    db: Session,
    user_id: int,
    decision_id: int,
    title: str,
    message: str
):

    # Check that the user exists
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Notification recipient user not found."
        )

    notification = Notification(
        user_id=user_id,
        decision_id=decision_id,
        title=title,
        message=message,
        status="Unread"
    )

    db.add(notification)

    return notification