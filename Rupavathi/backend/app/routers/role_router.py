from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.schemas.role_schema import RoleCreate, RoleResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/roles", tags=["Roles"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _require_admin(current_user: User) -> None:
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only an Admin can manage roles")


@router.get("/", response_model=list[RoleResponse])
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Role).all()


@router.post("/", response_model=RoleResponse)
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    existing_role = db.query(Role).filter(Role.name == role.name).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(name=role.name, description=role.description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}