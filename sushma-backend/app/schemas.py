"""
Pydantic schemas — request/response contracts for the API.
"""
from datetime import datetime
from typing import Optional, List, Any

from pydantic import BaseModel, EmailStr, Field

from app.models import UserRole, DecisionStatus, RiskLevel, StakeholderRole


# ---------------------------------------------------------------------------
# Auth / User
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    job_title: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    job_title: Optional[str] = None
    bio: Optional[str] = None
    team_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserTeamAssign(BaseModel):
    team_id: Optional[int] = None


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TeamOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Decision
# ---------------------------------------------------------------------------

class DecisionCreate(BaseModel):
    title: str
    problem_statement: str
    category: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    tags: Optional[str] = None


class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    category: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    tags: Optional[str] = None
    change_summary: Optional[str] = Field(default=None, description="Short note describing what changed")


class DecisionStatusUpdate(BaseModel):
    status: DecisionStatus
    change_summary: Optional[str] = None


class DecisionOut(BaseModel):
    id: int
    title: str
    problem_statement: str
    category: Optional[str] = None
    evaluation_criteria: Optional[str] = None
    status: DecisionStatus
    tags: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: datetime
    current_version: int

    class Config:
        from_attributes = True


class DecisionVersionOut(BaseModel):
    id: int
    decision_id: int
    version_number: int
    snapshot: Any
    change_summary: Optional[str] = None
    edited_by: int
    edited_at: datetime

    class Config:
        from_attributes = True


class StakeholderAdd(BaseModel):
    user_id: int
    role: StakeholderRole = StakeholderRole.STAKEHOLDER


class StakeholderOut(BaseModel):
    id: int
    decision_id: int
    user_id: int
    role: StakeholderRole

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Alternative
# ---------------------------------------------------------------------------

class AlternativeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = None
    feasibility_score: Optional[int] = Field(default=None, ge=1, le=5)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    risk_notes: Optional[str] = None


class AlternativeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = None
    feasibility_score: Optional[int] = Field(default=None, ge=1, le=5)
    risk_level: Optional[RiskLevel] = None
    risk_notes: Optional[str] = None
    is_selected: Optional[bool] = None


class AlternativeOut(BaseModel):
    id: int
    decision_id: int
    title: str
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = None
    feasibility_score: Optional[int] = None
    risk_level: RiskLevel
    risk_notes: Optional[str] = None
    is_selected: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Comment / Discussion
# ---------------------------------------------------------------------------

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None
    is_meeting_note: bool = False


class CommentUpdate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: int
    decision_id: int
    author_id: int
    parent_id: Optional[int] = None
    content: str
    is_meeting_note: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentThreadOut(CommentOut):
    replies: List["CommentThreadOut"] = []


CommentThreadOut.model_rebuild()


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

class DocumentOut(BaseModel):
    id: int
    decision_id: int
    filename: str
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
