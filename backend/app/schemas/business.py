from datetime import time
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BusinessUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    business_type: str | None = Field(default=None, max_length=100)
    description: str | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    website: str | None = Field(default=None, max_length=500)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    country: str | None = Field(default=None, max_length=100)
    timezone: str | None = Field(default=None, max_length=100)


class BusinessResponse(BusinessUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    business_type: str
    timezone: str
    is_active: bool


class SettingsUpdate(BaseModel):
    ai_enabled: bool | None = None
    voice_enabled: bool | None = None
    auto_lead_creation: bool | None = None
    auto_followups: bool | None = None
    human_handoff: bool | None = None
    welcome_message: str | None = None
    fallback_message: str | None = None
    handoff_message: str | None = None
    default_language: str | None = Field(default=None, max_length=20)
    timezone: str | None = Field(default=None, max_length=100)
    conversation_retention_days: int | None = Field(default=None, ge=1, le=3650)


class SettingsResponse(SettingsUpdate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID


class BusinessHourItem(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    is_open: bool = True
    open_time: time | None = None
    close_time: time | None = None


class BusinessHoursResponse(BusinessHourItem):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID


class BusinessHoursUpdate(BaseModel):
    hours: list[BusinessHourItem]
