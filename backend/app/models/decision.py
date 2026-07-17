from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Decision(Base):

    __tablename__ = "decisions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    problem_statement = Column(
        Text,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category_id = Column(
        Integer,
        nullable=True
    )

    status = Column(
        String,
        default="Draft"
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationship with Comments
    comments = relationship(
        "Comment",
        back_populates="decision",
        cascade="all, delete"
    )

    # Relationship with Meeting Notes
    meeting_notes = relationship(
        "MeetingNote",
        back_populates="decision",
        cascade="all, delete"
    )

    # Relationship with Decision Versions
    versions = relationship(
        "DecisionVersion",
        back_populates="decision",
        cascade="all, delete"
    )