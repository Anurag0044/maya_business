from __future__ import annotations

from typing import Any
from uuid import UUID

from app.services.channels.adapters.base import (
    ChannelAdapter,
    ChannelDeliveryResult,
)
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)


class ChatChannelAdapter(ChannelAdapter):
    """Adapter for the authenticated website/test chat channel.

    This adapter deliberately does not call an external provider. The HTTP
    response carries the generated MAYA reply back to the caller. It exists
    so website chat follows the same adapter contract as WhatsApp and all
    future channels.
    """

    channel = ChannelType.CHAT

    def normalize_inbound(
        self,
        *,
        business_id: UUID,
        payload: Any,
        metadata: dict[str, Any] | None = None,
    ) -> NormalizedInboundMessage:
        if not isinstance(payload, dict):
            raise ValueError("Chat payload must be an object")

        external_user_id = str(payload.get("external_user_id") or payload.get("session_id") or "")
        message = str(payload.get("message") or "").strip()

        if not external_user_id:
            raise ValueError("external_user_id or session_id is required")
        if not message:
            raise ValueError("message is required")

        return NormalizedInboundMessage(
            business_id=business_id,
            channel=self.channel,
            external_user_id=external_user_id,
            session_id=str(payload.get("session_id") or external_user_id),
            external_message_id=payload.get("external_message_id"),
            message=message,
            metadata={**(metadata or {}), **(payload.get("metadata") or {})},
        )

    async def send(
        self,
        outbound: NormalizedOutboundMessage,
    ) -> ChannelDeliveryResult:
        # For website/test chat the API response is the delivery mechanism.
        return ChannelDeliveryResult(
            success=True,
            status="SENT",
            metadata={"delivery_mode": "HTTP_RESPONSE"},
        )


class WebsiteChannelAdapter(ChatChannelAdapter):
    """Website chat uses the same adapter contract as authenticated test chat."""

    channel = ChannelType.WEBSITE
