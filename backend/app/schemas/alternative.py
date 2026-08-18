from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlternativeBase(BaseModel):
    decision_id: int
    title: str
    description: Optional[str] = None
    cost: Optional[float] = None
    risk_level: Optional[str] = None
    feasibility: Optional[str] = None
    is_selected: Optional[bool] = False

class AlternativeCreate(AlternativeBase):
    pass

class AlternativeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    risk_level: Optional[str] = None
    feasibility: Optional[str] = None
    is_selected: Optional[bool] = None

class AlternativeOut(AlternativeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
