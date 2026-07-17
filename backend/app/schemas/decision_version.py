from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DecisionVersionCreate(BaseModel):
    change_summary: Optional[str] = None


class DecisionVersionResponse(BaseModel):
    id: int
    decision_id: int
    version_number: int
    title: str
    description: Optional[str]
    status: str
    modified_by: int
    modified_at: datetime
    change_summary: Optional[str]

    class Config:
        from_attributes = True