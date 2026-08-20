from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, NotificationStatus, User, UserRole
from app.schemas import NotificationOut
from app.deps import get_current_user, require_roles

router = APIRouter(prefix="/notifications", tags=["Notification Management"])


@router.get("", response_model=List[NotificationOut])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.status == NotificationStatus.UNREAD)
    return query.order_by(Notification.created_at.desc()).all()


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.status = NotificationStatus.READ
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.status == NotificationStatus.UNREAD
    ).update({"status": NotificationStatus.READ}, synchronize_session=False)
    db.commit()
    return {"detail": "All notifications marked as read"}


@router.get("/{notification_id}", response_model=NotificationOut)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.get("/users/{user_id}/notifications", response_model=List[NotificationOut])
def get_user_notifications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.MANAGER, UserRole.ADMINISTRATOR)),
):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    db.delete(notification)
    db.commit()
    return None


def create_notification(db: Session, user_id: int, title: str, message: str, decision_id: Optional[int] = None) -> Notification:
    from app.models import User as UserModel
    if not db.query(UserModel).filter(UserModel.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found for notification")
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        decision_id=decision_id,
        status=NotificationStatus.UNREAD,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def notify_stakeholders(db: Session, decision_id: int, title: str, message: str, exclude_user_id: Optional[int] = None):
    from app.models import DecisionStakeholder
    stakeholders = db.query(DecisionStakeholder).filter(DecisionStakeholder.decision_id == decision_id).all()
    for s in stakeholders:
        if exclude_user_id and s.user_id == exclude_user_id:
            continue
        create_notification(db, s.user_id, title, message, decision_id)

