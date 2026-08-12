from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    comment = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    decision = relationship("Decision")
    author = relationship("User")
