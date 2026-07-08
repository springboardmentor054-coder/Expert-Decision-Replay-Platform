from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.role import Role
from app.schemas.role_schema import RoleCreate, RoleResponse

router = APIRouter(prefix="/roles", tags=["Roles"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[RoleResponse])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


@router.post("/", response_model=RoleResponse)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    existing_role = db.query(Role).filter(Role.name == role.name).first()
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(name=role.name)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role