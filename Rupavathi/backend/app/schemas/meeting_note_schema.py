from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class MeetingNoteCreatorOut(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True


class MeetingNoteCreate(BaseModel):
    decision_id: int
    meeting_summary: str = Field(..., min_length=1)
    conclusion: Optional[str] = None
    next_action: Optional[str] = None

    @field_validator("meeting_summary")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Meeting summary cannot be empty")
        return stripped


class MeetingNoteUpdate(BaseModel):
    meeting_summary: Optional[str] = None
    conclusion: Optional[str] = None
    next_action: Optional[str] = None

    @field_validator("meeting_summary")
    @classmethod
    def not_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Meeting summary cannot be empty")
        return stripped


class MeetingNoteResponse(BaseModel):
    id: int
    decision_id: int
    meeting_summary: str
    conclusion: Optional[str]
    next_action: Optional[str]
    created_by: int
    creator: MeetingNoteCreatorOut
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
