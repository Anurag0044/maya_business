from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class Intent(str, Enum):
    COURSE_ENQUIRY = "COURSE_ENQUIRY"
    FEE_ENQUIRY = "FEE_ENQUIRY"
    TIMING_ENQUIRY = "TIMING_ENQUIRY"
    LOCATION_ENQUIRY = "LOCATION_ENQUIRY"
    ADMISSION_ENQUIRY = "ADMISSION_ENQUIRY"
    SCHOLARSHIP_ENQUIRY = "SCHOLARSHIP_ENQUIRY"
    GENERAL_FAQ = "GENERAL_FAQ"
    APPOINTMENT_REQUEST = "APPOINTMENT_REQUEST"
    APPOINTMENT_CANCEL = "APPOINTMENT_CANCEL"
    APPOINTMENT_RESCHEDULE = "APPOINTMENT_RESCHEDULE"
    FOLLOWUP_REQUEST = "FOLLOWUP_REQUEST"
    HUMAN_REQUEST = "HUMAN_REQUEST"
    UNKNOWN = "UNKNOWN"


class IntentResult(BaseModel):
    intent: Intent
    confidence: float = Field(ge=0, le=1)
    entities: dict[str, Any] = Field(default_factory=dict)
    reasoning: str | None = None
