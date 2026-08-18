from datetime import datetime
from pydantic import BaseModel, ConfigDict

class CommentBase(BaseModel):
    decision_id: int
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: str

class CommentOut(CommentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    created_at: datetime
