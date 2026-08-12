from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

RiskLevel = Literal["Low", "Medium", "High"]


class AlternativeDecisionOut(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class AlternativeCreate(BaseModel):
    decision_id: int
    alternative_name: str = Field(..., min_length=1)
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = None
    feasibility: Optional[str] = None
    risk_level: RiskLevel

    @field_validator("alternative_name")
    @classmethod
    def not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Alternative name cannot be empty")
        return stripped

    @field_validator("estimated_cost")
    @classmethod
    def positive_cost(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value <= 0:
            raise ValueError("Estimated cost must be a positive number")
        return value


class AlternativeUpdate(BaseModel):
    alternative_name: Optional[str] = None
    description: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    estimated_cost: Optional[float] = None
    feasibility: Optional[str] = None
    risk_level: Optional[RiskLevel] = None

    @field_validator("alternative_name")
    @classmethod
    def not_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Alternative name cannot be empty")
        return stripped

    @field_validator("estimated_cost")
    @classmethod
    def positive_cost(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and value <= 0:
            raise ValueError("Estimated cost must be a positive number")
        return value


class AlternativeResponse(BaseModel):
    id: int
    decision_id: int
    decision: AlternativeDecisionOut
    alternative_name: str
    description: Optional[str]
    pros: Optional[str]
    cons: Optional[str]
    estimated_cost: Optional[float]
    feasibility: Optional[str]
    risk_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
