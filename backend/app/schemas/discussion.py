from pydantic import BaseModel, ConfigDict
from typing import Optional


class DiscussionCreate(BaseModel):
    comment: str
    user_id: int
    decision_id: int


class DiscussionUpdate(BaseModel):
    comment: Optional[str] = None


class DiscussionResponse(BaseModel):
    id: int
    comment: str
    user_id: int
    decision_id: int

    model_config = ConfigDict(
        from_attributes=True
    )