from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any
from uuid import UUID


class ChannelType(StrEnum):
    CHAT = "CHAT"
    WHATSAPP = "WHATSAPP"
    INSTAGRAM = "INSTAGRAM"
    SMS = "SMS"
    EMAIL = "EMAIL"
    LINKEDIN = "LINKEDIN"
    VOICE = "VOICE"


@dataclass(slots=True)
class NormalizedInboundMessage:
    business_id: UUID
    channel: ChannelType
    external_user_id: str
    message: str
    external_message_id: str | None = None
    session_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class NormalizedOutboundMessage:
    business_id: UUID
    channel: ChannelType
    external_user_id: str
    message: str
    conversation_id: UUID | None = None
    reply_to_external_message_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
