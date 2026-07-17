from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    comments = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete"
    )

    decision_versions = relationship(
        "DecisionVersion",
        back_populates="user",
        cascade="all, delete"
    )