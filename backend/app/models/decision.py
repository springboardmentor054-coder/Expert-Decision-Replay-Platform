from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    problem_statement = Column(Text, nullable=False)

    decision_taken = Column(Text, nullable=False)

    reasoning = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id")
    )

    creator = relationship(
        "User",
        back_populates="decisions"
    )

    alternatives = relationship(
        "Alternative",
        back_populates="decision"
    )

    files = relationship(
        "FileUpload",
        back_populates="decision"
    )

    discussions = relationship(
        "Discussion",
        back_populates="decision"
    )

    versions = relationship(
        "DecisionVersion",
        back_populates="decision"
    )