from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class VoiceRecording(Base):
    __tablename__ = "voice_recordings"
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    admin_reply = Column(Text, nullable=True)
    admin_replied_at = Column(DateTime(timezone=True), nullable=True)
    admin_replied_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="voice_recordings")
    admin = relationship("User", foreign_keys=[admin_replied_by])
    decision = relationship("Decision", back_populates="voice_recordings")
