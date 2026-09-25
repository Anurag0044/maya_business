from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LeadCreate(BaseModel):
    phone: str = Field(min_length=3, max_length=50)
    name: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    source: str | None = Field(default=None, max_length=100)
    interest: str | None = None
    course_id: UUID | None = None
    notes: str | None = None


class LeadUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    source: str | None = None
    interest: str | None = None
    course_id: UUID | None = None
    status: str | None = None
    priority: int | None = None
    assigned_to: UUID | None = None
    notes: str | None = None
    next_followup_at: datetime | None = None


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    name: str | None
    phone: str
    email: str | None
    source: str | None
    interest: str | None
    course_id: UUID | None
    status: str
    priority: int
    assigned_to: UUID | None
    notes: str | None
    customer_intelligence_summary: str | None
    customer_intelligence: dict | None
    next_followup_at: datetime | None


class LeadActivityCreate(BaseModel):
    activity_type: str = Field(min_length=1, max_length=50)
    description: str | None = None


class LeadActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lead_id: UUID
    business_id: UUID
    activity_type: str
    description: str | None
