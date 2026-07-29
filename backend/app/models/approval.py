from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Approval(Base):

    __tablename__ = "approvals"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id"),
        nullable=False
    )

    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    approval_level = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="Pending"
    )

    remarks = Column(
        Text,
        nullable=True
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationship with Decision
    decision = relationship(
        "Decision",
        back_populates="approvals"
    )

    # Relationship with User / Reviewer
    reviewer = relationship(
        "User",
        back_populates="approvals"
    )