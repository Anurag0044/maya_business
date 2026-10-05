from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.service import ChannelMessageService
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)


class ChannelGateway:
    """Entry/exit boundary for the unified customer interaction pipeline.

    Inbound:
        provider payload -> adapter.normalize_inbound()
        -> NormalizedInboundMessage -> Conversation Engine

    Outbound:
        MAYA -> NormalizedOutboundMessage -> adapter.send()
    """

    def __init__(
        self,
        db: AsyncSession,
        registry: ChannelAdapterRegistry | None = None,
    ) -> None:
        self.db = db
        self.registry = registry or ChannelAdapterRegistry()

    def normalize_inbound(
        self,
        *,
        channel: ChannelType,
        business_id: UUID,
        payload: Any,
        metadata: dict[str, Any] | None = None,
    ) -> NormalizedInboundMessage:
        adapter = self.registry.get(channel)
        return adapter.normalize_inbound(
            business_id=business_id,
            payload=payload,
            metadata=metadata,
        )

    async def receive(
        self,
        inbound: NormalizedInboundMessage,
    ) -> dict:
        """Send one normalized inbound message into the single MAYA pipeline."""
        return await ChannelMessageService(self.db).process_ai_message(inbound)

    async def send(
        self,
        outbound: NormalizedOutboundMessage,
    ):
        """Dispatch a normalized outbound message through its adapter."""
        adapter = self.registry.get(outbound.channel)
        return await adapter.send(outbound)
