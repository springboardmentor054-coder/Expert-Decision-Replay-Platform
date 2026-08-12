from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class AuthorOut(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True


class CommentDecisionOut(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    decision_id: int
    comment: str = Field(..., min_length=1)

    @field_validator("comment")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Comment cannot be empty")
        return stripped


class CommentUpdate(BaseModel):
    comment: str = Field(..., min_length=1)

    @field_validator("comment")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Comment cannot be empty")
        return stripped


class CommentResponse(BaseModel):
    id: int
    decision_id: int
    decision: CommentDecisionOut
    user_id: int
    author: AuthorOut
    comment: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
