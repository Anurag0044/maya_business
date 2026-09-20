from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FollowupCreate(BaseModel):
    lead_id: UUID
    scheduled_at: datetime
    reason: str | None = None
    followup_type: str = "GENERAL"
    assigned_to: UUID | None = None


class FollowupUpdate(BaseModel):
    scheduled_at: datetime | None = None
    status: str | None = None
    reason: str | None = None
    followup_type: str | None = None
    assigned_to: UUID | None = None


class FollowupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    lead_id: UUID
    type: str
    scheduled_at: datetime
    status: str
    reason: str | None
    assigned_to: UUID | None


class FollowupAttemptCreate(BaseModel):
    attempt_number: int
    channel: str
    status: str
    notes: str | None = None
