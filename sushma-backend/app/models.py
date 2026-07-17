"""
SQLAlchemy ORM models — the database design for the Expert Decision Replay Platform.

Entities:
- Team, User                         (User Management)
- Decision, DecisionVersion          (Decision Management + Version Tracking)
- Alternative                        (Alternative Analysis)
- DecisionStakeholder                (Stakeholders on a decision)
- Comment                            (Discussion Module, threaded)
- Document                           (File uploads / Document Management)
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, Boolean, JSON
)
from sqlalchemy.orm import relationship

from app.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    REVIEWER = "reviewer"
    MANAGER = "manager"
    ADMINISTRATOR = "administrator"


class DecisionStatus(str, enum.Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class StakeholderRole(str, enum.Enum):
    OWNER = "owner"
    REVIEWER = "reviewer"
    STAKEHOLDER = "stakeholder"


# ---------------------------------------------------------------------------
# User Management
# ---------------------------------------------------------------------------

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("User", back_populates="team")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    is_active = Column(Boolean, default=True)
    job_title = Column(String(150), nullable=True)
    bio = Column(Text, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="members")
    decisions_created = relationship("Decision", back_populates="creator")
    comments = relationship("Comment", back_populates="author")


# ---------------------------------------------------------------------------
# Decision Management
# ---------------------------------------------------------------------------

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    evaluation_criteria = Column(Text, nullable=True)
    status = Column(Enum(DecisionStatus), default=DecisionStatus.DRAFT, nullable=False, index=True)
    tags = Column(String(255), nullable=True)  # comma-separated tags for search/filter

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_version = Column(Integer, default=1)

    creator = relationship("User", back_populates="decisions_created")
    alternatives = relationship("Alternative", back_populates="decision", cascade="all, delete-orphan")
    versions = relationship("DecisionVersion", back_populates="decision", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="decision", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="decision", cascade="all, delete-orphan")
    stakeholders = relationship("DecisionStakeholder", back_populates="decision", cascade="all, delete-orphan")


class DecisionVersion(Base):
    """Snapshot of a Decision at a point in time — powers version history / audit trail."""
    __tablename__ = "decision_versions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot = Column(JSON, nullable=False)   # full field snapshot as JSON
    change_summary = Column(String(500), nullable=True)
    edited_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    edited_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("Decision", back_populates="versions")


class DecisionStakeholder(Base):
    __tablename__ = "decision_stakeholders"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(StakeholderRole), default=StakeholderRole.STAKEHOLDER)

    decision = relationship("Decision", back_populates="stakeholders")
    user = relationship("User")


# ---------------------------------------------------------------------------
# Alternative Analysis
# ---------------------------------------------------------------------------

class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pros = Column(Text, nullable=True)
    cons = Column(Text, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    feasibility_score = Column(Integer, nullable=True)  # 1 (low) - 5 (high)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    risk_notes = Column(Text, nullable=True)
    is_selected = Column(Boolean, default=False)  # marks the chosen alternative
    created_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("Decision", back_populates="alternatives")


# ---------------------------------------------------------------------------
# Discussion Module
# ---------------------------------------------------------------------------

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # for threaded replies
    content = Column(Text, nullable=False)
    is_meeting_note = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    decision = relationship("Decision", back_populates="comments")
    author = relationship("User", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])


# ---------------------------------------------------------------------------
# Document Management
# ---------------------------------------------------------------------------

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    stored_path = Column(String(500), nullable=False)
    content_type = Column(String(150), nullable=True)
    size_bytes = Column(Integer, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("Decision", back_populates="documents")
