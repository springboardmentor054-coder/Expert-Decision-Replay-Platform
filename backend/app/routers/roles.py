from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.role import Role
from app.schemas.role import RoleRequest
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/roles")
def create_role(
    role: RoleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_role = db.query(Role).filter(Role.name == role.name).first()

    if existing_role:
        return {
            "message": "Role already exists"
        }

    new_role = Role(
        name=role.name
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return {
        "message": "Role created successfully",
        "role": new_role
    }


@router.get("/roles")
def get_roles(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    roles = db.query(Role).all()
    return roles