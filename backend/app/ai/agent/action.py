from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class AgentAction(str, Enum):
    ANSWER = "ANSWER"
    ASK_CLARIFICATION = "ASK_CLARIFICATION"
    CHECK_APPOINTMENT_AVAILABILITY = "CHECK_APPOINTMENT_AVAILABILITY"
    BOOK_APPOINTMENT = "BOOK_APPOINTMENT"
    CANCEL_APPOINTMENT = "CANCEL_APPOINTMENT"
    RESCHEDULE_APPOINTMENT = "RESCHEDULE_APPOINTMENT"
    CREATE_LEAD = "CREATE_LEAD"
    UPDATE_LEAD = "UPDATE_LEAD"
    HUMAN_HANDOFF = "HUMAN_HANDOFF"


class ActionPlan(BaseModel):
    action: AgentAction
    arguments: dict[str, Any] = Field(default_factory=dict)
    response: str | None = None
    reason: str | None = None