from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="Employee")
    bio = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())