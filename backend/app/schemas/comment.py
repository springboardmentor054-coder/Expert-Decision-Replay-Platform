from pydantic import BaseModel, ConfigDict
from datetime import datetime


class CommentCreate(BaseModel):
    decision_id: int
    content: str


class CommentUpdate(BaseModel):
    content: str



class CommentResponse(BaseModel):
    id: int
    decision_id: int
    user_id: int
    comment: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )