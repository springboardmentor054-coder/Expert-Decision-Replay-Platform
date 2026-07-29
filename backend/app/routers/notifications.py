from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.notification import Notification
from app.models.user import User

from app.schemas.notification import NotificationResponse

from app.core.security import get_current_user


# ==========================================
# Notification Router
# ==========================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==========================================
# User Notification Router
# ==========================================

user_notification_router = APIRouter(
    prefix="/users",
    tags=["User Notifications"]
)


# ==========================================
# Database Dependency
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# GET /notifications
# Get Current User's Notifications
# ==========================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return notifications


# ==========================================
# GET /notifications/{id}
# Get Single Notification
# ==========================================

@router.get(
    "/{id}",
    response_model=NotificationResponse
)
def get_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )


    return notification


# ==========================================
# PUT /notifications/{id}/read
# Mark Notification As Read
# ==========================================

@router.put(
    "/{id}/read",
    response_model=NotificationResponse
)
def mark_notification_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )


    notification.status = "Read"


    db.commit()

    db.refresh(notification)


    return notification


# ==========================================
# DELETE /notifications/{id}
# Delete Notification
# ==========================================

@router.delete(
    "/{id}"
)
def delete_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found."
        )


    db.delete(notification)

    db.commit()


    return {

        "message":
            "Notification deleted successfully."

    }


# ==========================================
# GET /users/{id}/notifications
# Get Notifications For Specific User
# ==========================================

@user_notification_router.get(
    "/{id}/notifications",
    response_model=list[NotificationResponse]
)
def get_user_notifications(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # CHECK USER EXISTS
    # ==========================================

    user = db.query(User).filter(
        User.id == id
    ).first()


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    # ==========================================
    # GET USER NOTIFICATIONS
    # ==========================================

    notifications = db.query(Notification).filter(
        Notification.user_id == id
    ).order_by(
        Notification.created_at.desc()
    ).all()


    return notifications