from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate, PasswordChange
from app.schemas.notification_schema import NotificationResponse
from app.utils.security import hash_password, verify_password
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

AVATAR_DIR = Path(__file__).resolve().parents[2] / "uploads" / "avatars"
ALLOWED_AVATAR_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_AVATAR_SIZE = 3 * 1024 * 1024  # 3 MB


def _require_self(user_id: int, current_user: User) -> None:
    if user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="You can only manage your own profile picture")


def _delete_avatar_file(avatar_url: str | None) -> None:
    if not avatar_url:
        return
    file_path = AVATAR_DIR / Path(avatar_url).name
    if file_path.exists():
        file_path.unlink()


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_self(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if updated_user.role != user.role and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only an Admin can change a user's role")

    user.full_name = updated_user.full_name
    user.email = updated_user.email
    user.role = updated_user.role
    user.bio = updated_user.bio
    user.phone = updated_user.phone
    user.department = updated_user.department

    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/avatar", response_model=UserResponse)
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_self(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_AVATAR_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Allowed types: PNG, JPG, WEBP.",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Image is too large. Maximum allowed size is {MAX_AVATAR_SIZE // (1024 * 1024)} MB.",
        )

    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    _delete_avatar_file(user.avatar_url)

    stored_name = f"{uuid4().hex}{extension}"
    with open(AVATAR_DIR / stored_name, "wb") as out_file:
        out_file.write(contents)

    user.avatar_url = f"/avatars/{stored_name}"
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}/avatar", response_model=UserResponse)
def remove_avatar(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_self(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    _delete_avatar_file(user.avatar_url)
    user.avatar_url = None
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}/notifications", response_model=list[NotificationResponse])
def get_user_notifications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="You can only view your own notifications")

    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.put("/{user_id}/password")
def change_password(
    user_id: int,
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only change your own password")

    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    current_user.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_self(user_id, current_user)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this account because it still owns decisions, comments, or other records. Please transfer or remove that content first.",
        )
    return {"message": "User deleted successfully"}