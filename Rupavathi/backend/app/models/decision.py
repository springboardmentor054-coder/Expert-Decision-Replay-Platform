from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    problem_statement = Column(String, nullable=False)

    description = Column(String, nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    status = Column(String, nullable=False, default="Draft")

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    category = relationship("Category")
    creator = relationship("User")
