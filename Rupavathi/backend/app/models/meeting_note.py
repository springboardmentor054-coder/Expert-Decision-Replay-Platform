from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class MeetingNote(Base):
    __tablename__ = "meeting_notes"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)

    meeting_summary = Column(String, nullable=False)

    conclusion = Column(String, nullable=True)

    next_action = Column(String, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    decision = relationship("Decision")
    creator = relationship("User")
