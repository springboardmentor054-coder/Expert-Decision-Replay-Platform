from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class MeetingNote(Base):

    __tablename__ = "meeting_notes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id", ondelete="CASCADE"),
        nullable=False
    )

    meeting_summary = Column(
        Text,
        nullable=False
    )

    conclusion = Column(
        Text,
        nullable=False
    )

    next_action = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


    decision = relationship(
        "Decision",
        back_populates="meeting_notes"
    )