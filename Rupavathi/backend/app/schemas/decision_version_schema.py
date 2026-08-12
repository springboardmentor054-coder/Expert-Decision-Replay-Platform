from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ModifierOut(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True


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
    modifier: ModifierOut
    modified_at: datetime
    change_summary: Optional[str]

    class Config:
        from_attributes = True
