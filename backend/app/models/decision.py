from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="open")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    creator = relationship("User", back_populates="decisions_created")
    alternatives = relationship("Alternative", back_populates="decision", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="decision", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="decision", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="decision", cascade="all, delete-orphan")
    versions = relationship("DecisionVersion", back_populates="decision", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="decision", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="decision", cascade="all, delete-orphan")
    voice_recordings = relationship("VoiceRecording", back_populates="decision", cascade="all, delete-orphan")
