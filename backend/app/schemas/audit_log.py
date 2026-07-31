from datetime import datetime

from pydantic import BaseModel


# ==========================================
# Audit Log Response
# ==========================================

class AuditLogResponse(BaseModel):

    id: int

    user_id: int

    # Login audit logs do not belong
    # to any particular decision
    decision_id: int | None = None

    action_type: str

    description: str

    ip_address: str | None = None

    created_at: datetime | None = None


    class Config:

        from_attributes = True