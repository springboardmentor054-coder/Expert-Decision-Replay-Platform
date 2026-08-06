from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class AlternativeCreate(BaseModel):
    decision_id: int
    alternative_name: str = Field(..., min_length=1)
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: float = Field(..., gt=0)
    feasibility: str
    risk_level: str

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, value):
        allowed = ["Low", "Medium", "High"]

        if value not in allowed:
            raise ValueError(
                "Risk Level must be Low, Medium, or High"
            )

        return value


class AlternativeUpdate(BaseModel):
    alternative_name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, gt=0)
    feasibility: Optional[str] = None
    risk_level: Optional[str] = None

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, value):
        if value is None:
            return value

        allowed = ["Low", "Medium", "High"]

        if value not in allowed:
            raise ValueError(
                "Risk Level must be Low, Medium, or High"
            )

        return value


class AlternativeResponse(BaseModel):
    id: int
    decision_id: int
    alternative_name: str
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: float
    feasibility: str
    risk_level: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True