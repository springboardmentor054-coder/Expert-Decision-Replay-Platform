from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(Integer, ForeignKey("decisions.id", ondelete="CASCADE"), nullable=False)

    alternative_name = Column(String, nullable=False)

    description = Column(String, nullable=True)

    pros = Column(String, nullable=True)

    cons = Column(String, nullable=True)

    estimated_cost = Column(Float, nullable=True)

    feasibility = Column(String, nullable=True)

    risk_level = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    decision = relationship("Decision")
