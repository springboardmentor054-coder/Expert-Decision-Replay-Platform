from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    
    # Create user
    hashed_password = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role.value,
        team=user_in.team
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    auth.log_activity(db, user.id, "USER_REGISTER", f"User {user.email} registered successfully.")
    return user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    
    auth.log_activity(db, user.id, "LOGIN", f"User {user.email} logged in.")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_user_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_in: schemas.UserBase,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check if updating to an email that is already taken
    if user_in.email != current_user.email:
        db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already in use.")
        current_user.email = user_in.email

    current_user.full_name = user_in.full_name
    current_user.team = user_in.team
    # Only Admin can change their own role here, otherwise it is ignored or raises HTTP exception
    # (For safety, standard users cannot elevate their own role)
    if current_user.role == models.UserRole.ADMINISTRATOR.value:
        current_user.role = user_in.role.value

    db.commit()
    db.refresh(current_user)
    
    auth.log_activity(db, current_user.id, "USER_UPDATE", f"User updated profile details.")
    return current_user

@router.get("/teams", response_model=List[str])
def get_teams(db: Session = Depends(get_db)):
    # Fetch distinct team values from users table
    teams = db.query(models.User.team).filter(models.User.team != None).distinct().all()
    team_list = [t[0] for t in teams if t[0]]
    # Ensure there are some default teams if list is empty
    if not team_list:
        team_list = ["Engineering", "Product", "Operations", "Legal", "Executive", "Research"]
    return team_list

@router.get("/roles/{role_name}", response_model=List[schemas.UserPublic])
def get_users_by_role(role_name: str, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.role == role_name).all()
    return users

@router.get("/", response_model=List[schemas.UserResponse])
def get_all_users(
    current_user: models.User = Depends(auth.check_role(["Administrator"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    return users
