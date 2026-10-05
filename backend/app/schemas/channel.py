from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChannelInboundRequest(BaseModel):
    """Provider-neutral request used by authenticated internal channel tests.

    Real provider webhooks should use their channel adapter directly after
    provider verification rather than exposing this endpoint publicly.
    """

    external_user_id: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=20000)
    external_message_id: str | None = Field(default=None, max_length=255)
    session_id: str | None = Field(default=None, max_length=255)
    provider: str | None = Field(default=None, max_length=100)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChannelCapabilityResponse(BaseModel):
    channel: str
    registered: bool
