from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app import models
from backend.app.auth import get_current_user
from backend.app.schemas import NotificationResponse, NotificationCountResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# GET /notifications - Get all notifications for the current user
@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    is_read: Optional[int] = Query(None, description="Filter by read status: 0=unread, 1=read"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )
    if is_read is not None:
        query = query.filter(models.Notification.is_read == is_read)
    
    notifications = query.order_by(models.Notification.created_at.desc()).limit(limit).all()
    return notifications

# GET /notifications/count - Get unread notification count
@router.get("/count", response_model=NotificationCountResponse)
def get_notification_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    total = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).count()
    unread = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == 0
    ).count()
    return {"unread_count": unread, "total_count": total}

# PUT /notifications/{id}/read - Mark a notification as read
@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = 1
    db.commit()
    db.refresh(notification)
    return notification

# PUT /notifications/read-all - Mark all notifications as read
@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == 0
    ).update({"is_read": 1})
    db.commit()
    return {"message": "All notifications marked as read"}

# DELETE /notifications/{id} - Users cannot delete notifications (immutability)
@router.delete("/{notification_id}")
def delete_notification(notification_id: int):
    raise HTTPException(status_code=403, detail="Notifications cannot be deleted")
