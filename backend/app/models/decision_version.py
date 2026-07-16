from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(Integer, primary_key=True, index=True)

    version_number = Column(Integer, nullable=False)

    title = Column(String, nullable=False)

    problem_statement = Column(Text, nullable=False)

    decision_taken = Column(Text, nullable=False)

    reasoning = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id"),
        nullable=False
    )

    decision = relationship(
        "Decision",
        back_populates="versions"
    )