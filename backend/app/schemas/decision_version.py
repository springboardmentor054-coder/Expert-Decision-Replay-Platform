from pydantic import BaseModel, ConfigDict


class DecisionVersionResponse(BaseModel):
    id: int
    version_number: int
    title: str
    problem_statement: str
    decision_taken: str
    reasoning: str
    decision_id: int

    model_config = ConfigDict(
        from_attributes=True
    )