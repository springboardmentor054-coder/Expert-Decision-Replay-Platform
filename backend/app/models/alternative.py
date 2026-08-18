from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class Alternative(Base):
    __tablename__ = "alternatives"
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True)
    feasibility = Column(String(50), nullable=True)
    is_selected = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    decision = relationship("Decision", back_populates="alternatives")
