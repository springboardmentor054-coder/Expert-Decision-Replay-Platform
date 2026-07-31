from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Login does not belong to a decision,
    # so decision_id must be optional.
    decision_id = Column(
        Integer,
        ForeignKey(
            "decisions.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    action_type = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    ip_address = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationship with User
    user = relationship(
        "User",
        back_populates="audit_logs"
    )

    # Relationship with Decision
    decision = relationship(
        "Decision",
        back_populates="audit_logs"
    )