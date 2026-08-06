from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    problem_statement = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, nullable=True)
    status = Column(String, default="Draft")
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with Alternative
    alternatives = relationship(
        "Alternative",
        back_populates="decision",
        cascade="all, delete-orphan"
    )

    # Relationship with Document
    documents = relationship(
        "Document",
        back_populates="decision",
        cascade="all, delete-orphan"
    )

    comments = relationship(
    "Comment",
    back_populates="decision",
    cascade="all, delete-orphan"
    ) 

    discussions = relationship(
    "Discussion",
    back_populates="decision",
    cascade="all, delete-orphan"
    )

    versions = relationship(
    "DecisionVersion",
    back_populates="decision",
    cascade="all, delete"
    )