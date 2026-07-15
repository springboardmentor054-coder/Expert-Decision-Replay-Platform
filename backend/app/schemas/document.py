from pydantic import BaseModel
from datetime import datetime


class DocumentCreate(BaseModel):
    decision_id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: int


class DocumentResponse(DocumentCreate):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True