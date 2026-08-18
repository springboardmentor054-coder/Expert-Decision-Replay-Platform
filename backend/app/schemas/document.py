from datetime import datetime
from pydantic import BaseModel, ConfigDict

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    decision_id: int
    file_name: str
    file_type: str
    file_size: int
    uploaded_by: int
    uploaded_at: datetime
