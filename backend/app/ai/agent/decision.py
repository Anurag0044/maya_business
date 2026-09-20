from enum import Enum

from pydantic import BaseModel, Field


class DecisionType(str, Enum):
    ANSWER = "ANSWER"
    TOOL_CALL = "TOOL_CALL"
    CLARIFY = "CLARIFY"
    HUMAN_HANDOFF = "HUMAN_HANDOFF"


class AgentDecision(BaseModel):
    decision: DecisionType
    response: str | None = None
    tool_name: str | None = None
    tool_arguments: dict = Field(default_factory=dict)
    confidence: float = Field(default=0.0, ge=0, le=1)
    reason: str | None = None
