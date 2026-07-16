from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class FileUpload(Base):
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True, index=True)

    file_name = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    file_type = Column(String, nullable=False)

    file_size = Column(Float, nullable=False)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id"),
        nullable=False
    )

    decision = relationship(
        "Decision",
        back_populates="files"
    )