from pydantic import BaseModel
from datetime import datetime


class DocumentCreate(BaseModel):
    decision_id: int
    uploaded_by: int | None = None


class DocumentResponse(BaseModel):
    id: int
    decision_id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: int | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True