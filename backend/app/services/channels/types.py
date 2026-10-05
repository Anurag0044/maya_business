from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any
from uuid import UUID


class ChannelType(StrEnum):
    """Customer communication channels supported by the unified pipeline."""

    CHAT = "CHAT"
    WHATSAPP = "WHATSAPP"
    INSTAGRAM = "INSTAGRAM"
    FACEBOOK = "FACEBOOK"
    SMS = "SMS"
    EMAIL = "EMAIL"
    WEBSITE = "WEBSITE"
    VOICE = "VOICE"
    # Kept for future business integrations; not part of the Frontdesk MVP
    # customer-channel rollout.
    LINKEDIN = "LINKEDIN"


class MessageType(StrEnum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"
    DOCUMENT = "DOCUMENT"
    LOCATION = "LOCATION"
    CONTACT = "CONTACT"
    UNKNOWN = "UNKNOWN"


@dataclass(slots=True)
class NormalizedInboundMessage:
    """Canonical message envelope produced by every channel adapter.

    Provider-specific webhook payloads must be converted to this object before
    they enter the Conversation Engine. MAYA never receives provider payloads
    directly.
    """

    business_id: UUID
    channel: ChannelType
    external_user_id: str
    message: str

    external_message_id: str | None = None
    session_id: str | None = None
    provider: str | None = None

    # Optional customer identity hints supplied by a channel.
    display_name: str | None = None
    phone_number: str | None = None
    email: str | None = None

    message_type: MessageType = MessageType.TEXT
    attachments: list[dict[str, Any]] = field(default_factory=list)

    # Provider event/message time. We keep receipt time as a safe fallback.
    received_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Provider event ID is distinct from the individual message ID.
    raw_event_id: str | None = None

    # Anything provider-specific that should survive normalization.
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class NormalizedOutboundMessage:
    """Canonical outbound envelope consumed by a channel adapter."""

    business_id: UUID
    channel: ChannelType
    external_user_id: str
    message: str

    conversation_id: UUID | None = None
    reply_to_external_message_id: str | None = None
    provider: str | None = None

    message_type: MessageType = MessageType.TEXT
    attachments: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
