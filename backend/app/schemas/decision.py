from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DecisionCreate(BaseModel):
    title: str
    problem_statement: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = "Draft"


class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None


class DecisionResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    description: Optional[str]
    category_id: Optional[int]
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True