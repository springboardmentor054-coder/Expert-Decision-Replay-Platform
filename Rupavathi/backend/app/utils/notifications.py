from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    category: str,
    title: str,
    message: str,
    decision_id: int | None = None,
) -> None:
    notification = Notification(
        user_id=user_id,
        decision_id=decision_id,
        category=category,
        title=title,
        message=message,
    )
    db.add(notification)
    db.commit()
