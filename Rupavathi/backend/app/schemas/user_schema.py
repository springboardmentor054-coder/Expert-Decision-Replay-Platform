from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

from app.utils.security import validate_password_strength


def _normalize_email(value: str) -> str:
    return value.strip().lower()


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class GoogleAuthRequest(BaseModel):
    access_token: str


class AppleAuthRequest(BaseModel):
    id_token: str
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, value: str) -> str:
        return validate_password_strength(value)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    bio: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True