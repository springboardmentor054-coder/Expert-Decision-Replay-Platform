from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)

    comment = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
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

    user = relationship(
        "User",
        back_populates="discussions"
    )

    decision = relationship(
        "Decision",
        back_populates="discussions"
    )