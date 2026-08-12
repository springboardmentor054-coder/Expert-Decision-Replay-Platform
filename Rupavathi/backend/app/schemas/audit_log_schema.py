from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditUserOut(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class AuditDecisionOut(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    user: AuditUserOut
    decision_id: Optional[int]
    decision: Optional[AuditDecisionOut]
    action_type: str
    description: str
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
