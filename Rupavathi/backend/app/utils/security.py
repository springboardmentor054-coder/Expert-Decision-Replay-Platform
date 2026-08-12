import os
import re
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mysecretkey123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must include at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must include at least one lowercase letter")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must include at least one number")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError("Password must include at least one special character")
    return password


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)