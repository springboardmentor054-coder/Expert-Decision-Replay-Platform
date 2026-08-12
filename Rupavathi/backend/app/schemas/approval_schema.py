from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserSummaryOut(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class DecisionSummaryOut(BaseModel):
    id: int
    title: str
    status: str
    created_by: int
    creator: UserSummaryOut

    class Config:
        from_attributes = True


class ApprovalCreate(BaseModel):
    decision_id: int
    approval_level: int = Field(..., ge=1, le=2)


class ApprovalUpdate(BaseModel):
    approval_level: Optional[int] = Field(None, ge=1, le=2)
    status: Optional[str] = None
    remarks: Optional[str] = None


class ApprovalAction(BaseModel):
    remarks: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: int
    decision_id: int
    decision: DecisionSummaryOut
    reviewer_id: Optional[int]
    reviewer: Optional[UserSummaryOut]
    approval_level: int
    status: str
    remarks: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
