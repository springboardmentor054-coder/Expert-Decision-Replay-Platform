from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database.connection import SessionLocal

from app.models.decision import Decision
from app.models.approval import Approval
from app.models.user import User
from app.models.team import Team
from app.models.document import Document
from app.models.audit_log import AuditLog

from app.core.security import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# ROLE HELPER
# ==========================================

def get_user_role(user):

    role = (user.role or "").strip().lower()

    if role == "administrator":
        return "Administrator"

    if role == "manager":
        return "Manager"

    if role == "employee":
        return "Employee"

    return "Employee"


# ==========================================
# ROLE-BASED DASHBOARD
# ==========================================

@router.get("/role-dashboard")
def get_role_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    role = get_user_role(current_user)

    # ==========================================
    # EMPLOYEE DASHBOARD
    # ==========================================

    if role == "Employee":

        my_decisions = (
            db.query(Decision)
            .filter(
                Decision.created_by == current_user.id
            )
            .order_by(
                Decision.created_at.desc()
            )
            .limit(10)
            .all()
        )

        pending_reviews = (
            db.query(Approval)
            .filter(
                Approval.reviewer_id == current_user.id,
                Approval.status == "Pending"
            )
            .count()
        )

        recent_activities = (
            db.query(AuditLog)
            .filter(
                AuditLog.user_id == current_user.id
            )
            .order_by(
                AuditLog.created_at.desc()
            )
            .limit(10)
            .all()
        )

        return {

            "role": "Employee",

            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email
            },

            "my_decisions": [
                {
                    "id": decision.id,
                    "title": decision.title,
                    "status": decision.status,
                    "category_id": decision.category_id,
                    "created_at": decision.created_at
                }
                for decision in my_decisions
            ],

            "pending_reviews": pending_reviews,

            "recent_activities": [
                {
                    "id": activity.id,
                    "action_type": activity.action_type,
                    "description": activity.description,
                    "decision_id": activity.decision_id,
                    "created_at": activity.created_at
                }
                for activity in recent_activities
            ]
        }

    # ==========================================
    # MANAGER DASHBOARD
    # ==========================================

    if role == "Manager":

        team_decisions = (
            db.query(Decision)
            .join(
                User,
                Decision.created_by == User.id
            )
            .filter(
                User.team_id == current_user.team_id
            )
            .order_by(
                Decision.created_at.desc()
            )
            .limit(10)
            .all()
        )

        pending_approvals = (
            db.query(Approval)
            .filter(
                Approval.status == "Pending"
            )
            .count()
        )

        total_team_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .join(
                User,
                Decision.created_by == User.id
            )
            .filter(
                User.team_id == current_user.team_id
            )
            .scalar()
        )

        approved_team_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .join(
                User,
                Decision.created_by == User.id
            )
            .filter(
                User.team_id == current_user.team_id,
                Decision.status == "Approved"
            )
            .scalar()
        )

        rejected_team_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .join(
                User,
                Decision.created_by == User.id
            )
            .filter(
                User.team_id == current_user.team_id,
                Decision.status == "Rejected"
            )
            .scalar()
        )

        pending_team_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .join(
                User,
                Decision.created_by == User.id
            )
            .filter(
                User.team_id == current_user.team_id,
                Decision.status.in_([
                    "Pending",
                    "Under Review",
                    "In Review",
                    "Review"
                ])
            )
            .scalar()
        )

        return {

            "role": "Manager",

            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "team_id": current_user.team_id
            },

            "team_decisions": [
                {
                    "id": decision.id,
                    "title": decision.title,
                    "status": decision.status,
                    "category_id": decision.category_id,
                    "created_by": decision.created_by,
                    "created_at": decision.created_at
                }
                for decision in team_decisions
            ],

            "pending_approvals": pending_approvals,

            "decision_statistics": {
                "total": total_team_decisions,
                "approved": approved_team_decisions,
                "rejected": rejected_team_decisions,
                "pending": pending_team_decisions
            }
        }

    # ==========================================
    # ADMINISTRATOR DASHBOARD
    # ==========================================

    if role == "Administrator":

        total_users = (
            db.query(
                func.count(User.id)
            )
            .scalar()
        )

        total_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .scalar()
        )

        total_documents = (
            db.query(
                func.count(Document.id)
            )
            .scalar()
        )

        total_approvals = (
            db.query(
                func.count(Approval.id)
            )
            .scalar()
        )

        total_teams = (
            db.query(
                func.count(Team.id)
            )
            .scalar()
        )

        total_audit_logs = (
            db.query(
                func.count(AuditLog.id)
            )
            .scalar()
        )

        recent_user_activity = (
            db.query(AuditLog)
            .order_by(
                AuditLog.created_at.desc()
            )
            .limit(10)
            .all()
        )

        approved_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .filter(
                Decision.status == "Approved"
            )
            .scalar()
        )

        rejected_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .filter(
                Decision.status == "Rejected"
            )
            .scalar()
        )

        pending_decisions = (
            db.query(
                func.count(Decision.id)
            )
            .filter(
                Decision.status.in_([
                    "Pending",
                    "Under Review",
                    "In Review",
                    "Review"
                ])
            )
            .scalar()
        )

        return {

            "role": "Administrator",

            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email
            },

            "system_analytics": {
                "users": total_users,
                "decisions": total_decisions,
                "documents": total_documents,
                "approvals": total_approvals,
                "teams": total_teams,
                "audit_logs": total_audit_logs
            },

            "user_activity": [
                {
                    "id": activity.id,
                    "user_id": activity.user_id,
                    "action_type": activity.action_type,
                    "description": activity.description,
                    "decision_id": activity.decision_id,
                    "created_at": activity.created_at
                }
                for activity in recent_user_activity
            ],

            "organization_reports": {
                "total_decisions": total_decisions,
                "approved": approved_decisions,
                "rejected": rejected_decisions,
                "pending": pending_decisions,
                "total_users": total_users,
                "total_documents": total_documents,
                "total_approvals": total_approvals,
                "total_teams": total_teams
            }
        }

    return {
        "role": role,
        "message": "Dashboard available."
    }


# ==========================================
# DASHBOARD CHARTS
# ==========================================

@router.get("/charts")
def get_dashboard_charts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    role = get_user_role(current_user)

    # ==========================================
    # DECISION STATUS DISTRIBUTION
    # ==========================================

    decision_status_rows = (
        db.query(
            Decision.status,
            func.count(Decision.id)
        )
        .group_by(
            Decision.status
        )
        .all()
    )

    decision_status = [
        {
            "status": status or "Unknown",
            "count": count
        }
        for status, count in decision_status_rows
    ]


    # ==========================================
    # DECISIONS BY CATEGORY
    # ==========================================

    category_rows = (
        db.query(
            Decision.category_id,
            func.count(Decision.id)
        )
        .group_by(
            Decision.category_id
        )
        .all()
    )

    decisions_by_category = [
        {
            "category": (
                f"Category {category_id}"
                if category_id is not None
                else "Uncategorized"
            ),
            "count": count
        }
        for category_id, count in category_rows
    ]


    # ==========================================
    # MONTHLY DECISIONS
    # ==========================================

    monthly_rows = (
        db.query(
            extract(
                "year",
                Decision.created_at
            ).label("year"),

            extract(
                "month",
                Decision.created_at
            ).label("month"),

            func.count(
                Decision.id
            ).label("count")
        )
        .group_by(
            extract(
                "year",
                Decision.created_at
            ),

            extract(
                "month",
                Decision.created_at
            )
        )
        .order_by(
            extract(
                "year",
                Decision.created_at
            ),

            extract(
                "month",
                Decision.created_at
            )
        )
        .all()
    )

    month_names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    monthly_decisions = []

    for year, month, count in monthly_rows:

        month_number = int(month)

        monthly_decisions.append({
            "month": f"{month_names[month_number - 1]} {int(year)}",
            "count": count
        })


    # ==========================================
    # APPROVAL STATISTICS
    # ==========================================

    approval_rows = (
        db.query(
            Approval.status,
            func.count(Approval.id)
        )
        .group_by(
            Approval.status
        )
        .all()
    )

    approval_status = [
        {
            "status": status or "Unknown",
            "count": count
        }
        for status, count in approval_rows
    ]


    # ==========================================
    # RECENT ACTIVITIES
    # ==========================================

    recent_activities = (
        db.query(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
        .limit(10)
        .all()
    )

    activity_data = [
        {
            "id": activity.id,
            "user_id": activity.user_id,
            "action_type": activity.action_type,
            "description": activity.description,
            "decision_id": activity.decision_id,
            "created_at": activity.created_at
        }
        for activity in recent_activities
    ]


    # ==========================================
    # RESPONSE
    # ==========================================

    return {

        "role": role,

        "decision_status": decision_status,

        "decisions_by_category":
            decisions_by_category,

        "monthly_decisions":
            monthly_decisions,

        "approval_status":
            approval_status,

        "team_decisions": [],

        "audit_actions":
            activity_data
    }