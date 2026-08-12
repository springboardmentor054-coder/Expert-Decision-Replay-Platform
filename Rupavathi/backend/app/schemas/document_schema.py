from pydantic import BaseModel
from datetime import datetime


class DocumentDecisionOut(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class DocumentUploaderOut(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: int
    decision_id: int
    decision: DocumentDecisionOut
    file_name: str
    file_type: str
    file_size: int
    uploaded_by: int
    uploader: DocumentUploaderOut
    uploaded_at: datetime

    class Config:
        from_attributes = True
