from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SummaryResponse(BaseModel):
    total_decisions: int
    approved_decisions: int
    pending_decisions: int
    rejected_decisions: int
    active_users: int
    total_documents: int


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryCount(BaseModel):
    category: str
    count: int


class MonthlyCount(BaseModel):
    month: str
    label: str
    count: int


class ApprovalStatCount(BaseModel):
    label: str
    count: int


class ChartsResponse(BaseModel):
    decision_status_distribution: List[StatusCount]
    decisions_by_category: List[CategoryCount]
    monthly_decisions: List[MonthlyCount]
    approval_statistics: List[ApprovalStatCount]


class RecentActivityItem(BaseModel):
    id: int
    action_type: str
    description: str
    user_name: str
    created_at: datetime


class EmployeeAnalytics(BaseModel):
    my_decisions: int
    pending_reviews: int


class DecisionStatistics(BaseModel):
    approved: int
    rejected: int
    pending: int


class ManagerAnalytics(BaseModel):
    team_decisions: int
    pending_approvals: int
    decision_statistics: DecisionStatistics


class SystemAnalytics(BaseModel):
    total_decisions: int
    total_users: int
    total_documents: int
    total_categories: int


class UserActivityRow(BaseModel):
    user_name: str
    action_count: int


class OrganizationReports(BaseModel):
    decisions_by_category: List[CategoryCount]
    decisions_by_status: List[StatusCount]


class AdminAnalytics(BaseModel):
    system_analytics: SystemAnalytics
    user_activity: List[UserActivityRow]
    organization_reports: OrganizationReports


class AnalyticsResponse(BaseModel):
    role: str
    recent_activities: List[RecentActivityItem]
    employee: Optional[EmployeeAnalytics] = None
    manager: Optional[ManagerAnalytics] = None
    admin: Optional[AdminAnalytics] = None
