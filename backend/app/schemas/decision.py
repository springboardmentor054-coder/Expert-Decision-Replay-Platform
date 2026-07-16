from pydantic import BaseModel
from datetime import datetime


class DecisionCreate(BaseModel):
    title: str
    problem_statement: str
    decision_taken: str
    reasoning: str
    created_by: int


class DecisionResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    decision_taken: str
    reasoning: str
    created_at: datetime
    created_by: int

    class Config:
        from_attributes = True