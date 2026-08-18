from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApprovalCreate(BaseModel):
    decision_id: int
    reviewer_id: int
    approval_level: str


class ApprovalUpdate(BaseModel):
    approval_level: Optional[str] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


class ApprovalApprove(BaseModel):
    remarks: Optional[str] = None


class ApprovalReject(BaseModel):
    remarks: str


class ApprovalResponse(BaseModel):
    id: int
    decision_id: int
    reviewer_id: int
    approval_level: str
    status: str
    remarks: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True