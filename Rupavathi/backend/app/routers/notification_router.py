from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification_schema import NotificationResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _get_notification_or_404(db: Session, notification_id: int) -> Notification:
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


def _require_owner(notification: Notification, current_user: User) -> None:
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own notifications")


# Get My Notifications
@router.get("/", response_model=list[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


# Get Notification By ID
@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = _get_notification_or_404(db, notification_id)
    _require_owner(notification, current_user)
    return notification


def _mark_read(notification_id: int, db: Session, current_user: User) -> Notification:
    notification = _get_notification_or_404(db, notification_id)
    _require_owner(notification, current_user)

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


# Mark One Notification As Read
@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read_patch(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _mark_read(notification_id, db, current_user)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read_put(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _mark_read(notification_id, db, current_user)


# Mark All Notifications As Read
@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False),
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# Delete Notification
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = _get_notification_or_404(db, notification_id)
    _require_owner(notification, current_user)

    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}
