from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class Notification(Base):

    __tablename__ = "notifications"

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

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    status = Column(
        String,
        default="Unread",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationship with User
    user = relationship(
        "User",
        back_populates="notifications"
    )

    # Relationship with Decision
    decision = relationship(
        "Decision",
        back_populates="notifications"
    )