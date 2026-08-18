from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import get_current_user
from app.utils.audit import create_audit_log


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# ADMINISTRATOR CHECK
# ==========================================

def require_admin(
    current_user: User = Depends(get_current_user)
):

    if current_user.role.lower() != "administrator":

        raise HTTPException(
            status_code=403,
            detail="Only Administrators can manage users."
        )

    return current_user


# ==========================================
# GET ALL USERS
# ==========================================

@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    users = db.query(User).all()

    return users


# ==========================================
# GET SINGLE USER
# ==========================================

@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ==========================================
# UPDATE USER
# ==========================================

@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not db_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # ==========================================
    # DUPLICATE EMAIL CHECK
    # ==========================================

    existing_user = db.query(User).filter(
        User.email == user.email,
        User.id != user_id
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )


    old_name = db_user.name
    old_email = db_user.email
    old_role = db_user.role
    old_team_id = db_user.team_id


    db_user.name = user.name
    db_user.email = user.email
    db_user.role = user.role
    db_user.team_id = user.team_id


    db.commit()
    db.refresh(db_user)


    # ==========================================
    # AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action_type="USER_UPDATED",
        description=(
            f"Administrator {current_user.email} updated "
            f"user {old_email}. "
            f"Name: {old_name} -> {db_user.name}, "
            f"Role: {old_role} -> {db_user.role}, "
            f"Team: {old_team_id} -> {db_user.team_id}."
        )
    )

    db.commit()

    return db_user


# ==========================================
# DELETE USER
# ==========================================

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # ==========================================
    # PREVENT SELF DELETE
    # ==========================================

    if user.id == current_user.id:

        raise HTTPException(
            status_code=400,
            detail="Administrators cannot delete their own account."
        )


    deleted_email = user.email
    deleted_name = user.name
    deleted_role = user.role


    # ==========================================
    # DELETE USER
    # ==========================================

    db.delete(user)

    db.commit()


    # ==========================================
    # AUDIT LOG
    # ==========================================

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action_type="USER_DELETED",
        description=(
            f"Administrator {current_user.email} deleted "
            f"user {deleted_name} ({deleted_email}) "
            f"with role {deleted_role}."
        )
    )

    db.commit()


    return {
        "message": "User deleted successfully"
    }