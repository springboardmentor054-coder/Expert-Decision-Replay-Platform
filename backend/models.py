from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    TIMESTAMP,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base



# ==========================
# User Model
# ==========================

class User(Base):
    __tablename__ = "users"

    user_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        default="User"
    )



# ==========================
# Decision Model
# ==========================

class Decision(Base):
    __tablename__ = "decisions"

    decision_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    decision_title = Column(
        String(255),
        nullable=False
    )

    decision_description = Column(
        Text
    )

    status = Column(
        String(30),
        default="Draft"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    criteria = relationship(
        "Criteria",
        back_populates="decision",
        cascade="all, delete"
    )


# ==========================
# Alternative Model
# ==========================

class Alternative(Base):
    __tablename__ = "alternatives"

    alternative_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    alternative_name = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text
    )

    pros = Column(
        Text
    )

    cons = Column(
        Text
    )

    estimated_cost = Column(
        Integer,
        nullable=False
    )

    feasibility = Column(
        String(50)
    )

    risk_level = Column(
        String(20)
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )


# ==========================
# Criteria Model
# ==========================

class Criteria(Base):
    __tablename__ = "criteria"

    criteria_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    criteria_name = Column(
        String(100),
        nullable=False
    )

    weight = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    decision = relationship(
        "Decision",
        back_populates="criteria"
    )


# ==========================
# Alternative Score Model
# ==========================

class AlternativeScore(Base):
    __tablename__ = "alternative_scores"

    score_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    alternative_id = Column(
        Integer,
        ForeignKey("alternatives.alternative_id"),
        nullable=False
    )

    criteria_id = Column(
        Integer,
        ForeignKey("criteria.criteria_id"),
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )


# ==========================
# Document Model
# ==========================

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    file_type = Column(
        String(100)
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    uploaded_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )


# ==========================
# Discussion Model
# ==========================

class Discussion(Base):
    __tablename__ = "discussions"

    discussion_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    comment = Column(
        Text,
        nullable=False
    )

    discussion_type = Column(
        String(30),
        default="Comment"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    decision = relationship("Decision")
    user = relationship("User")


# ==========================
# Decision Version Model
# ==========================

class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    version_number = Column(
        Integer,
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text
    )

    status = Column(
        String(50)
    )

    modified_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    modified_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    change_summary = Column(
        Text
    )

    decision = relationship("Decision")
    user = relationship("User", foreign_keys=[modified_by])


# ==========================
# Approval Model
# ==========================

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=False
    )

    reviewer_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    approval_level = Column(
        Integer,
        default=1
    )

    status = Column(
        String(20),
        default="Pending"
    )

    remarks = Column(
        Text
    )

    approved_at = Column(
        TIMESTAMP
    )

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    decision = relationship("Decision")
    reviewer = relationship("User", foreign_keys=[reviewer_id])


# ==========================
# Notification Model
# ==========================

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30))
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

# ============================================================
# AUDIT LOGS
# ============================================================

class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.decision_id"),
        nullable=True
    )

    action_type = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    ip_address = Column(
        String(100),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User"
    )

    decision = relationship(
        "Decision"
    )


