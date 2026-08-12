from calendar import month_abbr
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.approval import Approval
from app.models.audit_log import AuditLog
from app.models.category import Category
from app.models.decision import Decision
from app.models.document import Document
from app.models.user import User
from app.schemas.dashboard_schema import (
    AdminAnalytics,
    AnalyticsResponse,
    ApprovalStatCount,
    CategoryCount,
    ChartsResponse,
    DecisionStatistics,
    EmployeeAnalytics,
    ManagerAnalytics,
    MonthlyCount,
    OrganizationReports,
    RecentActivityItem,
    StatusCount,
    SummaryResponse,
    SystemAnalytics,
    UserActivityRow,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

PENDING_STATUSES = ("Draft", "Under Review")
DECISION_STATUSES = ("Draft", "Under Review", "Approved", "Rejected")
RECENT_ACTIVITY_TYPES = ("Decision Created", "Decision Approved", "Document Uploaded", "Comment Added")
REVIEWER_LEVEL_BY_ROLE = {"Approver": 2}


# Summary Cards
@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status_counts = dict(
        db.query(Decision.status, func.count(Decision.id)).group_by(Decision.status).all()
    )
    total_decisions = sum(status_counts.values())
    pending = sum(status_counts.get(s, 0) for s in PENDING_STATUSES)

    return SummaryResponse(
        total_decisions=total_decisions,
        approved_decisions=status_counts.get("Approved", 0),
        pending_decisions=pending,
        rejected_decisions=status_counts.get("Rejected", 0),
        active_users=db.query(func.count(User.id)).scalar() or 0,
        total_documents=db.query(func.count(Document.id)).scalar() or 0,
    )


# Chart Datasets
@router.get("/charts", response_model=ChartsResponse)
def get_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status_counts = dict(
        db.query(Decision.status, func.count(Decision.id)).group_by(Decision.status).all()
    )
    decision_status_distribution = [
        StatusCount(status=s, count=status_counts.get(s, 0)) for s in DECISION_STATUSES
    ]

    category_counts = (
        db.query(Category.name, func.count(Decision.id))
        .outerjoin(Decision, Decision.category_id == Category.id)
        .group_by(Category.name)
        .order_by(Category.name)
        .all()
    )
    decisions_by_category = [CategoryCount(category=name, count=count) for name, count in category_counts]

    now = datetime.now(timezone.utc)
    month_keys = []
    cursor = now.replace(day=1)
    for _ in range(6):
        month_keys.append((cursor.year, cursor.month))
        cursor = (cursor - timedelta(days=1)).replace(day=1)
    month_keys.reverse()

    decisions_created_at = db.query(Decision.created_at).all()
    monthly_totals = {key: 0 for key in month_keys}
    for (created_at,) in decisions_created_at:
        key = (created_at.year, created_at.month)
        if key in monthly_totals:
            monthly_totals[key] += 1

    monthly_decisions = [
        MonthlyCount(
            month=f"{year:04d}-{month:02d}",
            label=f"{month_abbr[month]} {year}",
            count=monthly_totals[(year, month)],
        )
        for year, month in month_keys
    ]

    approval_counts = dict(
        db.query(Approval.status, func.count(Approval.id)).group_by(Approval.status).all()
    )
    approval_statistics = [
        ApprovalStatCount(label=label, count=approval_counts.get(label, 0))
        for label in ("Approved", "Rejected", "Pending")
    ]

    return ChartsResponse(
        decision_status_distribution=decision_status_distribution,
        decisions_by_category=decisions_by_category,
        monthly_decisions=monthly_decisions,
        approval_statistics=approval_statistics,
    )


def _recent_activities(db: Session, limit: int = 10) -> list[RecentActivityItem]:
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.action_type.in_(RECENT_ACTIVITY_TYPES))
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        RecentActivityItem(
            id=log.id,
            action_type=log.action_type,
            description=log.description,
            user_name=log.user.full_name if log.user else "Unknown",
            created_at=log.created_at,
        )
        for log in logs
    ]


def _employee_analytics(db: Session, current_user: User) -> EmployeeAnalytics:
    my_decisions = db.query(func.count(Decision.id)).filter(Decision.created_by == current_user.id).scalar() or 0
    pending_reviews = (
        db.query(func.count(Decision.id))
        .filter(Decision.created_by == current_user.id, Decision.status == "Under Review")
        .scalar()
        or 0
    )
    return EmployeeAnalytics(my_decisions=my_decisions, pending_reviews=pending_reviews)


def _manager_analytics(db: Session, current_user: User) -> ManagerAnalytics:
    department = current_user.department
    if department:
        team_user_ids = [
            row[0] for row in db.query(User.id).filter(User.department == department).all()
        ]
    else:
        team_user_ids = [current_user.id]

    team_decisions = (
        db.query(func.count(Decision.id)).filter(Decision.created_by.in_(team_user_ids)).scalar() or 0
    )

    level = REVIEWER_LEVEL_BY_ROLE.get(current_user.role)
    pending_approvals = 0
    if level:
        pending_approvals = (
            db.query(func.count(Approval.id))
            .filter(Approval.status == "Pending", Approval.approval_level == level)
            .scalar()
            or 0
        )

    status_counts = dict(
        db.query(Decision.status, func.count(Decision.id)).group_by(Decision.status).all()
    )
    decision_statistics = DecisionStatistics(
        approved=status_counts.get("Approved", 0),
        rejected=status_counts.get("Rejected", 0),
        pending=sum(status_counts.get(s, 0) for s in PENDING_STATUSES),
    )

    return ManagerAnalytics(
        team_decisions=team_decisions,
        pending_approvals=pending_approvals,
        decision_statistics=decision_statistics,
    )


def _admin_analytics(db: Session) -> AdminAnalytics:
    system_analytics = SystemAnalytics(
        total_decisions=db.query(func.count(Decision.id)).scalar() or 0,
        total_users=db.query(func.count(User.id)).scalar() or 0,
        total_documents=db.query(func.count(Document.id)).scalar() or 0,
        total_categories=db.query(func.count(Category.id)).scalar() or 0,
    )

    activity_counts = (
        db.query(User.full_name, func.count(AuditLog.id))
        .join(AuditLog, AuditLog.user_id == User.id)
        .group_by(User.full_name)
        .order_by(func.count(AuditLog.id).desc())
        .limit(5)
        .all()
    )
    user_activity = [UserActivityRow(user_name=name, action_count=count) for name, count in activity_counts]

    category_counts = (
        db.query(Category.name, func.count(Decision.id))
        .outerjoin(Decision, Decision.category_id == Category.id)
        .group_by(Category.name)
        .order_by(Category.name)
        .all()
    )
    status_counts_raw = dict(
        db.query(Decision.status, func.count(Decision.id)).group_by(Decision.status).all()
    )

    organization_reports = OrganizationReports(
        decisions_by_category=[CategoryCount(category=name, count=count) for name, count in category_counts],
        decisions_by_status=[
            StatusCount(status=s, count=status_counts_raw.get(s, 0)) for s in DECISION_STATUSES
        ],
    )

    return AdminAnalytics(
        system_analytics=system_analytics,
        user_activity=user_activity,
        organization_reports=organization_reports,
    )


# Role-Based Analytics + Recent Activities
@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recent_activities = _recent_activities(db)

    employee = manager = admin = None

    if current_user.role == "Admin":
        admin = _admin_analytics(db)
    elif current_user.role in REVIEWER_LEVEL_BY_ROLE:
        manager = _manager_analytics(db, current_user)
    else:
        employee = _employee_analytics(db, current_user)

    return AnalyticsResponse(
        role=current_user.role,
        recent_activities=recent_activities,
        employee=employee,
        manager=manager,
        admin=admin,
    )
