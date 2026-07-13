from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class AlternativeCreate(BaseModel):
    decision_id: int
    alternative_name: str
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = Field(default=None, gt=0)
    feasibility: Optional[str] = None
    risk_level: Optional[Literal["Low", "Medium", "High"]] = None


class AlternativeResponse(AlternativeCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True