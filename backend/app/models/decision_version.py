from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.connection import Base


class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id", ondelete="CASCADE"),
        nullable=False
    )

    version_number = Column(
        Integer,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text
    )

    status = Column(
        String,
        nullable=False
    )

    modified_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    modified_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    change_summary = Column(
        Text
    )

    decision = relationship(
        "Decision",
        back_populates="versions"
    )

    user = relationship(
        "User",
        back_populates="decision_versions"
    )