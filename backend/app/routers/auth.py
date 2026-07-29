from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.core.security import create_access_token, get_current_user


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

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password,
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

        return {
            "message": "User not found"
        }


    if db_user.password != user.password:

        return {
            "message": "Invalid password"
        }


    access_token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role
        }
    )


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