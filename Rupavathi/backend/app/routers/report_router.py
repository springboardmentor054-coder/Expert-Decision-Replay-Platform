from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.approval import Approval
from app.models.audit_log import AuditLog
from app.models.decision import Decision
from app.models.user import User
from app.schemas.report_schema import (
    AuditActionBreakdown,
    AuditReportResponse,
    AuditReportSummary,
    ApprovalReportResponse,
    ApprovalReportRow,
    DecisionReportResponse,
    DecisionReportRow,
    DecisionReportSummary,
    TeamReportResponse,
    TeamReportRow,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

REVIEWER_ROLES = ("Approver",)
PENDING_STATUSES = ("Draft", "Under Review")


def _pending_reviews_for_role(role: str, pending_by_level: dict) -> int:
    if role == "Admin":
        return sum(pending_by_level.values())
    level = {"Approver": 2}.get(role)
    return pending_by_level.get(level, 0) if level else 0


# Decision Report
@router.get("/decisions", response_model=DecisionReportResponse)
def decision_report(
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Decision)
    if category_id is not None:
        query = query.filter(Decision.category_id == category_id)
    if status:
        query = query.filter(Decision.status == status)
    if search:
        query = query.filter(Decision.title.ilike(f"%{search}%"))

    decisions = query.order_by(Decision.created_at.desc()).all()

    rows = [
        DecisionReportRow(
            id=d.id,
            title=d.title,
            category=d.category.name,
            status=d.status,
            created_by=d.creator.full_name,
            created_at=d.created_at,
        )
        for d in decisions
    ]

    summary = DecisionReportSummary(
        total_decisions=len(decisions),
        approved=sum(1 for d in decisions if d.status == "Approved"),
        rejected=sum(1 for d in decisions if d.status == "Rejected"),
        pending=sum(1 for d in decisions if d.status in PENDING_STATUSES),
    )

    return DecisionReportResponse(summary=summary, decisions=rows)


# Approval Report
@router.get("/approvals", response_model=ApprovalReportResponse)
def approval_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pending_by_level = dict(
        db.query(Approval.approval_level, func.count(Approval.id))
        .filter(Approval.status == "Pending")
        .group_by(Approval.approval_level)
        .all()
    )

    role_based_reviewers = db.query(User).filter(User.role.in_(REVIEWER_ROLES)).all()
    role_based_ids = {u.id for u in role_based_reviewers}

    acted_reviewer_ids = {
        row[0]
        for row in db.query(Approval.reviewer_id).filter(Approval.reviewer_id.isnot(None)).distinct().all()
    }
    extra_ids = acted_reviewer_ids - role_based_ids
    extra_reviewers = db.query(User).filter(User.id.in_(extra_ids)).all() if extra_ids else []

    all_reviewers = role_based_reviewers + extra_reviewers

    rows = []
    for reviewer in all_reviewers:
        approved_count = (
            db.query(func.count(Approval.id))
            .filter(Approval.reviewer_id == reviewer.id, Approval.status == "Approved")
            .scalar()
        )
        rejected_count = (
            db.query(func.count(Approval.id))
            .filter(Approval.reviewer_id == reviewer.id, Approval.status == "Rejected")
            .scalar()
        )

        rows.append(
            ApprovalReportRow(
                reviewer_id=reviewer.id,
                reviewer_name=reviewer.full_name,
                role=reviewer.role,
                decisions_approved=approved_count or 0,
                decisions_rejected=rejected_count or 0,
                pending_reviews=_pending_reviews_for_role(reviewer.role, pending_by_level),
            )
        )

    rows.sort(key=lambda r: r.reviewer_name)
    return ApprovalReportResponse(reviewers=rows)


# Team Report (grouped by department)
@router.get("/teams", response_model=TeamReportResponse)
def team_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()
    decisions = db.query(Decision).all()

    department_user_ids: dict[str, list[int]] = {}
    for user in users:
        department = user.department or "Unassigned"
        department_user_ids.setdefault(department, []).append(user.id)

    rows = []
    for department, user_ids in department_user_ids.items():
        user_id_set = set(user_ids)
        team_decisions = [d for d in decisions if d.created_by in user_id_set]
        rows.append(
            TeamReportRow(
                team_name=department,
                total_users=len(user_ids),
                total_decisions=len(team_decisions),
                total_approvals=sum(1 for d in team_decisions if d.status == "Approved"),
            )
        )

    rows.sort(key=lambda r: r.team_name)
    return TeamReportResponse(teams=rows)


# Audit Report
@router.get("/audit", response_model=AuditReportResponse)
def audit_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    counts = dict(
        db.query(AuditLog.action_type, func.count(AuditLog.id)).group_by(AuditLog.action_type).all()
    )

    summary = AuditReportSummary(
        total_logins=counts.get("Login", 0),
        decisions_created=counts.get("Decision Created", 0),
        documents_uploaded=counts.get("Document Uploaded", 0),
        comments_added=counts.get("Comment Added", 0),
        approval_actions=counts.get("Decision Approved", 0) + counts.get("Decision Rejected", 0),
    )

    breakdown = [
        AuditActionBreakdown(action_type=action_type, count=count)
        for action_type, count in sorted(counts.items())
    ]

    return AuditReportResponse(summary=summary, by_action_type=breakdown)
