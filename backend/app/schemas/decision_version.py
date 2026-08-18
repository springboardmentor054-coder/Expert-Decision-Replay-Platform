from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class VersionCreate(BaseModel):
    change_summary: Optional[str] = None

class VersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    decision_id: int
    version_number: int
    title: str
    description: Optional[str] = None
    status: str
    modified_by: int
    modified_at: datetime
    change_summary: Optional[str] = None
