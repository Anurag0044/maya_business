from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CallCreate(BaseModel):
    session_id: str = Field(min_length=1, max_length=255)
    caller_number: str = Field(min_length=3, max_length=50)
    caller_name: str | None = None


class CallEventCreate(BaseModel):
    event_type: str = Field(min_length=1, max_length=50)
    event_data: dict | None = None


class CallTranscriptCreate(BaseModel):
    speaker: str = Field(min_length=1, max_length=20)
    message: str = Field(min_length=1)
    sequence_number: int = Field(ge=0)
    confidence: float | None = Field(default=None, ge=0, le=1)


class CallEndRequest(BaseModel):
    status: str = "COMPLETED"
    outcome: str | None = None
    transferred: bool | None = None
    transfer_reason: str | None = None


class CallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    session_id: str
    caller_number: str
    caller_name: str | None
    started_at: datetime | None
    ended_at: datetime | None
    duration_seconds: int | None
    status: str
    lead_id: UUID | None
    appointment_id: UUID | None
    primary_intent: str | None
    outcome: str | None
    transferred: bool
    transfer_reason: str | None
