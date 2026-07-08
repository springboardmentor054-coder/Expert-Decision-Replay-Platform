from pydantic import BaseModel


class DecisionCreate(BaseModel):
    title: str
    description: str
    category: str
    status: str


class DecisionResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    owner_id: int

    class Config:
        from_attributes = True