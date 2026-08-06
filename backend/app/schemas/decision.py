from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class DecisionCreate(BaseModel):
    title: str
    problem_statement: str
    description: Optional[str] = None
    category_id: Optional[int] = None

    @field_validator("title")
    def validate_title(cls, value):
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value

    @field_validator("problem_statement")
    def validate_problem_statement(cls, value):
        if not value.strip():
            raise ValueError("Problem statement is mandatory")
        return value


class DecisionUpdate(BaseModel):
    title: str
    problem_statement: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: str

    @field_validator("title")
    def validate_title(cls, value):
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value

    @field_validator("problem_statement")
    def validate_problem_statement(cls, value):
        if not value.strip():
            raise ValueError("Problem statement is mandatory")
        return value


class DecisionResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    description: Optional[str]
    category_id: Optional[int]
    status: str
    created_by: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True