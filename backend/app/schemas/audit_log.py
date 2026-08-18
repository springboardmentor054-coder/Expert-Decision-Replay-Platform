from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: Optional[int] = None
    decision_id: Optional[int] = None
    action_type: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
