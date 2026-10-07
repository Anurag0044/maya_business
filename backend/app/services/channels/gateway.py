from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.channel_message import ChannelMessage
from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.service import ChannelMessageService
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)


class ChannelGateway:
    """Entry/exit boundary for the unified customer interaction pipeline."""

    def __init__(
        self,
        db: AsyncSession,
        registry: ChannelAdapterRegistry | None = None,
    ) -> None:
        self.db = db
        self.registry = registry or ChannelAdapterRegistry(db)

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
        """Run MAYA once, then deliver the generated response through its adapter."""

        result = await ChannelMessageService(self.db).process_ai_message(
            inbound
        )

        if result.get("duplicate") or not result.get("response"):
            return result

        outbound = NormalizedOutboundMessage(
            business_id=inbound.business_id,
            channel=inbound.channel,
            external_user_id=inbound.external_user_id,
            message=result["response"],
            conversation_id=result.get("conversation_id"),
            reply_to_external_message_id=inbound.external_message_id,
            provider=inbound.provider,
            metadata={
                "source": "MAYA",
                "decision": result.get("decision"),
                "confidence": result.get("confidence"),
            },
        )

        delivery = await self.send(outbound)

        outbound_id = result.get("outbound_channel_message_id")
        if outbound_id:
            outbound_record = await self.db.scalar(
                select(ChannelMessage).where(
                    ChannelMessage.id == outbound_id
                )
            )
            if outbound_record:
                outbound_record.status = (
                    delivery.status
                    if delivery.success
                    else "FAILED"
                )
                outbound_record.provider_message_id = (
                    delivery.provider_message_id
                )
                outbound_record.metadata_json = {
                    **(outbound_record.metadata_json or {}),
                    "delivery": {
                        "success": delivery.success,
                        "status": delivery.status,
                        "error": delivery.error,
                        "metadata": delivery.metadata,
                    },
                }
                await self.db.commit()

        result["delivery"] = {
            "success": delivery.success,
            "status": delivery.status,
            "provider_message_id": delivery.provider_message_id,
            "error": delivery.error,
        }
        return result

    async def send(
        self,
        outbound: NormalizedOutboundMessage,
    ):
        """Dispatch a normalized outbound message through its adapter."""
        adapter = self.registry.get(outbound.channel)
        return await adapter.send(outbound)
