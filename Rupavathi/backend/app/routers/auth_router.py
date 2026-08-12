import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.access_log import AccessLog
from app.schemas.user_schema import UserCreate, UserLogin, GoogleAuthRequest, AppleAuthRequest
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.audit import create_audit_log
from app.utils.oauth import verify_google_access_token, verify_apple_id_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

SOCIAL_SIGNUP_ROLE = "Team Member"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login(user: UserLogin, request: Request, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": existing_user.email, "role": existing_user.role}
    )

    client_ip = request.client.host if request.client else None
    db.add(AccessLog(user_id=existing_user.id, action="Login", ip_address=client_ip))
    db.commit()

    create_audit_log(
        db,
        user_id=existing_user.id,
        action_type="Login",
        description=f"{existing_user.full_name} logged in",
        request=request,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email,
            "role": existing_user.role,
            "avatar_url": existing_user.avatar_url
        }
    }


def _social_login(db: Session, request: Request, email: str, full_name: str, provider: str) -> dict:
    email = email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    is_new_user = False

    if not user:
        user = User(
            full_name=full_name,
            email=email,
            password=hash_password(secrets.token_urlsafe(32)),
            role=SOCIAL_SIGNUP_ROLE,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True

    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    client_ip = request.client.host if request.client else None
    db.add(AccessLog(user_id=user.id, action=f"Login via {provider}", ip_address=client_ip))
    db.commit()

    create_audit_log(
        db,
        user_id=user.id,
        action_type="Login",
        description=f"{user.full_name} logged in via {provider}",
        request=request,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "avatar_url": user.avatar_url,
        },
    }


@router.post("/google")
async def google_login(payload: GoogleAuthRequest, request: Request, db: Session = Depends(get_db)):
    profile = await verify_google_access_token(payload.access_token)
    return _social_login(db, request, profile["email"], profile["full_name"], "Google")


@router.post("/apple")
async def apple_login(payload: AppleAuthRequest, request: Request, db: Session = Depends(get_db)):
    profile = await verify_apple_id_token(payload.id_token)
    full_name = payload.full_name or profile["full_name"]
    return _social_login(db, request, profile["email"], full_name, "Apple")