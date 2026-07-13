from pydantic import BaseModel, EmailStr


# --------------------------
# Register User Schema
# --------------------------
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


# --------------------------
# Login User Schema
# --------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# --------------------------
# Update User Schema
# --------------------------
class UserUpdate(BaseModel):
    username: str
    email: EmailStr


# --------------------------
# Update Role Schema
# --------------------------
class RoleUpdate(BaseModel):
    role: str