from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=True)

    action_type = Column(String, nullable=False)

    description = Column(String, nullable=False)

    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    decision = relationship("Decision")
