from pydantic import BaseModel
from datetime import datetime


class MeetingNoteCreate(BaseModel):
    decision_id: int
    meeting_summary: str
    conclusion: str
    next_action: str



class MeetingNoteResponse(BaseModel):
    id: int
    decision_id: int
    meeting_summary: str
    conclusion: str
    next_action: str
    created_at: datetime

    class Config:
        from_attributes = True