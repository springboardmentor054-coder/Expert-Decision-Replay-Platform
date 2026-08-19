from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

# ============================================================
# USER SCHEMAS
# ============================================================

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: str
    email: EmailStr


class RoleUpdate(BaseModel):
    role: str


# ============================================================
# DECISION SCHEMAS
# ============================================================

class DecisionCreate(BaseModel):
    user_id: int
    decision_title: str
    decision_description: str


class DecisionUpdate(BaseModel):
    decision_title: str
    decision_description: str


# ============================================================
# ALTERNATIVE SCHEMAS
# ============================================================

class AlternativeCreate(BaseModel):
    decision_id: int
    alternative_name: str
    description: str
    pros: str
    cons: str
    estimated_cost: int
    feasibility: str
    risk_level: str


class AlternativeUpdate(BaseModel):
    alternative_name: str
    description: str
    pros: str
    cons: str
    estimated_cost: int
    feasibility: str
    risk_level: str


# ============================================================
# CRITERIA SCHEMAS
# ============================================================

class CriteriaCreate(BaseModel):
    decision_id: int
    criteria_name: str
    weight: int


class CriteriaUpdate(BaseModel):
    criteria_name: str
    weight: int


# ============================================================
# ALTERNATIVE SCORE SCHEMAS
# ============================================================

class AlternativeScoreCreate(BaseModel):
    alternative_id: int
    criteria_id: int
    score: int


class AlternativeScoreUpdate(BaseModel):
    score: int


# ==========================
# Discussion Schemas
# ==========================

class DiscussionCreate(BaseModel):
    decision_id: int
    user_id: int
    comment: str

class DiscussionUpdate(BaseModel):

    comment: str

    discussion_type: str = "Comment"


class DiscussionResponse(BaseModel):
    discussion_id: int
    decision_id: int
    user_id: int
    comment: str
    discussion_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# DECISION VERSION SCHEMAS
# ============================================================

class DecisionVersionCreate(BaseModel):
    modified_by: int
    status: str = "Draft"
    change_summary: str


class DecisionVersionUpdate(BaseModel):
    decision_title: str
    decision_description: str
    modified_by: int
    status: str = "Draft"
    change_summary: str

 # ==========================
# Approval
# ==========================

class ApprovalCreate(BaseModel):

    decision_id: int

    reviewer_id: int

    approval_level: int = 1


class ApprovalUpdate(BaseModel):

    status: str

    remarks: Optional[str] = None


class ApprovalResponse(BaseModel):

    id: int

    decision_id: int

    reviewer_id: int

    approval_level: int

    status: str

    remarks: Optional[str]

    approved_at: Optional[datetime]

    created_at: datetime

    class Config:

        from_attributes = True   

# ============================================================
# AUDIT LOG SCHEMAS
# ============================================================

class AuditLogBase(BaseModel):

    user_id: int

    decision_id: Optional[int] = None

    action_type: str

    description: str

    ip_address: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):

    id: int

    created_at: datetime

    class Config:

        from_attributes = True

