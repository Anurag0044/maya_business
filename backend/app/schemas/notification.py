from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    notification_type: str = Field(min_length=1, max_length=50)
    user_id: UUID | None = None
    channel: str = "IN_APP"
    priority: str = "NORMAL"
    scheduled_at: datetime | None = None
    related_entity_type: str | None = None
    related_entity_id: UUID | None = None
    metadata: dict | None = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    user_id: UUID | None
    type: str
    title: str
    message: str
    channel: str
    status: str
    delivery_status: str
    priority: str
    scheduled_at: datetime | None
    sent_at: datetime | None
    delivered_at: datetime | None
    failed_at: datetime | None
    failure_reason: str | None
    attempt_count: int
    provider_message_id: str | None
    metadata_json: dict | None
    related_entity_type: str | None
    related_entity_id: UUID | None
    created_at: datetime
    updated_at: datetime | None
    read_at: datetime | None


class NotificationAttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    notification_id: UUID
    business_id: UUID
    attempt_number: int
    channel: str
    status: str
    provider_message_id: str | None
    error: str | None
    attempted_at: datetime


class NotificationCountResponse(BaseModel):
    unread_count: int
