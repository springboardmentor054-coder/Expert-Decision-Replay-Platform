from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.role import Role

from app.schemas.user import UserCreate
from app.utils.hashing import hash_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Check if role exists
    role = db.query(Role).filter(
        Role.id == user.role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

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
        "message": "User created successfully",
        "user_id": new_user.id
    }


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/{id}")
def get_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.put("/{id}")
def update_user(
    id: int,
    updated_user: UserCreate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    role = db.query(Role).filter(
        Role.id == updated_user.role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    user.username = updated_user.username
    user.email = updated_user.email
    user.password = hash_password(updated_user.password)
    user.role_id = updated_user.role_id

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully"
    }


@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }