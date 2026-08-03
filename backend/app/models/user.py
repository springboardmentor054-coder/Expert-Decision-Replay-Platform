from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False
    )

    # ==========================================
    # Team
    # ==========================================

    team_id = Column(
        Integer,
        ForeignKey("teams.id"),
        nullable=True
    )

    team = relationship(
        "Team",
        back_populates="users"
    )


    # ==========================================
    # Relationship with Comments
    # ==========================================

    comments = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete"
    )


    # ==========================================
    # Relationship with Decision Versions
    # ==========================================

    decision_versions = relationship(
        "DecisionVersion",
        back_populates="user",
        cascade="all, delete"
    )


    # ==========================================
    # Relationship with Approvals
    # ==========================================

    approvals = relationship(
        "Approval",
        back_populates="reviewer",
        foreign_keys="Approval.reviewer_id",
        cascade="all, delete"
    )


    # ==========================================
    # Relationship with Notifications
    # ==========================================

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete"
    )


    # ==========================================
    # Relationship with Audit Logs
    # ==========================================

    audit_logs = relationship(
        "AuditLog",
        back_populates="user"
    )