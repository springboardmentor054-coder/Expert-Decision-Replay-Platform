from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, index=True)

    alternative_name = Column(String, nullable=False)

    description = Column(String)

    cost = Column(Float)

    risk_level = Column(String)

    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)

    decision = relationship("Decision", back_populates="alternatives")