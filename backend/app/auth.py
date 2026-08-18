from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app import models

# Password hashing configuration
# Using pbkdf2_sha256 as bcrypt might have issues if bcrypt native binaries are missing
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/users/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def check_role(required_roles: list[str]):
    def dependency(user: models.User = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {required_roles}"
            )
        return user
    return dependency

# Helper function to create audit log
def log_activity(
    db: Session,
    user_id: Optional[int],
    action: str,
    details: str,
    decision_id: Optional[int] = None,
    ip_address: Optional[str] = None
):
    audit_log = models.AuditLog(
        user_id=user_id,
        decision_id=decision_id,
        action_type=action,
        description=details,
        ip_address=ip_address
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log

# Helper function to create notification
def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    decision_id: Optional[int] = None
):
    notification = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        decision_id=decision_id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
