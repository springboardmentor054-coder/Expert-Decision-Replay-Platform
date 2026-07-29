from datetime import datetime
from pydantic import BaseModel


# ==========================================
# Notification Response
# ==========================================

class NotificationResponse(BaseModel):

    id: int
    user_id: int
    decision_id: int
    title: str
    message: str
    status: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True