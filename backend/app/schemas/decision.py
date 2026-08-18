from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class DecisionBase(BaseModel):
    title: str
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "open"

class DecisionCreate(DecisionBase):
    pass

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class DecisionOut(DecisionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
