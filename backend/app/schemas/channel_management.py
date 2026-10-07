from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.services.channels.types import ChannelType


class ChannelDefinitionResponse(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    channel: ChannelType
    label: str
    description: str
    external: bool
    registered: bool
    connected: bool
    enabled: bool
    status: str
    provider: str | None = None
    setup_required: list[str] = Field(default_factory=list)
    details: dict[str, Any] = Field(default_factory=dict)


class ChannelManagementResponse(BaseModel):
    business_id: UUID
    channels: list[ChannelDefinitionResponse]
