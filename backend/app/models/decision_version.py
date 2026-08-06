from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id", ondelete="CASCADE"),
        nullable=False
    )

    version_number = Column(Integer, nullable=False)

    title = Column(String, nullable=False)

    description = Column(Text)

    status = Column(String)

    modified_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    modified_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    change_summary = Column(Text)

    decision = relationship("Decision", back_populates="versions")