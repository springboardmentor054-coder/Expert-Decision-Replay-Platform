from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class CategoryOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CreatorOut(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class DecisionCreate(BaseModel):
    title: str = Field(..., min_length=1)
    problem_statement: str = Field(..., min_length=1)
    description: Optional[str] = None
    category_id: int

    @field_validator("title", "problem_statement")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be empty")
        return stripped


class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    change_summary: Optional[str] = None

    @field_validator("title", "problem_statement")
    @classmethod
    def not_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("This field cannot be empty")
        return stripped


class DecisionResponse(BaseModel):
    id: int
    title: str
    problem_statement: str
    description: Optional[str]
    category_id: int
    category: CategoryOut
    status: str
    created_by: int
    creator: CreatorOut
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
