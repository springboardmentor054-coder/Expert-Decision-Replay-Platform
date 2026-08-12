from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=True)

    category = Column(String, nullable=False)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    is_read = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    decision = relationship("Decision")
