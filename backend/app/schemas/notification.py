from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class NotificationCreate(BaseModel):
    user_id: int
    decision_id: Optional[int] = None
    title: str
    message: str

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    decision_id: Optional[int] = None
    title: str
    message: str
    status: str
    created_at: datetime
