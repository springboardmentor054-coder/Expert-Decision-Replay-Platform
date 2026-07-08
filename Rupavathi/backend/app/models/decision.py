from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, default="Draft")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)