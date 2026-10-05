from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)


@dataclass(slots=True)
class ChannelDeliveryResult:
    """Provider-neutral result returned by every outbound channel adapter."""

    success: bool
    status: str
    provider_message_id: str | None = None
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class ChannelAdapter(ABC):
    """Boundary between MAYA and an external communication provider.

    Adapters are intentionally provider-specific. They translate provider
    payloads into the canonical inbound envelope and translate MAYA's
    canonical outbound envelope into provider API calls.

    The Conversation Engine must never import Meta, Twilio, SMTP, Instagram,
    etc. directly.
    """

    channel: ChannelType

    @abstractmethod
    def normalize_inbound(
        self,
        *,
        business_id: UUID,
        payload: Any,
        metadata: dict[str, Any] | None = None,
    ) -> NormalizedInboundMessage:
        """Convert a provider webhook/event payload into the canonical envelope."""

    @abstractmethod
    async def send(
        self,
        outbound: NormalizedOutboundMessage,
    ) -> ChannelDeliveryResult:
        """Deliver a canonical outbound message through this channel."""
