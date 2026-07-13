from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, index=True)

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id", ondelete="CASCADE"),
        nullable=False
    )

    alternative_name = Column(String, nullable=False)

    description = Column(Text)

    pros = Column(Text)

    cons = Column(Text)

    estimated_cost = Column(Float)

    feasibility = Column(String)

    risk_level = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )