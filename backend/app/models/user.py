from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role_id = Column(
        Integer,
        ForeignKey("roles.id")
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    decisions = relationship(
        "Decision",
        back_populates="creator"
    )

    discussions = relationship(
        "Discussion",
        back_populates="user"
    )