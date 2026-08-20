from datetime import datetime, timedelta
import secrets
import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.password_reset_token import PasswordResetToken

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    UserProfileUpdate,
    PasswordChange,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
    is_password_hashed
)

from app.utils.audit import create_audit_log
from app.utils.email import send_password_reset_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# REGISTER
# ==========================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ==========================================
# LOGIN
# ==========================================

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    password_valid = verify_password(
        user.password,
        db_user.password
    )

    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password."
        )

    # ==========================================
    # UPGRADE OLD PLAINTEXT PASSWORD
    # ==========================================

    if not is_password_hashed(db_user.password):

        db_user.password = hash_password(
            user.password
        )

        db.commit()
        db.refresh(db_user)

    # ==========================================
    # CREATE ACCESS TOKEN
    # ==========================================

    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    # ==========================================
    # CREATE LOGIN AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=db_user.id,
        action_type="LOGIN",
        description=f"User {db_user.email} logged in successfully."
    )

    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==========================================
# FORGOT PASSWORD
# ==========================================

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # ==========================================
    # DON'T REVEAL WHETHER EMAIL EXISTS
    # ==========================================

    if not user:

        return {
            "message": "If the email is registered, a password reset link has been sent."
        }

    # ==========================================
    # INVALIDATE PREVIOUS UNUSED TOKENS
    # ==========================================

    previous_tokens = db.query(
        PasswordResetToken
    ).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).all()

    for previous_token in previous_tokens:

        previous_token.used = True

    # ==========================================
    # GENERATE SECURE RESET TOKEN
    # ==========================================

    token = secrets.token_urlsafe(32)

    expires_at = datetime.utcnow() + timedelta(
        minutes=30
    )

    reset_token = PasswordResetToken(
        token=token,
        user_id=user.id,
        expires_at=expires_at,
        used=False
    )

    db.add(reset_token)
    db.commit()

    # ==========================================
    # CREATE FRONTEND RESET LINK
    # ==========================================

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000"
    )

    reset_link = (
        f"{frontend_url}/reset-password?token={token}"
    )

    # ==========================================
    # SEND RESET EMAIL
    # ==========================================

    try:

        send_password_reset_email(
            recipient_email=user.email,
            reset_link=reset_link
        )

    except Exception as error:

        # Remove the token if email sending fails
        db.delete(reset_token)
        db.commit()

        print(
            f"Password reset email error: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send password reset email."
        )

    return {
        "message": "If the email is registered, a password reset link has been sent."
    }


# ==========================================
# RESET PASSWORD
# ==========================================

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    reset_token = db.query(
        PasswordResetToken
    ).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False
    ).first()

    if not reset_token:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or already used reset token."
        )

    # ==========================================
    # CHECK TOKEN EXPIRATION
    # ==========================================

    if reset_token.expires_at < datetime.utcnow():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired."
        )

    # ==========================================
    # FIND USER
    # ==========================================

    user = db.query(User).filter(
        User.id == reset_token.user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # ==========================================
    # UPDATE PASSWORD
    # ==========================================

    user.password = hash_password(
        request.new_password
    )

    # ==========================================
    # INVALIDATE TOKEN
    # ==========================================

    reset_token.used = True

    db.commit()

    # ==========================================
    # AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=user.id,
        action_type="PASSWORD_RESET",
        description=f"User {user.email} reset their password."
    )

    db.commit()

    return {
        "message": "Password reset successfully."
    }


# ==========================================
# GET CURRENT LOGGED-IN USER
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
):

    return current_user


# ==========================================
# UPDATE CURRENT USER PROFILE
# ==========================================

@router.put(
    "/me",
    response_model=UserResponse
)
def update_my_profile(
    user: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.id == current_user.id
    ).first()

    if not db_user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # ==========================================
    # CHECK EMAIL
    # ==========================================

    existing_user = db.query(User).filter(
        User.email == user.email,
        User.id != db_user.id
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # ==========================================
    # UPDATE PROFILE
    # ==========================================

    db_user.name = user.name
    db_user.email = user.email

    db.commit()
    db.refresh(db_user)

    # ==========================================
    # AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=db_user.id,
        action_type="PROFILE_UPDATED",
        description=f"User {db_user.email} updated their profile."
    )

    db.commit()

    return db_user


# ==========================================
# CHANGE PASSWORD
# ==========================================

@router.put("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.id == current_user.id
    ).first()

    if not db_user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # ==========================================
    # VERIFY CURRENT PASSWORD
    # ==========================================

    if not verify_password(
        password_data.current_password,
        db_user.password
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    # ==========================================
    # PREVENT SAME PASSWORD
    # ==========================================

    if verify_password(
        password_data.new_password,
        db_user.password
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password."
        )

    # ==========================================
    # HASH NEW PASSWORD
    # ==========================================

    db_user.password = hash_password(
        password_data.new_password
    )

    db.commit()
    db.refresh(db_user)

    # ==========================================
    # AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=db_user.id,
        action_type="PASSWORD_CHANGED",
        description=f"User {db_user.email} changed their password."
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }