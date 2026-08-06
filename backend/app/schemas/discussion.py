from pydantic import BaseModel
from datetime import datetime


class DiscussionCreate(BaseModel):

    decision_id: int
    user_id: int
    message: str



class DiscussionResponse(BaseModel):

    id: int
    decision_id: int
    user_id: int
    user_name: str
    message: str
    created_at: datetime


    class Config:
        from_attributes = True