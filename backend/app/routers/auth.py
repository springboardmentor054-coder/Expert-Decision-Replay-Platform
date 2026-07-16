from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.role import Role

from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest

from app.utils.hashing import hash_password, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check if role exists
    role = db.query(Role).filter(Role.id == user.role_id).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role_id=user.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": role.role_name
    }


@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    return {
        "message": "Login Successful",
        "username": db_user.username,
        "email": db_user.email
    }