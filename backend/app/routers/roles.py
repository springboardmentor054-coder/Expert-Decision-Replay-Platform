from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.role import Role
from app.schemas.role import RoleCreate

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.get("/")
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


@router.post("/")
def create_role(role: RoleCreate, db: Session = Depends(get_db)):

    new_role = Role(
        role_name=role.name
    )

    db.add(new_role)
    db.commit()
    db.refresh(new_role)

    return {
        "message": "Role created successfully",
        "id": new_role.id,
        "role_name": new_role.role_name
    }