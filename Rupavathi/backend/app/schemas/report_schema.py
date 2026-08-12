from pydantic import BaseModel
from typing import List
from datetime import datetime


class DecisionReportRow(BaseModel):
    id: int
    title: str
    category: str
    status: str
    created_by: str
    created_at: datetime


class DecisionReportSummary(BaseModel):
    total_decisions: int
    approved: int
    rejected: int
    pending: int


class DecisionReportResponse(BaseModel):
    summary: DecisionReportSummary
    decisions: List[DecisionReportRow]


class ApprovalReportRow(BaseModel):
    reviewer_id: int
    reviewer_name: str
    role: str
    decisions_approved: int
    decisions_rejected: int
    pending_reviews: int


class ApprovalReportResponse(BaseModel):
    reviewers: List[ApprovalReportRow]


class TeamReportRow(BaseModel):
    team_name: str
    total_users: int
    total_decisions: int
    total_approvals: int


class TeamReportResponse(BaseModel):
    teams: List[TeamReportRow]


class AuditReportSummary(BaseModel):
    total_logins: int
    decisions_created: int
    documents_uploaded: int
    comments_added: int
    approval_actions: int


class AuditActionBreakdown(BaseModel):
    action_type: str
    count: int


class AuditReportResponse(BaseModel):
    summary: AuditReportSummary
    by_action_type: List[AuditActionBreakdown]
