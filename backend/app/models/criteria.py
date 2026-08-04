from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Criteria(Base):
    __tablename__ = "criteria"

    criteria_id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    criteria_name = Column(String(255), nullable=False)
    description = Column(String)
    weight = Column(Float, nullable=False)

    decision = relationship("Decision", back_populates="criteria")