from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User
from schemas import (
    UserRegister,
    UserLogin,
    UserUpdate,
    RoleUpdate
)
from security import hash_password, verify_password

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expert Decision Replay Platform"
)


# ==========================
# Home API
# ==========================
@app.get("/")
def home():
    return {
        "message": "Database Connected Successfully"
    }


# ==========================
# Register User
# ==========================
@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.user_id
    }


# ==========================
# Login User
# ==========================
@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    return {
        "message": "Login Successful",
        "username": db_user.username,
        "role": db_user.role
    }


# ==========================
# Get All Users
# ==========================
@app.get("/users")
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(User).all()


# ==========================
# Get User By ID
# ==========================
@app.get("/users/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ==========================
# Update User
# ==========================
@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.username = user_data.username
    user.email = user_data.email

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully"
    }


# ==========================
# Delete User
# ==========================
@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

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


# ==========================
# Update User Role
# ==========================
@app.put("/users/{user_id}/role")
def update_role(
    user_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    allowed_roles = [
        "Admin",
        "Manager",
        "Reviewer",
        "User"
    ]

    if role_data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    user.role = role_data.role

    db.commit()
    db.refresh(user)

    return {
        "message": "Role updated successfully",
        "role": user.role
    }