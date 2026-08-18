import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Enum
from sqlalchemy.orm import relationship, synonym
from backend.app.database import Base
import enum

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class UserRole(str, enum.Enum):
    EMPLOYEE = "Employee"
    REVIEWER = "Reviewer"
    MANAGER = "Manager"
    ADMINISTRATOR = "Administrator"

class DecisionStatus(str, enum.Enum):
    DRAFT = "Draft"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ARCHIVED = "Archived"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.EMPLOYEE.value, nullable=False)
    team = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    decisions = relationship("Decision", back_populates="creator", foreign_keys="[Decision.creator_id]")
    comments = relationship("Comment", back_populates="user")
    approvals = relationship("Approval", back_populates="approver")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    problem_statement = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    category_id = Column(String, nullable=True)
    status = Column(String, default=DecisionStatus.DRAFT.value, nullable=False)
    current_version = Column(Integer, default=1, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meeting_summary = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    creator = relationship("User", back_populates="decisions", foreign_keys=[creator_id])
    alternatives = relationship("Alternative", back_populates="decision", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="decision", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="decision", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="decision", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="decision", cascade="all, delete-orphan")
    versions = relationship("DecisionVersion", back_populates="decision", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="decision", cascade="all, delete-orphan")

class DecisionVersion(Base):
    __tablename__ = "decision_versions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    version = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    problem_statement = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    decision = relationship("Decision", back_populates="versions")
    changed_by = relationship("User")

    @property
    def version_number(self):
        return self.version

    @version_number.setter
    def version_number(self, val):
        self.version = val

    @property
    def description(self):
        return self.problem_statement

    @description.setter
    def description(self, val):
        self.problem_statement = val

    @property
    def modified_at(self):
        return self.created_at

    @modified_at.setter
    def modified_at(self, val):
        self.created_at = val

    @property
    def modified_by_id(self):
        return self.changed_by_id

    @modified_by_id.setter
    def modified_by_id(self, val):
        self.changed_by_id = val

    @property
    def modified_by(self):
        return self.changed_by

class Alternative(Base):
    __tablename__ = "alternatives"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    pros = Column(JSON, nullable=True)  # List of strings
    cons = Column(JSON, nullable=True)  # List of strings
    cost = Column(Float, default=0.0)
    feasibility_rating = Column(Integer, default=3)  # 1-5
    risk_rating = Column(Integer, default=3)        # 1-5
    risk_mitigation = Column(Text, nullable=True)

    # Relationships
    decision = relationship("Decision", back_populates="alternatives")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    decision = relationship("Decision", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="comment", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=get_utc_now)

    # Relationships
    decision = relationship("Decision", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=get_utc_now)

    # Relationships
    decision = relationship("Decision", back_populates="attachments")
    comment = relationship("Comment", back_populates="attachments")
    uploaded_by = relationship("User")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    level = Column(Integer, default=1)  # Level of approval (1, 2, etc.)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="Pending", nullable=False)  # Pending, Approved, Rejected
    comments = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=get_utc_now)
    actioned_at = Column(DateTime, nullable=True)

    # Relationships
    decision = relationship("Decision", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)
    action_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Backward compatibility synonyms
    action = synonym("action_type")
    details = synonym("description")
    timestamp = synonym("created_at")

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    decision = relationship("Decision", back_populates="audit_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # approval_assigned, decision_approved, decision_rejected, comment_added, document_uploaded, status_changed
    is_read = Column(Integer, default=0)  # 0 = unread, 1 = read
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    user = relationship("User", back_populates="notifications")
    decision = relationship("Decision")
