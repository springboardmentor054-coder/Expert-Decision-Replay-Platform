from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    UserProfileUpdate,
    PasswordChange
)
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
    is_password_hashed
)
from app.utils.audit import create_audit_log


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

    # ==========================================
    # GET USER IN CURRENT SESSION
    # ==========================================

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

    # ==========================================
    # GET USER IN CURRENT SESSION
    # ==========================================

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