from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ApprovalBase(BaseModel):
    decision_id: int
    approver_id: int
    status: Optional[str] = "pending"
    remarks: Optional[str] = None

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None

class ApprovalOut(ApprovalBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
