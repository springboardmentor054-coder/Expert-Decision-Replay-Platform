from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    action = Column(String, nullable=False)

    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
