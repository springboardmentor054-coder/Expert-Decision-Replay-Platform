from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AlternativeCreate(BaseModel):
    alternative_name: str
    description: str
    cost: float = Field(..., gt=0)
    risk_level: str
    decision_id: int

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, value):
        allowed = ["Low", "Medium", "High"]

        if value not in allowed:
            raise ValueError(
                "Risk level must be Low, Medium, or High"
            )

        return value


class AlternativeUpdate(BaseModel):
    alternative_name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = Field(None, gt=0)
    risk_level: Optional[str] = None
    decision_id: Optional[int] = None

    @field_validator("risk_level")
    @classmethod
    def validate_risk_level(cls, value):

        if value is None:
            return value

        allowed = ["Low", "Medium", "High"]

        if value not in allowed:
            raise ValueError(
                "Risk level must be Low, Medium, or High"
            )

        return value


class AlternativeResponse(BaseModel):
    id: int
    alternative_name: str
    description: str
    cost: float
    risk_level: str
    decision_id: int

    model_config = ConfigDict(
        from_attributes=True
    )