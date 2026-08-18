from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==========================================
# ADMINISTRATOR USER UPDATE
# ==========================================

class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    role: str
    team_id: Optional[int] = None


# ==========================================
# LOGGED-IN USER PROFILE UPDATE
# ==========================================

class UserProfileUpdate(BaseModel):
    name: str
    email: EmailStr


# ==========================================
# PASSWORD CHANGE
# ==========================================

class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ==========================================
# USER RESPONSE
# ==========================================

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    team_id: Optional[int] = None

    class Config:
        from_attributes = True