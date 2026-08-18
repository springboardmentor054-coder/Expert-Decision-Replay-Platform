from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class VoiceRecordingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    decision_id: Optional[int] = None
    title: str
    file_size: Optional[int] = None
    duration_seconds: Optional[int] = None
    uploaded_by: int
    uploaded_at: datetime
    admin_reply: Optional[str] = None
    admin_replied_at: Optional[datetime] = None
    admin_replied_by: Optional[int] = None

class AdminReplyRequest(BaseModel):
    reply: str
