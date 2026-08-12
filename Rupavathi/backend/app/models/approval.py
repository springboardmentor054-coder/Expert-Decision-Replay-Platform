from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)

    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    approval_level = Column(Integer, nullable=False)

    status = Column(String, nullable=False, default="Pending")

    remarks = Column(String, nullable=True)

    approved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    decision = relationship("Decision")
    reviewer = relationship("User")
