from pydantic import BaseModel
from datetime import datetime


class DecisionVersionCreate(BaseModel):
    change_summary: str


class DecisionVersionResponse(BaseModel):
    id: int
    decision_id: int
    version_number: int
    title: str
    description: str | None = None
    status: str | None = None
    modified_by: int
    modified_at: datetime
    change_summary: str | None = None

    class Config:
        from_attributes = True