from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    session_id: str
    lead_id: UUID | None
    channel: str
    status: str
    conversation_summary: str | None
    structured_state: dict | None
    summary_turn_count: int
    started_at: datetime
    last_activity_at: datetime
    ended_at: datetime | None
    expires_at: datetime
    created_at: datetime
    updated_at: datetime | None


class ConversationMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    speaker: str
    message: str
    turn_number: int
    created_at: datetime


class HumanMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=20000)


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    limit: int
    offset: int
