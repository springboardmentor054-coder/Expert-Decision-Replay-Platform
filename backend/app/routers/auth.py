from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.role import Role
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserOut
from app.utils.deps import get_current_user
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def _audit(db, user_id, action, description, request=None):
    ip = None
    if request:
        ip = request.client.host if request.client else None
    db.add(AuditLog(user_id=user_id, action_type=action, description=description, ip_address=ip))
    db.commit()

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    if not db.query(Role).filter(Role.id == payload.role_id).first():
        raise HTTPException(status_code=400, detail="Role does not exist")
    user = User(full_name=payload.full_name, email=payload.email,
                hashed_password=hash_password(payload.password), role_id=payload.role_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    _audit(db, user.id, "USER_REGISTERED", f"User {user.email} registered", request)
    return user

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    token = create_access_token(subject=str(user.id))
    _audit(db, user.id, "USER_LOGIN", f"User {user.email} logged in", request)
    return Token(access_token=token)
