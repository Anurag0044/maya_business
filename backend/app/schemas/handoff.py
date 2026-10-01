from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class HandoffCreate(BaseModel):
    conversation_id: UUID | None = None
    lead_id: UUID | None = None
    call_id: UUID | None = None
    assigned_to: UUID | None = None
    priority: str = Field(default="NORMAL", min_length=1, max_length=20)
    reason: str = Field(min_length=1)
    channel: str = Field(default="CHAT", min_length=1, max_length=30)
    customer_name: str | None = Field(default=None, max_length=255)
    customer_phone: str | None = Field(default=None, max_length=50)
    customer_email: str | None = Field(default=None, max_length=255)
    metadata: dict | None = None


class HandoffAssignRequest(BaseModel):
    assigned_to: UUID | None = None


class HandoffResolutionRequest(BaseModel):
    resolution_notes: str | None = None


class HandoffResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    conversation_id: UUID | None
    lead_id: UUID | None
    call_id: UUID | None
    assigned_to: UUID | None
    status: str
    priority: str
    reason: str
    channel: str
    customer_name: str | None
    customer_phone: str | None
    customer_email: str | None
    requested_at: datetime
    assigned_at: datetime | None
    started_at: datetime | None
    resolved_at: datetime | None
    resolution_notes: str | None
    metadata_json: dict | None
    created_at: datetime
    updated_at: datetime | None
