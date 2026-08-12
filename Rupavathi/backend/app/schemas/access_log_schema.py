from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AccessLogResponse(BaseModel):
    id: int
    action: str
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
