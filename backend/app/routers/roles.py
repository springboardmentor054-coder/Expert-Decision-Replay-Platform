from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleOut
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.get("", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only admins may create roles
    from app.models.role import Role as RoleModel
    admin_role = db.query(RoleModel).filter(RoleModel.name == "Admin").first()
    if not admin_role or current_user.role_id != admin_role.id:
        raise HTTPException(status_code=403, detail="Only admins can create roles")
    role = Role(**payload.model_dump())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role
