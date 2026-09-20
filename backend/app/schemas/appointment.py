from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AppointmentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    start_time: datetime
    end_time: datetime
    lead_id: UUID | None = None
    assigned_to: UUID | None = None
    description: str | None = None
    appointment_type: str = "COUNSELLING"
    location: str | None = None
    meeting_link: str | None = None


class AppointmentUpdate(BaseModel):
    title: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    lead_id: UUID | None = None
    assigned_to: UUID | None = None
    description: str | None = None
    status: str | None = None
    appointment_type: str | None = None
    location: str | None = None
    meeting_link: str | None = None


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    lead_id: UUID | None
    assigned_to: UUID | None
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    status: str
    appointment_type: str
    location: str | None
    meeting_link: str | None
